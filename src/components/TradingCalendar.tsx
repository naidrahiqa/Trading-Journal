'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradingLog } from '@/types/trading';
import { formatCurrency, formatPercentage } from '@/utils/tradingCalculations';

export default function TradingCalendar() {
  const supabase = createClientComponentClient();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<TradingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch trades for the current month
  useEffect(() => {
    fetchMonthlyTrades();
  }, [currentDate]);

  const fetchMonthlyTrades = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate).toISOString();
      const end = endOfMonth(currentDate).toISOString();

      const { data, error } = await supabase
        .from('trading_logs')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to get trades for a specific day
  const getTradesForDay = (day: Date) => {
    return trades.filter(trade => isSameDay(new Date(trade.created_at), day));
  };

  // Helper to calculate daily stats
  const getDailyStats = (dayTrades: TradingLog[]) => {
    if (dayTrades.length === 0) return null;

    const totalPnL = dayTrades.reduce((acc, t) => acc + (t.net_pnl || 0), 0);
    const wins = dayTrades.filter(t => (t.net_pnl || 0) > 0).length;
    const winRate = (wins / dayTrades.length) * 100;

    return { totalPnL, wins, count: dayTrades.length, winRate };
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-4 text-center">
        {weekDays.map(day => (
          <div key={day} className="text-slate-500 font-bold text-sm tracking-widest uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, idx) => {
          const dayTrades = getTradesForDay(day);
          const stats = getDailyStats(dayTrades);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          let bgClass = "bg-slate-800/30 border-slate-800 text-slate-500";
          let indicatorColor = "";

          if (isCurrentMonth) {
            bgClass = "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 cursor-pointer";
            if (stats) {
              if (stats.totalPnL > 0) {
                bgClass = "bg-emerald-900/20 border-emerald-500/30 text-emerald-100 hover:border-emerald-500 hover:bg-emerald-900/30 cursor-pointer";
                indicatorColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
              } else if (stats.totalPnL < 0) {
                bgClass = "bg-rose-900/20 border-rose-500/30 text-rose-100 hover:border-rose-500 hover:bg-rose-900/30 cursor-pointer";
                indicatorColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
              } else {
                bgClass = "bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-400 cursor-pointer";
                indicatorColor = "bg-slate-400";
              }
            }
          } else {
             bgClass = "bg-transparent border-transparent text-slate-700 opacity-50";
          }

          return (
            <motion.div
              key={idx}
              whileHover={isCurrentMonth ? { scale: 1.05 } : {}}
              whileTap={isCurrentMonth ? { scale: 0.95 } : {}}
              onClick={() => isCurrentMonth && setSelectedDate(day)}
              className={`relative h-24 sm:h-32 rounded-2xl border p-3 flex flex-col justify-between transition-all ${bgClass}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-lg font-bold ${!isCurrentMonth && "invisible"}`}>
                  {format(day, 'd')}
                </span>
                {indicatorColor && (
                  <div className={`w-3 h-3 rounded-full ${indicatorColor}`} />
                )}
              </div>
              
              {isCurrentMonth && stats && (
                <div className="text-xs sm:text-sm">
                  <div className={`font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stats.totalPnL >= 0 ? '+' : ''}{formatCurrency(stats.totalPnL, 'crypto').replace('Rp', '')}
                  </div>
                  <div className="text-slate-500 text-[10px] sm:text-xs mt-1">
                    {stats.count} Trades
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selected Date Popup */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-emerald-400" />
                    {format(selectedDate, 'EEEE, d MMMM yyyy')}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Daily Trade Summary</p>
                </div>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                 {(() => {
                    const dayTrades = getTradesForDay(selectedDate);
                    const stats = getDailyStats(dayTrades);
                    
                    if (!stats) return (
                      <div className="text-center py-12 text-slate-500">
                        <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No trades recorded on this day.</p>
                      </div>
                    );

                    return (
                      <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-4 rounded-2xl border ${stats.totalPnL >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Net PnL</p>
                            <p className={`text-2xl font-black ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatCurrency(stats.totalPnL, 'crypto')}
                            </p>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Win Rate</p>
                            <p className="text-2xl font-black text-white">
                              {formatPercentage(stats.winRate)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{stats.wins} Wins / {stats.count} Trades</p>
                          </div>
                        </div>

                        {/* Trades List */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Trades History</h4>
                          <div className="space-y-3">
                            {dayTrades.map(trade => (
                              <div key={trade.id} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between border border-slate-700 hover:border-slate-600 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trade.order_type === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {trade.order_type === 'long' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white">{trade.asset_name}</h5>
                                    <p className="text-xs text-slate-500 capitalize">{trade.order_type} • {trade.asset_type}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-bold ${trade.net_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {trade.net_pnl >= 0 ? '+' : ''}{formatCurrency(trade.net_pnl, trade.asset_type)}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {(trade.net_pnl / (trade.entry_price * trade.quantity) * 100).toFixed(2)}% ROI
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                 })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
