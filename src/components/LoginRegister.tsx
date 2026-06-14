import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Mail, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface LoginRegisterProps {
  onAuthSuccess: (token: string, user: any, isAdmin: boolean) => void;
  onCancel?: () => void;
}

export default function LoginRegister({ onAuthSuccess, onCancel }: LoginRegisterProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const payload = isLoginView 
      ? { email, password }
      : { email, username, password };

    const apiRoute = isLoginView ? '/api/login' : '/api/register';

    try {
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Identity verification aborted.');
      }

      if (isLoginView) {
        setSuccessMsg(`Welcome back, ${data.user.username}! Synchronizing active keys...`);
        setTimeout(() => {
          onAuthSuccess(data.token, data.user, !!data.isAdmin);
        }, 1200);
      } else {
        setSuccessMsg(`Successfully registered user account! Initiating 40.0 tokens allocation...`);
        setTimeout(() => {
          onAuthSuccess(data.token, data.user, false);
        }, 1500);
      }

    } catch (err: any) {
      setErrorMessage(err.message || 'Failure validating network credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6" id="auth-gate-anchor">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="rounded-2xl border border-zinc-900 bg-zinc-950 p-7 shadow-2xl relative overflow-hidden text-left"
      >
        {/* Glow accent lights */}
        <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-yellow-500/5 blur-xl pointer-events-none" />

        {/* View Toggle Header */}
        <div className="flex border-b border-zinc-900 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLoginView(true);
              setErrorMessage(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              isLoginView 
                ? 'text-yellow-400 border-b-2 border-yellow-500' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            EXISTING MEMBER LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginView(false);
              setErrorMessage(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              !isLoginView 
                ? 'text-yellow-400 border-b-2 border-yellow-500' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            CREATE REGISTRATION
          </button>
        </div>

        {/* Informative Header Description */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-yellow-400/5 text-yellow-400 border border-yellow-500/10 mb-3">
            {isLoginView ? <Lock className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {isLoginView ? 'CODING AI Platform Sign-In' : 'Join CODING AI Generative Network'}
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
            {isLoginView 
              ? 'Synchronize active developer keys, budgets, and operational sandboxes.'
              : 'Immediate enrollment equips your terminal with 40 Free daily tokens.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-2">Registered Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@example.com"
                className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-yellow-500 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all font-mono"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                <Mail className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Username input (Only for registration) */}
          {!isLoginView && (
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-2">System Username / Nickname</label>
              <div className="relative">
                <input
                  type="text"
                  required={!isLoginView}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dev_overlord"
                  className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-yellow-500 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-2">Security Password Passkey</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLoginView ? "••••••••" : "Choose a secure passkey"}
                className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-yellow-500 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                <Lock className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Feedback logs */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5"
              >
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2.5"
              >
                <Check className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-mono">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black font-extrabold text-xs font-mono tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-xl shadow-yellow-500/10"
          >
            {isLoading 
              ? 'SECURING SECURITY TOKENS...' 
              : (isLoginView ? 'AUTHORIZE SECURE PROFILE' : 'REGISTER TERMINAL PROFILE')
            }
          </button>
        </form>

        {/* Cancellation row */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-[10px] font-mono text-zinc-650 hover:text-zinc-400 tracking-wider transition-colors pt-4 block uppercase"
          >
            ← Cancel Authentication / Go back
          </button>
        )}
      </motion.div>
    </div>
  );
}
