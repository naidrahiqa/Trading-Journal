/**
 * Enhanced Shareable PnL Card Component - KECE ABIS Edition
 * @description Ultra-premium social-media-ready card with real logos
 * @version 2.0.0
 */

'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, X, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ShareableCardData } from '@/types/trading';
import { formatCurrency, formatPercentage, getPnLColorClass } from '@/utils/tradingCalculations';

interface ShareablePnLCardProps {
  data: ShareableCardData;
  onClose: () => void;
}

// Real crypto logos from CoinGecko API
const getCryptoLogo = (assetName: string): string => {
  const symbol = assetName.split('/')[0].toLowerCase(); // BTC/USDT -> btc
  return `https://assets.coincap.io/assets/icons/${symbol}@2x.png`;
};

// Generate avatar for stocks (first letter with gradient)
const getStockAvatar = (ticker: string): JSX.Element => {
  const letter = ticker.charAt(0).toUpperCase();
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
  ];
  const colorIndex = letter.charCodeAt(0) % colors.length;
  
  return (
    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center shadow-2xl`}>
      <span className="text-4xl font-black text-white">{letter}</span>
    </div>
  );
};

// Platform logos mapping
const platformLogos: Record<string, string> = {
  binance: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
  bybit: '🟠',
  okx: '⚫',
  tokocrypto: '🔵',
  indodax: '🟣',
  reku: '🟢',
  pintu: '🟡',
  ajaib: '🟢',
  stockbit: '📊',
  ipot: '📈',
  mirae: '🏛️',
  gotrade: '🌐',
  interactive_brokers: '🔷',
};

export default function ShareablePnLCard({ data, onClose }: ShareablePnLCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3, // Higher quality!
        logging: false,
        useCORS: true, // Allow cross-origin images
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.assetName.replace('/', '-')}-PnL-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Check if Web Share API is available and can share files
        if (navigator.share && typeof navigator.canShare === 'function') {
          const file = new File([blob], `${data.assetName}-PnL.png`, { type: 'image/png' });
          
          // Check if this specific file can be shared
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `${data.assetName} - ${data.netPnL >= 0 ? 'PROFIT' : 'LOSS'}`,
                text: `${data.netPnL >= 0 ? '📈 CUAN!' : '📉'} ${formatCurrency(data.netPnL, data.assetType)} (${formatPercentage(data.roi)} ROI)`,
              });
            } catch (err) {
              handleDownload();
            }
          } else {
            handleDownload();
          }
        } else {
          handleDownload();
        }
      });
    } catch (error) {
      console.error('Error sharing card:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isProfitable = data.netPnL >= 0;
  const assetTypeLabel = data.assetType === 'crypto' ? 'CRYPTOCURRENCY' : 'SAHAM'; // Changed!

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-16 right-0 text-white hover:text-emerald-400 transition-colors group"
        >
          <div className="relative">
            <X className="w-10 h-10" />
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </button>

        {/* Card to be exported */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: isProfitable
              ? 'linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #064e3b 100%)'
              : 'linear-gradient(135deg, #7f1d1d 0%, #0f172a 50%, #7f1d1d 100%)',
          }}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className={`absolute inset-0 bg-gradient-to-br ${
              isProfitable 
                ? 'from-emerald-500/40 via-transparent to-cyan-500/40' 
                : 'from-rose-500/40 via-transparent to-pink-500/40'
            } animate-pulse`}></div>
          </div>

          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-2xl"></div>

          {/* Neon Glow Effect */}
          <div className={`absolute inset-0 ${
            isProfitable ? 'shadow-[0_0_100px_rgba(16,185,129,0.3)]' : 'shadow-[0_0_100px_rgba(244,63,94,0.3)]'
          }`}></div>

          {/* Content */}
          <div className="relative p-10">
            {/* Header - Asset Info */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                {/* Asset Logo */}
                {data.assetType === 'crypto' && !logoError ? (
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      isProfitable ? 'from-emerald-500 to-cyan-500' : 'from-rose-500 to-pink-500'
                    } rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity`}></div>
                    <img 
                      src={getCryptoLogo(data.assetName)}
                      alt={data.assetName}
                      className="relative w-20 h-20 rounded-2xl object-cover shadow-2xl"
                      onError={() => setLogoError(true)}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    {getStockAvatar(data.assetName)}
                  </div>
                )}
                
                <div>
                  <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
                    {data.assetName}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                      isProfitable 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    }`}>
                      {assetTypeLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform Badge */}
              <div className="text-right">
                <div className="text-4xl mb-2">{platformLogos[data.platformName.toLowerCase()] || data.platformLogo}</div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {data.platformName}
                </p>
              </div>
            </div>

            {/* Divider with Sparkles */}
            <div className="relative h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-8">
              <Sparkles className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 ${
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`} />
            </div>

            {/* Net PnL - MEGA DISPLAY */}
            <div className="mb-8 text-center">
              <p className="text-slate-400 text-sm mb-3 uppercase tracking-[0.3em] font-bold">
                NET PROFIT/LOSS
              </p>
              <div className="relative">
                {/* Glow effect behind text */}
                <div className={`absolute inset-0 blur-3xl opacity-50 ${
                  isProfitable ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></div>
                
                <div className={`relative text-7xl font-black mb-3 flex items-center justify-center gap-3 ${
                  isProfitable ? 'text-emerald-400' : 'text-rose-400'
                }`} style={{
                  textShadow: isProfitable 
                    ? '0 0 40px rgba(16,185,129,0.8)' 
                    : '0 0 40px rgba(244,63,94,0.8)'
                }}>
                  {isProfitable ? (
                    <TrendingUp className="w-16 h-16" strokeWidth={3} />
                  ) : (
                    <TrendingDown className="w-16 h-16" strokeWidth={3} />
                  )}
                  <span>{formatCurrency(data.netPnL, data.assetType)}</span>
                </div>
              </div>
            </div>

            {/* ROI Badge - BIGGER */}
            <div className="flex justify-center mb-10">
              <div className="relative group">
                {/* Animated ring */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                  isProfitable 
                    ? 'from-emerald-500 via-cyan-500 to-emerald-500' 
                    : 'from-rose-500 via-pink-500 to-rose-500'
                } blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse`}></div>
                
                <div className={`relative px-8 py-4 rounded-full border-4 ${
                  isProfitable
                    ? 'bg-emerald-500/10 border-emerald-400 backdrop-blur-sm'
                    : 'bg-rose-500/10 border-rose-400 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-black ${
                      isProfitable ? 'text-emerald-300' : 'text-rose-300'
                    }`}>
                      {isProfitable ? '+' : ''}{formatPercentage(data.roi)}
                    </span>
                    <span className="text-slate-300 text-lg font-bold">ROI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Tanggal</p>
                  <p className="text-slate-300 font-semibold">
                    {new Date(data.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <span className={`text-lg font-black bg-gradient-to-r ${
                      isProfitable 
                        ? 'from-emerald-400 to-cyan-400' 
                        : 'from-rose-400 to-pink-400'
                    } bg-clip-text text-transparent`}>
                      Trading Journal
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Premium Analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative corner gradients */}
          <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${
            isProfitable ? 'from-emerald-500/30' : 'from-rose-500/30'
          } to-transparent rounded-full blur-3xl`}></div>
          <div className={`absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr ${
            isProfitable ? 'from-cyan-500/30' : 'from-pink-500/30'
          } to-transparent rounded-full blur-3xl`}></div>
        </div>

        {/* Action Buttons - ENHANCED */}
        <div className="flex gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            disabled={isExporting}
            className="flex-1 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl">
              <Share2 className="w-6 h-6" />
              {isExporting ? 'Generating...' : 'SHARE'}
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 relative group"
          >
            <div className="absolute inset-0 bg-slate-700 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-slate-800 border-2 border-slate-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:border-slate-500 transition-colors">
              <Download className="w-6 h-6" />
              DOWNLOAD
            </div>
          </motion.button>
        </div>

        {/* Pro Tip */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 text-sm mt-6"
        >
          💡 <span className="text-slate-400">Pro tip:</span> Share your wins, learn from losses!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
