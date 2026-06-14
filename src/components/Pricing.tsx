import React from 'react';
import { Check, ShieldCheck, Sparkles, Building, Zap, Star } from 'lucide-react';
import { Plan } from '../types';

interface PricingProps {
  onSelectPlan: (planName: string) => void;
}

export const PRESET_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Playground',
    price: '$0',
    period: 'forever',
    tokenAllowance: 40,
    description: 'Perfect for quick testing, developer research, and instant answers.',
    features: [
      'Get 40 tokens per day automatically',
      'AI queries consume exactly 1.30 tokens each',
      'Access to Free Model (Gemini 3.5 Flash)',
      'Upload file types (PDF, TEXT, JSON, PNG)',
      'Up to 10MB file size attachments'
    ],
    color: 'border-zinc-800 bg-zinc-950 text-zinc-400',
    popular: false
  },
  {
    id: 'pro',
    name: 'Creator Premium Pro',
    price: '$19',
    period: 'month',
    tokenAllowance: 500,
    description: 'Engineered for dedicated designers, developers, and AI content creators.',
    features: [
      'Add 500 premium tokens instantly',
      'AI queries consume exactly 1.30 tokens each',
      'Access Premium Model queue (Gemini 3.1 Pro)',
      'Unlimited uploads & 100MB file limit',
      'Priority rapid-response API queue'
    ],
    color: 'border-yellow-500 bg-zinc-900/60 text-yellow-500 shadow-[0_4px_30px_rgba(242,193,46,0.1)]',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Ultra Max',
    price: '$149',
    period: 'month',
    tokenAllowance: 5000,
    description: 'Configured for high-volume enterprises and deep-research institutions.',
    features: [
      'Add 5000 Enterprise tokens instantly',
      'AI queries consume exactly 1.30 tokens each',
      'Dedicated API endpoint integration',
      'Custom fine-tuned system vectors',
      '99.9% Uptime SLA Guarantee'
    ],
    color: 'border-zinc-800 bg-zinc-950 text-zinc-400',
    popular: false
  }
];

export default function Pricing({ onSelectPlan }: PricingProps) {
  return (
    <div className="relative py-12" id="pricing-section">
      {/* Decorative gradient overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PRESET_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.03] hover:outline hover:outline-2 hover:outline-yellow-500/40 hover:outline-offset-4 hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] ${
              plan.popular 
                ? 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 shadow-yellow-500/10' 
                : 'bg-zinc-950/80'
            } ${plan.color}`}
          >
            {/* Visual indicators for popular choices */}
            {plan.popular && (
              <span className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold font-mono tracking-widest flex items-center gap-1 shadow-md">
                <Star className="h-3 w-3 fill-current" />
                MOST POPULAR
              </span>
            )}

            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between text-left">
                <div>
                  <h4 className="text-sm font-mono tracking-widest text-zinc-500 uppercase">
                    {plan.id === 'free' ? 'Starter' : plan.id === 'pro' ? 'Recommended' : 'Scale'}
                  </h4>
                  <h3 className="text-xl font-bold text-white mt-1">{plan.name}</h3>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  plan.popular 
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  {plan.id === 'free' ? (
                    <Zap className="h-5 w-5" />
                  ) : plan.id === 'pro' ? (
                    <Sparkles className="h-5 w-5" />
                  ) : (
                    <Building className="h-5 w-5" />
                  )}
                </div>
              </div>

              {/* Pricing section */}
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight text-white">{plan.price}</span>
                <span className="text-zinc-500 text-sm ml-2 font-mono">/ {plan.period}</span>
              </div>
              
              {/* Tokens allocation bubble */}
              <div className="mt-3 inline-block px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase bg-yellow-400/5 text-yellow-400 border border-yellow-400/10 text-left">
                📦 ALLOWANCE: {plan.tokenAllowance} TOKENS
              </div>

              <p className="mt-3 text-xs text-zinc-400 leading-relaxed text-left">
                {plan.description}
              </p>

              {/* Divider line */}
              <div className="h-px bg-zinc-800/80 my-5" />

              {/* List features list */}
              <ul className="space-y-3.5 text-left">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-tight">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-yellow-400' : 'text-zinc-500'}`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Click CTA Button */}
            <div className="mt-8 flex flex-col gap-2.5">
              {plan.id === 'free' ? (
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black hover:scale-[1.01] hover:brightness-110 shadow-lg shadow-yellow-500/15'
                      : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-850 hover:border-zinc-700 hover:text-yellow-400'
                  }`}
                >
                  Configure Free Chat
                </button>
              ) : (
                <a
                  href="https://discord.gg/8fp89cEKww"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black hover:scale-[1.01] hover:brightness-110 shadow-lg shadow-yellow-500/15'
                      : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-850 hover:border-zinc-700 hover:text-yellow-400'
                  }`}
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                  </svg>
                  Select {plan.name}
                </a>
              )}

              <span className="text-[9px] text-zinc-650 block text-center mt-1 font-mono">
                {plan.id === 'free' ? 'No Credit Card required' : 'Cancel anytime. Instant delivery.'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
