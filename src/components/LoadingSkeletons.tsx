/**
 * Loading Skeleton Components
 * @description Beautiful loading states for dashboard
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function StatsCardSkeleton() {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
      <div className="animate-pulse">
        {/* Icon skeleton */}
        <div className="w-12 h-12 bg-slate-700 rounded-xl mb-4"></div>
        
        {/* Label skeleton */}
        <div className="h-4 bg-slate-700 rounded w-24 mb-3"></div>
        
        {/* Value skeleton */}
        <div className="h-8 bg-slate-700 rounded w-32 mb-2"></div>
        
        {/* Subtext skeleton */}
        <div className="h-3 bg-slate-700 rounded w-20"></div>
      </div>
    </div>
  );
}

export function TradeCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
    >
      <div className="animate-pulse space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-24"></div>
              <div className="h-3 bg-slate-700 rounded w-16"></div>
            </div>
          </div>
          <div className="w-20 h-8 bg-slate-700 rounded-full"></div>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-700 rounded w-16"></div>
              <div className="h-5 bg-slate-700 rounded w-20"></div>
            </div>
          ))}
        </div>
        
        {/* PnL */}
        <div className="pt-4 border-t border-slate-700">
          <div className="h-8 bg-slate-700 rounded w-32"></div>
        </div>
      </div>
    </motion.div>
  );
}

export function TradeTableSkeleton() {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              {['Asset', 'Platform', 'Type', 'Entry', 'Exit', 'PnL', 'ROI', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-4 text-left">
                  <div className="h-4 bg-slate-700 rounded w-16 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="border-t border-slate-800">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                  <td key={cell} className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-20 animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-10 w-24 bg-slate-700 rounded-xl animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </div>

      {/* Trade List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <TradeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function PlatformSelectorSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-slate-700 rounded w-32 animate-pulse"></div>
      <div className="h-14 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse"></div>
    </div>
  );
}

// Shimmer effect for premium look
export function ShimmerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-slate-800 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
    </div>
  );
}

// Add to globals.css:
/*
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
*/
