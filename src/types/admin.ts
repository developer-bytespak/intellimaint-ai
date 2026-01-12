// Admin Types & Interfaces

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'military' | 'civilian';
  profileImage?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  uploads: number;
  sessions: number;
  subscriptionPlan?: string;
}

export interface AdminUpload {
  id: string;
  _id?: string;
  userId: string;
  userName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  uploadedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface AdminSession {
  id: string;
  _id?: string;
  userId?: string;
  email: string;
  totalSessions: number;
  status?: 'active' | 'inactive' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  totalMessages: number;
  totalToken: number;
  totalPrice: number;
  userName?: string;
  messageCount?: number;
}

export interface AdminChat {
  id: string;
  _id?: string;
  userId: string;
  sessionId: string;
  messages: number;
  feedback?: number;
  createdAt: Date;
}

export interface AdminSubscription {
  id: string;
  _id?: string;
  userId: string;
  userName: string;
  email: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  amount?: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  lastMonthUsers: number;
  activeUsers: number;
  totalUploads: number;
  ready:number;
  totalSessions: number;
  totalSubscriptions: number;
  usersByRole: {
    student: number;
    military: number;
    civilian: number;
  };
  uploadsByStatus: {
    uploading: number;
    processing: number;
    ready: number;
    failed: number;
  };
  subscriptionsByPlan: {
    free: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface AdminDashboardData {
  analytics: AdminAnalytics;
  recentUsers: AdminUser[];
  recentUploads: AdminUpload[];
  recentSessions: AdminSession[];
  userGrowth: any[];
  uploadTrends: TimeSeriesData[];
  sessionTrends: TimeSeriesData[];
  subscriptionTrends: TimeSeriesData[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  role?: string;
  status?: string;
  plan?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AdminQueryParams extends PaginationParams {
  filters?: FilterParams;
}
