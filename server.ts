import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));

// Directories
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const STATS_PATH = path.join(DATA_DIR, 'stats.json');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const CHATS_PATH = path.join(DATA_DIR, 'chats.json');

// Default admin details - Hidden on login page input as per request
const ADMIN_EMAIL = 'mail@vxhost.in';
const ADMIN_PASSWORD = 'vxhost@';
const AUTH_TOKEN = 'vxhost_admin_token_2026';

function getChats() {
  try {
    if (fs.existsSync(CHATS_PATH)) {
      return JSON.parse(fs.readFileSync(CHATS_PATH, 'utf-8'));
    }
  } catch (err) {}
  return [];
}

function saveChats(chats: any[]) {
  try {
    fs.writeFileSync(CHATS_PATH, JSON.stringify(chats, null, 2), 'utf-8');
  } catch (err) {}
}

// Read config
function getConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (err) {}
  return { customApiKey: '', customLogoUrl: '' };
}

function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

function getApiKey() {
  const config = getConfig();
  if (config.customApiKey && config.customApiKey.trim().length > 0) {
    return config.customApiKey.trim();
  }
  return process.env.GEMINI_API_KEY || '';
}

function hasCustomApiKey() {
  const config = getConfig();
  return !!(config.customApiKey && config.customApiKey.trim().length > 0);
}

function getCustomLogoUrl() {
  const config = getConfig();
  return config.customLogoUrl || '';
}

function getConfigUpdatedAt() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const stats = fs.statSync(CONFIG_PATH);
      return stats.mtime.toISOString();
    }
  } catch (err) {}
  return new Date().toISOString();
}

// User persistent storage helpers
function getUsers(): any[] {
  try {
    if (fs.existsSync(USERS_PATH)) {
      return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading users:', err);
  }
  return [];
}

function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

// Read/Write analytics stats
function getStats() {
  try {
    if (fs.existsSync(STATS_PATH)) {
      return JSON.parse(fs.readFileSync(STATS_PATH, 'utf-8'));
    }
  } catch (err) {}
  return {
    totalChats: 0,
    totalMessages: 0,
    totalFilesUploaded: 0,
    apiRequestsCount: 0,
    uptimeStart: new Date().toISOString()
  };
}

function saveStats(stats: any) {
  try {
    fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving stats:', err);
  }
}

// Simple security check middlewares
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required.' });
  }
  next();
}

// Get user from token helper
function getUserByToken(token: string) {
  if (token === AUTH_TOKEN) {
    return {
      email: ADMIN_EMAIL,
      username: 'Main Operator',
      planId: 'admin_tier',
      planName: 'Omnipresent Operator',
      tokens: 999999,
      isBanned: false
    };
  }
  if (!token || !token.startsWith('vx_user_session_')) return null;
  const email = Buffer.from(token.replace('vx_user_session_', ''), 'base64').toString('utf-8');
  const users = getUsers();
  return users.find(u => u.email === email) || null;
}

// --- USER MANAGEMENT ROUTES ---

// Registration Route
app.post('/api/register', (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are strictly required.' });
  }

  const users = getUsers();
  const lowerEmail = email.toLowerCase().trim();

  // Check unique constraints
  if (users.some(u => u.email === lowerEmail)) {
    return res.status(400).json({ error: 'Email has already been registered.' });
  }

  // Create new user account with 40.0 tokens automatically as per instructions
  const newUser = {
    email: lowerEmail,
    username: username.trim(),
    password: password, // Simple plain text for local developer sandbox storage
    planId: 'free',
    planName: 'Free Playground',
    tokens: 40.00, // 40 automatic free tokens
    isBanned: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Generate Session Token
  const sessionToken = 'vx_user_session_' + Buffer.from(lowerEmail).toString('base64');

  res.json({
    token: sessionToken,
    user: {
      email: newUser.email,
      username: newUser.username,
      planId: newUser.planId,
      planName: newUser.planName,
      tokens: newUser.tokens,
      isBanned: newUser.isBanned
    }
  });
});

// Single Unified Login Route (Separates Admin vs User logic)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password fields are required.' });
  }

  const lowerEmail = email.toLowerCase().trim();

  // 1. Check if admin
  if (lowerEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({
      token: AUTH_TOKEN,
      email: ADMIN_EMAIL,
      isAdmin: true,
      user: {
        email: ADMIN_EMAIL,
        username: 'Main Operator',
        tokens: 999999,
        planId: 'admin_tier',
        planName: 'Omnipresent Operator',
        isBanned: false
      }
    });
  }

  // 2. Check general users database
  const users = getUsers();
  const user = users.find(u => u.email === lowerEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid authentication credentials.' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'Your account has been locked or banned by network operators.' });
  }

  const sessionToken = 'vx_user_session_' + Buffer.from(lowerEmail).toString('base64');

  res.json({
    token: sessionToken,
    isAdmin: false,
    user: {
      email: user.email,
      username: user.username,
      planId: user.planId,
      planName: user.planName,
      tokens: parseFloat(user.tokens.toFixed(2)),
      isBanned: user.isBanned
    }
  });
});

// Handle Profile Fetching / Syncing
app.get('/api/user/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session token missing.' });
  }

  const token = authHeader.substring(7);
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid session profile.' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'Account banned.' });
  }

  // Find exact user in active database list to fetch persistent attributes
  const dbUsers = getUsers();
  const dbUser = dbUsers.find(u => u.email === user.email);
  const lastTokenRefill = dbUser && dbUser.lastTokenRefill ? dbUser.lastTokenRefill : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  res.json({
    email: user.email,
    username: user.username,
    planId: user.planId,
    planName: user.planName,
    tokens: parseFloat(user.tokens.toFixed(2)),
    isBanned: user.isBanned,
    lastTokenRefill: lastTokenRefill
  });
});

// Update User Password
app.post('/api/user/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session token missing or invalid.' });
  }

  const token = authHeader.substring(7);
  const user = getUserByToken(token);

  if (!user || user.email === ADMIN_EMAIL) {
    return res.status(401).json({ error: 'System administration or invalid session.' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  const users = getUsers();
  const userIdx = users.findIndex(u => u.email === user.email);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'User workspace not found.' });
  }

  if (users[userIdx].password !== currentPassword) {
    return res.status(400).json({ error: 'Original current password is incorrect.' });
  }

  users[userIdx].password = newPassword;
  saveUsers(users);

  res.json({ success: true, message: 'Password updated successfully across clusters.' });
});

// Reset Token Refill and daily cooldown
app.post('/api/user/reset-tokens', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session token missing.' });
  }

  const token = authHeader.substring(7);
  const user = getUserByToken(token);

  if (!user || user.email === ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Unauthorized credentials.' });
  }

  const users = getUsers();
  const userIdx = users.findIndex(u => u.email === user.email);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'User workspace not found.' });
  }

  // Refill tokens by restarting the cooldown interval immediately
  // Grant user 40 tokens as per free daily allocation, or topup if they are lower than 40
  const originalTokens = users[userIdx].tokens || 0;
  if (originalTokens < 40) {
    users[userIdx].tokens = 40.00;
  } else {
    // Already has high tier/purchased tokens, still grant +20 tokens as bonus refill
    users[userIdx].tokens = parseFloat((originalTokens + 20).toFixed(2));
  }
  
  users[userIdx].lastTokenRefill = new Date().toISOString();
  saveUsers(users);

  res.json({ 
    success: true, 
    message: 'Tokens refilled successfully. Cooldown period reset.',
    tokens: users[userIdx].tokens,
    lastTokenRefill: users[userIdx].lastTokenRefill
  });
});

// User Select Plan Route (Assigns correct tokens dynamically)
app.post('/api/user/select-plan', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization header present.' });
  }

  const token = authHeader.substring(7);
  const users = getUsers();
  const selfEmail = getUserByToken(token)?.email;

  if (!selfEmail) {
    return res.status(401).json({ error: 'Invalid profile token.' });
  }

  const { planId, planName, tokenAllowance } = req.body;
  const userIdx = users.findIndex(u => u.email === selfEmail);

  if (userIdx === -1) {
    return res.status(404).json({ error: 'User does not exist.' });
  }

  if (users[userIdx].isBanned) {
    return res.status(403).json({ error: 'Banned users cannot buy modules.' });
  }

  // Update plan details and load proper tokens
  users[userIdx].planId = planId;
  users[userIdx].planName = planName;
  users[userIdx].tokens = (users[userIdx].tokens || 0) + tokenAllowance;

  saveUsers(users);

  res.json({
    success: true,
    user: {
      email: users[userIdx].email,
      username: users[userIdx].username,
      planId: users[userIdx].planId,
      planName: users[userIdx].planName,
      tokens: parseFloat(users[userIdx].tokens.toFixed(2)),
      isBanned: users[userIdx].isBanned
    }
  });
});

// Admin Manage Users route
app.get('/api/admin/history', requireAdmin, (req, res) => {
  res.json({ history: getChats() });
});

app.post('/api/users/manage', requireAdmin, (req, res) => {
  const { action, targetEmail, tokensValue } = req.body;
  const users = getUsers();
  const userIdx = users.findIndex(u => u.email === targetEmail);

  if (userIdx === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (action === 'give_tokens') {
    const val = parseFloat(tokensValue);
    if (isNaN(val)) return res.status(400).json({ error: 'Invalid tokens numeric volume value.' });
    users[userIdx].tokens = (users[userIdx].tokens || 0) + val;
  } 
  else if (action === 'take_tokens') {
    const val = parseFloat(tokensValue);
    if (isNaN(val)) return res.status(400).json({ error: 'Invalid tokens numeric volume value.' });
    users[userIdx].tokens = Math.max(0, (users[userIdx].tokens || 0) - val);
  }
  else if (action === 'change_plan') {
    const { planId, planName } = req.body;
    users[userIdx].planId = planId;
    users[userIdx].planName = planName;
  }
  else if (action === 'ban_user') {
    users[userIdx].isBanned = true;
  } 
  else if (action === 'unban_user') {
    users[userIdx].isBanned = false;
  } 
  else if (action === 'delete_user') {
    users.splice(userIdx, 1);
  } 
  else {
    return res.status(400).json({ error: 'Invalid operator command action.' });
  }

  saveUsers(users);
  res.json({ success: true, usersList: users });
});


// System settings & Logo handling
app.get('/api/config', (req, res) => {
  res.json({
    hasCustomKey: hasCustomApiKey(),
    customLogoUrl: getCustomLogoUrl(),
    updatedAt: getConfigUpdatedAt()
  });
});

app.post('/api/config', requireAdmin, (req, res) => {
  const { customApiKey, customLogoUrl } = req.body;
  try {
    const currentConfig = getConfig();
    const updatedConfig = {
      ...currentConfig,
      customApiKey: customApiKey !== undefined ? customApiKey : currentConfig.customApiKey,
      customLogoUrl: customLogoUrl !== undefined ? customLogoUrl : currentConfig.customLogoUrl,
      updatedAt: new Date().toISOString()
    };
    saveConfig(updatedConfig);
    res.json({ 
      success: true, 
      hasCustomKey: !!(updatedConfig.customApiKey && updatedConfig.customApiKey.trim().length > 0),
      customLogoUrl: updatedConfig.customLogoUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save configuration.' });
  }
});

app.get('/api/stats', requireAdmin, (req, res) => {
  const currentStats = getStats();
  const listFilesUploadedCount = currentStats.totalFilesUploaded || 0;
  
  // Calculate uptime
  const start = new Date(currentStats.uptimeStart || new Date().toISOString());
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const uptimeStr = `${diffHrs}h ${diffMins}m`;

  // Provide raw users database output for admin dashboard mapping
  const users = getUsers().map(u => ({
    email: u.email,
    username: u.username,
    planId: u.planId,
    planName: u.planName,
    tokens: parseFloat(u.tokens.toFixed(2)),
    isBanned: u.isBanned,
    createdAt: u.createdAt || new Date().toISOString()
  }));

  res.json({
    totalChats: currentStats.totalChats,
    totalMessages: currentStats.totalMessages,
    totalFilesUploaded: listFilesUploadedCount,
    apiRequestsCount: currentStats.apiRequestsCount,
    uptime: uptimeStr,
    keyStatus: hasCustomApiKey() ? 'custom_configured' : (process.env.GEMINI_API_KEY ? 'default' : 'missing'),
    usersList: users
  });
});

// Main AI chat proxy endpoint (Supports dynamic token checks & deductions)
app.post('/api/chat', async (req, res) => {
  const { messages, isNewChat } = req.body;
  const authHeader = req.headers.authorization;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required.' });
  }

  // Double Check API Keys
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(400).json({
      error: 'Backend API Key not configured. Inform operator / admin to authorize a main override key.'
    });
  }

  // Look up user profile & assert token budget validation
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please Login or Register to launch chat queries.' });
  }

  const token = authHeader.substring(7);
  const users = getUsers();
  
  let activeUser: any = null;
  let userIdx = -1;

  if (token === AUTH_TOKEN) {
    // Admin override (Omnipresent Operator)
    activeUser = {
      email: ADMIN_EMAIL,
      username: 'Main Operator',
      planId: 'admin_tier',
      planName: 'Omnipresent Operator',
      tokens: 999999,
      isBanned: false
    };
  } else {
    userIdx = users.findIndex(u => {
      const anticipatedToken = 'vx_user_session_' + Buffer.from(u.email).toString('base64');
      return anticipatedToken === token;
    });

    if (userIdx === -1) {
      return res.status(401).json({ error: 'Session profile expired. Register/Login to chat.' });
    }
    activeUser = users[userIdx];
  }

  if (activeUser.isBanned) {
    return res.status(403).json({ error: 'Your account is locked. Banned users cannot query.' });
  }

  // STRICT TOKEN CONSTRAINT: Deduct exactly 1.30 tokens per answer for non-admin accounts
  const COST_PER_CHAT = 1.30;
  if (token !== AUTH_TOKEN) {
    if (activeUser.tokens < COST_PER_CHAT) {
      return res.status(402).json({
        error: `Insufficient balance! You have only ${activeUser.tokens.toFixed(2)} tokens. Each AI query costs exactly ${COST_PER_CHAT} tokens. Select a Creator Premium or Enterprise plan to add more, or request admin support.`
      });
    }

    // Deduct tokens
    users[userIdx].tokens = parseFloat((activeUser.tokens - COST_PER_CHAT).toFixed(4));
    saveUsers(users);
  }

  // Update backend load metrics
  const statsObj = getStats();
  statsObj.totalMessages += 1;
  statsObj.apiRequestsCount += 1;
  if (isNewChat) {
    statsObj.totalChats += 1;
  }
  
  const lastMsg = messages[messages.length - 1];
  if (lastMsg && lastMsg.files && lastMsg.files.length > 0) {
    statsObj.totalFilesUploaded += lastMsg.files.length;
  }
  saveStats(statsObj);

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const contents = messages.map((m: any) => {
      const parts: any[] = [];
      
      if (m.files && m.files.length > 0) {
        m.files.forEach((file: any) => {
          const commaIndex = file.dataUrl.indexOf(',');
          if (commaIndex !== -1) {
            const base64Data = file.dataUrl.substring(commaIndex + 1);
            parts.push({
              inlineData: {
                mimeType: file.type || 'image/png',
                data: base64Data
              }
            });
          }
        });
      }

      parts.push({ text: m.text || '' });

      return {
        role: m.role === 'model' ? 'model' : 'user',
        parts: parts
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: "You are CODING AI. You are a highly specialized AI for Discord bot making, coding, and error fixing. Always provide accurate, robust code for Discord bots (using discord.js or similar libraries) and troubleshoot errors effectively. If the user asks to generate a project, bot, application, or mentions a '.zip' file, ALWAYS break your code into multiple files. Precede every single code block with a markdown header containing EXACTLY the filename, like '### config.json', '### index.js' or '### src/bot.js' (no other text in the header), followed immediately by the markdown code block. This ensures the frontend can parse them into a downloadable ZIP."
      }
    });

    const responseText = response.text || '(No text answer returned from core engine.)';

    // Log chat history
    const allChats = getChats();
    allChats.push({
      email: activeUser.email,
      username: activeUser.username,
      timestamp: new Date().toISOString(),
      userMessage: lastMsg?.text || '(File only)',
      aiResponse: responseText
    });
    // keep only last 500
    if (allChats.length > 500) allChats.shift();
    saveChats(allChats);

    res.json({ 
      text: responseText,
      remainingTokens: token === AUTH_TOKEN ? 999999 : parseFloat(users[userIdx].tokens.toFixed(2))
    });
  } catch (err: any) {
    console.error('Gemini API query crashed:', err);
    // Refund transaction tokens if model failed to respond and user is not admin
    if (token !== AUTH_TOKEN && userIdx !== -1) {
      users[userIdx].tokens = parseFloat((users[userIdx].tokens + COST_PER_CHAT).toFixed(4));
      saveUsers(users);
    }
    res.status(500).json({ error: err.message || 'Internal core exception during generation.' });
  }
});

// Setup Vite & static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
