/**
 * Custom PnL Card Editor
 * @description Customizable card with background upload & aspect ratio
 * @version 3.0.0
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Download, TrendingUp, TrendingDown, X, Sparkles,
  Image as ImageIcon, Maximize, User, Palette, Upload
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ShareableCardData } from '@/types/trading';
import { formatCurrency, formatPercentage } from '@/utils/tradingCalculations';
import { generateCryptoAvatar, generateStockAvatar, getBrokerLogo } from '@/utils/logoUtils';

interface CustomPnLCardProps {
  data: ShareableCardData;
  onClose: () => void;
}

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1)', width: 1080, height: 1080 },
  { id: '4:5', label: 'Instagram Post (4:5)', width: 1080, height: 1350 },
  { id: '9:16', label: 'Story/Reels (9:16)', width: 1080, height: 1920 },
  { id: '16:9', label: 'Landscape (16:9)', width: 1920, height: 1080 },
];

const DEFAULT_BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

export default function CustomPnLCard({ data, onClose }: CustomPnLCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [assetLogoUrl, setAssetLogoUrl] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[1]); // 4:5 default
  const [background, setBackground] = useState(DEFAULT_BACKGROUNDS[0]);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(true);

  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Generate asset logo
  useEffect(() => {
    const symbol = data.assetName.split('/')[0];
    if (data.assetType === 'crypto') {
      setAssetLogoUrl(generateCrypto Avatar(symbol.toLowerCase()));
    } else {
      setAssetLogoUrl(generateStockAvatar(symbol.toUpperCase()));
    }
  }, [data.assetName, data.assetType]);

  const loadUserProfile = async () => {
    try {
      const storedUsername = localStorage.getItem('tradingJournalUsername');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    localStorage.setItem('tradingJournalUsername', value);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomBgImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async (action: 'download' | 'share') => {
    if (!cardRef.current) return;

    setIsExporting(true);
    setShowCustomize(false);

    // Wait for UI update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        useCORS: true,
        width: selectedRatio.width,
        height: selectedRatio.height,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (action === 'share' && navigator.share && typeof navigator.canShare === 'function') {
          const file = new File([blob], `${data.assetName}-PnL.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `${data.assetName} - ${formatCurrency(data.netPnL, data.assetType)}`,
              });
            } catch (err) {
              downloadBlob(blob);
            }
          } else {
            downloadBlob(blob);
          }
        } else {
          downloadBlob(blob);
        }
      });
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsExporting(false);
      setShowCustomize(true);
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.assetName.replace('/', '-')}-PnL-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isProfitable = data.netPnL >= 0;
  const assetTypeLabel = data.assetType === 'crypto' ? 'CRYPTOCURRENCY' : 'SAHAM';

  const cardStyle = {
    width: `${selectedRatio.width / 3}px`,
    height: `${selectedRatio.height / 3}px`,
    maxWidth: '100%',
    maxHeight: '80vh',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-7xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
          {/* Preview Area */}
          <div className="flex flex-col items-center">
            <button
              onClick={onClose}
              className="self-end mb-4 text-white hover:text-emerald-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Card Preview */}
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={cardStyle}
            >
              {/* Background */}
              <div 
                className="absolute inset-0"
                style={{
                  background: customBgImage ? `url(${customBgImage})` : background,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={assetLogoUrl}
                      alt={data.assetName}
                      className="w-16 h-16 rounded-2xl shadow-2xl"
                    />
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {data.assetName}
                      </h2>
                      <span className={`text-xs font-bold tracking-wider ${
                        isProfitable ? 'text-emerald-300' : 'text-rose-300'
                      }`}>
                        {assetTypeLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl">{getBrokerLogo(data.platformName.toLowerCase())}</div>
                </div>

                {/* PnL Display */}
                <div className="text-center my-8">
                  <p className="text-slate-400 text-sm mb-2 uppercase tracking-[0.3em]">
                    NET PROFIT/LOSS
                  </p>
                  <div className={`text-6xl font-black mb-3 flex items-center justify-center gap-3 ${
                    isProfitable ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isProfitable ? <TrendingUp className="w-12 h-12" /> : <TrendingDown className="w-12 h-12" />}
                    <span>{formatCurrency(data.netPnL, data.assetType)}</span>
                  </div>
                  <div className={`inline-block px-6 py-3 rounded-full border-2 ${
                    isProfitable
                      ? 'bg-emerald-500/10 border-emerald-400'
                      : 'bg-rose-500/10 border-rose-400'
                  }`}>
                    <span className={`text-2xl font-black ${
                      isProfitable ? 'text-emerald-300' : 'text-rose-300'
                    }`}>
                      {isProfitable ? '+' : ''}{formatPercentage(data.roi)} ROI
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">TANGGAL</p>
                    <p className="text-slate-300 font-semibold">
                      {new Date(data.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {username && (
                      <p className="text-emerald-400 font-bold text-lg mb-1">@{username}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Trading Journal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <AnimatePresence>
            {showCustomize && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 space-y-6"
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Customize Card
                </h3>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Username (Optional)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="yourusername"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Maximize className="w-4 h-4 inline mr-2" />
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          selectedRatio.id === ratio.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Background
                  </label>
                  
                  {/* Upload Custom */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-3 px-4 py-3 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Custom Background
                  </button>
                  <input
                    ref={fileInputRef}
 type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />

                  {/* Preset Gradients */}
                  <div className="grid grid-cols-4 gap-2">
                    {DEFAULT_BACKGROUNDS.map((bg, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setBackground(bg);
                          setCustomBgImage(null);
                        }}
                        className={`h-12 rounded-xl border-2 transition-all ${
                          background === bg && !customBgImage
                            ? 'border-white scale-110'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ background: bg }}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleExport('share')}
                    disabled={isExporting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5" />
                        SHARE
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleExport('download')}
                    disabled={isExporting}
                    className="w-full bg-slate-800 border-2 border-slate-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-slate-500 transition-all disabled:opacity-50"
                  >
                    <Download className="w-5 h-5" />
                    DOWNLOAD
                  </button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  💡 Tip: Add background & username untuk personal branding!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
