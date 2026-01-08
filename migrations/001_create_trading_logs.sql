-- =====================================================
-- TRADING JOURNAL - SUPABASE MIGRATION SCRIPT
-- Version: 1.0.0
-- Date: 2026-01-08
-- Description: Creates trading_logs table with RLS
-- =====================================================

-- Drop existing table if it exists (for development only)
-- DROP TABLE IF EXISTS public.trading_logs CASCADE;

-- Create ENUM types for asset_type and order_type
CREATE TYPE asset_type AS ENUM ('crypto', 'stock');
CREATE TYPE order_type AS ENUM ('long', 'short');

-- Create the trading_logs table
CREATE TABLE public.trading_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Asset Information
    asset_name TEXT NOT NULL,
    asset_type asset_type NOT NULL,
    platform_id TEXT NOT NULL,
    
    -- Trade Details
    order_type order_type NOT NULL DEFAULT 'long',
    entry_price NUMERIC(20, 8) NOT NULL CHECK (entry_price > 0),
    exit_price NUMERIC(20, 8) NOT NULL CHECK (exit_price > 0),
    quantity NUMERIC(20, 8) NOT NULL CHECK (quantity > 0),
    
    -- Financial Calculations
    gross_pnl NUMERIC(20, 8) NOT NULL,
    total_fee NUMERIC(20, 8) NOT NULL DEFAULT 0,
    net_pnl NUMERIC(20, 8) NOT NULL,
    
    -- Additional Information
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_trading_logs_user_id ON public.trading_logs(user_id);
CREATE INDEX idx_trading_logs_asset_type ON public.trading_logs(asset_type);
CREATE INDEX idx_trading_logs_platform_id ON public.trading_logs(platform_id);
CREATE INDEX idx_trading_logs_created_at ON public.trading_logs(created_at DESC);
CREATE INDEX idx_trading_logs_user_asset ON public.trading_logs(user_id, asset_type, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trading_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own trading logs" ON public.trading_logs;
DROP POLICY IF EXISTS "Users can insert their own trading logs" ON public.trading_logs;
DROP POLICY IF EXISTS "Users can update their own trading logs" ON public.trading_logs;
DROP POLICY IF EXISTS "Users can delete their own trading logs" ON public.trading_logs;

-- RLS Policy: Users can only view their own records
CREATE POLICY "Users can view their own trading logs"
    ON public.trading_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own records
CREATE POLICY "Users can insert their own trading logs"
    ON public.trading_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own records
CREATE POLICY "Users can update their own trading logs"
    ON public.trading_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own records
CREATE POLICY "Users can delete their own trading logs"
    ON public.trading_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.trading_logs;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.trading_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create a view for trading statistics (optional but useful)
CREATE OR REPLACE VIEW public.trading_stats AS
SELECT 
    user_id,
    asset_type,
    platform_id,
    COUNT(*) as total_trades,
    SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
    SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
    SUM(gross_pnl) as total_gross_pnl,
    SUM(total_fee) as total_fees_paid,
    SUM(net_pnl) as total_net_pnl,
    AVG(net_pnl) as avg_pnl_per_trade,
    MAX(net_pnl) as best_trade,
    MIN(net_pnl) as worst_trade
FROM public.trading_logs
GROUP BY user_id, asset_type, platform_id;

-- Grant necessary permissions
GRANT ALL ON public.trading_logs TO authenticated;
GRANT SELECT ON public.trading_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.trading_logs IS 'Stores individual trading transactions for both crypto and stock markets';
COMMENT ON COLUMN public.trading_logs.gross_pnl IS 'Profit/Loss before fees';
COMMENT ON COLUMN public.trading_logs.total_fee IS 'Sum of all transaction fees (buy + sell)';
COMMENT ON COLUMN public.trading_logs.net_pnl IS 'Final Profit/Loss after deducting fees';
COMMENT ON COLUMN public.trading_logs.platform_id IS 'Trading platform identifier (e.g., binance, ajaib, ipot)';

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================
