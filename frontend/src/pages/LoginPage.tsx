import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Shield, Zap, Target } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/15 via-indigo-600/15 to-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="glass-panel-glow p-8 sm:p-10 rounded-3xl border border-slate-700/60 shadow-2xl backdrop-blur-2xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-extrabold text-white tracking-tight block">SkillGap AI</span>
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">Career Intelligence</span>
              </div>
            </Link>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1.5">Sign in to your AI Career Intelligence cockpit</p>
          </div>

          {/* Quick value badges */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-center p-2 rounded-xl">
              <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">4-Pillar Fit</span>
            </div>
            <div className="text-center p-2 rounded-xl">
              <Zap className="w-4 h-4 text-brand-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">Realtime AI</span>
            </div>
            <div className="text-center p-2 rounded-xl">
              <Target className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">12-Wk Plan</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.mercer@company.com"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:opacity-95 shadow-glow-brand flex items-center justify-center gap-2 disabled:opacity-50 transition duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

