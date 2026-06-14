export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isTyping?: boolean;
  files?: Array<{
    name: string;
    type: string;
    size: number;
    dataUrl: string; // Base64 data url for preview and API transfer
  }>;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: string;
  popular?: boolean;
  tokenAllowance: number;
}

export interface InfoCardData {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  category: string;
}

export interface ApiConfig {
  hasCustomKey: boolean;
  customLogoUrl?: string; // If set, replace vector with this image
  updatedAt?: string;
  error?: string;
}

export interface UserAccount {
  email: string;
  username: string;
  planId: string;
  planName: string;
  tokens: number;
  isBanned: boolean;
  createdAt: string;
}

export interface AnalyticsStats {
  totalChats: number;
  totalMessages: number;
  totalFilesUploaded: number;
  apiRequestsCount: number;
  uptime: string;
  keyStatus: 'default' | 'custom_configured' | 'missing';
  usersList?: UserAccount[];
}

