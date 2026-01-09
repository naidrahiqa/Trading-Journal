/**
 * Enhanced Login Page with Feature Showcase
 * @description Epic landing page with animated feature preview
 * @version 3.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { 
  Mail, Lock, Loader2, TrendingUp, AlertCircle,
  BarChart3, Share2, Filter, Eye, Brain, Clock, Target, Sparkles, Zap, Shield
} from 'lucide-react';

export default function EmailAuth() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [currentFeature, setCurrentFeature] = useState(0);

  // Feature showcase
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Automated Fee Calculation",
      description: "14+ platform support dengan fee otomatis",
      color: "from-blue-500 to-cyan-500",
      stats: "14+ Platforms"
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Shareable PnL Cards",
      description: "Generate kartu cuan keren untuk social media",
      color: "from-emerald-500 to-green-500",
      stats: "1-Click Share"
    },
    {
      icon: <Filter className="w-8 h-8" />,
      title: "Timeframe Filtering",
      description: "Analisis performa dari 7 hari sampai all-time",
      color: "from-purple-500 to-pink-500",
      stats: "7 Timeframes"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Psychology Tracking",
      description: "Track FOMO, Revenge Trading, dan Discipline",
      color: "from-orange-500 to-red-500",
      stats: "12 Tags"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Trading Hours Analytics",
      description: "Find jam terbaik untuk trading Anda",
      color: "from-indigo-500 to-blue-500",
      stats: "24/7 Insights"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Expected Value (EV)",
      description: "Hitung profitability strategy jangka panjang",
      color: "from-yellow-500 to-orange-500",
      stats: "Real Math"
    }
  ];

  useEffect(() => {
    checkUser();
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email dan password harus diisi!');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || email.split('@')[0],
            }
          }
        });

        if (error) throw error;
        if (data.user) router.push('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'Login/Register gagal. Coba lagi!';
      
      if (error.message?.includes('Email not confirmed')) {
        errorMessage = '📧 Email belum dikonfirmasi! Check inbox Anda atau disable email confirmation di Supabase Settings.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '❌ Email atau password salah! Pastikan sudah register.';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = '⚠️ Email sudah terdaftar! Coba login.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative grid lg:grid-cols-2 gap-8 min-h-screen">
        {/* LEFT SIDE - FEATURE SHOWCASE */}
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Hero Section */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">v3.0.0 - Psychology Edition</span>
              </div>
              
              <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Trading Journal
              </h1>
              
              <p className="text-2xl text-slate-300 mb-4 font-semibold">
                Dari Trader, Untuk Trader 📈
              </p>
              
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Platform <span className="text-emerald-400 font-bold">ALL-IN-ONE</span> untuk track performa,
                analyze psychology, dan <span className="text-cyan-400 font-bold">level up</span> trading skill Anda.
                <span className="text-rose-400 font-bold"> 100% GRATIS!</span>
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-12">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                  <div className="text-3xl font-black text-emerald-400">14+</div>
                  <div className="text-xs text-slate-500 uppercase">Platforms</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                  <div className="text-3xl font-black text-cyan-400">7</div>
                  <div className="text-xs text-slate-500 uppercase">Timeframes</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                  <div className="text-3xl font-black text-purple-400">12</div>
                  <div className="text-xs text-slate-500 uppercase">Psych Tags</div>
                </div>
              </div>
            </div>

            {/* Animated Feature Carousel */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${features[currentFeature].color} rounded-2xl mb-6 shadow-lg`}>
                    {features[currentFeature].icon}
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">
                      {features[currentFeature].title}
                    </h3>
                    <span className={`px-3 py-1 bg-gradient-to-r ${features[currentFeature].color} rounded-full text-xs font-bold text-white`}>
                      {features[currentFeature].stats}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-lg">
                    {features[currentFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentFeature 
                        ? 'w-8 bg-emerald-400' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-400">Secure with Supabase</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-slate-400">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-slate-400">Open Source</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/50">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Trading Journal
              </h1>
              <p className="text-slate-400">
                Track, Analyze, Level Up! 📈
              </p>
            </div>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isSignUp ? '🚀 Mulai Journey Anda' : '👋 Welcome Back!'}
                </h2>
                <p className="text-slate-400">
                  {isSignUp 
                    ? 'Daftar GRATIS dan mulai track trading performance!' 
                    : 'Login untuk akses premium analytics Anda'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (Sign Up Only) */}
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nama (Opsional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter</p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-white shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Logging In...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? '🚀 Sign Up GRATIS' : '✨ Login'}
                    </>
                  )}
                </motion.button>
              </form>

              {/* Toggle Sign Up / Login */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                  >
                    {isSignUp ? 'Login di sini' : 'Daftar GRATIS'}
                  </button>
                </p>
              </div>
            </motion.div>

            {/* Mobile Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:hidden mt-6 grid grid-cols-3 gap-4 text-center"
            >
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-xs text-slate-400 font-semibold">Analytics</p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3">
                <div className="text-2xl mb-1">🧠</div>
                <p className="text-xs text-slate-400 font-semibold">Psychology</p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3">
                <div className="text-2xl mb-1">🔒</div>
                <p className="text-xs text-slate-400 font-semibold">Secure</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
