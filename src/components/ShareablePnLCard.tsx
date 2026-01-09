/**
 * Shareable PnL Card Component
 * @description Beautiful social-media-ready card with glassmorphism effect
 * @version 1.0.0
 */

'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ShareableCardData } from '@/types/trading';
import { formatCurrency, formatPercentage, getPnLColorClass } from '@/utils/tradingCalculations';

interface ShareablePnLCardProps {
  data: ShareableCardData;
  onClose: () => void;
}

export default function ShareablePnLCard({ data, onClose }: ShareablePnLCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pnl-${data.assetName}-${Date.now()}.png`;
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
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `pnl-${data.assetName}.png`, { type: 'image/png' });
          try {
            await navigator.share({
              files: [file],
              title: `${data.assetName} PnL`,
              text: `${data.netPnL >= 0 ? '📈' : '📉'} ${formatCurrency(data.netPnL, data.assetType)} (${formatPercentage(data.roi)})`,
            });
          } catch (err) {
            // Fallback to download if sharing fails
            handleDownload();
          }
        } else {
          // Fallback to download if Web Share API not available
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-emerald-400 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Card to be exported */}
        <div
          ref={cardRef}
          className={`relative overflow-hidden rounded-3xl shadow-2xl ${
            isProfitable
              ? 'bg-gradient-to-br from-emerald-500/20 via-slate-900 to-emerald-500/10'
              : 'bg-gradient-to-br from-rose-500/20 via-slate-900 to-rose-500/10'
          }`}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"></div>

          {/* Content */}
          <div className="relative p-8">
            {/* Header with Asset and Platform */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{data.assetLogo}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{data.assetName}</h2>
                  <p className="text-slate-400 text-sm uppercase tracking-wide">
                    {data.assetType === 'crypto' ? 'Cryptocurrency' : 'Stock'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl mb-1">{data.platformLogo}</div>
                <p className="text-slate-400 text-xs">{data.platformName}</p>
              </div>
            </div>

            {/* Net PnL - Main Focus */}
            <div className="mb-6 text-center">
              <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">Net Profit/Loss</p>
              <div
                className={`text-6xl font-black mb-2 flex items-center justify-center gap-3 ${
                  isProfitable ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="w-12 h-12" />
                ) : (
                  <TrendingDown className="w-12 h-12" />
                )}
                {formatCurrency(data.netPnL, data.assetType)}
              </div>
            </div>

            {/* ROI Badge */}
            <div className="flex justify-center mb-8">
              <div
                className={`px-6 py-3 rounded-full ${
                  isProfitable
                    ? 'bg-emerald-500/20 border-2 border-emerald-500'
                    : 'bg-rose-500/20 border-2 border-rose-500'
                }`}
              >
                <span
                  className={`text-2xl font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {isProfitable ? '+' : ''}{formatPercentage(data.roi)}
                </span>
                <span className="text-slate-400 text-sm ml-2">ROI</span>
              </div>
            </div>

            {/* Footer with Timestamp and Branding */}
            <div className="pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{new Date(data.timestamp).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
                <span className="font-semibold text-emerald-500">📊 Trading Journal</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            disabled={isExporting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            {isExporting ? 'Generating...' : 'Share'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 bg-slate-800 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Download
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
