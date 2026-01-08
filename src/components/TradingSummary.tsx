/**
 * Trading Summary Dashboard
 * @description Main dashboard showing trading statistics and recent trades
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PlusCircle,
  Activity,
  Award,
  AlertTriangle,
  Calendar,
  BarChart3,
  Mail
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatPercentage, getPnLColorClass } from '@/utils/tradingCalculations';

interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  
  // Crypto stats (USD)
  cryptoTrades: number;
  cryptoNetPnL: number;
  cryptoBestTrade: number;
  cryptoWorstTrade: number;
  
  // Stock stats (IDR)
  stockTrades: number;
  stockNetPnL: number;
  stockBestTrade: number;
  stockWorstTrade: number;
}

interface RecentTrade {
  id: string;
  asset_name: string;
  asset_type: 'crypto' | 'stock';
  platform_id: string;
  net_pnl: number;
  created_at: string;
}

// Motivational quotes based on performance
const getMotivationalQuote = (stats: TradeStats | null): string => {
  if (!stats || stats.totalTrades === 0) {
    const quotes = [
      "Every expert was once a beginner. Start your trading journey today!",
      "The best time to start was yesterday. The next best time is now.",
      "Success is the sum of small efforts repeated day in and day out.",
      "Your first trade is the first step to financial freedom!"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  const winRate = stats.winRate;
  const totalPnL = stats.cryptoNetPnL + stats.stockNetPnL;

  if (winRate >= 70) {
    const quotes = [
      "Outstanding! You're trading like a pro! 🚀",
      "Fantastic win rate! Keep up the excellent work!",
      "You're on fire! But remember, discipline beats emotion.",
      "Amazing performance! Stay consistent and humble."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else if (winRate >= 50) {
    const quotes = [
      "Good progress! Every trade is a learning opportunity.",
      "Steady and consistent wins the race. Keep going!",
      "You're building solid foundations. Stay the course!",
      "Great work! Remember to stick to your strategy."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else {
    const quotes = [
      "Every trader faces challenges. Learn from each trade.",
      "Losses are lessons in disguise. Review and improve!",
      "The market is your teacher. Stay patient and keep learning.",
      "Great traders are made in tough times. Don't give up!"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

export default function TradingSummary() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      fetchStats();
      fetchRecentTrades();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: trades, error } = await supabase
        .from('trading_logs')
        .select('asset_type, net_pnl');

      if (error) throw error;
      if (!trades || trades.length === 0) {
        setStats({
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          cryptoTrades: 0,
          cryptoNetPnL: 0,
          cryptoBestTrade: 0,
          cryptoWorstTrade: 0,
          stockTrades: 0,
          stockNetPnL: 0,
          stockBestTrade: 0,
          stockWorstTrade: 0
        });
        setLoading(false);
        return;
      }

      // Separate crypto and stock trades
      const cryptoTrades = trades.filter(t => t.asset_type === 'crypto');
      const stockTrades = trades.filter(t => t.asset_type === 'stock');

      // Calculate stats
      const totalTrades = trades.length;
      const winningTrades = trades.filter(t => t.net_pnl > 0).length;
      const losingTrades = trades.filter(t => t.net_pnl < 0).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

      // Crypto stats
      const cryptoNetPnL = cryptoTrades.reduce((sum, t) => sum + t.net_pnl, 0);
      const cryptoPnLs = cryptoTrades.map(t => t.net_pnl);
      const cryptoBestTrade = cryptoPnLs.length > 0 ? Math.max(...cryptoPnLs) : 0;
      const cryptoWorstTrade = cryptoPnLs.length > 0 ? Math.min(...cryptoPnLs) : 0;

      // Stock stats
      const stockNetPnL = stockTrades.reduce((sum, t) => sum + t.net_pnl, 0);
      const stockPnLs = stockTrades.map(t => t.net_pnl);
      const stockBestTrade = stockPnLs.length > 0 ? Math.max(...stockPnLs) : 0;
      const stockWorstTrade = stockPnLs.length > 0 ? Math.min(...stockPnLs) : 0;

      setStats({
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        cryptoTrades: cryptoTrades.length,
        cryptoNetPnL,
        cryptoBestTrade,
        cryptoWorstTrade,
        stockTrades: stockTrades.length,
        stockNetPnL,
        stockBestTrade,
        stockWorstTrade
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_logs')
        .select('id, asset_name, asset_type, platform_id, net_pnl, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setRecentTrades(data);
    } catch (error) {
      console.error('Error fetching recent trades:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* User Info Bar */}
          {user && (
            <div className="flex items-center justify-between mb-4 p-3 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-emerald-500/30"
                  />
                )}
                <div>
                  <div className="text-white font-medium text-sm">
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <div className="text-slate-400 text-xs flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
              >
                Logout
              </motion.button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Trading Dashboard
              </h1>
              <p className="text-slate-400 text-lg">
                Track your trading performance
              </p>
            </div>
            
            {/* Add Trade Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/add-trade')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Add New Trade
            </motion.button>
          </div>

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl"
          >
            <p className="text-emerald-400 text-sm font-medium italic text-center">
              💡 "{getMotivationalQuote(stats)}"
            </p>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        {stats && stats.totalTrades > 0 ? (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Trades */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300">Total Trades</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stats.totalTrades}</div>
                <div className="text-sm text-slate-400">
                  {stats.winningTrades} wins / {stats.losingTrades} losses
                </div>
              </motion.div>

              {/* Win Rate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300">Win Rate</h3>
                </div>
                <div className={`text-4xl font-bold mb-2 ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercentage(stats.winRate)}
                </div>
                <div className="text-sm text-slate-400">
                  {stats.winRate >= 50 ? 'Excellent performance!' : 'Keep improving!'}
                </div>
              </motion.div>

              {/* Combined P&L */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${
                    (stats.cryptoNetPnL + stats.stockNetPnL) > 0 
                      ? 'bg-emerald-500/10' 
                      : 'bg-rose-500/10'
                  }`}>
                    <BarChart3 className={`w-6 h-6 ${
                      (stats.cryptoNetPnL + stats.stockNetPnL) > 0 
                        ? 'text-emerald-400' 
                        : 'text-rose-400'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300">Combined P&L</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Crypto:</span>
                    <span className={`font-semibold ${getPnLColorClass(stats.cryptoNetPnL)}`}>
                      {formatCurrency(stats.cryptoNetPnL, 'crypto')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Stock:</span>
                    <span className={`font-semibold ${getPnLColorClass(stats.stockNetPnL)}`}>
                      {formatCurrency(stats.stockNetPnL, 'stock')}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Detailed Stats - Crypto & Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Crypto Stats */}
              {stats.cryptoTrades > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    Crypto Trading (USD)
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                      <span className="text-slate-300">Total Trades</span>
                      <span className="font-bold text-white">{stats.cryptoTrades}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                      <span className="text-slate-300">Net P&L</span>
                      <span className={`font-bold ${getPnLColorClass(stats.cryptoNetPnL)}`}>
                        {formatCurrency(stats.cryptoNetPnL, 'crypto')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="text-emerald-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Best Trade
                      </span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(stats.cryptoBestTrade, 'crypto')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      <span className="text-rose-400 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Worst Trade
                      </span>
                      <span className="font-bold text-rose-400">
                        {formatCurrency(stats.cryptoWorstTrade, 'crypto')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stock Stats */}
              {stats.stockTrades > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    Stock Trading (IDR)
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                      <span className="text-slate-300">Total Trades</span>
                      <span className="font-bold text-white">{stats.stockTrades}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                      <span className="text-slate-300">Net P&L</span>
                      <span className={`font-bold ${getPnLColorClass(stats.stockNetPnL)}`}>
                        {formatCurrency(stats.stockNetPnL, 'stock')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="text-emerald-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Best Trade
                      </span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(stats.stockBestTrade, 'stock')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      <span className="text-rose-400 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Worst Trade
                      </span>
                      <span className="font-bold text-rose-400">
                        {formatCurrency(stats.stockWorstTrade, 'stock')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Recent Trades */}
            {recentTrades.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-slate-400" />
                  Recent Trades
                </h3>
                
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.asset_type === 'crypto'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {trade.asset_type.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{trade.asset_name}</div>
                          <div className="text-xs text-slate-400 capitalize">
                            {trade.platform_id.replace('_', ' ')} • {new Date(trade.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${getPnLColorClass(trade.net_pnl)}`}>
                        {formatCurrency(trade.net_pnl, trade.asset_type)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="mb-6">
              <BarChart3 className="w-24 h-24 mx-auto text-slate-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-300 mb-2">
              No Trades Yet
            </h2>
            <p className="text-slate-500 mb-8">
              Start tracking your trades to see your performance metrics
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/add-trade')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all"
            >
              <PlusCircle className="w-6 h-6" />
              Add Your First Trade
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
