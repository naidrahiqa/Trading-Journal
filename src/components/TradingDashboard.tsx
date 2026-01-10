/**
 * Trading Dashboard Component
 * @description Premium dark-mode trading journal with live P&L preview
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Calculator,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import PlatformSelector from '@/components/PlatformSelector';
// Import utilities and configurations
import { 
  calculatePnL, 
  formatCurrency, 
  formatPercentage, 
  getPnLColorClass,
  getPnLBgClass,
  validateTradeInputs 
} from '@/utils/tradingCalculations';
import { getPlatformsByAssetType, ALL_PLATFORMS } from '@/config/platformFees';
import { 
  AssetType, 
  OrderType, 
  Platform, 
  TradingFormState, 
  PnLCalculation 
} from '@/types/trading';

// ==================== MAIN COMPONENT ====================

export default function TradingDashboard() {
  const supabase = createClientComponentClient();

  // ==================== STATE MANAGEMENT ====================
  
  const [assetType, setAssetType] = useState<AssetType>('crypto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState<TradingFormState>({
    assetName: '',
    assetType: 'crypto',
    platformId: '',
    orderType: 'long',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    notes: '',
    tags: []
  });

  // ==================== COMPUTED VALUES ====================

  const availablePlatforms = useMemo(() => {
    return getPlatformsByAssetType(assetType);
  }, [assetType]);

  const calculation: PnLCalculation | null = useMemo(() => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);

    if (!formData.platformId || isNaN(entry) || isNaN(exit) || isNaN(qty)) {
      return null;
    }

    // For stocks: convert lot to shares (1 lot = 100 shares)
    const actualQuantity = formData.assetType === 'stock' ? qty * 100 : qty;

    return calculatePnL(entry, exit, actualQuantity, formData.platformId as Platform, formData.orderType);
  }, [formData]);

  // ==================== EVENT HANDLERS ====================

  const handleAssetTypeToggle = () => {
    const newType: AssetType = assetType === 'crypto' ? 'stock' : 'crypto';
    setAssetType(newType);
    setFormData(prev => ({
      ...prev,
      assetType: newType,
      platformId: '' // Reset platform when switching types
    }));
  };

  const handleInputChange = (field: keyof TradingFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitStatus('idle');
  };

  const handlePlatformSelect = (platformId: Platform) => {
    setFormData(prev => ({ ...prev, platformId }));
  };

  const handleOrderTypeToggle = () => {
    setFormData(prev => ({
      ...prev,
      orderType: prev.orderType === 'long' ? 'short' : 'long'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);

    const validation = validateTradeInputs(entry, exit, qty);
    
    if (!validation.isValid) {
      setErrorMessage(validation.errors.join(', '));
      setSubmitStatus('error');
      return;
    }

    if (!formData.platformId || !formData.assetName.trim()) {
      setErrorMessage('Please fill in all required fields');
      setSubmitStatus('error');
      return;
    }

    if (!calculation) {
      setErrorMessage('Unable to calculate P&L');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save trades');
      }

      // Prepare payload
      const payload = {
        user_id: user.id,
        asset_name: formData.assetName.trim(),
        asset_type: formData.assetType,
        platform_id: formData.platformId,
        order_type: formData.orderType,
        entry_price: entry,
        exit_price: exit,
        quantity: formData.assetType === 'stock' ? qty * 100 : qty,  // Convert lot to shares for stocks
        gross_pnl: calculation.grossPnL,
        total_fee: calculation.fees.totalFee,
        net_pnl: calculation.netPnL,
        notes: formData.notes.trim() || null,
        tags: formData.tags.length > 0 ? formData.tags : null
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('trading_logs')
        .insert([payload]);

      if (error) throw error;

      // Success!
      setSubmitStatus('success');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          assetName: '',
          assetType,
          platformId: '',
          orderType: 'long',
          entryPrice: '',
          exitPrice: '',
          quantity: '',
          notes: '',
          tags: []
        });
        setSubmitStatus('idle');
      }, 2000);

    } catch (error: any) {
      console.error('Error saving trade:', error);
      setErrorMessage(error.message || 'Failed to save trade');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Trading Journal
          </h1>
          <p className="text-slate-400 text-lg">
            Track your trades with automated fee calculation
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Asset Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Asset Type
                  </label>
                  <div className="relative inline-flex items-center bg-slate-800/50 rounded-full p-1">
                    <button
                      type="button"
                      onClick={handleAssetTypeToggle}
                      className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${
                        assetType === 'crypto'
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/50'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Crypto
                    </button>
                    <button
                      type="button"
                      onClick={handleAssetTypeToggle}
                      className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${
                        assetType === 'stock'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Stocks
                    </button>
                  </div>
                </div>

                {/* Platform Selection - NEW COMPONENT */}
                <PlatformSelector
                  assetType={assetType}
                  selectedPlatform={formData.platformId}
                  onSelect={handlePlatformSelect}
                />

                {/* Asset Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    value={formData.assetName}
                    onChange={(e) => handleInputChange('assetName', e.target.value)}
                    placeholder={assetType === 'crypto' ? 'e.g., BTC/USDT' : 'e.g., AAPL'}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                {/* Order Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Order Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleOrderTypeToggle}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                        formData.orderType === 'long'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-700 bg-slate-800/30 text-slate-400'
                      }`}
                    >
                      <ArrowUpRight className="inline-block w-5 h-5 mr-2" />
                      Long (Buy)
                    </button>
                    <button
                      type="button"
                      onClick={handleOrderTypeToggle}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                        formData.orderType === 'short'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                          : 'border-slate-700 bg-slate-800/30 text-slate-400'
                      }`}
                    >
                      <ArrowDownRight className="inline-block w-5 h-5 mr-2" />
                      Short (Sell)
                    </button>
                  </div>
                </div>

                {/* Price and Quantity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Entry Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="number"
                        step="any"
                        value={formData.entryPrice}
                        onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Exit Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="number"
                        step="any"
                        value={formData.exitPrice}
                        onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {assetType === 'stock' ? 'Quantity (Lot)' : 'Quantity'}
                    </label>
                    {assetType === 'stock' && (
                      <p className="text-xs text-slate-500 mb-2">1 lot = 100 lembar saham</p>
                    )}
                    <input
                      type="number"
                      step="any"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder={assetType === 'stock' ? 'Jumlah lot' : '0'}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Trading Psychology & Notes Section */}
                <div className="space-y-4">
                  <div className="border-t border-slate-800 pt-6"></div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    🧠 Trading Psychology
                  </h3>
                  
                  {/* Emotions Chips */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Emotions Felt
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Calm', 'Fear', 'Greed', 'FOMO', 'Revenge', 'Disciplined', 'Patience', 'Impulsive'].map((emotion) => {
                        const isSelected = formData.tags.includes(emotion);
                        return (
                          <button
                            key={emotion}
                            type="button"
                            onClick={() => {
                              const newTags = isSelected
                                ? formData.tags.filter(t => t !== emotion)
                                : [...formData.tags, emotion];
                              handleInputChange('tags', newTags as any); // Cast because handleInputChange expects string usually, but we need to update our state handler logic
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                              isSelected
                                ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-purple-500/50 hover:text-purple-300'
                            }`}
                          >
                            {emotion}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes / Lessons */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Lesson Learned / Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="What did you learn from this trade?"
                      rows={3}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    submitStatus === 'success'
                      ? 'bg-emerald-500 text-white'
                      : submitStatus === 'error'
                      ? 'bg-rose-500 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Trade...
                    </span>
                  ) : submitStatus === 'success' ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Trade Saved Successfully!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      Save Trade
                    </span>
                  )}
                </motion.button>

                {/* Error Message */}
                <AnimatePresence>
                  {submitStatus === 'error' && errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{errorMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {calculation ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`sticky top-6 bg-gradient-to-br ${
                    calculation.netPnL > 0
                      ? 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/30'
                      : calculation.netPnL < 0
                      ? 'from-rose-500/10 to-pink-500/10 border-rose-500/30'
                      : 'from-slate-500/10 to-slate-500/10 border-slate-500/30'
                  } backdrop-blur-xl border-2 rounded-2xl p-6 shadow-2xl`}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Calculator className="w-6 h-6 text-slate-300" />
                    <h2 className="text-xl font-bold text-slate-100">Live Preview</h2>
                  </div>

                  {/* Net P&L */}
                  <div className="mb-6 p-4 bg-slate-900/50 rounded-xl">
                    <div className="text-sm text-slate-400 mb-1">Net Profit/Loss</div>
                    <div className={`text-4xl font-bold ${getPnLColorClass(calculation.netPnL)} flex items-center gap-2`}>
                      {calculation.netPnL > 0 ? (
                        <TrendingUp className="w-8 h-8" />
                      ) : calculation.netPnL < 0 ? (
                        <TrendingDown className="w-8 h-8" />
                      ) : null}
                      {formatCurrency(calculation.netPnL, formData.assetType)}
                    </div>
                  </div>

                  {/* ROI */}
                  <div className="mb-6 p-4 bg-slate-900/50 rounded-xl">
                    <div className="text-sm text-slate-400 mb-1">Return on Investment</div>
                    <div className={`text-3xl font-bold ${getPnLColorClass(calculation.roi)} flex items-center gap-2`}>
                      <Percent className="w-6 h-6" />
                      {formatPercentage(calculation.roi)}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                      <span className="text-slate-400">Gross P&L</span>
                      <span className={`font-semibold ${getPnLColorClass(calculation.grossPnL)}`}>
                        {formatCurrency(calculation.grossPnL, formData.assetType)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                      <span className="text-slate-400">Buy Fee</span>
                      <span className="font-semibold text-slate-300">
                        -{formatCurrency(calculation.fees.buyFee, formData.assetType)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                      <span className="text-slate-400">Sell Fee</span>
                      <span className="font-semibold text-slate-300">
                        -{formatCurrency(calculation.fees.sellFee, formData.assetType)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      <span className="text-rose-400 font-medium">Total Fees</span>
                      <span className="font-bold text-rose-400">
                        -{formatCurrency(calculation.fees.totalFee, formData.assetType)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-700 space-y-2">
                      {formData.assetType === 'stock' && formData.quantity && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Quantity</span>
                          <span className="font-semibold text-slate-300">
                            {formData.quantity} lot ({parseFloat(formData.quantity) * 100} lembar)
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Total Investment</span>
                        <span className="font-semibold text-slate-300">
                          {formatCurrency(calculation.totalValue, formData.assetType)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sticky top-6 bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 text-center"
                >
                  <Calculator className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">
                    Enter Trade Details
                  </h3>
                  <p className="text-sm text-slate-500">
                    Fill in the form to see live P&L calculations
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
