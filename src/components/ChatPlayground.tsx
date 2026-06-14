import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Trash2, 
  Flame, 
  Loader2, 
  Check, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCode,
  Lock,
  Plus,
  MessageSquare,
  ChevronLeft,
  History,
  Info,
  User,
  Key,
  RefreshCw,
  Settings,
  ArrowLeft,
  Menu,
  Download
} from 'lucide-react';
import { Message } from '../types';
import JSZip from 'jszip';

interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface ChatPlaygroundProps {
  onOpenAdmin: () => void;
  hasCustomKey: boolean;
  currentUser: any;
  onOpenLoginRegister: () => void;
  onTokensUpdated: (tokens: number) => void;
  onBackHome?: () => void;
  onSyncProfile?: () => void;
}

const CONVERSATION_SUGGESTIONS = [
  { text: "Analyze a business plan for CODING AI startup", icon: <Sparkles className="h-4 w-4 text-yellow-500" /> },
  { text: "Write an interactive yellow & black landing page code", icon: <FileCode className="h-4 w-4 text-yellow-500" /> },
  { text: "Explain deep learning neural network with a simple analogy", icon: <HelpCircle className="h-4 w-4 text-yellow-500" /> },
  { text: "Draft a modern premium high-converting email proposal", icon: <Flame className="h-4 w-4 text-yellow-500" /> },
];

function TypewriterBubble({ 
  text, 
  onComplete, 
  formatText 
}: { 
  text: string; 
  onComplete: () => void; 
  formatText: (t: string) => React.ReactNode 
}) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    // Split by words/whitespace, keeping spacing intact
    const words = text.split(/(\s+)/);
    let currentWordIndex = 0;
    let currentText = '';
    
    const timer = setInterval(() => {
      if (currentWordIndex < words.length) {
        currentText += words[currentWordIndex];
        setDisplayedText(currentText);
        currentWordIndex++;
      } else {
        clearInterval(timer);
        onComplete();
      }
    }, 15); // Silky and ultra-fast word-by-word streaming speed
    
    return () => clearInterval(timer);
  }, [text]);
  
  return (
    <div className="relative group/typewriter">
      <div className="markdown-body space-y-2 selection:bg-yellow-500 selection:text-black">
        {formatText(displayedText)}
      </div>
      <button
        onClick={onComplete}
        className="absolute -bottom-6 right-0 text-[9px] font-mono font-bold tracking-widest text-yellow-500 hover:text-white bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 cursor-pointer opacity-0 group-hover/typewriter:opacity-100 transition-opacity"
        title="Bypass streaming animation"
      >
        SKIP ANIMATION ➔
      </button>
    </div>
  );
}

const downloadProjectAsZip = async (text: string) => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  const files: {name: string, content: string}[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('```') && part.endsWith('```')) {
      let fileName = 'file_' + files.length + '.txt';
      const prevPart = parts[i - 1];
      if (prevPart) {
        const headerMatch = prevPart.match(/###\s*([a-zA-Z0-9_\-\.\/]+)\s*$/);
        if (headerMatch) {
          fileName = headerMatch[1];
        } else {
          const altMatch = prevPart.match(/([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z]+)\s*$/);
          if (altMatch) fileName = altMatch[1];
        }
      }
      
      const codeLines = part.slice(3, -3).trim().split('\n');
      if (codeLines[0] && codeLines[0].length < 15 && !codeLines[0].includes(' ') && !codeLines[0].includes('(')) {
        codeLines.shift();
      }
      files.push({ name: fileName, content: codeLines.join('\n') });
    }
  }

  if (files.length === 0) return;

  const zip = new JSZip();
  files.forEach(f => {
    zip.file(f.name, f.content);
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vxai-project.zip';
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function ChatPlayground({ 
  onOpenAdmin, 
  hasCustomKey, 
  currentUser, 
  onOpenLoginRegister, 
  onTokensUpdated,
  onBackHome,
  onSyncProfile
}: ChatPlaygroundProps) {
  // Page threads management
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  // Navigation layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Profile Down Settings panel states
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResettingTokens, setIsResettingTokens] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [timeRemaining, setTimeRemaining] = useState<string>('Checking...');

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; type: string; size: number; dataUrl: string }>>([]);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load threads from local storage on bootstrap
  useEffect(() => {
    const email = currentUser ? currentUser.email : 'guest';
    const storeKey = `vxhost_chat_threads_${email}`;
    const saved = localStorage.getItem(storeKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      } catch (err) {
        console.error('Error loading threads from storage:', err);
      }
    }
    
    // Seed initial single default thread if none are saved
    const initialId = 'thread-' + Date.now();
    const initialThread: ChatThread = {
      id: initialId,
      title: 'CODING AI Console Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setThreads([initialThread]);
    setActiveThreadId(initialId);
  }, [currentUser]);

  // Dynamic Token Cooldown Live Timer Effect
  useEffect(() => {
    if (!currentUser) return;
    
    const updateCountdown = () => {
      const refillStr = currentUser.lastTokenRefill;
      if (!refillStr) {
        setTimeRemaining('Refill Ready!');
        return;
      }

      const lastRefill = new Date(refillStr).getTime();
      const nextRefill = lastRefill + 24 * 60 * 60 * 1000; // 24 Hours later
      const diff = nextRefill - Date.now();

      if (diff <= 0) {
        setTimeRemaining('Refill Available!');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const pad = (num: number) => num < 10 ? `0${num}` : num;
        setTimeRemaining(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentUser?.lastTokenRefill]);

  // Handle password modification
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ text: 'All fields are required.', type: 'error' });
      return;
    }

    setIsResettingPassword(true);
    setPasswordStatus({ text: '', type: '' });

    try {
      const token = localStorage.getItem('vx_user_session_token');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordStatus({ text: 'Password reset successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordStatus({ text: '', type: '' }), 5000);
      } else {
        setPasswordStatus({ text: data.error || 'Failed to update password.', type: 'error' });
      }
    } catch (err) {
      setPasswordStatus({ text: 'Network request occurred error.', type: 'error' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Handle instant token refill
  const handleRefillTokens = async () => {
    setIsResettingTokens(true);
    setTokenStatus({ text: '', type: '' });

    try {
      const token = localStorage.getItem('vx_user_session_token');
      const response = await fetch('/api/user/reset-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setTokenStatus({ text: 'Tokens replenished! Daily cooldown reset.', type: 'success' });
        onTokensUpdated(data.tokens);
        if (onSyncProfile) {
          onSyncProfile();
        }
        setTimeout(() => setTokenStatus({ text: '', type: '' }), 5000);
      } else {
        setTokenStatus({ text: data.error || 'Failed to replenish tokens.', type: 'error' });
      }
    } catch (err) {
      setTokenStatus({ text: 'Network request error for refill.', type: 'error' });
    } finally {
      setIsResettingTokens(false);
    }
  };

  // Persists active threads on modification
  const saveThreads = (updatedThreads: ChatThread[]) => {
    setThreads(updatedThreads);
    const email = currentUser ? currentUser.email : 'guest';
    const storeKey = `vxhost_chat_threads_${email}`;
    localStorage.setItem(storeKey, JSON.stringify(updatedThreads));
  };

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const messages = activeThread ? activeThread.messages : [];

  const updateActiveThreadMessages = (newMessages: Message[]) => {
    if (!activeThreadId) return;
    
    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        let updatedTitle = t.title;
        // Auto rename default titles dynamically from first user input
        if (t.title === 'CODING AI Console Chat' || t.title === 'New Chat Thread') {
          const firstUserStr = newMessages.find(m => m.role === 'user');
          if (firstUserStr) {
            updatedTitle = firstUserStr.text.slice(0, 30) + (firstUserStr.text.length > 30 ? '...' : '');
          }
        }
        return {
          ...t,
          title: updatedTitle,
          messages: newMessages
        };
      }
      return t;
    });
    saveThreads(updatedThreads);
  };

  const handleCreateNewThread = () => {
    const newId = 'thread-' + Date.now();
    const newThread: ChatThread = {
      id: newId,
      title: 'New Chat Thread',
      messages: [],
      createdAt: new Date().toISOString()
    };
    const updatedThreads = [newThread, ...threads];
    saveThreads(updatedThreads);
    setActiveThreadId(newId);
    setMobileSidebarOpen(false);
  };

  const handleDeleteThread = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = threads.filter(t => t.id !== idToDelete);
    if (filtered.length === 0) {
      const resetId = 'thread-' + Date.now();
      const resetThread: ChatThread = {
        id: resetId,
        title: 'CODING AI Console Chat',
        messages: [],
        createdAt: new Date().toISOString()
      };
      saveThreads([resetThread]);
      setActiveThreadId(resetId);
    } else {
      saveThreads(filtered);
      if (activeThreadId === idToDelete) {
        setActiveThreadId(filtered[0].id);
      }
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle file reads
  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    setErrorNotice(null);

    Array.from(files).forEach((file) => {
      // Limit to 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        setErrorNotice(`File "${file.name}" exceeds the 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return;

        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;

    setErrorNotice(null);
    setIsLoading(true);

    const userMsgId = 'user-' + Date.now();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    // Update messages
    const updatedMessages = [...messages, newUserMessage];
    updateActiveThreadMessages(updatedMessages);
    setInputText('');
    setAttachedFiles([]);

    try {
      const userToken = localStorage.getItem('vx_user_session_token') || localStorage.getItem('vxhost_admin_token') || '';
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          messages: updatedMessages,
          isNewChat: messages.length === 0,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server error occurred');
      }

      // Propagate updated tokens back to parent profile state
      if (typeof data.remainingTokens === 'number') {
        onTokensUpdated(data.remainingTokens);
      }

      const modelMessage: Message = {
        id: 'model-' + Date.now(),
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTyping: true, // Mark active typing true for first-time reveal!
      };

      updateActiveThreadMessages([...updatedMessages, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorNotice(err.message || 'Something went wrong. Please verify connection credentials.');
      // Remove the last message from history if it failed
      updateActiveThreadMessages(messages.filter((m) => m.id !== userMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypewriterComplete = (msgId: string) => {
    const freshMessages = messages.map(m => {
      if (m.id === msgId) {
        return { ...m, isTyping: false };
      }
      return m;
    });
    updateActiveThreadMessages(freshMessages);
  };

  const clearChatHistory = () => {
    updateActiveThreadMessages([]);
    setAttachedFiles([]);
    setErrorNotice(null);
  };

  // Simple custom renderer for markdown-like text (bold, code blocks, bullet points, numbering)
  const formatText = (text: string) => {
    if (!text) return '';
    
    // Split into segments of code blocks and normal text
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, i) => {
      // Is code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim().split('\n');
        let language = 'text';
        if (codeLines[0] && codeLines[0].length < 15 && !codeLines[0].includes(' ') && !codeLines[0].includes('(')) {
          language = codeLines.shift() || 'text';
        }
        const codeText = codeLines.join('\n');
        return (
          <div key={i} className="my-3 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 text-xs font-mono">
            <div className="bg-zinc-900 px-4 py-1.5 flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800">
              <span className="uppercase">{language}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  // Optional: we don't have local state here without a nested component, so just copy silently
                }}
                className="text-[10px] text-yellow-500/80 hover:text-yellow-400 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                title="Copy to clipboard"
              >
                Click to Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-yellow-105/95 leading-relaxed text-zinc-300">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Format inline headers, bullet points, bold and inline code
      let formatted = part;
      const lines = formatted.split('\n');
      return (
        <div key={i} className="space-y-1.5">
          {lines.map((line, lineIdx) => {
            let processedLine = line;

            // Header tags
            if (processedLine.startsWith('### ')) {
              return <h4 key={lineIdx} className="text-sm font-bold text-yellow-400 mt-3">{processedLine.slice(4)}</h4>;
            }
            if (processedLine.startsWith('## ')) {
              return <h3 key={lineIdx} className="text-md font-bold text-yellow-400 mt-4 border-b border-zinc-800/60 pb-1">{processedLine.slice(3)}</h3>;
            }
            if (processedLine.startsWith('# ')) {
              return <h2 key={lineIdx} className="text-lg font-bold text-yellow-500 mt-5">{processedLine.slice(2)}</h2>;
            }

            // Bullet points
            const isBullet = processedLine.startsWith('* ') || processedLine.startsWith('- ');
            if (isBullet) {
              processedLine = processedLine.substring(2);
            }

            // Render inline bold/code features
            const renderInline = (srcStr: string) => {
              const boldRegex = /\*\*(.*?)\*\*/g;
              const codeRegex = /`(.*?)`/g;
              
              const list: { type: 'text' | 'bold' | 'code'; text: string; index: number }[] = [];
              
              // Match bold
              let match;
              while ((match = boldRegex.exec(srcStr)) !== null) {
                list.push({ type: 'bold', text: match[1], index: match.index });
              }
              // Match code
              while ((match = codeRegex.exec(srcStr)) !== null) {
                list.push({ type: 'code', text: match[1], index: match.index });
              }
              
              // Sort by index
              list.sort((a, b) => a.index - b.index);
              
              let currentPos = 0;
              const resultNodes: React.ReactNode[] = [];
              
              for (let k = 0; k < list.length; k++) {
                const item = list[k];
                if (item.index < currentPos) continue; // Skip overlaps
                
                // Add preceding text
                if (item.index > currentPos) {
                  resultNodes.push(srcStr.slice(currentPos, item.index));
                }
                
                // Add tag
                if (item.type === 'bold') {
                  resultNodes.push(<strong key={k} className="text-yellow-400 font-extrabold">{item.text}</strong>);
                  currentPos = item.index + item.text.length + 4; // **body** is 4 chars
                } else if (item.type === 'code') {
                  resultNodes.push(<code key={k} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-yellow-500 font-mono text-xs">{item.text}</code>);
                  currentPos = item.index + item.text.length + 2; // `body` is 2 chars
                }
              }
              
              if (currentPos < srcStr.length) {
                resultNodes.push(srcStr.slice(currentPos));
              }
              
              return resultNodes.length > 0 ? resultNodes : srcStr;
            };

            if (isBullet) {
              return (
                <ul key={lineIdx} className="list-disc list-inside pl-4 text-xs leading-relaxed text-zinc-300">
                  <li>{renderInline(processedLine)}</li>
                </ul>
              );
            }
            
            return (
              <p key={lineIdx} className="text-xs leading-relaxed text-zinc-300">
                {renderInline(processedLine)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const renderProfileSettingsSection = () => {
    if (!currentUser) return null;

    return (
      <div className="p-3 border-t border-zinc-900 bg-zinc-950 flex flex-col gap-2">
        {/* Return to website */}
        {onBackHome && (
          <button
            type="button"
            onClick={onBackHome}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 text-yellow-400 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            RETURN TO WEBSITE
          </button>
        )}

        {/* Quick Profile Overview Info */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-900">
          <div className="flex items-center gap-2 truncate">
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold font-mono text-xs uppercase">
              {currentUser.username ? currentUser.username[0] : 'U'}
            </div>
            <div className="truncate text-left">
              <span className="text-[11px] font-bold text-white block leading-tight truncate">{currentUser.username || 'Subscriber'}</span>
              <span className="text-[9px] text-zinc-550 block max-w-[110px] truncate leading-tight">{currentUser.email}</span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => setIsProfileSettingsOpen(!isProfileSettingsOpen)}
            className={`p-1.5 rounded-lg border cursor-pointer hover:bg-zinc-800 transition-colors ${isProfileSettingsOpen ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-500' : 'bg-transparent border-zinc-800 text-zinc-400'}`}
            title="Manage Account Profile"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Profile Settings Drawer (collapsible block) */}
        <AnimatePresence>
          {isProfileSettingsOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-2 text-xs space-y-3.5 overflow-hidden"
            >
              {/* Cooldown refill status */}
              <div className="space-y-1 bg-zinc-950/50 p-2 rounded-lg border border-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-wider font-bold">NEXT REFILL IN:</span>
                  <span className="text-[10px] font-bold font-mono text-yellow-400">{timeRemaining}</span>
                </div>
                
                <button
                  type="button"
                  onClick={handleRefillTokens}
                  disabled={isResettingTokens}
                  className="w-full mt-1.5 py-1 px-2 border border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500 hover:text-black rounded text-[10px] text-yellow-500 font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isResettingTokens ? 'animate-spin' : ''}`} />
                  RESET COOLDOWN (REFILL)
                </button>
                {tokenStatus.text && (
                  <p className={`text-[9px] mt-1 font-mono leading-tight ${tokenStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {tokenStatus.text}
                  </p>
                )}
              </div>

              {/* Password reset form */}
              <form onSubmit={handleResetPassword} className="space-y-2 border-t border-zinc-900/80 pt-2.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold block text-left">UPDATE PASSWORD</span>
                <div className="space-y-1.5">
                  <input 
                    type="password"
                    placeholder="Current secret key"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-1.5 text-[11px] bg-zinc-950 border border-zinc-850 focus:border-yellow-500/50 rounded text-white focus:outline-none placeholder-zinc-500 font-sans"
                    required
                  />
                  <input 
                    type="password"
                    placeholder="New secret key"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-1.5 text-[11px] bg-zinc-950 border border-zinc-850 focus:border-yellow-500/50 rounded text-white focus:outline-none placeholder-zinc-500 font-sans"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full py-1 text-center bg-zinc-850 hover:bg-zinc-750 hover:text-white border border-zinc-750 text-[10px] font-mono font-bold text-zinc-300 rounded cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Key className="h-3 w-3" />
                  {isResettingPassword ? 'UPDATING...' : 'RESET PASSWORD'}
                </button>
                
                {passwordStatus.text && (
                  <p className={`text-[9px] mt-1 font-mono leading-tight ${passwordStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordStatus.text}
                  </p>
                )}
              </form>

              {/* Plan display detail */}
              <div className="text-[9px] font-mono text-zinc-500 border-t border-zinc-900/80 pt-2 flex items-center justify-between">
                <span>Plan: <strong className="text-zinc-300">{currentUser.planName || 'Free Allocation'}</strong></span>
                <span>Tokens: <strong className="text-yellow-400">{currentUser.tokens?.toFixed(2)}</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="relative flex h-full w-full bg-zinc-950 overflow-hidden shadow-2xl">
      
      {/* LOCKED VISITOR OVERLAY */}
      {!currentUser && (
        <div className="absolute inset-0 z-30 bg-zinc-950/95 flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="mx-auto rounded-2xl bg-yellow-400/5 text-yellow-400 border border-yellow-500/25 p-4 h-16 w-16 flex items-center justify-center animate-pulse">
              <Lock className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight font-sans">Chat Console Encrypted</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                CODING AI requires user registration to synchronize developer credentials and authorize real-time token transactions.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/40 text-left space-y-2.5">
              <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider font-extrabold block">🛡️ Chat Allocations:</span>
              <ul className="text-xs text-zinc-300 font-mono space-y-1.5 list-disc list-inside">
                <li>Automatic daily grant: <strong className="text-white">40 Free tokens</strong></li>
                <li>Instant priority queue channels</li>
                <li>Charge rate: <strong className="text-white">1.30 tokens</strong> per solver query</li>
              </ul>
            </div>

            <button
              onClick={onOpenLoginRegister}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black font-semibold text-xs font-mono tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all duration-300 cursor-pointer shadow-lg shadow-yellow-500/10"
            >
              Sign Up or Authenticate Now
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR PANEL FOR ACTIVE PAGES */}
      {currentUser && sidebarOpen && (
        <div className="hidden md:flex flex-col w-72 border-r border-zinc-900 bg-zinc-950 h-full flex-shrink-0 text-left">
          {/* Sidebar title */}
          <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">ACTIVE CHAT PAGES</span>
            <button
              onClick={handleCreateNewThread}
              className="p-1 px-1.5 rounded-lg border border-yellow-500/20 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
              title="Create new active chat page"
            >
              <Plus className="h-3 w-3" />
              NEW PAGE
            </button>
          </div>

          {/* Active lists */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {threads.map(t => {
              const isActive = t.id === activeThreadId;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-yellow-400/5 text-yellow-400 border-yellow-500/20 font-bold'
                      : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[80%] truncate">
                    <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-yellow-400' : 'text-zinc-500'}`} />
                    <span className="truncate">{t.title}</span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteThread(t.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-zinc-900 hover:bg-red-500/10 hover:text-red-400 rounded transition-opacity cursor-pointer text-zinc-500"
                    title="Delete Chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Render Profile Section */}
          {renderProfileSettingsSection()}

          <div className="p-3 border-t border-zinc-900 bg-zinc-950/40 text-[10px] font-mono text-zinc-600 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
            <span>Pages auto-save to device memory</span>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY SIDEBAR */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/80 md:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 bg-zinc-950 border-r border-zinc-900 h-full flex flex-col text-left"
            >
              <div className="p-4 flex items-center justify-between border-b border-zinc-900">
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">ACTIVE CHAT PAGES</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white block cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <button
                  onClick={handleCreateNewThread}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-yellow-300"
                >
                  <Plus className="h-4 w-4" />
                  CREATE NEW CHAT PAGE
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {threads.map(t => {
                  const isActive = t.id === activeThreadId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveThreadId(t.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer ${
                        isActive
                          ? 'bg-yellow-400/5 text-yellow-400 border-yellow-500/20 font-bold'
                          : 'border-transparent text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate max-w-[80%]">
                        <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-yellow-400' : 'text-zinc-400'}`} />
                        <span className="truncate">{t.title}</span>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteThread(t.id, e)}
                        className="p-1.5 bg-zinc-900 hover:bg-red-500/10 hover:text-red-400 rounded cursor-pointer text-zinc-500"
                        title="Delete page"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Render profile settings section at the bottom of mobile sidebar as well */}
              {renderProfileSettingsSection()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHAT CONTAINER PANEL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Lights */}
        <div className="absolute right-0 top-1/4 h-64 w-32 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-1/4 h-64 w-32 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

        {/* Top Header of Chat Console */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {/* 3-Line Menu button (Hamburguer Toggler) */}
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  // Toggle desktop or mobile sidebar depending on display width
                  if (window.innerWidth < 768) {
                    setMobileSidebarOpen(!mobileSidebarOpen);
                  } else {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className="flex p-1.5 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 rounded-lg border border-zinc-850 cursor-pointer"
                title="Toggle Active Chat Pages (3-Line Menu)"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}

            <div className="text-left">
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                CODING AI Chat Engine <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 px-1.5 py-0.5 rounded uppercase font-normal text-yellow-400">v3.5 Flash</span>
              </h3>
              <p className="text-[11px] text-zinc-450 hidden sm:block">Unlimited questions. Upload blueprints, code, or images.</p>
            </div>
          </div>


        </div>

        {/* Drag & Drop Overlay */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`absolute inset-0 z-30 transition-all duration-300 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl pointer-events-none ${
            isDragging 
              ? 'opacity-100 bg-black/90 scale-100 border-yellow-500' 
              : 'opacity-0 scale-95 border-transparent'
          }`}
        >
          <div className="p-4 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 mb-4 animate-bounce">
            <Paperclip className="h-10 w-10" />
          </div>
          <h4 className="text-lg font-bold text-white">Import File into Chat</h4>
          <p className="text-zinc-400 text-sm mt-1 max-w-xs text-center">Release to attach documents, text files, or images automatically.</p>
        </div>

        {/* Messages area */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar" 
          onDragOver={handleDragOver}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center py-6 text-center max-w-xl mx-auto space-y-6">
              <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-yellow-500 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Unlock Full AI Capabilities</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Connect documents, spreadsheets, or images. CODING AI's Free flash model inspects files and answers developer queries instantly.
                </p>
              </div>

              {/* Suggestions list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {CONVERSATION_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.text)}
                    className="flex items-start text-left gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/45 hover:bg-zinc-900 hover:border-yellow-500/30 hover:shadow-[0_4px_20px_rgba(245,158,11,0.04)] text-xs text-zinc-300 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="mt-0.5 rounded-lg bg-zinc-800 p-1.5 group-hover:bg-yellow-500/10 transition-colors">
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{s.text}</p>
                      <span className="text-[9px] text-zinc-550 uppercase font-mono mt-1 block">Try Request →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {m.role === 'model' && (
                    <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-extrabold text-sm border border-yellow-600 shadow-md flex-shrink-0">
                      V
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Attachement list inside messages */}
                    {m.files && m.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {m.files.map((file, fIdx) => (
                          <div 
                            key={fIdx}
                            className="flex items-center gap-1.5 p-1.5 pr-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                          >
                            {file.type.startsWith('image/') ? (
                              <img src={file.dataUrl} className="h-5 w-5 object-cover rounded border border-zinc-800" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-yellow-500" />
                            )}
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <span className="text-[9px] text-zinc-500">({(file.size / 1024).toFixed(0)} KB)</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div 
                      className={`rounded-2xl px-4 py-3 text-sm shadow-md leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-yellow-500 text-black font-semibold rounded-tr-none' 
                          : 'bg-zinc-900 text-zinc-100 border border-zinc-800/80 rounded-tl-none text-left'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap selection:bg-zinc-900 selection:text-white font-medium">{m.text}</p>
                      ) : (
                        m.isTyping ? (
                          <TypewriterBubble 
                            text={m.text} 
                            onComplete={() => handleTypewriterComplete(m.id)} 
                            formatText={formatText} 
                          />
                        ) : (
                          <div className="markdown-body space-y-2 selection:bg-yellow-500 selection:text-black">
                            {formatText(m.text)}
                          </div>
                        )
                      )}
                    </div>

                    {/* Bottom timestamp and actions */}
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <span className="text-[9px] font-mono text-zinc-500">
                        {m.timestamp}
                      </span>
                      {m.role === 'model' && m.text.includes('```') && (
                        <button
                          onClick={() => downloadProjectAsZip(m.text)}
                          className="flex items-center gap-1.5 text-[9px] font-mono text-yellow-500 border border-yellow-500/20 hover:border-yellow-500/40 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          title="Download all code snippets as a ZIP file"
                        >
                          <Download className="h-3 w-3" />
                          DOWNLOAD .ZIP PROJECT
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {m.role === 'user' && (
                    <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-xs flex-shrink-0 uppercase">
                      ME
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading placeholder */}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-extrabold text-sm border border-yellow-600 shadow-md flex-shrink-0 animate-pulse">
                    V
                  </div>
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3.5 text-xs text-zinc-400 flex items-center gap-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                      <span>CODING AI is formulating response...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error notice panel */}
        {errorNotice && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex-1 text-left">
              <span className="font-bold uppercase tracking-wider block text-[10px] text-red-500 mb-0.5">Execution Failed</span>
              <p>{errorNotice}</p>
              {errorNotice.includes('API Key') && (
                <button 
                  onClick={onOpenAdmin} 
                  className="mt-2 flex items-center gap-1 font-bold font-mono text-yellow-500 hover:text-yellow-400 hover:underline bg-yellow-500/10 px-2.5 py-1 rounded border border-yellow-500/20 transition-all cursor-pointer"
                >
                  PROMPT API KEY CONFIG
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
            <button onClick={() => setErrorNotice(null)} className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Attached file pre-sending display bar */}
        {attachedFiles.length > 0 && (
          <div className="px-6 py-2 border-t border-zinc-900 bg-zinc-900/30 flex flex-wrap gap-2">
            {attachedFiles.map((file, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 px-2 py-1 bg-zinc-950 border border-zinc-c800 rounded-lg text-xs text-zinc-300"
              >
                {file.type.startsWith('image/') ? (
                  <img src={file.dataUrl} className="h-6 w-6 object-cover rounded border border-zinc-800" />
                ) : (
                  <FileText className="h-4 w-4 text-yellow-500" />
                )}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold max-w-[120px] truncate">{file.name}</span>
                  <span className="text-[8px] text-zinc-500 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
                <button 
                  onClick={() => removeAttachedFile(idx)} 
                  className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input section */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/40 backdrop-blur-md z-10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus-within:border-yellow-500/80 rounded-xl transition-all duration-300 p-1.5 pl-3"
          >
            {/* File Input */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleFileSelection(e.target.files)}
              className="hidden"
              multiple
              accept="image/*,application/pdf,text/*,application/json"
            />

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                title="Upload PDF, TXT, or Document"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                title="Upload Image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={attachedFiles.length > 0 ? "Attached files ready. Send or describe instructions..." : "Type a message to custom Free CODING AI model..."}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-zinc-550 focus:outline-none min-w-0"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && attachedFiles.length === 0) || isLoading}
              className={`p-2.5 rounded-lg text-black font-bold transition-all flex items-center justify-center cursor-pointer ${
                (inputText.trim() || attachedFiles.length > 0) && !isLoading
                  ? 'bg-yellow-400 hover:bg-yellow-300 hover:scale-105 shadow-md shadow-yellow-500/10'
                  : 'bg-zinc-900 text-zinc-650 border border-zinc-800'
              }`}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-mono px-1">
            <span>Supports: PDF, TXT, JSON, PNG, JPEG, WEBP files</span>
            <span>Press Enter to Send</span>
          </div>
        </div>

      </div>
    </div>
  );
}
