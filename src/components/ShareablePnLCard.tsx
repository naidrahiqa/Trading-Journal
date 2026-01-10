/**
 * Enhanced Shareable PnL Card Component - KECE ABIS Edition
 * @description Ultra-premium social-media-ready card with real logos
 * @version 2.0.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, X, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ShareableCardData } from '@/types/trading';
import { formatCurrency, formatPercentage, getPnLColorClass } from '@/utils/tradingCalculations';
import { generateCryptoAvatar, generateStockAvatar, getBrokerLogo } from '@/utils/logoUtils';

interface ShareablePnLCardProps {
  data: ShareableCardData;
  onClose: () => void;
}

export default function ShareablePnLCard({ data, onClose }: ShareablePnLCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [assetLogoUrl, setAssetLogoUrl] = useState<string>('');

  // Generate asset logo on mount
  useEffect(() => {
    const symbol = data.assetName.split('/')[0]; // BTC/USDT -> BTC
    
    if (data.assetType === 'crypto') {
      // Generate crypto SVG avatar
      setAssetLogoUrl(generateCryptoAvatar(symbol.toLowerCase()));
    } else {
      // Generate stock SVG avatar
      setAssetLogoUrl(generateStockAvatar(symbol.toUpperCase()));
    }
  }, [data.assetName, data.assetType]);

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
  const assetTypeLabel = data.assetType === 'crypto' ? 'CRYPTO' : 'STOCK';
  const orderTypeLabel = data.orderType ? data.orderType.toUpperCase() : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative max-w-2xl w-full my-8" // Increased max-width for better spacing
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Card Component (To Be Exported) */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[2rem] shadow-2xl bg-slate-900 border border-slate-800 text-white font-sans selection:bg-none"
          // Inlining styles for html2canvas compatibility
          style={{
            background: isProfitable
              ? 'linear-gradient(145deg, #022c22 0%, #064e3b 40%, #065f46 100%)'
              : 'linear-gradient(145deg, #450a0a 0%, #7f1d1d 40%, #991b1b 100%)',
          }}
        >
          {/* Background Textures */}
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 60%)' 
          }}></div>
          
          {/* Subtle noise texture or pattern could go here */}

          <div className="relative p-10 flex flex-col gap-8">
            
            {/* 1. Header Section: Asset & Platform */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                {/* Asset Logo */}
                <div className="relative">
                  <div className={`absolute inset-0 rounded-2xl blur-lg opacity-60 ${
                    isProfitable ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}></div>
                  <img 
                    src={assetLogoUrl} 
                    alt={data.assetName}
                    className="relative w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white/10"
                  />
                </div>
                
                {/* Asset Details */}
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-white leading-none mb-2">
                    {data.assetName}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white/90 text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-white/10">
                      {assetTypeLabel}
                    </span>
                    {orderTypeLabel && (
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase backdrop-blur-md border ${
                        data.orderType === 'long' 
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-200 border-rose-500/30'
                      }`}>
                        {orderTypeLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Platform Logo */}
              <div className="text-right opacity-90">
                <div className="text-5xl drop-shadow-lg filter">
                  {getBrokerLogo(data.platformName.toLowerCase()) || data.platformLogo}
                </div>
              </div>
            </div>

            {/* 2. Main Stats Grid */}
            <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-inner">
              <div className="text-center mb-6">
                <h3 className="text-white/50 text-sm font-bold uppercase tracking-[0.3em] pl-[0.3em]">Trade Result</h3>
              </div>

              {/* Grid: Entry/Exit if available */}
              {(data.entryPrice && data.exitPrice) && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Entry Price</p>
                    <p className="text-xl md:text-2xl font-bold font-mono text-white">
                      {formatCurrency(data.entryPrice, data.assetType)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Exit Price</p>
                    <p className="text-xl md:text-2xl font-bold font-mono text-white">
                      {formatCurrency(data.exitPrice, data.assetType)}
                    </p>
                  </div>
                </div>
              )}

              {/* PnL & ROI Centerpiece */}
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Net PnL */}
                <div className="relative">
                   <div className={`absolute inset-0 blur-3xl opacity-40 ${
                      isProfitable ? 'bg-emerald-400' : 'bg-rose-400'
                   }`}></div>
                   <div className={`relative text-6xl md:text-7xl font-black tracking-tighter flex items-center gap-3 ${
                      isProfitable 
                        ? 'text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-100 to-emerald-300 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]'
                        : 'text-transparent bg-clip-text bg-gradient-to-br from-white via-rose-100 to-rose-300 drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]'
                   }`}>
                      {isProfitable ? '+' : ''}{formatCurrency(data.netPnL, data.assetType)}
                   </div>
                </div>

                {/* ROI Badge */}
                <div className={`px-6 py-2 rounded-full border-2 ${
                  isProfitable 
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                }`}>
                  <span className="text-2xl font-bold">
                    {isProfitable ? 'ROI +' : 'ROI '}{formatPercentage(data.roi)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Footer Section */}
            <div className="flex items-end justify-between pt-2 border-t border-white/10">
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Tanggal</p>
                <p className="text-white font-medium">
                  {new Date(data.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="text-right">
                <div className="flex flex-col items-end">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Jurnal Trading Ku</p>
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-sm">@username</span> 
                    {/* Note: In a real app, pass username via props */}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 px-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            disabled={isExporting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            {isExporting ? 'Generating...' : 'Share Image'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Download
          </motion.button>
        </div>

      </motion.div>
    </motion.div>
  );
}
