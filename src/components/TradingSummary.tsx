/**
 * Enhanced Trading Summary with Timeframe Filtering
 * @description Dashboard statistics with 7d, 1m, 3m, 4m, 12m, All Time filters
 * @version 2.0.0
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  Activity,
  LayoutGrid,
  List,
  Share2,
  Calendar,
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradingLog, TimeframeFilter, TimeframeOption, ViewMode, ShareableCardData } from '@/types/trading';
import { formatCurrency, formatPercentage, getPnLColorClass } from '@/utils/tradingCalculations';
import { getPlatformById } from '@/config/platformFees';
import ShareablePnLCard from './ShareablePnLCard';
import { subDays, subMonths, isAfter, parseISO } from 'date-fns';

// ==================== TIMEFRAME OPTIONS ====================

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { id: 'last_trade', label: 'Hasil Barusan' },
  { id: '7d', label: '7 Hari', daysBack: 7 },
  { id: '1m', label: '1 Bulan', daysBack: 30 },
  { id: '3m', label: '3 Bulan', daysBack: 90 },
  { id: '4m', label: '4 Bulan', daysBack: 120 },
  { id: '12m', label: '12 Bulan', daysBack: 365 },
  { id: 'all_time', label: 'All Time' },
];

// ==================== UTILITY FUNCTIONS ====================

const filterTradesByTimeframe = (trades: TradingLog[], timeframe: TimeframeFilter): TradingLog[] => {
  if (timeframe === 'all_time') return trades;
  
  if (timeframe === 'last_trade') {
    const sorted = [...trades].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted.length > 0 ? [sorted[0]] : [];
  }

  const option = TIMEFRAME_OPTIONS.find(opt => opt.id === timeframe);
  if (!option || !option.daysBack) return trades;

  const cutoffDate = subDays(new Date(), option.daysBack);
  
  return trades.filter(trade => {
    const tradeDate = parseISO(trade.created_at);
    return isAfter(tradeDate, cutoffDate);
  });
};

const calculateStats = (trades: TradingLog[]) => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalNetPnL: 0,
      totalFees: 0,
      avgPnL: 0,
      bestTrade: 0,
      worstTrade: 0,
    };
  }

  const winningTrades = trades.filter(t => t.net_pnl > 0).length;
  const losingTrades = trades.filter(t => t.net_pnl < 0).length;
  const totalNetPnL = trades.reduce((sum, t) => sum + t.net_pnl, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.total_fee, 0);
  const avgPnL = totalNetPnL / trades.length;
  const bestTrade = Math.max(...trades.map(t => t.net_pnl));
  const worstTrade = Math.min(...trades.map(t => t.net_pnl));
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  return {
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate,
    totalNetPnL,
    totalFees,
    avgPnL,
    bestTrade,
    worstTrade,
  };
};

// ==================== MAIN COMPONENT ====================

export default function EnhancedTradingSummary() {
  const supabase = createClientComponentClient();

  // ==================== STATE ====================

  const [allTrades, setAllTrades] = useState<TradingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeFilter>('all_time');
  const [viewMode, setViewMode] = useState<ViewMode>('kece_abis');
  const [shareCardData, setShareCardData] = useState<ShareableCardData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ==================== DATA FETCHING ====================

  useEffect(() => {
    fetchTrades();
  }, [refreshTrigger]);

  const fetchTrades = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trading_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FILTERED DATA ====================

  const filteredTrades = useMemo(
    () => filterTradesByTimeframe(allTrades, selectedTimeframe),
    [allTrades, selectedTimeframe]
  );

  const stats = useMemo(() => calculateStats(filteredTrades), [filteredTrades]);

  // Calculate total ROI (if we have initial investment data)
  const totalInvestment = filteredTrades.reduce((sum, trade) => {
    return sum + (trade.entry_price * trade.quantity);
  }, 0);
  const totalROI = totalInvestment > 0 ? (stats.totalNetPnL / totalInvestment) * 100 : 0;

  // ==================== SHARE HANDLERS ====================

  const handleShareOverallCard = () => {
    const cardData: ShareableCardData = {
      assetName: 'Portfolio Summary',
      assetLogo: '📊',
      platformName: 'Trading Journal',
      platformLogo: '💼',
      netPnL: stats.totalNetPnL,
      roi: totalROI,
      assetType: 'crypto', // Default for formatting
      timestamp: new Date().toISOString(),
    };
    setShareCardData(cardData);
  };

  const handleShareTradeCard = (trade: TradingLog) => {
    const platform = getPlatformById(trade.platform_id);
    const roi = (trade.net_pnl / (trade.entry_price * trade.quantity)) * 100;

    const cardData: ShareableCardData = {
      assetName: trade.asset_name,
      assetLogo: platform?.logo || '📈',
      platformName: platform?.name || trade.platform_id,
      platformLogo: platform?.logo || '💹',
      netPnL: trade.net_pnl,
      roi,
      assetType: trade.asset_type,
      timestamp: trade.created_at,
    };
    setShareCardData(cardData);
  };

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Trading Summary</h2>
          <p className="text-slate-400">Filter and analyze your trading performance</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-1">
          <button
            onClick={() => setViewMode('minimalist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'minimalist'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Minimalist</span>
          </button>
          <button
            onClick={() => setViewMode('kece_abis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'kece_abis'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kece Abis</span>
          </button>
        </div>
      </div>

      {/* Timeframe Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {TIMEFRAME_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setSelectedTimeframe(option.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
              selectedTimeframe === option.id
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net PnL */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative overflow-hidden rounded-2xl p-6 ${
            stats.totalNetPnL >= 0
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5'
              : 'bg-gradient-to-br from-rose-500/20 to-rose-500/5'
          } border ${
            stats.totalNetPnL >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'
          } backdrop-blur-xl`}
        >
          <div className="flex items-start justify-between mb-4">
            <DollarSign className={`w-8 h-8 ${getPnLColorClass(stats.totalNetPnL)}`} />
            <button
              onClick={handleShareOverallCard}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Share Summary"
            >
              <Share2 className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>
          <h3 className="text-slate-400 text-sm mb-2">Total Net PnL</h3>
          <p className={`text-3xl font-bold ${getPnLColorClass(stats.totalNetPnL)}`}>
            {formatCurrency(stats.totalNetPnL, 'crypto')}
          </p>
          {stats.totalTrades > 0 && (
            <p className="text-slate-500 text-xs mt-2">
              Avg: {formatCurrency(stats.avgPnL, 'crypto')} per trade
            </p>
          )}
        </motion.div>

        {/* Win Rate */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 backdrop-blur-xl"
        >
          <Trophy className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-slate-400 text-sm mb-2">Win Rate</h3>
          <p className={`text-3xl font-bold ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stats.winRate.toFixed(1)}%
          </p>
          <p className="text-slate-500 text-xs mt-2">
            {stats.winningTrades}W / {stats.losingTrades}L
          </p>
        </motion.div>

        {/* Total ROI */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative overflow-hidden rounded-2xl p-6 ${
            totalROI >= 0
              ? 'bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30'
              : 'bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/30'
          } border backdrop-blur-xl`}
        >
          <Activity className={`w-8 h-8 ${totalROI >= 0 ? 'text-purple-400' : 'text-orange-400'} mb-4`} />
          <h3 className="text-slate-400 text-sm mb-2">Total ROI</h3>
          <p className={`text-3xl font-bold ${getPnLColorClass(totalROI)}`}>
            {formatPercentage(totalROI)}
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Return on Investment
          </p>
        </motion.div>

        {/* Total Trades */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 backdrop-blur-xl"
        >
          <Calendar className="w-8 h-8 text-cyan-400 mb-4" />
          <h3 className="text-slate-400 text-sm mb-2">Total Trades</h3>
          <p className="text-3xl font-bold text-cyan-400">{stats.totalTrades}</p>
          <p className="text-slate-500 text-xs mt-2">
            {selectedTimeframe === 'all_time' 
              ? 'All time record' 
              : TIMEFRAME_OPTIONS.find(o => o.id === selectedTimeframe)?.label}
          </p>
        </motion.div>
      </div>

      {/* Trade List */}
      {viewMode === 'minimalist' ? (
        <MinimalistTradeList 
          trades={filteredTrades} 
          onShareTrade={handleShareTradeCard}
        />
      ) : (
        <KeceAbisTradeGrid 
          trades={filteredTrades} 
          onShareTrade={handleShareTradeCard}
        />
      )}

      {/* Shareable Card Modal */}
      <AnimatePresence>
        {shareCardData && (
          <ShareablePnLCard
            data={shareCardData}
            onClose={() => setShareCardData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== MINIMALIST VIEW ====================

function MinimalistTradeList({ 
  trades, 
  onShareTrade 
}: { 
  trades: TradingLog[];
  onShareTrade: (trade: TradingLog) => void;
}) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>No trades found for this period</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left p-4 text-slate-400 text-sm font-medium">Asset</th>
            <th className="text-left p-4 text-slate-400 text-sm font-medium">Platform</th>
            <th className="text-right p-4 text-slate-400 text-sm font-medium">Entry</th>
            <th className="text-right p-4 text-slate-400 text-sm font-medium">Exit</th>
            <th className="text-right p-4 text-slate-400 text-sm font-medium">Net PnL</th>
            <th className="text-right p-4 text-slate-400 text-sm font-medium">ROI</th>
            <th className="text-right p-4 text-slate-400 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const platform = getPlatformById(trade.platform_id);
            const roi = (trade.net_pnl / (trade.entry_price * trade.quantity)) * 100;

            return (
              <motion.tr
                key={trade.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{platform?.logo}</span>
                    <span className="text-white font-medium">{trade.asset_name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{platform?.name}</td>
                <td className="p-4 text-right text-slate-300">
                  {formatCurrency(trade.entry_price, trade.asset_type)}
                </td>
                <td className="p-4 text-right text-slate-300">
                  {formatCurrency(trade.exit_price, trade.asset_type)}
                </td>
                <td className={`p-4 text-right font-bold ${getPnLColorClass(trade.net_pnl)}`}>
                  {formatCurrency(trade.net_pnl, trade.asset_type)}
                </td>
                <td className={`p-4 text-right font-semibold ${getPnLColorClass(roi)}`}>
                  {formatPercentage(roi)}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onShareTrade(trade)}
                    className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                    title="Share this trade"
                  >
                    <Share2 className="w-4 h-4 text-slate-400 hover:text-emerald-400" />
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ==================== KECE ABIS VIEW ====================

function KeceAbisTradeGrid({ 
  trades, 
  onShareTrade 
}: { 
  trades: TradingLog[];
  onShareTrade: (trade: TradingLog) => void;
}) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>No trades found for this period</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trades.map((trade) => {
        const platform = getPlatformById(trade.platform_id);
        const roi = (trade.net_pnl / (trade.entry_price * trade.quantity)) * 100;
        const isProfitable = trade.net_pnl >= 0;

        return (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`relative overflow-hidden rounded-2xl p-6 ${
              isProfitable
                ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5'
                : 'bg-gradient-to-br from-rose-500/10 to-rose-500/5'
            } border ${
              isProfitable ? 'border-emerald-500/30' : 'border-rose-500/30'
            } backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{platform?.logo}</span>
                <div>
                  <h3 className="text-white font-bold text-lg">{trade.asset_name}</h3>
                  <p className="text-slate-400 text-xs">{platform?.name}</p>
                </div>
              </div>
              <button
                onClick={() => onShareTrade(trade)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Net PnL */}
            <div className="mb-4">
              <p className="text-slate-400 text-xs mb-1">Net PnL</p>
              <div className={`text-3xl font-black ${getPnLColorClass(trade.net_pnl)} flex items-center gap-2`}>
                {isProfitable ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {formatCurrency(trade.net_pnl, trade.asset_type)}
              </div>
            </div>

            {/* ROI Badge */}
            <div className="mb-4">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  isProfitable
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                }`}
              >
                {isProfitable ? '+' : ''}{formatPercentage(roi)} ROI
              </span>
            </div>

            {/* Trade Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Entry</p>
                <p className="text-white font-semibold">{formatCurrency(trade.entry_price, trade.asset_type)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Exit</p>
                <p className="text-white font-semibold">{formatCurrency(trade.exit_price, trade.asset_type)}</p>
              </div>
            </div>

            {/* Date */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-slate-500 text-xs">
                {new Date(trade.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Decorative Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${
              isProfitable 
                ? 'bg-gradient-to-br from-emerald-500/20' 
                : 'bg-gradient-to-br from-rose-500/20'
            } to-transparent rounded-full blur-2xl -z-10`}></div>
          </motion.div>
        );
      })}
    </div>
  );
}
