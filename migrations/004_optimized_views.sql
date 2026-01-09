-- ==================== OPTIMIZED TRADING STATS VIEW ====================
-- DROP existing views to avoid conflicts
DROP VIEW IF EXISTS public.trading_stats CASCADE;
DROP VIEW IF EXISTS public.mistake_cost_analysis CASCADE;
DROP VIEW IF EXISTS public.trading_hours_analysis CASCADE;
DROP VIEW IF EXISTS public.expected_value_analysis CASCADE;

-- ==================== MAIN TRADING STATS VIEW ====================
-- Comprehensive statistics per user
CREATE OR REPLACE VIEW public.trading_stats AS
SELECT 
    user_id,
    COUNT(*) AS total_trades,
    
    -- Win/Loss metrics
    SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END) AS winning_trades,
    SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END) AS losing_trades,
    SUM(CASE WHEN net_pnl = 0 THEN 1 ELSE 0 END) AS breakeven_trades,
    
    -- Win Rate (percentage)
    CASE 
        WHEN COUNT(*) > 0 THEN 
            ROUND((SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
        ELSE 0 
    END AS win_rate,
    
    -- PnL metrics
    SUM(gross_pnl) AS total_gross_pnl,
    SUM(total_fee) AS total_fees_paid,
    SUM(net_pnl) AS total_net_pnl,
    AVG(net_pnl) AS avg_net_pnl,
    
    -- Best/Worst trades
    MAX(net_pnl) AS best_trade,
    MIN(net_pnl) AS worst_trade,
    
    -- Average win/loss
    AVG(CASE WHEN net_pnl > 0 THEN net_pnl ELSE NULL END) AS avg_win,
    AVG(CASE WHEN net_pnl < 0 THEN net_pnl ELSE NULL END) AS avg_loss,
    
    -- Mistake Cost (from psychology tags)
    SUM(CASE 
        WHEN tags && ARRAY['fomo', 'revenge_trade'] THEN net_pnl 
        ELSE 0 
    END) AS mistake_cost,
    
    -- Disciplined trades performance
    SUM(CASE 
        WHEN 'disciplined' = ANY(tags) AND net_pnl > 0 THEN 1 
        ELSE 0 
    END) AS disciplined_wins,
    SUM(CASE 
        WHEN 'disciplined' = ANY(tags) THEN 1 
        ELSE 0 
    END) AS total_disciplined

FROM public.trading_logs
GROUP BY user_id;

-- Grant access
GRANT SELECT ON public.trading_stats TO authenticated;

-- ==================== MISTAKE COST ANALYSIS VIEW ====================
CREATE OR REPLACE VIEW public.mistake_cost_analysis AS
SELECT 
    user_id,
    
    -- Mistake trades (FOMO + Revenge)
    COUNT(*) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']) AS mistake_trades,
    SUM(net_pnl) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']) AS total_mistake_cost,
    AVG(net_pnl) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']) AS avg_mistake_cost,
    
    -- FOMO specific
    COUNT(*) FILTER (WHERE 'fomo' = ANY(tags)) AS fomo_trades,
    SUM(net_pnl) FILTER (WHERE 'fomo' = ANY(tags)) AS fomo_total_cost,
    
    -- Revenge Trade specific
    COUNT(*) FILTER (WHERE 'revenge_trade' = ANY(tags)) AS revenge_trades,
    SUM(net_pnl) FILTER (WHERE 'revenge_trade' = ANY(tags)) AS revenge_total_cost,
    
    -- Disciplined trades for comparison
    COUNT(*) FILTER (WHERE 'disciplined' = ANY(tags)) AS disciplined_trades,
    SUM(net_pnl) FILTER (WHERE 'disciplined' = ANY(tags)) AS disciplined_total_pnl,
    ROUND(
        (COUNT(*) FILTER (WHERE 'disciplined' = ANY(tags) AND net_pnl > 0)::NUMERIC / 
         NULLIF(COUNT(*) FILTER (WHERE 'disciplined' = ANY(tags)), 0)::NUMERIC * 100), 
        2
    ) AS disciplined_win_rate,
    
    -- Mistake win rate
    ROUND(
        (COUNT(*) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade'] AND net_pnl > 0)::NUMERIC / 
         NULLIF(COUNT(*) FILTER (WHERE tags && ARRAY['fomo', 'revenge_trade']), 0)::NUMERIC * 100), 
        2
    ) AS mistake_win_rate

FROM public.trading_logs
GROUP BY user_id;

GRANT SELECT ON public.mistake_cost_analysis TO authenticated;

-- ==================== TRADING HOURS ANALYSIS VIEW ====================
CREATE OR REPLACE VIEW public.trading_hours_analysis AS
SELECT 
    user_id,
    EXTRACT(HOUR FROM created_at) AS hour,
    COUNT(*) AS total_trades,
    SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END) AS wins,
    SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END) AS losses,
    ROUND(
        (SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 
        2
    ) AS win_rate,
    SUM(net_pnl) AS total_pnl,
    AVG(net_pnl) AS avg_pnl,
    MAX(net_pnl) AS best_trade,
    MIN(net_pnl) AS worst_trade

FROM public.trading_logs
GROUP BY user_id, EXTRACT(HOUR FROM created_at)
ORDER BY user_id, hour;

GRANT SELECT ON public.trading_hours_analysis TO authenticated;

-- ==================== EXPECTED VALUE ANALYSIS VIEW ====================
CREATE OR REPLACE VIEW public.expected_value_analysis AS
SELECT 
    user_id,
    asset_name,
    platform_id,
    COUNT(*) AS total_trades,
    
    -- Win metrics
    SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END) AS wins,
    ROUND(
        (SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 
        2
    ) AS win_percentage,
    AVG(CASE WHEN net_pnl > 0 THEN net_pnl ELSE NULL END) AS avg_win,
    
    -- Loss metrics
    SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END) AS losses,
    ROUND(
        (SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 
        2
    ) AS loss_percentage,
    AVG(CASE WHEN net_pnl < 0 THEN net_pnl ELSE NULL END) AS avg_loss,
    
    -- Expected Value calculation
    (
        (SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC) * 
        AVG(CASE WHEN net_pnl > 0 THEN net_pnl ELSE NULL END)
    ) + (
        (SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC) * 
        AVG(CASE WHEN net_pnl < 0 THEN net_pnl ELSE NULL END)
    ) AS expected_value,
    
    -- Risk-Reward Ratio
    CASE 
        WHEN AVG(CASE WHEN net_pnl < 0 THEN net_pnl ELSE NULL END) != 0 THEN
            ABS(AVG(CASE WHEN net_pnl > 0 THEN net_pnl ELSE NULL END) / 
                AVG(CASE WHEN net_pnl < 0 THEN net_pnl ELSE NULL END))
        ELSE NULL
    END AS risk_reward_ratio

FROM public.trading_logs
WHERE net_pnl IS NOT NULL
GROUP BY user_id, asset_name, platform_id
HAVING COUNT(*) >= 5  -- Only show if at least 5 trades
ORDER BY expected_value DESC NULLS LAST;

GRANT SELECT ON public.expected_value_analysis TO authenticated;

-- ==================== HELPER FUNCTION: GET BEST TRADING HOURS ====================
DROP FUNCTION IF EXISTS public.get_best_trading_hours(UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.get_best_trading_hours(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    hour INTEGER,
    total_trades BIGINT,
    win_rate NUMERIC,
    total_pnl NUMERIC,
    avg_pnl NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM created_at)::INTEGER AS hour,
        COUNT(*) AS total_trades,
        ROUND(
            (SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 
            2
        ) AS win_rate,
        SUM(net_pnl) AS total_pnl,
        AVG(net_pnl) AS avg_pnl
    FROM public.trading_logs
    WHERE user_id = p_user_id
    GROUP BY EXTRACT(HOUR FROM created_at)
    HAVING COUNT(*) >= 3  -- At least 3 trades in that hour
    ORDER BY win_rate DESC, total_pnl DESC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_best_trading_hours TO authenticated;

-- ==================== VERIFICATION QUERIES ====================
-- Run these to verify views work:

-- Check trading stats
-- SELECT * FROM trading_stats WHERE user_id = auth.uid();

-- Check mistake cost
-- SELECT * FROM mistake_cost_analysis WHERE user_id = auth.uid();

-- Check best hours
-- SELECT * FROM get_best_trading_hours(auth.uid(), 5);

-- Check EV
-- SELECT * FROM expected_value_analysis WHERE user_id = auth.uid();

COMMENT ON VIEW public.trading_stats IS 'Comprehensive trading statistics per user';
COMMENT ON VIEW public.mistake_cost_analysis IS 'Analysis of emotional trading costs';
COMMENT ON VIEW public.trading_hours_analysis IS 'Trading performance by hour of day';
COMMENT ON VIEW public.expected_value_analysis IS 'Expected value and risk-reward metrics';
COMMENT ON FUNCTION public.get_best_trading_hours IS 'Returns top performing trading hours for a user';
