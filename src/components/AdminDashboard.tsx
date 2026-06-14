import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Database, 
  BarChart3, 
  Lock, 
  ShieldCheck, 
  Power, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  FileCheck, 
  MessageSquare,
  TrendingUp,
  Clock,
  LogOut,
  Sparkles,
  Users,
  Plus,
  Minus,
  Ban,
  UserCheck,
  Trash2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Edit
} from 'lucide-react';
import { ApiConfig, AnalyticsStats, UserAccount } from '../types';
import { PRESET_PLANS } from './Pricing';

interface AdminDashboardProps {
  onApiConfigUpdated: () => void;
}

export default function AdminDashboard({ onApiConfigUpdated }: AdminDashboardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  // Form states
  const [customKey, setCustomKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keyMessage, setKeyMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Logo upload state
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Selected state for token gifting
  const [tokenGiftValues, setTokenGiftValues] = useState<{ [email: string]: string }>({});

  // Statistics & Config states
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // User list searching
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    // Check local storage for pre-existing session
    const token = localStorage.getItem('vxhost_admin_token');
    if (token) {
      setIsLoggedIn(true);
      fetchAdminData(token);
    }
  }, []);

  const fetchAdminData = async (token: string) => {
    setIsLoadingStats(true);
    try {
      // Fetch stats (which returns our users roster)
      const statsRes = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch config schema
      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      const historyRes = await fetch('/api/admin/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistoryList(historyData.history.reverse()); // latest first
      }

    } catch (err) {
      console.error('Error querying admin metrics:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoadingLogin(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server validation failed.');
      }

      localStorage.setItem('vxhost_admin_token', data.token);
      setIsLoggedIn(true);
      fetchAdminData(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Credentials invalid. Reach system operator.');
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKey(true);
    setKeyMessage(null);

    const token = localStorage.getItem('vxhost_admin_token');
    if (!token) {
      setKeyMessage({ text: 'Admin token missing. Log in again.', type: 'error' });
      setIsSavingKey(false);
      return;
    }

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ customApiKey: customKey })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Configuration could not be saved.');
      }

      setKeyMessage({ text: 'API Key successfully configured as system override key!', type: 'success' });
      setCustomKey('');
      onApiConfigUpdated();
      fetchAdminData(token);
    } catch (err: any) {
      setKeyMessage({ text: err.message || 'Failed to save configuration key.', type: 'error' });
    } finally {
      setIsSavingKey(false);
    }
  };

  // Custom base64 logo configuration handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setUploadMessage(null);

    const adminToken = localStorage.getItem('vxhost_admin_token');
    if (!adminToken) {
      setUploadMessage({ text: 'Admin token missing. Log in again.', type: 'error' });
      setIsUploadingLogo(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        setUploadMessage({ text: 'Could not process custom file data.', type: 'error' });
        setIsUploadingLogo(false);
        return;
      }

      try {
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ customLogoUrl: base64Data })
        });

        if (!response.ok) throw new Error('Could not upload logo configuration.');

        setUploadMessage({ text: 'Custom logo loaded successfully! Dynamic headers refreshed.', type: 'success' });
        onApiConfigUpdated();
        fetchAdminData(adminToken);
      } catch (err: any) {
        setUploadMessage({ text: err.message, type: 'error' });
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Restore Vector default Logo Action
  const handleResetLogo = async () => {
    setIsUploadingLogo(true);
    setUploadMessage(null);

    const adminToken = localStorage.getItem('vxhost_admin_token');
    if (!adminToken) return;

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ customLogoUrl: "" })
      });

      if (!response.ok) throw new Error('Failed resetting configuration.');

      setUploadMessage({ text: 'Reverted to native CODING AI system vector emblem.', type: 'success' });
      onApiConfigUpdated();
      fetchAdminData(adminToken);
    } catch (err: any) {
      setUploadMessage({ text: err.message, type: 'error' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // User modification actions proxy
  const handleUserAction = async (targetEmail: string, action: 'give_tokens' | 'take_tokens' | 'ban_user' | 'unban_user' | 'delete_user' | 'change_plan', newPlanId?: string, newPlanName?: string) => {
    const adminToken = localStorage.getItem('vxhost_admin_token');
    if (!adminToken) return;

    let payload: any = { action, targetEmail };

    const giftAmount = tokenGiftValues[targetEmail] || '';
    if ((action === 'give_tokens' || action === 'take_tokens') && (!giftAmount || isNaN(parseFloat(giftAmount)))) {
      alert('Please fill a valid numeric token amount to act upon.');
      return;
    }

    if (action === 'give_tokens' || action === 'take_tokens') {
      payload.tokensValue = parseFloat(giftAmount);
    }

    if (action === 'change_plan') {
      if (!newPlanId || !newPlanName) return;
      payload.planId = newPlanId;
      payload.planName = newPlanName;
    }

    try {
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Operator command failed.');
      }

      // Reset gift text field
      if (action === 'give_tokens') {
        setTokenGiftValues(prev => ({ ...prev, [targetEmail]: '' }));
      }

      // Fetch fresh stats to update listed rows
      fetchAdminData(adminToken);
    } catch (err: any) {
      alert(err.message || 'Error executing client override command.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vxhost_admin_token');
    setIsLoggedIn(false);
    setStats(null);
    setConfig(null);
  };

  const handleRefreshStats = () => {
    const token = localStorage.getItem('vxhost_admin_token');
    if (token) {
      fetchAdminData(token);
    }
  };

  const filteredUsers = (stats?.usersList || []).filter(u => {
    const s = userSearch.toLowerCase();
    return u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  });

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-login-panel">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-yellow-500/5 blur-xl pointer-events-none" />

          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 mb-4 text-center">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">CODING AI Operator Console</h3>
            <p className="text-xs text-zinc-400 mt-2">Authenticated credentials required to access nodes.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">Operator Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-yellow-500 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">Security Keyphrase</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password passkey"
                className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-yellow-500 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-lg font-medium">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoadingLogin}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-xs font-mono tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-yellow-500/10"
            >
              {isLoadingLogin ? 'VALIDATING SECURITY CODES...' : 'CONNECT OPERATOR NODE'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8" id="admin-dashboard-panel">
      {/* Upper header action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-90 w-full p-6 border border-zinc-800 bg-zinc-950 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-bl-full bg-yellow-500/5 blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400 border border-yellow-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight text-left">CODING AI Operator Dashboard</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border border-amber-500/35 bg-amber-500/10 text-amber-400 tracking-wider">
                CORE OVERLORD ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 text-left">Manage tokens, upload custom vector branding, and supervise cloud subscribers.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshStats}
            disabled={isLoadingStats}
            className="p-3 text-zinc-400 hover:text-white bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            title="Refresh Server Analytics"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isLoadingStats ? 'animate-spin text-yellow-500' : ''}`} />
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            DISCONNECT OPERATOR
          </button>
        </div>
      </div>

      {/* Main Stats Summary in Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="rounded-xl border border-zinc-850 bg-zinc-950 p-5 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono tracking-widest uppercase">System Users Count</span>
            <Users className="h-4 w-4 text-yellow-500/70" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-white mt-2 text-left">{stats?.usersList?.length ?? '0'} Users</h4>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
              <span>Managed sandbox profiles</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-xl border border-zinc-850 bg-zinc-950 p-5 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono tracking-widest uppercase">Total System Messages</span>
            <MessageSquare className="h-4 w-4 text-yellow-500/70" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-white mt-2 text-left">{stats?.totalMessages ?? '0'} Answers</h4>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
              <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />
              <span>Realtime processing load</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-xl border border-zinc-850 bg-zinc-950 p-5 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono tracking-widest uppercase">Document Analyses</span>
            <FileCheck className="h-4 w-4 text-yellow-500/70" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-white mt-2 text-left">{stats?.totalFilesUploaded ?? '0'} Files</h4>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
              <span>Knowledge extraction</span>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-xl border border-zinc-850 bg-zinc-950 p-5 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono tracking-widest uppercase">Operator Session Uptime</span>
            <Clock className="h-4 w-4 text-yellow-500/70" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-white mt-2 text-left">{stats?.uptime ?? '0h 0m'}</h4>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span>Standby operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM LOGO PERSONALIZATION ENGINE */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 relative overflow-hidden text-left">
        <div className="flex items-center gap-2.5 text-white mb-6">
          <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-500 border border-yellow-500/20">
            <ImageIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-md">Personalized Logo Administrator Uploader</h3>
            <p className="text-xs text-zinc-500">Upload a Custom Logo image to replace the default V SVG model vector emblem globally.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">ACTIVE LOGO LOOK</span>
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-zinc-950 border border-zinc-850 overflow-hidden shadow-2xl">
              {config?.customLogoUrl ? (
                <img 
                  src={config.customLogoUrl} 
                  alt="Custom Web Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-zinc-500 font-mono text-[10px] flex flex-col items-center">
                  <span className="text-yellow-500 text-lg font-black font-mono">CODING AI</span>
                  <span className="text-[9px] text-zinc-600 block mt-1">VECTOR DEFAULT</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Accepts PNG, JPEG or SVG image files. The system encodes images inside base-64 data envelopes so they load flawlessly without external asset CDNs.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer">
                <Upload className="h-4 w-4 text-yellow-500" />
                {isUploadingLogo ? 'PROCESSING IMAGE...' : 'CHOOSE CUSTOM LOGO'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  disabled={isUploadingLogo}
                  className="hidden" 
                />
              </label>

              {config?.customLogoUrl && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  disabled={isUploadingLogo}
                  className="flex items-center gap-2 px-5 py-3.5 bg-red-950/10 hover:bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  RESTORE ORIGINAL VECTOR
                </button>
              )}
            </div>

            {uploadMessage && (
              <p className={`text-xs p-3 rounded-lg font-mono tracking-wide ${
                uploadMessage.type === 'success' ? 'text-emerald-400 bg-emerald-500/5' : 'text-red-400 bg-red-500/5'
              }`}>
                {uploadMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* USER DATABASE MATRIX AND CONTROLS */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5 text-white">
            <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-500 border border-yellow-500/20">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-md">Subscriber Accounts Matrix (History Panel)</h3>
              <p className="text-xs text-zinc-500">Monitor active accounts, grant developer token gifts, and administer bans.</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search roster by email / username..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-yellow-500 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none w-full md:w-64 font-mono transition-all"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-zinc-900 bg-zinc-900/10">
            <Users className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-mono">No matching system accounts detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-900">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-900">
                <tr>
                  <th className="px-5 py-4">Username / Email</th>
                  <th className="px-5 py-4">Selected Membership Plan</th>
                  <th className="px-5 py-4">Active Balance</th>
                  <th className="px-5 py-4">Status / Actions</th>
                  <th className="px-5 py-4 text-center">Gifting Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-zinc-950">
                {filteredUsers.map((u: UserAccount) => (
                  <tr key={u.email} className="hover:bg-zinc-900/30 transition-colors">
                    {/* User profile identifier */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm font-sans">{u.username}</div>
                      <div className="text-[11.5px] text-zinc-500 mt-0.5">{u.email}</div>
                      <div className="text-[9px] text-zinc-600 mt-1 uppercase font-mono">Created: {new Date(u.createdAt).toLocaleDateString()}</div>
                    </td>

                    {/* Active assigned plan */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select 
                          className={`bg-zinc-900 border ${
                            u.planId.includes('free') ? 'border-zinc-800 text-zinc-400' : 'border-yellow-500/20 text-yellow-400'
                          } text-[10px] font-bold uppercase rounded px-2 py-1 pr-2 cursor-pointer focus:outline-none focus:border-yellow-500`}
                          value={u.planId}
                          onChange={(e) => {
                            const newPlanId = e.target.value;
                            const newPlanName = PRESET_PLANS.find(p => p.id === newPlanId)?.name || newPlanId;
                            handleUserAction(u.email, 'change_plan', newPlanId, newPlanName);
                          }}
                        >
                          {PRESET_PLANS.map(plan => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Live balance */}
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-white">{u.tokens.toFixed(2)}</div>
                      <span className="text-[9px] text-zinc-600 uppercase block">tokens remaining</span>
                    </td>

                    {/* Operational states (Bans and unlocks) */}
                    <td className="px-5 py-4 space-y-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        u.isBanned 
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {u.isBanned ? 'LOCKED / BANNED' : 'OPERATIONAL'}
                      </span>

                      <div className="flex items-center gap-2 pt-1.5">
                        {u.isBanned ? (
                          <button
                            type="button"
                            onClick={() => handleUserAction(u.email, 'unban_user')}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[9.5px] font-mono uppercase font-bold cursor-pointer transition-all flex items-center gap-1"
                          >
                            <UserCheck className="h-3 w-3" />
                            UNBAN
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUserAction(u.email, 'ban_user')}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-700/20 px-2 py-1 rounded text-[9.5px] font-mono uppercase font-bold cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Ban className="h-3 w-3" />
                            BAN / LOCK
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Do you want to permanently delete user account ${u.username}?`)) {
                              handleUserAction(u.email, 'delete_user');
                            }
                          }}
                          className="bg-zinc-900 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/30 p-1.5 rounded cursor-pointer transition-all"
                          title="Delete user record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Add tokens gifted widget */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 ml-auto">
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            placeholder="Amt"
                            value={tokenGiftValues[u.email] || ''}
                            onChange={(e) => setTokenGiftValues(prev => ({ ...prev, [u.email]: e.target.value }))}
                            className="bg-zinc-900 border border-zinc-850 focus:border-yellow-500 rounded-lg px-2 w-20 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none font-sans"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUserAction(u.email, 'take_tokens')}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="Take Tokens"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUserAction(u.email, 'give_tokens')}
                          className="bg-yellow-400 hover:bg-yellow-300 text-black px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                          title="Gift Tokens"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHAT HISTORY MATRIX */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5 text-white">
            <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-500 border border-yellow-500/20">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-md">Global Chat History Logs</h3>
              <p className="text-xs text-zinc-500">View real-time history of AI interactions across all network nodes.</p>
            </div>
          </div>
        </div>

        {historyList.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-zinc-900 bg-zinc-900/10">
            <MessageSquare className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-mono">No interactions logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-900 max-h-96">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-900 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">User Prompt</th>
                  <th className="px-5 py-4">AI Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-zinc-950">
                {historyList.slice(0, 50).map((h: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-5 py-4 text-[10px] text-zinc-500">
                      {new Date(h.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-white max-w-[120px] truncate">{h.username}</div>
                      <div className="text-[9px] text-zinc-500 max-w-[120px] truncate">{h.email}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-normal min-w-[200px] max-w-xs break-words border-x border-zinc-900/30">
                      <p className="text-zinc-300 leading-relaxed max-h-24 overflow-y-auto pr-2">{h.userMessage}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-normal min-w-[300px] max-w-lg break-words">
                      <p className="text-yellow-400/80 leading-relaxed max-h-24 overflow-y-auto pr-2">{h.aiResponse}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic system key credentials module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 relative overflow-hidden text-left">
            <div className="flex items-center gap-2.5 text-white mb-6">
              <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-500 border border-yellow-500/20">
                <Key className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-md">Gemini API Key Secure Configuration</h3>
                <p className="text-xs text-zinc-500">Set a custom dynamic key. Submissions override active system environmental variables.</p>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Custom Gemini API Key</label>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-yellow-500 transition-colors cursor-pointer"
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showKey ? 'MUTE KEY' : 'REVEAL KEY'}
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="Enter your AI Studio API key (AIzaSy...)"
                    className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-yellow-500 rounded-xl pl-4 pr-12 py-4 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none font-mono transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                    <Key className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {keyMessage && (
                <div className={`p-4 rounded-xl text-xs flex justify-between items-center ${
                  keyMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  <p className="font-medium">{keyMessage.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingKey}
                className="w-full py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs font-mono tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md shadow-yellow-500/5"
              >
                {isSavingKey ? 'CONSTRUCTING OVERRIDE ENVELOPE...' : 'SAVE & CONFIGURE OVERRIDE KEY'}
              </button>
            </form>
          </div>
        </div>

        {/* Informative credentials status panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="font-bold text-white text-sm mb-4">Keys & Service Health</h3>
            
            <div className="space-y-4">
              <div className="rounded-xl bg-zinc-90 w-full p-4 border border-zinc-900 bg-zinc-900/40">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">Dynamic Override Active</span>
                <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                  config?.hasCustomKey 
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${config?.hasCustomKey ? 'bg-yellow-400' : 'bg-transparent'}`} />
                  {config?.hasCustomKey ? 'CUSTOM CONFIGURED' : 'NO OVERRIDE ACTIVE'}
                </span>
                <span className="text-[10px] block text-zinc-500 mt-2 font-mono">
                  {config?.hasCustomKey ? `Saved: ${new Date(config.updatedAt || '').toLocaleDateString()}` : 'Using system env variable keys'}
                </span>
              </div>

              <div className="rounded-xl bg-zinc-90 w-full p-4 border border-zinc-900 bg-zinc-900/40">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">Default Environment Fallback</span>
                <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                  stats?.keyStatus === 'default' || stats?.keyStatus === 'custom_configured'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse'
                }`}>
                  {stats?.keyStatus === 'default' || stats?.keyStatus === 'custom_configured' ? 'ENVIRONMENT READY' : 'NO KEY SET'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
