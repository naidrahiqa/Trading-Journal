/**
 * Mistake Cost Analysis Widget
 * @description Tracks losses from FOMO and Revenge Trading
 * @version 3.0.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Brain, Target } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatCurrency } from '@/utils/tradingCalculations';
import { MISTAKE_TAGS } from '@/config/psychologyTags';
import { TradingLog } from '@/types/trading';

interface MistakeStats {
  mistakeTrades: number;
  totalMistakeCost: number;
  fomoTrades: number;
  fomoTotalCost: number;
  revengeTrades: number;
  revengeTotalCost: number;
  disciplinedTrades: number;
  disciplinedTotalPnL: number;
  disciplinedWinRate: number;
  mistakeWinRate: number;
}

export default function MistakeCostWidget() {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<MistakeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMistakeStats();
  }, []);

  const fetchMistakeStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: trades, error } = await supabase
        .from('trading_logs')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      if (!trades) return;

      // Calculate stats
      const mistakeTrades = trades.filter(t => 
        t.tags && (t.tags.includes('fomo') || t.tags.includes('revenge_trade'))
      );
      
      const fomoTrades = trades.filter(t => t.tags && t.tags.includes('fomo'));
      const revengeTrades = trades.filter(t => t.tags && t.tags.includes('revenge_trade'));
      const disciplinedTrades = trades.filter(t => t.tags && t.tags.includes('disciplined'));

      const totalMistakeCost = mistakeTrades.reduce((sum, t) => sum + t.net_pnl, 0);
      const fomoTotalCost = fomoTrades.reduce((sum, t) => sum + t.net_pnl, 0);
      const revengeTotalCost = revengeTrades.reduce((sum, t) => sum + t.net_pnl, 0);
      const disciplinedTotalPnL = disciplinedTrades.reduce((sum, t) => sum + t.net_pnl, 0);

      const disciplinedWinRate = disciplinedTrades.length > 0
        ? (disciplinedTrades.filter(t => t.net_pnl > 0).length / disciplinedTrades.length) * 100
        : 0;

      const mistakeWinRate = mistakeTrades.length > 0
        ? (mistakeTrades.filter(t => t.net_pnl > 0).length / mistakeTrades.length) * 100
        : 0;

      setStats({
        mistakeTrades: mistakeTrades.length,
        totalMistakeCost,
        fomoTrades: fomoTrades.length,
        fomoTotalCost,
        revengeTrades: revengeTrades.length,
        revengeTotalCost,
        disciplinedTrades: disciplinedTrades.length,
        disciplinedTotalPnL,
        disciplinedWinRate,
        mistakeWinRate,
      });
    } catch (error) {
      console.error('Error fetching mistake stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.mistakeTrades === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-emerald-400" />
          <h3 className="text-xl font-bold text-emerald-400">Excellent Discipline!</h3>
        </div>
        <p className="text-slate-300">
          No emotional trading detected. Keep following your strategy! 🎯
        </p>
      </motion.div>
    );
  }

  const potentialSavings = Math.abs(stats.totalMistakeCost);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/30 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
          <h3 className="text-xl font-bold text-white">Mistake Cost Analysis</h3>
        </div>
        <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-sm font-semibold">
          {stats.mistakeTrades} mistakes
        </span>
      </div>

      {/* Total Mistake Cost */}
      <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-rose-500/20">
        <p className="text-slate-400 text-sm mb-1">Total Cost of Emotional Trading</p>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-rose-400" />
          <p className="text-4xl font-black text-rose-400">
            {formatCurrency(stats.totalMistakeCost, 'crypto')}
          </p>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          💡 You could have saved {formatCurrency(potentialSavings, 'crypto')} with discipline
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* FOMO */}
        <div className="p-4 bg-slate-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">😱</span>
            <p className="text-slate-400 text-sm">FOMO Trades</p>
          </div>
          <p className="text-2xl font-bold text-rose-400">{stats.fomoTrades}</p>
          <p className="text-sm text-rose-500 mt-1">
            {formatCurrency(stats.fomoTotalCost, 'crypto')}
          </p>
        </div>

        {/* Revenge Trading */}
        <div className="p-4 bg-slate-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">😤</span>
            <p className="text-slate-400 text-sm">Revenge Trades</p>
          </div>
          <p className="text-2xl font-bold text-rose-400">{stats.revengeTrades}</p>
          <p className="text-sm text-rose-500 mt-1">
            {formatCurrency(stats.revengeTotalCost, 'crypto')}
          </p>
        </div>
      </div>

      {/* Disciplined Comparison */}
      {stats.disciplinedTrades > 0 && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 font-semibold">Disciplined Trading</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 mb-1">Disciplined Trades</p>
              <p className="text-lg font-bold text-emerald-400">{stats.disciplinedTrades}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Win Rate</p>
              <p className="text-lg font-bold text-emerald-400">
                {stats.disciplinedWinRate.toFixed(1)}%
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 mb-1">Total PnL</p>
              <p className={`text-xl font-bold ${stats.disciplinedTotalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(stats.disciplinedTotalPnL, 'crypto')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Win Rate Comparison */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Mistake Win Rate</span>
          <span className="text-rose-400 font-bold">{stats.mistakeWinRate.toFixed(1)}%</span>
        </div>
        {stats.disciplinedTrades > 0 && (
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-slate-400">Disciplined Win Rate</span>
            <span className="text-emerald-400 font-bold">{stats.disciplinedWinRate.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
