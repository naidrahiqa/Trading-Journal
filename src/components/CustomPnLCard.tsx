/**
 * Custom PnL Card Editor
 * @description Customizable card with background upload & aspect ratio
 * @version 3.2.0 (HD Output & Privacy Mode & Currency Selection)
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Download, TrendingUp, TrendingDown, X, Sparkles,
  Image as ImageIcon, Maximize, User, Palette, Upload,
  Eye, EyeOff
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ShareableCardData } from '@/types/trading';
import { formatCurrency, formatPercentage } from '@/utils/tradingCalculations';
import { getAssetLogo, getBrokerLogo, getBrokerLogoUrl } from '@/utils/logoUtils';

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
  const [hideValues, setHideValues] = useState(false);
  const [brokerLogoUrl, setBrokerLogoUrl] = useState<string>('');
  const [bgDimOpacity, setBgDimOpacity] = useState(25);
  const [showAssetIcon, setShowAssetIcon] = useState(true);
  const [customAssetName, setCustomAssetName] = useState(data.assetName);
  const [currency, setCurrency] = useState<'USD' | 'IDR'>(data.assetType === 'crypto' ? 'USD' : 'IDR');

  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Generate real asset logo with fallback
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await getAssetLogo(customAssetName, data.assetType);
        setAssetLogoUrl(url);
      } catch (error) {
        console.error('Error fetching asset logo:', error);
      }
    };
    fetchLogo();
  }, [customAssetName, data.assetType]);

  // Fetch Broker Logo
  useEffect(() => {
    const fetchBroker = async () => {
      try {
        const url = await getBrokerLogoUrl(data.platformName);
        setBrokerLogoUrl(url);
      } catch (error) {
        setBrokerLogoUrl(getBrokerLogo(data.platformName)); // Fallback to emoji
      }
    };
    fetchBroker();
  }, [data.platformName]);

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
      const result = event.target?.result as string;
      setCustomBgImage(result);
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
        scale: 2, // High resolution output
        logging: false,
        useCORS: true,
        width: selectedRatio.width,
        height: selectedRatio.height,
        // IMPORTANT: Reset transform during capture to get full resolution
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('pnl-card-export');
          if (el) {
            el.style.transform = 'none';
          }
        }
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (action === 'share' && navigator.share && typeof navigator.canShare === 'function') {
          const file = new File([blob], `${customAssetName}-PnL.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `${customAssetName} - ${data.netPnL >= 0 ? 'PROFIT' : 'LOSS'}`,
                text: `Cek profit ${customAssetName} saya!`,
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
    link.download = `${customAssetName.replace('/', '-')}-PnL-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isProfitable = data.netPnL >= 0;
  const assetTypeLabel = data.assetType === 'crypto' ? 'CRYPTOCURRENCY' : 'SAHAM';

  const [previewScale, setPreviewScale] = useState(0.35);

  useEffect(() => {
    const handleResize = () => {
      // Scale down card preview on mobile to fit screen width
      if (window.innerWidth < 640) {
        setPreviewScale(0.25); // Smaller on mobile
      } else {
        setPreviewScale(0.35); // Regular size on desktop
      }
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const previewContainerStyle = {
    width: `${selectedRatio.width * previewScale}px`,
    height: `${selectedRatio.height * previewScale}px`,
    position: 'relative' as const,
  };

  const cardStyle = {
    width: `${selectedRatio.width}px`,
    height: `${selectedRatio.height}px`,
    transform: `scale(${previewScale})`,
    transformOrigin: 'top left',
    maxWidth: 'none',
    maxHeight: 'none',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="min-h-full w-full flex items-start md:items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
          {/* Preview Area */}
          <div className="flex flex-col items-center lg:sticky lg:top-4">
            
            {/* Scale Container */}
            <div style={previewContainerStyle} className="shadow-2xl rounded-3xl overflow-hidden relative border border-slate-700">
               {/* Actual Card (Full Res, Scaled Down) */}
              <div
                ref={cardRef}
                id="pnl-card-export"
                className="relative overflow-hidden bg-slate-900"
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

                {/* Overlay - Controlled by Slider */}
                <div 
                  className="absolute inset-0 bg-black backdrop-blur-sm transition-opacity duration-300"
                  style={{ opacity: bgDimOpacity / 100 }}
                ></div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-12">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    {/* Asset Logo & Info */}
                    <div className="flex items-center gap-6">
                      {showAssetIcon && (
                      <div className="relative">
                        {/* Circle Background for Asset */}
                        <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
                          isProfitable ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}></div>
                        <img 
                          src={assetLogoUrl}
                          alt={customAssetName}
                          className={`relative w-24 h-24 rounded-full border border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.2)] object-cover`}
                        />
                      </div>
                      )}
                      <div>
                        <h2 className="text-5xl font-black tracking-tight leading-none mb-2 drop-shadow-lg text-white">
                          {customAssetName}
                        </h2>
                        <span className={`inline-block px-4 py-1.5 rounded-full text-xl font-bold tracking-wider border backdrop-blur-md ${
                          isProfitable 
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-200 border-rose-500/30'
                        }`}>
                          {assetTypeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Broker Logo - Blue Circle */}
                    <div className="relative">
                       <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-40"></div>
                       <div className="relative w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-blue-400/30 flex items-center justify-center overflow-hidden shadow-xl">
                          {brokerLogoUrl && brokerLogoUrl.startsWith('http') ? (
                            <img 
                              src={brokerLogoUrl} 
                              alt={data.platformName} 
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <span className="text-5xl">{getBrokerLogo(data.platformName.toLowerCase())}</span>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Main Content: PnL or Entry/Exit */}
                  <div className="text-center my-12">
                    <p className="text-slate-300 font-bold text-2xl mb-8 uppercase tracking-[0.4em] pl-[0.4em] drop-shadow-md">
                      {hideValues ? 'TRADE RESULT' : 'NET PROFIT/LOSS'}
                    </p>
                    
                    {hideValues && data.entryPrice && data.exitPrice ? (
                      // Hidden Mode: Show Entry/Exit
                      <div className="grid grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
                        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                          <p className="invisible-tag text-xl font-bold uppercase mb-4 tracking-widest bg-white/10 backdrop-blur-sm py-2 px-6 rounded-full inline-block text-slate-200 shadow-sm border border-white/5">Entry</p>
                          <p className="text-8xl font-black text-white tracking-tighter" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                            {formatCurrency(data.entryPrice, data.assetType, currency)}
                          </p>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                          <p className="invisible-tag text-xl font-bold uppercase mb-4 tracking-widest bg-white/10 backdrop-blur-sm py-2 px-6 rounded-full inline-block text-slate-200 shadow-sm border border-white/5">Exit</p>
                          <p className="text-8xl font-black text-white tracking-tighter" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                            {formatCurrency(data.exitPrice, data.assetType, currency)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Regular Mode: Show Net PnL
                      <div className={`text-[8rem] leading-none font-black mb-10 flex items-center justify-center gap-6 drop-shadow-2xl ${
                        isProfitable ? 'text-emerald-400' : 'text-rose-400'
                      }`} style={{ textShadow: isProfitable ? '0 0 40px rgba(52, 211, 153, 0.6)' : '0 2px 8px rgba(0,0,0,0.4)' }}>
                        {isProfitable ? <TrendingUp className="w-32 h-32 text-emerald-400" style={{ filter: 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.4))' }} /> : <TrendingDown className="w-32 h-32" />}
                        <span>{formatCurrency(data.netPnL, data.assetType, currency)}</span>
                      </div>
                    )}

                    {/* ROI Badge */}
                    <div className={`inline-block px-12 py-6 rounded-full border-4 shadow-2xl backdrop-blur-xl ${
                      isProfitable
                        ? 'bg-emerald-500/10 border-emerald-400/50'
                        : 'bg-rose-500/10 border-rose-400/50'
                    }`}>
                      <span className="text-6xl font-black tracking-tight text-white" 
                        style={{ textShadow: isProfitable ? '0 0 30px rgba(52, 211, 153, 0.8)' : '0 0 30px rgba(244, 63, 94, 0.6)' }}>
                        {formatPercentage(data.roi)} ROI
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between border-t border-white/10 pt-8">
                    <div>
                      <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-lg inline-block mb-3">
                        <p className="font-bold text-2xl tracking-widest text-slate-200">TANGGAL</p>
                      </div>
                      <p className="font-bold text-5xl text-white drop-shadow-md">
                        {new Date(data.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {username && (
                        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl inline-block mb-3 border border-white/5">
                          <p className="font-black text-5xl text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">@{username}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 justify-end opacity-90">
                        <Sparkles className="w-8 h-8 text-emerald-400" />
                        <span className="text-3xl font-bold tracking-wide text-white">Trading Journal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
              Close Preview
            </button>
          </div>

          {/* Customization Panel */}
          <AnimatePresence>
            {showCustomize && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 space-y-6 lg:w-[400px]"
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Customize Card
                </h3>

                {/* Privacy Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    {hideValues ? <EyeOff className="w-5 h-5 text-emerald-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                    <div>
                      <p className="text-white font-medium">Privacy Mode</p>
                      <p className="text-xs text-slate-400">Hide Net PnL value</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setHideValues(!hideValues)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      hideValues ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      hideValues ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Currency Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrency('IDR')}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        currency === 'IDR' 
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold' 
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      IDR (Rp)
                    </button>
                    <button 
                      onClick={() => setCurrency('USD')}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        currency === 'USD' 
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold' 
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                {/* Asset Name & Icon */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                       Asset Name & Icon
                    </label>
                    <div className="flex gap-2">
                       <input
                        type="text"
                        value={customAssetName}
                        onChange={(e) => setCustomAssetName(e.target.value)}
                        placeholder="e.g. BTC/USDT"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => setShowAssetIcon(!showAssetIcon)}
                        className={`px-4 rounded-xl border-2 transition-all ${
                          showAssetIcon
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-700 bg-slate-800 text-slate-400'
                        }`}
                        title="Toggle Asset Icon"
                      >
                         <ImageIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

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

                {/* Background Dimmer Slider */}
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                    <span>
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Background Dimmer
                    </span>
                    <span className="text-emerald-400">{bgDimOpacity}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={bgDimOpacity}
                    onChange={(e) => setBgDimOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">Adjust contrast for better readability</p>
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
