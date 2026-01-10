-- =====================================================
-- TRADING JOURNAL - SUPABASE MIGRATION SCRIPT
-- Version: 2.0.0
-- Date: 2026-01-10
-- Description: Adds 'tags' column to trading_logs table
-- =====================================================

-- Add 'tags' column if it doesn't exist
ALTER TABLE public.trading_logs 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Comment on column
COMMENT ON COLUMN public.trading_logs.tags IS 'Array of psychology tags (e.g. FOMO, Disciplined, Greed)';
