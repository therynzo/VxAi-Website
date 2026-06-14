import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface VerifierProps {
  onVerifyComplete: () => void;
}

export default function CloudflareVerifier({ onVerifyComplete }: VerifierProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [loadingText, setLoadingText] = useState('Initiating secure handshake...');
  const [rayId, setRayId] = useState('');
  const [userIp, setUserIp] = useState('');

  // Keep a stable ref to avoid restarting the timer when callback updates
  const onVerifyCompleteRef = useRef(onVerifyComplete);
  onVerifyCompleteRef.current = onVerifyComplete;

  useEffect(() => {
    // Generate pseudo Ray ID and random IP
    setRayId(Math.random().toString(16).substring(2, 10).toUpperCase() + '-' + Math.random().toString(16).substring(2, 6).toUpperCase());
    setUserIp(`${Math.floor(Math.random()*154)+50}.${Math.floor(Math.random()*200)+20}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`);

    // Loading text cycle
    const timers = [
      setTimeout(() => setLoadingText('Validating client environment...'), 600),
      setTimeout(() => setLoadingText('Establishing encrypted tunnel...'), 1200),
      setTimeout(() => {
        setLoadingText('Connection is secure');
        setIsChecked(true);
      }, 1800),
      setTimeout(() => onVerifyCompleteRef.current(), 2800)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none font-sans text-left">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_100%)] pointer-events-none" />
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[420px] w-full bg-zinc-950/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-8 rounded-2xl relative overflow-hidden"
      >
        {/* Glow backdrop lights */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-yellow-500/10 blur-[60px] pointer-events-none" />

        {/* Security Crest Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="p-3.5 rounded-full bg-zinc-900 border border-zinc-800/50 shadow-inner">
            <ShieldCheck className="h-6 w-6 text-yellow-500" />
          </div>
        </div>

        {/* Dynamic header checks */}
        <div className="space-y-3 text-center mb-10">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Verifying your connection
          </h1>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-[280px] mx-auto">
            Ensuring a secure and encrypted environment before accessing CODING AI systems.
          </p>
        </div>

        {/* Verification Checkbox element */}
        <div className="py-4 px-5 rounded-lg border border-white/[0.04] bg-white/[0.02] flex items-center gap-4 mb-8">
          <div className="relative flex-shrink-0">
            {isChecked ? (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
              </motion.div>
            ) : (
              <div className="h-6 w-6 rounded-full flex items-center justify-center">
                <Loader2 className="h-4.5 w-4.5 animate-[spin_1.5s_linear_infinite] text-yellow-500" />
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={loadingText}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.2 }}
                className={`text-sm tracking-tight ${isChecked ? 'text-emerald-400 font-medium' : 'text-zinc-300'}`}
              >
                {loadingText}
              </motion.span>
            </AnimatePresence>
            {!isChecked && (
              <motion.div className="h-0.5 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "linear" }}
                  className="h-full bg-yellow-500/50"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* ray ID and IP footer blocks */}
        <div className="space-y-2 font-mono text-[10px] text-zinc-600 block">
          <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
            <span>System IP</span>
            <span className="text-zinc-400">{userIp}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/[0.03]">
            <span>Trace ID</span>
            <span className="text-zinc-400">{rayId}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>Protocol</span>
            <span className="text-zinc-400 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              TLS 1.3
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="flex items-center gap-2 mt-8 text-[10px] font-mono text-zinc-600 tracking-widest uppercase"
      >
        <span>CODING AI</span>
        <span className="h-1 w-1 rounded-full bg-zinc-700" />
        <span>Secure Gateway</span>
      </motion.div>
    </div>
  );
}
