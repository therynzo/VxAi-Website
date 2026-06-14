import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Sparkles, Code, Key, RotateCcw } from 'lucide-react';
import { InfoCardData } from '../types';

interface InfoCardProps {
  card: InfoCardData;
  key?: any;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Cpu,
  Sparkles,
  Code,
  Key,
};

export default function InfoCard({ card }: InfoCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamically resolve lucide icons securely
  const IconComponent = iconMap[card.iconName] || Cpu;

  return (
    <div className="group h-76 w-full [perspective:1200px]" id={`info-card-${card.id}`}>
      <motion.div
        className="relative h-full w-full rounded-2xl transition-all duration-300 [transform-style:preserve-3d] cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
        whileHover={{
          scale: 1.03,
          boxShadow: "0px 0px 30px rgba(234, 179, 8, 0.35)",
        }}
        whileTap={{
          scale: 0.97,
          boxShadow: "0px 0px 45px rgba(234, 179, 8, 0.75)",
        }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 h-full w-full rounded-2xl border border-yellow-500/20 hover:border-yellow-500/80 bg-zinc-950 p-6 [backface-visibility:hidden] flex flex-col justify-between overflow-hidden transition-colors duration-350">
          {/* Top light beam glow effect */}
          <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl group-hover:bg-yellow-500/20 transition-all duration-500" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-yellow-500 uppercase px-2 py-0.5 rounded-full border border-yellow-500/20 bg-yellow-500/5">
                {card.category}
              </span>
              <div className="rounded-xl bg-zinc-900 p-2.5 text-yellow-500 border border-zinc-800 group-hover:border-yellow-500/30 transition-all duration-300">
                <IconComponent className="h-6 w-6" id={`icon-${card.id}`} />
              </div>
            </div>

            <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-yellow-400 transition-colors duration-300">
              {card.title}
            </h3>
            
            <p className="mt-3 text-sm text-zinc-400 line-clamp-3 leading-relaxed">
              {card.shortDesc}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mt-2">
            <span className="group-hover:text-yellow-500/80 transition-colors duration-300">CLICK TO FLIP TILT</span>
            <span className="text-yellow-500/40 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all duration-300">→</span>
          </div>
        </div>

        {/* BACK SIDE (Detailed Information) */}
        <div className="absolute inset-0 h-full w-full rounded-2xl border-2 border-yellow-500 bg-zinc-900 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-yellow-500/5 blur-xl" />
          
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-yellow-500/15 p-1.5 text-yellow-400">
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                CODING AI {card.category}
              </span>
            </div>

            {/* Slide up animation for details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isFlipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mt-4"
            >
              <h4 className="font-bold text-white text-md">Details & Applications</h4>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300 overflow-y-auto max-h-36 pr-1 custom-scrollbar">
                {card.fullDesc}
              </p>
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
            <span>TAP TO FLIP BACK</span>
            <RotateCcw className="h-3 w-3 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
