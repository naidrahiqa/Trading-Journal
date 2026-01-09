/**
 * Platform Selector Component
 * @description Mobile-optimized, scalable platform selection UI
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check } from 'lucide-react';
import { getPlatformsByAssetType, getFeeRange } from '@/config/platformFees';
import { AssetType, Platform } from '@/types/trading';

interface PlatformSelectorProps {
  assetType: AssetType;
  selectedPlatform: Platform | '';
  onSelect: (platformId: Platform) => void;
}

export default function PlatformSelector({
  assetType,
  selectedPlatform,
  onSelect,
}: PlatformSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const platforms = getPlatformsByAssetType(assetType);
  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  // Filter platforms by search
  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (platformId: Platform) => {
    onSelect(platformId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-3">
        Trading Platform
        <span className="ml-2 text-xs text-slate-500">
          ({platforms.length} available)
        </span>
      </label>

      {/* Selected Platform Display / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all ${
          selectedPlatform
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
        }`}
      >
        {selectedPlatformData ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedPlatformData.logo}</span>
            <div className="text-left">
              <div className="font-semibold text-white">{selectedPlatformData.name}</div>
              <div className="text-xs text-slate-400">
                Fee: {getFeeRange(selectedPlatformData.id)}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-slate-400">Select a platform...</span>
        )}
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 right-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] md:max-h-96 flex flex-col"
            >
              {/* Header with Search */}
              <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">
                    Select Platform
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                {platforms.length > 5 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search platforms..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Platform List - Scrollable */}
              <div className="overflow-y-auto flex-1 p-2">
                {filteredPlatforms.length > 0 ? (
                  <div className="space-y-1">
                    {filteredPlatforms.map((platform) => (
                      <motion.button
                        key={platform.id}
                        type="button"
                        onClick={() => handleSelect(platform.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedPlatform === platform.id
                            ? 'bg-emerald-500/20 border-2 border-emerald-500'
                            : 'bg-slate-800/30 hover:bg-slate-800 border-2 border-transparent'
                        }`}
                      >
                        {/* Logo */}
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-3xl bg-slate-700/50 rounded-lg">
                          {platform.logo}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-white truncate">
                            {platform.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            Fee: {getFeeRange(platform.id)}
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {selectedPlatform === platform.id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No platforms found</p>
                    <p className="text-xs mt-1">Try a different search</p>
                  </div>
                )}
              </div>

              {/* Footer with Count */}
              <div className="p-3 border-t border-slate-700 bg-slate-900/50 text-center text-xs text-slate-500">
                {filteredPlatforms.length} platform{filteredPlatforms.length !== 1 ? 's' : ''} available
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
