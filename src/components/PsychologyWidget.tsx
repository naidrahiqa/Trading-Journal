'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TradingLog } from '@/types/trading';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface PsychologyAnalysisWidgetProps {
  trades: TradingLog[];
}

export default function PsychologyAnalysisWidget({ trades }: PsychologyAnalysisWidgetProps) {
  
  const emotionStats = useMemo(() => {
    // 1. Flatten all tags from all trades
    const allTags = trades.flatMap(t => t.tags || []);
    const uniqueTags = Array.from(new Set(allTags));

    if (uniqueTags.length === 0) return null;

    // 2. Calculate stats for each tag
    const stats = uniqueTags.map(tag => {
      const tagTrades = trades.filter(t => t.tags?.includes(tag));
      const wins = tagTrades.filter(t => t.net_pnl > 0).length;
      const losses = tagTrades.filter(t => t.net_pnl < 0).length;
      const winRate = (wins / tagTrades.length) * 100;
      const avgPnL = tagTrades.reduce((sum, t) => sum + t.net_pnl, 0) / tagTrades.length;

      // Color coding based on 'positive' or 'negative' emotion map (optional, simple logic here)
      const isPositive = ['Disciplined', 'Calm', 'Patience', 'Planned'].includes(tag);
      const isNegative = ['FOMO', 'Greed', 'Revenge', 'Fear', 'Impulsive'].includes(tag);

      return {
        tag,
        count: tagTrades.length,
        winRate,
        avgPnL,
        isPositive,
        isNegative
      };
    });

    // Sort by transform count descending
    return stats.sort((a, b) => b.count - a.count);
  }, [trades]);

  if (!emotionStats) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-xl font-bold text-white">Trading Psychology Analysis</h3>
        <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
          AI INSIGHTS
        </span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {emotionStats.map((stat) => (
          <motion.div 
            key={stat.tag}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                   stat.isPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                   stat.isNegative ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                   'bg-slate-700 text-slate-300 border border-slate-600'
                 }`}>
                   {stat.tag}
                 </span>
                 <span className="text-slate-500 text-xs">{stat.count} Trades</span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${stat.avgPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {stat.avgPnL >= 0 ? '+' : ''}{Math.round(stat.avgPnL).toLocaleString()} Avg
                </div>
              </div>
            </div>

            {/* Win Rate Bar */}
            <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${stat.winRate}%` }}
                 transition={{ duration: 1, ease: 'easeOut' }}
                 className={`absolute top-0 left-0 h-full ${
                   stat.winRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                 }`}
               />
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                 {stat.winRate.toFixed(1)}% Win Rate
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
