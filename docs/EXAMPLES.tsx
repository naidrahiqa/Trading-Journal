/**
 * USAGE EXAMPLES - Trading Journal Dashboard
 * @description Various implementation scenarios
 */

// ============================================
// EXAMPLE 1: Basic Page Integration (App Router)
// ============================================

// src/app/trading/page.tsx
import TradingDashboard from '@/components/TradingDashboard';

export default function TradingPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <TradingDashboard />
    </main>
  );
}

// ============================================
// EXAMPLE 2: With Server-Side Auth Check
// ============================================

// src/app/trading/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TradingDashboard from '@/components/TradingDashboard';

export default async function ProtectedTradingPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <TradingDashboard />
    </div>
  );
}

// ============================================
// EXAMPLE 3: Embedded in Existing Dashboard
// ============================================

// src/app/dashboard/page.tsx
import TradingDashboard from '@/components/TradingDashboard';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      
      <div className="flex-1">
        <Header title="My Portfolio Dashboard" />
        
        <div className="p-6 space-y-8">
          {/* Your existing dashboard content */}
          <section>
            <h2>Portfolio Overview</h2>
            {/* Portfolio stats */}
          </section>
          
          {/* Trading Journal Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Trading Journal</h2>
            <TradingDashboard />
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: With Custom Wrapper Component
// ============================================

// src/components/TradingJournalWrapper.tsx
'use client';

import { useState } from 'react';
import TradingDashboard from '@/components/TradingDashboard';
import TradeHistory from '@/components/TradeHistory';

export default function TradingJournalWrapper() {
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('entry')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'entry'
              ? 'text-emerald-500 border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          New Trade Entry
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-emerald-500 border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Trade History
        </button>
      </div>

      {/* Content */}
      {activeTab === 'entry' ? (
        <TradingDashboard />
      ) : (
        <TradeHistory />
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Fetching and Displaying Trade History
// ============================================

// src/components/TradeHistory.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradingLog } from '@/types/trading';
import { formatCurrency, formatPercentage, getPnLColorClass } from '@/utils/tradingCalculations';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TradeHistory() {
  const [trades, setTrades] = useState<TradingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTrades();
  }, []);

  async function fetchTrades() {
    try {
      const { data, error } = await supabase
        .from('trading_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) setTrades(data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading trades...</div>;
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No trades recorded yet.</p>
        <p className="text-slate-500 text-sm mt-2">Start by adding your first trade!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Asset</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Platform</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Type</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Entry</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Exit</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Qty</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Fees</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Net P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {trades.map((trade) => {
              const roi = (trade.net_pnl / (trade.entry_price * trade.quantity)) * 100;
              
              return (
                <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(trade.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{trade.asset_name}</div>
                    <div className="text-xs text-slate-500 uppercase">{trade.asset_type}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 capitalize">
                    {trade.platform_id.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      trade.order_type === 'long' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {trade.order_type === 'long' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {trade.order_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-300">
                    {formatCurrency(trade.entry_price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-300">
                    {formatCurrency(trade.exit_price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-300">
                    {trade.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-rose-400">
                    -{formatCurrency(trade.total_fee)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`font-bold ${getPnLColorClass(trade.net_pnl)}`}>
                      {formatCurrency(trade.net_pnl)}
                    </div>
                    <div className={`text-xs ${getPnLColorClass(roi)}`}>
                      {formatPercentage(roi)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Real-time Updates with Supabase
// ============================================

// src/components/LiveTradeHistory.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradingLog } from '@/types/trading';

export default function LiveTradeHistory() {
  const [trades, setTrades] = useState<TradingLog[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial fetch
    fetchTrades();

    // Set up real-time subscription
    const channel = supabase
      .channel('trading_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trading_logs'
        },
        (payload) => {
          console.log('Change received!', payload);
          
          if (payload.eventType === 'INSERT') {
            setTrades(prev => [payload.new as TradingLog, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTrades(prev => 
              prev.map(trade => 
                trade.id === payload.new.id ? payload.new as TradingLog : trade
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTrades(prev => prev.filter(trade => trade.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTrades() {
    const { data } = await supabase
      .from('trading_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTrades(data);
  }

  return (
    <div>
      {/* Render trade history with real-time updates */}
      {trades.map(trade => (
        <div key={trade.id}>
          {/* Trade card */}
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 7: Trading Statistics Summary
// ============================================

// src/components/TradingStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatCurrency, formatPercentage } from '@/utils/tradingCalculations';

interface Stats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalNetPnL: number;
  totalFees: number;
  avgPnL: number;
}

export default function TradingStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { data } = await supabase
      .from('trading_logs')
      .select('net_pnl, total_fee');

    if (data) {
      const totalTrades = data.length;
      const winningTrades = data.filter(t => t.net_pnl > 0).length;
      const losingTrades = data.filter(t => t.net_pnl < 0).length;
      const totalNetPnL = data.reduce((sum, t) => sum + t.net_pnl, 0);
      const totalFees = data.reduce((sum, t) => sum + t.total_fee, 0);
      const avgPnL = totalTrades > 0 ? totalNetPnL / totalTrades : 0;

      setStats({
        totalTrades,
        winningTrades,
        losingTrades,
        totalNetPnL,
        totalFees,
        avgPnL
      });
    }
  }

  if (!stats) return <div>Loading stats...</div>;

  const winRate = stats.totalTrades > 0 
    ? (stats.winningTrades / stats.totalTrades) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-slate-400 text-sm mb-2">Total Trades</h3>
        <p className="text-3xl font-bold text-white">{stats.totalTrades}</p>
        <p className="text-sm text-slate-500 mt-2">
          {stats.winningTrades} wins / {stats.losingTrades} losses
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-slate-400 text-sm mb-2">Win Rate</h3>
        <p className={`text-3xl font-bold ${
          winRate >= 50 ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {formatPercentage(winRate)}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Avg P&L: {formatCurrency(stats.avgPnL)}
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-slate-400 text-sm mb-2">Net Profit/Loss</h3>
        <p className={`text-3xl font-bold ${
          stats.totalNetPnL > 0 ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {formatCurrency(stats.totalNetPnL)}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Fees paid: {formatCurrency(stats.totalFees)}
        </p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Using with Pages Router (Legacy)
// ============================================

// pages/trading.tsx
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import TradingDashboard from '@/components/TradingDashboard';

export default function TradingPage() {
  return (
    <div>
      <TradingDashboard />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
