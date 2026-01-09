/**
 * Enhanced Login Page with Feature Showcase
 * @description Epic landing page with animated feature preview & live market ticker
 * @version 3.1.0 (Mobile Optimized + Ticker)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { 
  Mail, Lock, Loader2, TrendingUp, TrendingDown, AlertCircle,
  BarChart3, Share2, Filter, Eye, Brain, Clock, Target, Sparkles, Zap, Shield,
  Globe
} from 'lucide-react';

// --- COMPONENTS ---

const MarketTicker = () => {
  const items = [
    { s: "BTC/USD", p: "98,245.00", c: "+2.4%", up: true },
    { s: "ETH/USD", p: "3,845.10", c: "+1.8%", up: true },
    { s: "SOL/USD", p: "145.20", c: "-0.5%", up: false },
    { s: "XAU/USD", p: "2,450.50", c: "+0.2%", up: true },
    { s: "NVDA", p: "142.50", c: "+3.1%", up: true },
    { s: "TSLA", p: "210.80", c: "-1.2%", up: false },
    { s: "EUR/USD", p: "1.0850", c: "+0.1%", up: true },
    { s: "GBP/USD", p: "1.2740", c: "-0.3%", up: false },
  ];

  return (
    <div className="absolute bottom-0 w-full overflow-hidden bg-slate-950/80 backdrop-blur-md border-t border-slate-800/50 py-3 z-20">
      {/* Inline styles for marquee animation to keep it self-contained */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
      <div className="animate-ticker w-fit gap-16 whitespace-nowrap px-4 hover:[animation-play-state:paused]">
        {/* Render 4x to ensure seamless loop on wide screens */}
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-sm cursor-default">
            <span className="font-bold text-slate-300">{item.s}</span>
            <span className="text-slate-400">${item.p}</span>
            <span className={`font-bold ${item.up ? 'text-emerald-400' : 'text-rose-400'} flex items-center`}>
              {item.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {item.c}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [isMobile, setIsMobile] = useState(false);

  // Feature showcase data
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
    
    // Performance Optimization: Check simple mobile agent or width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Auto-rotate features (ONLY on Desktop to save resources on mobile)
    let interval: NodeJS.Timeout;
    if (window.innerWidth >= 1024) {
      interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 3000);
    }
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkMobile);
    };
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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      {/* --- BACKGROUND EFFECTS --- */}
      {/* 1. Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* 2. Grid Pattern (Lightweight CSS) */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* 3. Ambient Glows (Optimized) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 gap-8 flex-grow">
        {/* LEFT SIDE - FEATURE SHOWCASE */}
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-20 relative">
          
          {/* Decorative Floating Elements */}
          <div className="absolute top-20 left-10 opacity-20 animate-bounce delay-700">
             <TrendingUp className="w-24 h-24 text-emerald-500" />
          </div>
          <div className="absolute bottom-40 right-20 opacity-20 animate-bounce delay-150">
             <Brain className="w-32 h-32 text-purple-500" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            {/* Hero Section */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">v3.0.0 - Psychology Edition</span>
              </div>
              
              <h1 className="text-7xl font-black mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Trading Journal</span>
              </h1>
              
              <p className="text-3xl text-slate-300 mb-4 font-semibold">
                Dari Trader, Untuk Trader 📈
              </p>
              
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl mb-10">
                Platform <span className="text-emerald-400 font-bold">ALL-IN-ONE</span> professional untuk track performa,
                analyze psychology, dan <span className="text-cyan-400 font-bold">level up</span> trading skill Anda.
                <span className="inline-block px-3 py-1 ml-2 bg-rose-500/20 text-rose-400 rounded-lg text-sm font-black transform -rotate-2">100% GRATIS</span>
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl">
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors group">
                  <div className="text-4xl font-black text-emerald-400 mb-1 group-hover:scale-110 transition-transform origin-left">14+</div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Platforms</div>
                </div>
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-cyan-500/50 transition-colors group">
                  <div className="text-4xl font-black text-cyan-400 mb-1 group-hover:scale-110 transition-transform origin-left">7</div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Timeframes</div>
                </div>
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/50 transition-colors group">
                  <div className="text-4xl font-black text-purple-400 mb-1 group-hover:scale-110 transition-transform origin-left">12</div>
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Psych Tags</div>
                </div>
              </div>
            </div>

            {/* Animated Feature Carousel */}
            <div className="relative max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${features[currentFeature].color} opacity-10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:opacity-20`} />
                  
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${features[currentFeature].color} rounded-2xl mb-6 shadow-lg shadow-black/20`}>
                    {features[currentFeature].icon}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-2xl font-bold text-white">
                      {features[currentFeature].title}
                    </h3>
                    <span className={`px-4 py-1.5 bg-gradient-to-r ${features[currentFeature].color} rounded-full text-xs font-bold text-white shadow-lg`}>
                      {features[currentFeature].stats}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-lg relative z-10">
                    {features[currentFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-start gap-2 mt-6 ml-1">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentFeature 
                        ? 'w-12 bg-emerald-400' 
                        : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-slate-400">Secure Database</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-slate-400">Global Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-bold text-slate-400">Transparency</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="flex items-center justify-center p-6 lg:p-12 pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full relative z-10"
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
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Glow effect on top of card */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                  {isSignUp ? '🚀 Create Account' : '👋 Welcome Back!'}
                </h2>
                <p className="text-slate-400">
                  {isSignUp 
                    ? 'Join thousands of traders tracking their edge.' 
                    : 'Login untuk akses premium analytics Anda.'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name (Sign Up Only) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                        Nama (Opsional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-right font-medium">Minimal 6 karakter</p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Create Account Free' : 'Login Now'}
                    </>
                  )}
                </motion.button>
              </form>

              {/* Toggle Sign Up / Login */}
              <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                <p className="text-sm text-slate-400 font-medium">
                  {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors ml-1"
                  >
                    {isSignUp ? 'Login di sini' : 'Daftar GRATIS'}
                  </button>
                </p>
              </div>
            </motion.div>

            {/* Mobile Features Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:hidden mt-8 grid grid-cols-3 gap-3"
            >
              {[
                { icon: '📊', label: 'Analytics' },
                { icon: '🧠', label: 'Psychology' },
                { icon: '🔒', label: 'Secure' }
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Live Market Ticker Component */}
      <MarketTicker />
    </div>
  );
}
