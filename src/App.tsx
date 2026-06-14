import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Cpu, 
  Code, 
  Key, 
  ShieldAlert, 
  Lock, 
  ChevronRight, 
  CheckCircle2, 
  Star, 
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
  Coins,
  ArrowRight,
  Database,
  RefreshCw,
  FileText,
  Play,
  Check,
  AlertTriangle,
  Fingerprint,
  TrendingUp
} from 'lucide-react';
import Logo from './components/Logo';
import InfoCard from './components/InfoCard';
import ChatPlayground from './components/ChatPlayground';
import Pricing, { PRESET_PLANS } from './components/Pricing';
import CloudflareVerifier from './components/CloudflareVerifier';
import LoginRegister from './components/LoginRegister';
import AdminDashboard from './components/AdminDashboard';
import { InfoCardData } from './types';

// Preset static data for Info cards
const FEATURE_CARDS: InfoCardData[] = [
  {
    id: 'multimodal',
    title: 'Multimodal Files Analyzer',
    category: 'INTELLIGENCE',
    iconName: 'Cpu',
    shortDesc: 'Upload images, blueprints, spreadsheets, code files, or text documents. CODING AI parses and extracts knowledge parameters instantly.',
    fullDesc: 'Leverage deep document intelligence. Directly drag-and-drop structural elements (TXT, CSV, JSON, PNG, or JPEG diagrams) onto our model parser. The engine breaks down complex data graphs, summarizes long paragraphs, and generates actionable analysis in seconds.'
  },
  {
    id: 'unbiased',
    title: 'Infinite Chat Playground',
    category: 'CHATBOT',
    iconName: 'Sparkles',
    shortDesc: 'A powerful chat framework utilizing Gemini 3.5 Flash for fast answers, debugging help, and structured content copywriting.',
    fullDesc: 'Designed for developers and creators. Ask open questions about logic systems, explore code layouts, translate algorithms, or design rich marketing sequences with zero session limits. Tap suggestion chips to launch predefined structural workflows.'
  },
  {
    id: 'advanced',
    title: 'Precision Developer Helper',
    category: 'ENGINEERING',
    iconName: 'Code',
    shortDesc: 'Generate database structures, validate application routes, write React modules, or review complex code logic blocks easily.',
    fullDesc: 'An expert coding agent at your fingertips. Input code fragments, request structural modifications, write unit testing envelopes, or debug runtime environment failures. Optimized for TypeScript, Javascript, Python, CSS, and full-stack database logic.'
  },
  {
    id: 'dynamic_key',
    title: 'Decentralized Key Node',
    category: 'SECURITY',
    iconName: 'Key',
    shortDesc: 'Set up or cycle custom AI API Keys dynamically. The control architecture provides absolute parameters control protecting dynamic keys fallbacks.',
    fullDesc: 'Full sovereignty of credentials. Input personal API tokens securely. Override the system environmental key instantly without rebuilds, protecting credentials behind authenticated operator paths.'
  }
];

// Presets for the Intelligence Simulator page
const DEMO_FILES = [
  {
    name: 'mechanical_blueprint_v3.png',
    size: '2.4 MB',
    type: 'PNG Image',
    desc: 'Complex production assembly design diagram.'
  },
  {
    name: 'telemetry_logs_network.json',
    size: '724 KB',
    type: 'JSON Document',
    desc: 'Structured server infrastructure packet tracking logs.'
  },
  {
    name: 'legacy_rust_routine.rs',
    size: '42 KB',
    type: 'Rust Source File',
    desc: 'Low-level cryptography hash calculation function.'
  }
];

export default function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'chat' | 'pricing' | 'auth'>('home');
  const [selectedCategory, setSelectedCategory] = useState<'INTELLIGENCE' | 'CHATBOT' | 'ENGINEERING' | 'SECURITY'>('INTELLIGENCE');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Prefilled message support
  const [prefilledMessage, setPrefilledMessage] = useState<string>('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Interactive intelligence state
  const [selectedDemoFile, setSelectedDemoFile] = useState<string>('mechanical_blueprint_v3.png');
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [fileAnalysisLogs, setFileAnalysisLogs] = useState<string[]>([]);
  const [fileAnalysisResult, setFileAnalysisResult] = useState<any>(null);

  // Interactive engineering state
  const [inputCodeSnippet, setInputCodeSnippet] = useState<string>(
    `function fetchUserData(id) {\n  let res = fetch('/api/users/' + id);\n  return res.json();\n}`
  );
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidationLogs, setCodeValidationLogs] = useState<string[]>([]);
  const [codeValidationResult, setCodeValidationResult] = useState<any>(null);

  // Sync profile details
  const handleProfileSync = async () => {
    const userToken = localStorage.getItem('vx_user_session_token');
    if (userToken) {
      try {
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        if (res.ok) {
          const profile = await res.json();
          setCurrentUser(profile);
        } else {
          localStorage.removeItem('vx_user_session_token');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Profile sync error:', err);
      }
    } else {
      setCurrentUser(null);
    }
  };

  // Check dynamic API key setup on the server
  const checkKeyStatus = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setHasCustomKey(data.hasCustomKey);
      }
    } catch (err) {
      console.error('Error querying backend key status:', err);
    }
  };

  useEffect(() => {
    checkKeyStatus();
    handleProfileSync();
  }, []);

  const handleAuthSuccess = (token: string, user: any) => {
    localStorage.setItem('vx_user_session_token', token);
    setCurrentUser(user);
    navigateToPage('home');
    triggerToast(`Authenticated successfully as ${user.username}! Welcome aboard CODING AI Chat.`);
  };

  const handleSignOut = () => {
    localStorage.removeItem('vx_user_session_token');
    localStorage.removeItem('vxhost_admin_token');
    setCurrentUser(null);
    navigateToPage('home');
    triggerToast('Logged out securely. Session destroyed.');
  };

  const handleSelectPlan = async (planId: string) => {
    if (!currentUser) {
      navigateToPage('auth');
      triggerToast('Identification is required to execute packages. Login or Register.');
      return;
    }

    const plan = PRESET_PLANS.find(p => p.id === planId);
    if (!plan) return;

    if (planId === 'free') {
      triggerToast('Your standard 40 Free Daily Tokens Chat allocation is already active.');
      setActiveTab('chat');
      return;
    }

    try {
      const userToken = localStorage.getItem('vx_user_session_token') || '';
      const response = await fetch('/api/user/select-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          tokenAllowance: plan.tokenAllowance
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error configuring package');
      }

      setCurrentUser(data.user);
      triggerToast(`Successful plan configuration! Added ${plan.tokenAllowance} tokens. New balance: ${data.user.tokens} tokens.`);
      setActiveTab('chat');
    } catch (err: any) {
      triggerToast(err.message || 'Verification failed. Could not allocate plan tokens.');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const navigateToPage = (tab: 'home' | 'categories' | 'chat' | 'pricing' | 'auth', categoryFilter?: 'INTELLIGENCE' | 'CHATBOT' | 'ENGINEERING' | 'SECURITY') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchHeroChat = () => {
    if (!currentUser) {
      navigateToPage('auth');
      triggerToast('Authorization required. Register / Login to activate the Chat Engine.');
    } else {
      navigateToPage('chat');
    }
  };

  // Launch pre-filled query directly into Chat input
  const launchPromptChip = (queryText: string) => {
    setPrefilledMessage(queryText);
    navigateToPage('chat');
  };

  // Stable callback for Cloudflare Complete
  const handleVerifyComplete = React.useCallback(() => {
    setIsVerified(true);
  }, []);

  // Simulator solvers
  const runFileAnalysisSimulator = () => {
    if (isAnalyzingFile) return;
    setIsAnalyzingFile(true);
    setFileAnalysisResult(null);
    setFileAnalysisLogs([]);

    const file = DEMO_FILES.find(f => f.name === selectedDemoFile) || DEMO_FILES[0];
    const sequence = [
      `[INTELLIGENCE_NODE]: Initializing multimodal parser pipeline for file: "${file.name}"...`,
      `[INTELLIGENCE_NODE]: Verifying binary payload health (${file.size})...`,
      `[INTELLIGENCE_NODE]: Mapping internal structures and layout metadata...`,
      `[INTELLIGENCE_NODE]: Applying specialized neural vectors for categorization...`,
      `[INTELLIGENCE_NODE]: Structuring extraction JSON parameter parameters...`,
      `[SUCCESS]: Data node compilation finished safely.`
    ];

    let delay = 0;
    sequence.forEach((log, index) => {
      setTimeout(() => {
        setFileAnalysisLogs(prev => [...prev, log]);
        if (index === sequence.length - 1) {
          setIsAnalyzingFile(false);
          // Set beautiful mock structured output
          if (file.name.includes('blueprint')) {
            setFileAnalysisResult({
              documentType: 'Structural Cad Blueprint / Image Schematic',
              detectedComponents: ['Main Rotor Conduit', 'Tension Plate Array', 'Calibrated Gauge Connector'],
              dimensions: '1920 x 1080 (HD Vectors)',
              estimatedComplexity: 'HIGH (88 structural facets categorized)',
              dataIntegrity: '99.8% Perfect Match',
              actionableAnalysis: 'Industrial design blueprint parsed correctly. Internal connections are healthy. Logic paths recommend high-stress carbon-steel bracing nodes.'
            });
          } else if (file.name.includes('logs')) {
            setFileAnalysisResult({
              documentType: 'Structured Log Stream File (JSON)',
              detectedComponents: ['Gateway Handshake', 'Authentication Error 104', 'Cipher Shift Handshake'],
              dimensions: '724 Lines of Logs',
              estimatedComplexity: 'MEDIUM (Telemetry structure detected)',
              dataIntegrity: '100% Intact Syntax',
              actionableAnalysis: 'Analysis detected recursive auth failures on client side ports. Suggest applying CORS safety layers and enforcing rate limit restrictions on /api/auth.'
            });
          } else {
            setFileAnalysisResult({
              documentType: 'Rust Source Code Routine (.rs)',
              detectedComponents: ['cryptographic_hasher', 'lowlevel_stack_overflow_guard', 'alloc_buffer'],
              dimensions: '312 Loc',
              estimatedComplexity: 'VERY HIGH (Unsafe memory references detected)',
              dataIntegrity: 'Compilation Validated',
              actionableAnalysis: 'Code relies on manual buffer allocations. Memory bounds are shielded. Recommended wrapping the return block with a structured enum wrapper to support multi-thread locks.'
            });
          }
        }
      }, delay);
      delay += 400;
    });
  };

  const runCodeLintSimulator = () => {
    if (isValidatingCode) return;
    setIsValidatingCode(true);
    setCodeValidationResult(null);
    setCodeValidationLogs([]);

    const sequence = [
      `[LINTING_ENGINE]: Reading input source buffer...`,
      `[LINTING_ENGINE]: Setting up dynamic AST token parser...`,
      `[LINTING_ENGINE]: Checking TypeScript rules and missing annotations...`,
      `[LINTING_ENGINE]: Evaluating asynchronous fetch handler loop timings...`,
      `[LINTING_ENGINE]: Analyzing potential memory leaks and recursion stacks...`,
      `[SUCCESS]: Code compilation and quality diagnostics mapped.`
    ];

    let delay = 0;
    sequence.forEach((log, index) => {
      setTimeout(() => {
        setCodeValidationLogs(prev => [...prev, log]);
        if (index === sequence.length - 1) {
          setIsValidatingCode(false);
          // generate elegant diagnostics
          setCodeValidationResult({
            score: '65/100',
            level: 'Action Needed',
            issues: [
              { severity: 'CRITICAL', text: "Parameter 'id' implicitly has 'any' type. Declare a typescript interface." },
              { severity: 'WARNING', text: "The asynchronous 'fetch' request is not awaited. This yields unresolved promises." },
              { severity: 'INFO', text: "Consider configuring an AbortController to safely discard uncompleted network request loops upon component unmount." }
            ],
            suggestedRemedy: `export async function fetchUserData(id: string): Promise<UserAccount> {\n  try {\n    const res = await fetch(\`/api/users/\${id}\`);\n    if (!res.ok) throw new Error('Query request failed');\n    return await res.json();\n  } catch (err) {\n    console.error('Database fetching exception:', err);\n    throw err;\n  }\n}`
          });
        }
      }, delay);
      delay += 350;
    });
  };

  if (!isVerified) {
    return <CloudflareVerifier onVerifyComplete={handleVerifyComplete} />;
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      {/* Glow lights */}
      <div className="absolute top-0 left-1/4 h-96 w-[600px] rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 h-96 w-[600px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* HEADER NAVBAR */}
      {activeTab !== 'chat' && (
        <>
          <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToPage('home')}>
                <Logo size="sm" />
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black tracking-tighter text-white font-mono flex items-center gap-1.5">
                    VxAi <span className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">CODING AI</span>
                  </span>
                </div>
              </div>

              {/* New Modern Multi-Page Navigation Bar */}
              <nav className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={() => navigateToPage('home')}
                  className={`px-4 py-2 text-xs font-semibold font-mono tracking-wider uppercase transition-colors rounded-lg cursor-pointer ${
                    activeTab === 'home' ? 'text-yellow-400 bg-yellow-400/5 border border-yellow-500/10' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  HOME
                </button>
                <button
                  onClick={() => navigateToPage('categories')}
                  className={`px-4 py-2 text-xs font-semibold font-mono tracking-wider uppercase transition-colors rounded-lg cursor-pointer ${
                    activeTab === 'categories' ? 'text-yellow-400 bg-yellow-400/5 border border-yellow-500/10' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ABOUT
                </button>
                <button
                  onClick={() => navigateToPage('chat')}
                  className={`px-4 py-2 text-xs font-semibold font-mono tracking-wider uppercase transition-colors rounded-lg cursor-pointer ${
                    activeTab === 'chat' ? 'text-yellow-400 bg-yellow-400/5 border border-yellow-500/10' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  CHAT
                </button>
                <button
                  onClick={() => navigateToPage('pricing')}
                  className={`px-4 py-2 text-xs font-semibold font-mono tracking-wider uppercase transition-colors rounded-lg cursor-pointer ${
                    activeTab === 'pricing' ? 'text-yellow-400 bg-yellow-400/5 border border-yellow-500/10' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  PRICING
                </button>
              </nav>

              {/* Quick Authentication & Token Balance View */}
              <div className="hidden lg:flex items-center gap-4">
                {currentUser?.email === 'mail@vxhost.in' && (
                  <button
                    onClick={() => setIsAdminDashboardOpen(true)}
                    className="px-3.5 py-2 border border-zinc-850 hover:border-yellow-500/55 bg-zinc-900/60 rounded-xl text-zinc-400 hover:text-yellow-400 transition-all font-mono text-xs font-bold tracking-wider uppercase cursor-pointer flex items-center gap-2"
                    title="Admin Dashboard"
                  >
                    <Menu className="h-4 w-4 text-yellow-500" />
                    <span className="text-[10px]">Admin Dashboard</span>
                  </button>
                )}

                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end text-right">
                      <span className="text-xs text-white font-bold flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-yellow-400" />
                        {currentUser.username}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-450 flex items-center gap-1">
                        <Coins className="h-3 w-3 text-yellow-500/80" />
                        {currentUser.tokens.toFixed(2)} TOKENS
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs font-mono cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigateToPage('auth');
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-400 hover:text-black font-bold font-mono text-xs text-yellow-400 tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    LOGIN / REGISTER
                  </button>
                )}
              </div>

              {/* Mobile hamburger menu */}
              <div className="md:hidden flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-850 cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </header>

          {/* MOBILE DROPDOWN - SLEEK NORMAL FLOATING COLLAPSIBLE MENU */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Clean partial-screen backdrop that allows clicks to close the menu instantly */}
                <div 
                  className="fixed inset-x-0 bottom-0 top-[74px] z-45 bg-black/40 backdrop-blur-[2px] md:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed top-[78px] left-4 right-4 max-w-sm ml-auto z-50 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-white/[0.06] p-5 space-y-4 shadow-2xl md:hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] mb-1">
                    <span className="text-[10px] font-black font-mono tracking-widest text-zinc-400 uppercase">VxAi NAVIGATION</span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-850 cursor-pointer"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigateToPage('home');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-mono font-medium text-zinc-300 hover:text-yellow-400 uppercase tracking-wider block bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-yellow-500/30 rounded-xl transition-all"
                    >
                      HOME
                    </button>
                    <button
                      onClick={() => {
                        navigateToPage('categories');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-mono font-medium text-zinc-300 hover:text-yellow-400 uppercase tracking-wider block bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-yellow-500/30 rounded-xl transition-all"
                    >
                      ABOUT
                    </button>
                    <button
                      onClick={() => {
                        navigateToPage('chat');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-mono font-medium text-zinc-300 hover:text-yellow-400 uppercase tracking-wider block bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-yellow-500/30 rounded-xl transition-all"
                    >
                      CHAT
                    </button>
                    <button
                      onClick={() => {
                        navigateToPage('pricing');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-mono font-medium text-zinc-300 hover:text-yellow-400 uppercase tracking-wider block bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-yellow-500/30 rounded-xl transition-all"
                    >
                      PRICING
                    </button>
                    {currentUser?.email === 'mail@vxhost.in' && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsAdminDashboardOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-400 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Menu className="h-3.5 w-3.5 text-yellow-500" />
                        Admin Dashboard
                      </button>
                    )}
                  </div>

                  {currentUser ? (
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-350 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-yellow-400" />
                          {currentUser.username}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Tokens: <span className="text-yellow-400 font-bold">{currentUser.tokens.toFixed(2)}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-center text-[11px] rounded-xl border border-red-500/10 transition-all font-bold"
                      >
                        SIGN OUT
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateToPage('auth');
                      }}
                      className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-black text-xs font-bold font-mono uppercase tracking-wider transition-all"
                    >
                      SIGN IN / REGISTER
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* QUICK FLOATING TOAST SYSTEM */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 p-4 max-w-sm rounded-xl bg-zinc-900 border-2 border-yellow-500 text-xs text-zinc-200 shadow-2xl flex items-start gap-3"
          >
            <div className="rounded-full bg-yellow-400 p-1 text-black flex-shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex-grow">
              <span className="font-bold font-mono text-yellow-400 block uppercase tracking-wider text-[10px]">CODING AI System Broadcast</span>
              <p className="mt-1 leading-relaxed text-left text-zinc-300">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'chat' ? (
        <div className="h-[100dvh] w-full flex flex-col items-stretch overflow-hidden">
          <ChatPlayground 
            hasCustomKey={hasCustomKey} 
            currentUser={currentUser}
            onBackHome={() => navigateToPage('home')}
            onSyncProfile={handleProfileSync}
            onOpenLoginRegister={() => {
              navigateToPage('auth');
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            onTokensUpdated={(remainingTokens) => {
              if (currentUser) {
                setCurrentUser((prev: any) => ({
                  ...prev,
                  tokens: remainingTokens
                }));
              }
            }}
            onOpenAdmin={() => {
              triggerToast("Operational key node configurations are active.");
            }}
          />
        </div>
      ) : (
        <>
          <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          
          <AnimatePresence mode="wait">
            
            {/* ================= PAGE 0: AUTHENTICATION PAGE ================= */}
            {activeTab === 'auth' && (
              <motion.div
                key="auth-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center min-h-[50vh] py-12"
              >
                  <div className="w-full max-w-md mx-auto">
                    <h3 className="text-xl font-mono font-bold tracking-widest text-yellow-400 uppercase mb-8 text-center bg-yellow-400/5 py-4 border border-yellow-500/10 rounded-xl">🔐 SECURE AUTHENTICATION NODE</h3>
                    <LoginRegister 
                      onAuthSuccess={handleAuthSuccess}
                      onCancel={() => navigateToPage('home')}
                    />
                  </div>
              </motion.div>
            )}

            {/* ================= PAGE 1: HOME LANDING PAGE ================= */}
            {activeTab === 'home' && (
              <motion.div
                key="home-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-24"
              >
                <section className="text-center py-12 relative">
                  <div className="inline-flex justify-center mb-6">
                    <Logo size="xl" />
                  </div>

                  <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-yellow-500/25 bg-yellow-500/10 text-yellow-400 text-xs font-mono tracking-widest uppercase mb-6">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>GENAI MULTIMODAL PLATFORM</span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase max-w-4xl mx-auto leading-none">
                    CODING AI DECISION CORE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">
                      INTELLIGENCE HUB.
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mt-6">
                    Analyze technical drawings, code units, relational schema scripts, or complex images. 
                    CODING AI structures intelligence parameters and assists your flow instantly in a clean standalone mode.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <button
                      onClick={handleLaunchHeroChat}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black hover:scale-105 active:scale-[0.98] transition-all duration-300 font-bold font-mono text-xs tracking-widest uppercase shadow-xl shadow-yellow-500/10 cursor-pointer"
                    >
                      OPEN CHAT
                    </button>
                    <button
                      onClick={() => navigateToPage('categories')}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-white border border-zinc-800 transition-all font-bold font-mono text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      ABOUT
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="text-center space-y-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-yellow-500 uppercase bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                      CORE MODULES
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      SPECIFICATIONS MATRIX
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-normal">
                      Click a specifications matrix block below to deep dive into real-time sub-pages and simulator systems.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                    {FEATURE_CARDS.map((card) => (
                      <div 
                        key={card.id} 
                        onClick={() => navigateToPage('categories', card.category as any)}
                        className="cursor-pointer group hover:scale-[1.01] transition-transform"
                        title={`Open ${card.category} details page`}
                      >
                        <InfoCard card={card} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Micro branding callout */}
                <section className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between text-left">
                  <div className="space-y-1">
                    <h4 className="text-sm font-mono uppercase tracking-wider text-yellow-400 font-bold">Unmatched Execution Times</h4>
                    <p className="text-xs text-zinc-450">Powered by server-side Gemini pipelines optimized for ultra-low latency response metrics.</p>
                  </div>
                  <button 
                    onClick={() => navigateToPage('pricing')} 
                    className="px-5 py-2.5 rounded-lg border border-yellow-500/20 text-yellow-400 text-xs font-mono font-semibold hover:bg-yellow-400 hover:text-black transition-all cursor-pointer whitespace-nowrap"
                  >
                    UPGRADE ACCOUNT
                  </button>
                </section>
              </motion.div>
            )}

            {/* ================= PAGE 2: MULTIPLE CATEGORY PAGES ================= */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-yellow-500 uppercase bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                    BOT INFORMATION
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    ALL IN BOT INFORMATION
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-normal">
                    Explore comprehensive details, capabilities, and features of the CODING AI generative system.
                  </p>
                </div>

                {/* Sub-Pages Selector Tabs */}
                <div className="flex flex-wrap justify-center border-b border-zinc-900 gap-1.5 pb-2 max-w-2xl mx-auto">
                  {(['INTELLIGENCE', 'CHATBOT', 'ENGINEERING', 'SECURITY'] as const).map((catName) => (
                    <button
                      key={catName}
                      onClick={() => setSelectedCategory(catName)}
                      className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded-lg border transition-all duration-200 cursor-pointer uppercase ${
                        selectedCategory === catName
                          ? 'bg-yellow-400 text-black border-yellow-500 font-extrabold shadow-md shadow-yellow-500/5'
                          : 'bg-zinc-900/60 text-zinc-400 hover:text-white border-zinc-800'
                      }`}
                    >
                      {catName} PAGE
                    </button>
                  ))}
                </div>

                {/* Dynamic Category Page Renders */}
                <AnimatePresence mode="wait">
                  {selectedCategory === 'INTELLIGENCE' && (
                    <motion.div
                      key="intelligence"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                      {/* Left Side: Summary & Data */}
                      <div className="lg:col-span-5 space-y-6 text-left">
                        <div className="p-3 bg-yellow-400/10 text-yellow-400 border border-yellow-500/20 rounded-xl inline-flex">
                          <Cpu className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase font-sans">Multimodal File Intelligence Page</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          CODING AI's Intelligence parser pipeline translates visual matrices and text documents into operational analytics blocks. Click a file below to run an absolute parsing test inside the simulator.
                        </p>

                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase font-black tracking-widest block">Available Preset Blueprints</span>
                          {DEMO_FILES.map((f, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedDemoFile(f.name);
                                setFileAnalysisResult(null);
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:outline hover:outline-2 hover:outline-yellow-500/40 hover:outline-offset-2 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] ${
                                selectedDemoFile === f.name
                                  ? 'border-yellow-400/80 bg-yellow-400/[0.02] shadow-[0_4px_15px_rgba(240,150,10,0.02)]'
                                  : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 hover:bg-zinc-900/40'
                              }`}
                            >
                              <FileText className={`h-5 w-5 mt-0.5 ${selectedDemoFile === f.name ? 'text-yellow-400' : 'text-zinc-500'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono font-bold text-white truncate">{f.name}</p>
                                <span className="text-[10px] font-mono text-zinc-450 block mt-0.5">{f.type} • {f.size}</span>
                                <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1 leading-normal">{f.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Awesome Interactive Simulator */}
                      <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 text-left space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <span className="text-[10px] font-mono tracking-wider text-yellow-500 font-bold uppercase">Multimodal Parser Simulator</span>
                          <span className="text-[9px] font-mono text-zinc-650">REF_ID: ANALYZER_V3.5_S1</span>
                        </div>

                        {/* Control actions */}
                        <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-left font-mono text-xs">
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Selected File Target</span>
                            <span className="text-white font-bold block truncate mt-0.5">{selectedDemoFile}</span>
                          </div>
                          <button
                            onClick={runFileAnalysisSimulator}
                            disabled={isAnalyzingFile}
                            className="px-5 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-900 text-black font-mono text-xs font-black tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all"
                          >
                            {isAnalyzingFile ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-black" />}
                            ANALYZE FILE NODE
                          </button>
                        </div>

                        {/* Interactive progress panel */}
                        {fileAnalysisLogs.length > 0 && (
                          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-900 font-mono text-[11px] text-zinc-400 space-y-1.5 h-36 overflow-y-auto max-h-36">
                            {fileAnalysisLogs.map((log, idx) => (
                              <p key={idx} className={log.includes('[SUCCESS]') ? 'text-yellow-400 font-bold' : ''}>
                                {log}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Structured result output */}
                        {fileAnalysisResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/60 p-4 border border-zinc-800/60 rounded-xl space-y-3 font-sans text-xs"
                          >
                            <span className="text-[10px] font-mono text-yellow-400 font-extrabold block tracking-wider uppercase">Compiled Semantic Metadata</span>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase block">Inferred File Type</span>
                                <span className="text-white font-bold">{fileAnalysisResult.documentType}</span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase block">Parsing Precision</span>
                                <span className="text-emerald-400 font-bold">{fileAnalysisResult.dataIntegrity}</span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase block">Size Metrics</span>
                                <span className="text-white font-bold">{fileAnalysisResult.dimensions}</span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase block">Model Complexity</span>
                                <span className="text-yellow-400 font-mono font-bold">{fileAnalysisResult.estimatedComplexity}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-zinc-800">
                              <span className="text-[10px] text-zinc-500 uppercase block">System Advisory Comments</span>
                              <p className="text-zinc-300 leading-relaxed mt-1 text-[11px]">{fileAnalysisResult.actionableAnalysis}</p>
                            </div>
                          </motion.div>
                        )}
                        
                        {!fileAnalysisLogs.length && (
                          <div className="h-44 border border-zinc-900 flex justify-center items-center rounded-xl bg-zinc-950/40 text-center p-4">
                            <p className="text-xs text-zinc-500 font-mono">Select a preset token structural document, and trigger "Analyze File Node".</p>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}

                  {selectedCategory === 'CHATBOT' && (
                    <motion.div
                      key="chatbot"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                      {/* Left Summary */}
                      <div className="lg:col-span-5 space-y-6 text-left">
                        <div className="p-3 bg-yellow-400/10 text-yellow-400 border border-yellow-500/20 rounded-xl inline-flex">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase font-sans">Continuous Chatbot Node Page</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          CODING AI empowers swift technical dialogue without boundaries. Connect directly via our Gemini model pipes and initiate immediate engineering reviews.
                        </p>
                        
                        <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-2 font-mono text-[11px]">
                          <span className="font-bold text-yellow-500 uppercase tracking-widest text-[10px] block">Model Parameters Overview</span>
                          <ul className="space-y-1 text-zinc-450 list-inside list-disc">
                            <li>Primary: <span className="text-white font-bold">Gemini 3.5 Flash</span></li>
                            <li>Secondary Context: <span className="text-white">Active history thread tracking</span></li>
                            <li>Daily allowance: <span className="text-white">40 Standard free queries</span></li>
                          </ul>
                        </div>
                      </div>

                      {/* Right Area: Prompt Shortcuts Panel */}
                      <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 text-left space-y-4">
                        <span className="text-[10px] font-mono tracking-wider text-yellow-500 font-bold uppercase block border-b border-zinc-900 pb-2">Direct Deep-Link prompt chips</span>
                        <p className="text-xs text-zinc-400 leading-normal">
                          Click any custom prompt shortcut chip below. It will automatically load the instructions and redirect you instantly into the live Chat box interface!
                        </p>

                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {[
                            { title: 'Database Optimization Logic', text: 'Optimize slow PostgreSQL join queries containing recursive filters, suggesting correct dynamic indices.', speed: '0.8s Solver Est.' },
                            { title: 'SaaS Architecture Pitch Draft', text: 'Draft a short, highly compelling SaaS investor proposal for an offline-first modular automation platform.', speed: '1.2s Solver Est.' },
                            { title: 'Reactive Unit Test Template', text: 'Write a comprehensive React module testing envelope using modern components with mock data injectors.', speed: '0.9s Solver Est.' },
                            { title: 'Zero-Knowledge Proof Concept', text: 'Explain the mathematical process of Zero-Knowledge Proof (ZKP) using clean visual code structures.', speed: '1.5s Solver Est.' }
                          ].map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => launchPromptChip(chip.text)}
                              className="text-left p-4 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-yellow-500/45 cursor-pointer block group hover:scale-[1.03] hover:outline hover:outline-2 hover:outline-yellow-500/40 hover:outline-offset-2 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-white group-hover:text-yellow-400 transition-colors uppercase">{chip.title}</span>
                                <span className="text-[9px] font-mono text-zinc-550 border border-zinc-900 px-1.5 py-0.5 rounded uppercase">{chip.speed}</span>
                              </div>
                              <p className="text-xs text-zinc-450 mt-2 line-clamp-1">{chip.text}</p>
                              <span className="text-[10px] font-mono text-yellow-500 mt-2.5 block text-right">Click to Launch Prompt →</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {selectedCategory === 'ENGINEERING' && (
                    <motion.div
                      key="engineering"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                      {/* Left Explanation */}
                      <div className="lg:col-span-5 space-y-6 text-left">
                        <div className="p-3 bg-yellow-400/10 text-yellow-400 border border-yellow-500/20 rounded-xl inline-flex">
                          <Code className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase font-sans">Precision Engineering Helper Page</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          This assistant inspects codebase inputs, flags performance bottlenecks, and proposes modern TypeScript refactor files immediately. Click the button to inspect the sample routine in our editor sandbox.
                        </p>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase font-black tracking-widest block">Input Source Document Block</label>
                          <textarea
                            value={inputCodeSnippet}
                            onChange={(e) => setInputCodeSnippet(e.target.value)}
                            rows={5}
                            disabled={isValidatingCode}
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 font-mono text-xs text-yellow-100 placeholder-zinc-700 focus:outline-none focus:border-yellow-500/40"
                          />
                        </div>
                      </div>

                      {/* Right Area: Validator Simulator */}
                      <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 text-left space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <span className="text-[10px] font-mono tracking-wider text-yellow-500 font-bold uppercase">AST Lint & Diagnostics Simulator</span>
                          <button
                            onClick={runCodeLintSimulator}
                            disabled={isValidatingCode}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-900 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            {isValidatingCode ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-black" />}
                            LINT CODE SNIPPET
                          </button>
                        </div>

                        {/* Logs */}
                        {codeValidationLogs.length > 0 && (
                          <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl font-mono text-[11px] text-zinc-400 space-y-1 h-32 overflow-y-auto max-h-32">
                            {codeValidationLogs.map((log, idx) => (
                              <p key={idx} className={log.includes('[SUCCESS]') ? 'text-yellow-400 font-bold' : ''}>
                                {log}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Diagnostic results */}
                        {codeValidationResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 text-xs font-sans"
                          >
                            <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                              <span className="font-mono text-[10px] text-zinc-550">SYNTAX RATING NODE:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-yellow-400 uppercase">{codeValidationResult.level}</span>
                                <span className="bg-yellow-400 text-black text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded">{codeValidationResult.score}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {codeValidationResult.issues.map((iss: any, idx: number) => (
                                <div key={idx} className="flex gap-2.5 p-2.5 rounded-lg border border-zinc-900 bg-zinc-950">
                                  {iss.severity === 'CRITICAL' && <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded uppercase font-mono h-4 block">Critical</span>}
                                  {iss.severity === 'WARNING' && <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded uppercase font-mono h-4 block">Warning</span>}
                                  {iss.severity === 'INFO' && <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1 rounded uppercase font-mono h-4 block">Info</span>}
                                  <p className="text-[11px] text-zinc-355 flex-1">{iss.text}</p>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">Proposed Safe Revision Code:</span>
                              <pre className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl overflow-x-auto text-[11px] font-mono text-zinc-200">
                                {codeValidationResult.suggestedRemedy}
                              </pre>
                            </div>
                          </motion.div>
                        )}

                        {!codeValidationLogs.length && (
                          <div className="h-44 border border-zinc-900 flex justify-center items-center rounded-xl bg-zinc-950/40 text-center p-4">
                            <p className="text-xs text-zinc-500 font-mono">Fill custom logic codes in the editor and click "LINT CODE SNIPPET" to process.</p>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}

                  {selectedCategory === 'SECURITY' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                      {/* Left Info */}
                      <div className="lg:col-span-5 space-y-6 text-left">
                        <div className="p-3 bg-yellow-400/10 text-yellow-400 border border-yellow-500/20 rounded-xl inline-flex">
                          <Key className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase font-sans">Decentralized Trust Key Node Page</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          CODING AI runs cryptographic layers protecting dynamic custom keys securely. All processing occurs in a sandboxed, memory-shielded container that falls back to system environmental models.
                        </p>

                        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/40 space-y-3 text-left">
                          <span className="text-[10px] font-mono text-yellow-500 block uppercase font-bold tracking-wider">Dynamic Keys Framework</span>
                          <p className="text-[11px] text-zinc-400 leading-normal text-left">
                            Keys submitted dynamically bypass permanent files storage systems and reside strictly in environment heaps. Dynamic proxy routing filters response requests, hiding raw keys during communication exchanges.
                          </p>
                        </div>
                      </div>

                      {/* Right Status Panel */}
                      <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 text-left space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <span className="text-[10px] font-mono tracking-wider text-yellow-500 font-bold uppercase">Dynamic Key Status Monitor</span>
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            <CheckCircle2 className="h-3 w-3" />
                            ONLINE
                          </span>
                        </div>

                        {/* Status Gauges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-2 hover:scale-[1.03] hover:outline hover:outline-2 hover:outline-yellow-500/30 hover:outline-offset-2 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all duration-300">
                            <span className="text-[9px] font-mono text-zinc-550 uppercase block font-bold leading-none">Security Encryption</span>
                            <span className="text-xs font-mono font-bold text-white block">AES_256_GCM</span>
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 w-full" />
                            </div>
                          </div>
                          <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-2 hover:scale-[1.03] hover:outline hover:outline-2 hover:outline-yellow-500/30 hover:outline-offset-2 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all duration-300">
                            <span className="text-[9px] font-mono text-zinc-550 uppercase block font-bold leading-none">Custom Key status</span>
                            <span className="text-xs font-mono font-bold text-white block">{hasCustomKey ? "Active User Key" : "System Fallback"}</span>
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className={`h-full ${hasCustomKey ? 'bg-yellow-400 w-full' : 'bg-zinc-700 w-1/3'}`} />
                            </div>
                          </div>
                          <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-2 hover:scale-[1.03] hover:outline hover:outline-2 hover:outline-yellow-500/30 hover:outline-offset-2 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all duration-300">
                            <span className="text-[9px] font-mono text-zinc-550 uppercase block font-bold leading-none">Operational Uptime</span>
                            <span className="text-xs font-mono font-bold text-white block">99.98% Standard</span>
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 w-[99.98%]" />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950 space-y-2.5 text-xs text-zinc-400 leading-relaxed font-sans">
                          <span className="text-[9px] font-mono text-zinc-550 block font-bold uppercase tracking-wider">Dynamic Node Safety Directives:</span>
                          <ul className="space-y-1.5 list-disc list-inside">
                            <li>Raw credentials never write to disk structures or system database models</li>
                            <li>Dynamic routing protects payloads from leaking into standard inspection consoles</li>
                            <li>Sessions automatically recycle and clean up memory allocations upon timeout metrics</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </motion.div>
            )}

            {/* ================= PAGE 3: FULLSCREEN DEDICATED AI CHAT BOX ================= */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat-page"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="text-center space-y-1.5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                    CODING AI Chat Console
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Unlimited conversation. Drop files or prompt technical schematics dynamically.
                  </p>
                </div>

                <div className="h-[600px] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 relative">
                  <ChatPlayground 
                    hasCustomKey={hasCustomKey} 
                    currentUser={currentUser}
                    onOpenLoginRegister={() => {
                      navigateToPage('auth');
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    onTokensUpdated={(remainingTokens) => {
                      if (currentUser) {
                        setCurrentUser((prev: any) => ({
                          ...prev,
                          tokens: remainingTokens
                        }));
                      }
                    }}
                    onOpenAdmin={() => {
                      // fallback safety in case component triggers admin opening
                      triggerToast("Operational key node configurations are active.");
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ================= PAGE 4: MEMBERSHIP PLANS ================= */}
            {activeTab === 'pricing' && (
              <motion.div
                key="pricing-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-yellow-500 uppercase bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
                    MEMBERSHIP PLANS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    CHOOSE YOUR ACCOUNT LEVEL
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-normal">
                    Gain priority bandwidth, customizable token allowances, and live production capability extensions immediately.
                  </p>
                </div>

                <div className="max-w-5xl mx-auto">
                  <Pricing onSelectPlan={handleSelectPlan} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 mt-12 py-8 px-6 text-zinc-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Logo size="sm" interactive={false} />
            <div className="flex flex-col text-left">
              <span className="font-bold text-white font-mono uppercase tracking-wider text-xs">VxAi</span>
            </div>
          </div>

          <div className="text-center md:text-right font-mono text-[11px] text-zinc-550 space-y-1.5 flex-shrink-0 flex flex-col items-center md:items-end justify-center">
            <p>© 2026 VxAi Generative Networks. All Rights Reserved.</p>
            <p className="text-[10px] text-yellow-400/80 font-mono font-bold uppercase tracking-widest mt-1">
              Made by TheRynzo
            </p>
          </div>
        </div>
      </footer>
        </>
      )}

      {/* ADMIN CONTROL CORE DRAWER OVERLAY */}
      <AnimatePresence>
        {isAdminDashboardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0"
            onClick={() => setIsAdminDashboardOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="w-full h-full bg-zinc-950 overflow-y-auto p-6 md:p-12 relative shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button banner */}
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6 flex-shrink-0">
                <span className="text-xs font-mono tracking-widest text-yellow-500 font-bold uppercase flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                  CODING AI Admin Dashboard
                </span>
                <button
                  onClick={() => setIsAdminDashboardOpen(false)}
                  className="p-2 px-4 bg-zinc-900 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-xs text-zinc-400 cursor-pointer font-semibold flex items-center gap-1.5 border border-zinc-850 transition-all font-mono"
                >
                  <X className="h-4 w-4" />
                  CLOSE DASHBOARD
                </button>
              </div>

              {/* Render Admin Dashboard contents */}
              <div className="flex-1">
                <AdminDashboard 
                  onApiConfigUpdated={checkKeyStatus} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
