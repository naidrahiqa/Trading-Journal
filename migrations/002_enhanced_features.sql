-- =====================================================
-- TRADING JOURNAL - ENHANCED SCHEMA (No Changes Required)
-- Version: 2.0.0
-- Date: 2026-01-09
-- Description: Existing schema supports all new features
-- =====================================================

-- ✅ The current trading_logs table already supports:
-- 1. Timeframe Filtering (via created_at column with indexes)
-- 2. Shareable PnL Cards (all data fields present)
-- 3. Dual-Mode UI Display (no schema changes needed)
-- 4. Automated Fee Engine (gross_pnl, total_fee, net_pnl columns)

-- =====================================================
-- OPTIONAL: Additional Statistics View
-- =====================================================

-- Drop existing view if you want to update it
DROP VIEW IF EXISTS public.trading_stats;

-- Enhanced statistics view with timeframe support
CREATE OR REPLACE VIEW public.trading_stats_detailed AS
SELECT 
    user_id,
    asset_type,
    platform_id,
    
    -- Counts
    COUNT(*) as total_trades,
    SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
    SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
    SUM(CASE WHEN net_pnl = 0 THEN 1 ELSE 0 END) as breakeven_trades,
    
    -- Win Rate
    ROUND(
        (SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
        2
    ) as win_rate_percentage,
    
    -- Financial Metrics
    SUM(gross_pnl) as total_gross_pnl,
    SUM(total_fee) as total_fees_paid,
    SUM(net_pnl) as total_net_pnl,
    
    -- Averages
    AVG(net_pnl) as avg_pnl_per_trade,
    AVG(gross_pnl) as avg_gross_pnl,
    AVG(total_fee) as avg_fee_per_trade,
    
    -- Best/Worst
    MAX(net_pnl) as best_trade,
    MIN(net_pnl) as worst_trade,
    
    -- Investment Metrics
    SUM(entry_price * quantity) as total_investment,
    
    -- ROI Calculation
    ROUND(
        (SUM(net_pnl)::NUMERIC / NULLIF(SUM(entry_price * quantity), 0)::NUMERIC) * 100,
        2
    ) as total_roi_percentage,
    
    -- Time Information
    MIN(created_at) as first_trade_date,
    MAX(created_at) as last_trade_date,
    MAX(updated_at) as last_updated
    
FROM public.trading_logs
GROUP BY user_id, asset_type, platform_id;

-- Grant permissions
GRANT SELECT ON public.trading_stats_detailed TO authenticated;

-- Add comment
COMMENT ON VIEW public.trading_stats_detailed IS 'Detailed trading statistics with ROI and investment tracking for enhanced dashboard';

-- =====================================================
-- OPTIONAL: Indexes for Performance Optimization
-- =====================================================

-- These indexes may already exist; adding IF NOT EXISTS for safety

-- Index for timeframe filtering (7d, 1m, 3m, etc.)
CREATE INDEX IF NOT EXISTS idx_trading_logs_created_at_desc 
ON public.trading_logs(user_id, created_at DESC);

-- Index for platform + asset type queries
CREATE INDEX IF NOT EXISTS idx_trading_logs_platform_asset 
ON public.trading_logs(user_id, platform_id, asset_type);

-- Index for profit/loss filtering
CREATE INDEX IF NOT EXISTS idx_trading_logs_net_pnl 
ON public.trading_logs(user_id, net_pnl);

-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_trading_logs_dashboard 
ON public.trading_logs(user_id, asset_type, created_at DESC, net_pnl);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify your schema is ready:
/*
SELECT 
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name = 'created_at' THEN 1 END) as has_timeframe_support,
    COUNT(CASE WHEN column_name = 'net_pnl' THEN 1 END) as has_pnl_tracking,
    COUNT(CASE WHEN column_name = 'platform_id' THEN 1 END) as has_platform_tracking
FROM information_schema.columns
WHERE table_name = 'trading_logs'
    AND table_schema = 'public';

-- Expected result: All counts should be > 0
*/

-- =====================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Uncomment and modify user_id to insert test data:
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
    notes
) VALUES
    -- Recent win (for "Last Trade" filter)
    (
        'YOUR_USER_ID_HERE',
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
        'Strong breakout trade'
    ),
    -- 7-day old trade
    (
        'YOUR_USER_ID_HERE',
        'ETH/USDT',
        'crypto',
        'binance',
        'long',
        3000,
        2900,
        0.5,
        -50,
        0.6,
        -50.6,
        'Stop loss hit'
    ),
    -- 1-month old trade (stock)
    (
        'YOUR_USER_ID_HERE',
        'BBCA',
        'stock',
        'ajaib',
        'long',
        8500,
        9000,
        500,
        250000,
        875,
        249125,
        'Banking sector rally'
    );

-- Update created_at for timeframe testing:
UPDATE public.trading_logs 
SET created_at = NOW() 
WHERE asset_name = 'BTC/USDT';

UPDATE public.trading_logs 
SET created_at = NOW() - INTERVAL '7 days' 
WHERE asset_name = 'ETH/USDT';

UPDATE public.trading_logs 
SET created_at = NOW() - INTERVAL '30 days' 
WHERE asset_name = 'BBCA';
*/

-- =====================================================
-- END OF ENHANCED SCHEMA SCRIPT
-- =====================================================
