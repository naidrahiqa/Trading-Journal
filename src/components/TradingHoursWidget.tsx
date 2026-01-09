/**
 * Trading Hours Widget
 * @description Shows best and worst performing hours
 * @version 1.0.0
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { TradingLog } from '@/types/trading';
import { formatCurrency, getPnLColorClass } from '@/utils/tradingCalculations';

interface HourStats {
  hour: number;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
}

interface TradingHoursWidgetProps {
  trades: TradingLog[];
}

export default function TradingHoursWidget({ trades }: TradingHoursWidgetProps) {
  const hourlyStats = useMemo(() => {
    if (trades.length === 0) return [];

    // Group by hour
    const grouped = trades.reduce((acc, trade) => {
      const hour = new Date(trade.created_at).getHours();
      
      if (!acc[hour]) {
        acc[hour] = {
          hour,
          trades: 0,
          wins: 0,
          losses: 0,
          totalPnL: 0,
        };
      }

      acc[hour].trades++;
      acc[hour].totalPnL += trade.net_pnl;
      if (trade.net_pnl > 0) acc[hour].wins++;
      if (trade.net_pnl < 0) acc[hour].losses++;

      return acc;
    }, {} as Record<number, any>);

    // Calculate stats and convert to array
    const statsArray: HourStats[] = Object.values(grouped).map((stats) => ({
      ...stats,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
      avgPnL: stats.totalPnL / stats.trades,
    }));

    // Sort by win rate then by total PnL
    return statsArray.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.totalPnL - a.totalPnL;
    });
  }, [trades]);

  if (trades.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
          <h3 className="text-xl font-bold text-white">Trading Hours</h3>
        </div>
        <p className="text-slate-400">No trades yet. Start trading to see patterns!</p>
      </motion.div>
    );
  }

  const bestHours = hourlyStats.slice(0, 3);
  const worstHours = hourlyStats.slice(-3).reverse();

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/30 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Trading Hours Analysis</h3>
        </div>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
          {hourlyStats.length} hours traded
        </span>
      </div>

      {/* Best Hours */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h4 className="text-emerald-400 font-semibold">Best Performing Hours</h4>
        </div>
        <div className="space-y-2">
          {bestHours.map((stats, index) => (
            <div
              key={stats.hour}
              className="p-3 bg-slate-900/30 rounded-xl border border-emerald-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-emerald-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-white font-semibold">{formatHour(stats.hour)}</p>
                    <p className="text-xs text-slate-400">
                      {stats.trades} trades • {stats.wins}W/{stats.losses}L
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    {stats.winRate.toFixed(0)}% WR
                  </p>
                  <p className={`text-xs ${getPnLColorClass(stats.totalPnL)}`}>
                    {formatCurrency(stats.totalPnL, 'crypto')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worst Hours */}
      {worstHours.length > 0 && worstHours[0].trades > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <h4 className="text-rose-400 font-semibold">Hours to Avoid</h4>
          </div>
          <div className="space-y-2">
            {worstHours.map((stats) => (
              <div
                key={stats.hour}
                className="p-3 bg-slate-900/30 rounded-xl border border-rose-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <div>
                      <p className="text-white font-semibold">{formatHour(stats.hour)}</p>
                      <p className="text-xs text-slate-400">
                        {stats.trades} trades • {stats.wins}W/{stats.losses}L
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-400">
                      {stats.winRate.toFixed(0)}% WR
                    </p>
                    <p className={`text-xs ${getPnLColorClass(stats.totalPnL)}`}>
                      {formatCurrency(stats.totalPnL, 'crypto')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-slate-400 text-sm">
          💡 <span className="text-blue-400 font-semibold">Pro tip:</span> Trade during your best hours 
          ({bestHours.slice(0, 2).map(h => formatHour(h.hour)).join(', ')}) 
          untuk win rate lebih tinggi!
        </p>
      </div>
    </motion.div>
  );
}
