-- =====================================================
-- TRADING JOURNAL - PSYCHOLOGY TAGS & TRADING HOURS
-- Version: 3.0.0
-- Date: 2026-01-09
-- Description: Add psychology tags and trading hours tracking
-- =====================================================

-- Add tags column to existing trading_logs table
ALTER TABLE public.trading_logs 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tag queries
CREATE INDEX IF NOT EXISTS idx_trading_logs_tags 
ON public.trading_logs USING GIN (tags);

-- Add comment
COMMENT ON COLUMN public.trading_logs.tags IS 'Psychology tags: FOMO, Disciplined, Revenge Trade, Greed, Fear, Patience, etc.';

-- =====================================================
-- PSYCHOLOGY TAG ENUM (Optional - for validation)
-- =====================================================

-- Create a custom type for psychology tags (optional)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'psychology_tag') THEN
        CREATE TYPE psychology_tag AS ENUM (
            'disciplined',
            'fomo',
            'revenge_trade',
            'greed',
            'fear',
            'patience',
            'overconfident',
            'fearful',
            'planned',
            'impulsive',
            'emotional',
            'analytical'
        );
    END IF;
END $$;

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Mistake Cost Analysis View
CREATE OR REPLACE VIEW public.mistake_cost_analysis AS
SELECT 
    user_id,
    asset_type,
    
    -- Mistake Trades (FOMO + Revenge)
    COUNT(*) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']::TEXT[]) as mistake_trades,
    SUM(net_pnl) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']::TEXT[]) as total_mistake_cost,
    AVG(net_pnl) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']::TEXT[]) as avg_mistake_cost,
    
    -- FOMO Specific
    COUNT(*) FILTER (WHERE 'fomo' = ANY(tags)) as fomo_trades,
    SUM(net_pnl) FILTER (WHERE 'fomo' = ANY(tags)) as fomo_total_cost,
    
    -- Revenge Trade Specific
    COUNT(*) FILTER (WHERE 'revenge_trade' = ANY(tags)) as revenge_trades,
    SUM(net_pnl) FILTER (WHERE 'revenge_trade' = ANY(tags)) as revenge_total_cost,
    
    -- Disciplined Trades
    COUNT(*) FILTER (WHERE 'disciplined' = ANY(tags)) as disciplined_trades,
    SUM(net_pnl) FILTER (WHERE 'disciplined' = ANY(tags)) as disciplined_total_pnl,
    AVG(net_pnl) FILTER (WHERE 'disciplined' = ANY(tags)) as disciplined_avg_pnl,
    
    -- Win Rate Comparison
    ROUND(
        (COUNT(*) FILTER (WHERE net_pnl > 0 AND 'disciplined' = ANY(tags))::NUMERIC / 
         NULLIF(COUNT(*) FILTER (WHERE 'disciplined' = ANY(tags)), 0)::NUMERIC) * 100,
        2
    ) as disciplined_win_rate,
    
    ROUND(
        (COUNT(*) FILTER (WHERE net_pnl > 0 AND tags && ARRAY['fomo', 'revenge_trade']::TEXT[])::NUMERIC / 
         NULLIF(COUNT(*) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']::TEXT[]), 0)::NUMERIC) * 100,
        2
    ) as mistake_win_rate

FROM public.trading_logs
GROUP BY user_id, asset_type;

-- Grant permissions
GRANT SELECT ON public.mistake_cost_analysis TO authenticated;

-- Trading Hours Analysis View
CREATE OR REPLACE VIEW public.trading_hours_analysis AS
SELECT 
    user_id,
    asset_type,
    EXTRACT(HOUR FROM created_at) as trading_hour,
    
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE net_pnl > 0) as winning_trades,
    COUNT(*) FILTER (WHERE net_pnl < 0) as losing_trades,
    
    ROUND(
        (COUNT(*) FILTER (WHERE net_pnl > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100,
        2
    ) as win_rate,
    
    SUM(net_pnl) as total_pnl,
    AVG(net_pnl) as avg_pnl,
    MAX(net_pnl) as best_trade,
    MIN(net_pnl) as worst_trade

FROM public.trading_logs
GROUP BY user_id, asset_type, EXTRACT(HOUR FROM created_at)
ORDER BY user_id, asset_type, trading_hour;

-- Grant permissions
GRANT SELECT ON public.trading_hours_analysis TO authenticated;

-- Expected Value (EV) Analysis View
CREATE OR REPLACE VIEW public.expected_value_analysis AS
SELECT 
    user_id,
    asset_type,
    platform_id,
    
    -- Total Stats
    COUNT(*) as total_trades,
    
    -- Win Statistics
    COUNT(*) FILTER (WHERE net_pnl > 0) as winning_trades,
    ROUND(
        (COUNT(*) FILTER (WHERE net_pnl > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100,
        2
    ) as win_percentage,
    AVG(net_pnl) FILTER (WHERE net_pnl > 0) as avg_win,
    
    -- Loss Statistics
    COUNT(*) FILTER (WHERE net_pnl < 0) as losing_trades,
    ROUND(
        (COUNT(*) FILTER (WHERE net_pnl < 0)::NUMERIC / COUNT(*)::NUMERIC) * 100,
        2
    ) as loss_percentage,
    AVG(net_pnl) FILTER (WHERE net_pnl < 0) as avg_loss,
    
    -- Expected Value Calculation
    -- EV = (Win% × Avg Win) - (Loss% × |Avg Loss|)
    ROUND(
        (
            (COUNT(*) FILTER (WHERE net_pnl > 0)::NUMERIC / COUNT(*)::NUMERIC) * 
            AVG(net_pnl) FILTER (WHERE net_pnl > 0)
        ) - (
            (COUNT(*) FILTER (WHERE net_pnl < 0)::NUMERIC / COUNT(*)::NUMERIC) * 
            ABS(AVG(net_pnl) FILTER (WHERE net_pnl < 0))
        ),
        2
    ) as expected_value,
    
    -- Risk-Reward Ratio
    ROUND(
        AVG(net_pnl) FILTER (WHERE net_pnl > 0) / 
        NULLIF(ABS(AVG(net_pnl) FILTER (WHERE net_pnl < 0)), 0),
        2
    ) as risk_reward_ratio

FROM public.trading_logs
GROUP BY user_id, asset_type, platform_id;

-- Grant permissions
GRANT SELECT ON public.expected_value_analysis TO authenticated;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get top performing hours
CREATE OR REPLACE FUNCTION public.get_best_trading_hours(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    hour INTEGER,
    win_rate NUMERIC,
    total_pnl NUMERIC,
    trade_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM created_at)::INTEGER as hour,
        ROUND(
            (COUNT(*) FILTER (WHERE net_pnl > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100,
            2
        ) as win_rate,
        SUM(net_pnl) as total_pnl,
        COUNT(*) as trade_count
    FROM public.trading_logs
    WHERE user_id = p_user_id
    GROUP BY EXTRACT(HOUR FROM created_at)
    HAVING COUNT(*) >= 3  -- Minimum 3 trades for statistical significance
    ORDER BY win_rate DESC, total_pnl DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_best_trading_hours TO authenticated;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment to insert sample data with psychology tags:
/*
INSERT INTO public.trading_logs (
    user_id,
    asset_name,
    asset_type,
    platform_id,
    order_type,
    entry_price,
    exit_price,
    quantity,
    gross_pnl,
    total_fee,
    net_pnl,
    tags,
    created_at
) VALUES
    -- Disciplined Trade (Morning - 9 AM)
    (
        'YOUR_USER_ID',
        'BTC/USDT',
        'crypto',
        'binance',
        'long',
        45000,
        47000,
        0.1,
        200,
        0.9,
        199.1,
        ARRAY['disciplined', 'planned'],
        '2026-01-09 09:30:00+07'
    ),
    -- FOMO Trade (Late Night - 11 PM)
    (
        'YOUR_USER_ID',
        'ETH/USDT',
        'crypto',
        'binance',
        'long',
        3000,
        2850,
        0.5,
        -75,
        0.6,
        -75.6,
        ARRAY['fomo', 'emotional'],
        '2026-01-08 23:15:00+07'
    ),
    -- Revenge Trade (Afternoon - 2 PM)
    (
        'YOUR_USER_ID',
        'SOL/USDT',
        'crypto',
        'bybit',
        'long',
        100,
        95,
        2,
        -10,
        0.2,
        -10.2,
        ARRAY['revenge_trade', 'emotional'],
        '2026-01-08 14:00:00+07'
    );
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tags column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trading_logs' 
  AND column_name = 'tags';

-- View mistake cost analysis
-- SELECT * FROM public.mistake_cost_analysis LIMIT 10;

-- View trading hours analysis
-- SELECT * FROM public.trading_hours_analysis ORDER BY win_rate DESC LIMIT 10;

-- View expected value analysis
-- SELECT * FROM public.expected_value_analysis ORDER BY expected_value DESC;

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================
