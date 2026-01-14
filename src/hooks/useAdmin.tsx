'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import {
  AdminUser,
  AdminUpload,
  AdminSession,
  AdminSubscription,
  AdminDashboardData,
  AdminQueryParams,
  PaginationParams,
  FilterParams,
} from '@/types/admin';
import {
  mockUsers,
  mockUploads,
  mockSessions,
  mockSubscriptions,
  getMockDashboardData,
} from '@/data/mockAdminData';
import axios from 'axios';
import baseURL from '@/lib/api/axios';


// Admin Context Types
export interface AdminContextType {
  // Pagination state
  pagination: PaginationParams;
  setPagination: (params: PaginationParams) => void;

  // Filter state
  filters: FilterParams;
  setFilters: (filters: FilterParams) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Year filter for dashboard
  dashboardYear: string | null;
  setDashboardYear: (year: string | null) => void;

  // Query states
  dashboardQuery: UseQueryResult<AdminDashboardData, Error>;
  usersQuery: UseQueryResult<{ data: AdminUser[]; total: number }, Error>;
  uploadsQuery: UseQueryResult<{ data: AdminUpload[]; total: number }, Error>;
  sessionsQuery: UseQueryResult<{ data: AdminSession[]; total: number }, Error>;
  subscriptionsQuery: UseQueryResult<{ data: AdminSubscription[]; total: number }, Error>;
  trendsQuery: UseQueryResult<any, Error>;

  // Refetch functions
  refetchAll: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// API Service Layer (Mock for now, replace with actual API calls later)
const adminApi = {
  // API endpoints will be: /api/admin/users, /api/admin/uploads, /api/admin/analytics, etc.

  fetchDashboard: async (year?: string | null): Promise<AdminDashboardData> => {
    // TODO: Replace with actual API call
    // const response = await baseURL.get('/api/admin/dashboard');
    let url = '/admin/dashboard';
    if (year && year !== 'all') {
      url += `?year=${year}`;
    }
    const res = await baseURL.get(url);
    console.log("Fetched Dashboard Data:", res.data)
    return res?.data?.data || getMockDashboardData();
  },

  fetchTrends: async (year?: string | null): Promise<any> => {
    let url = '/admin/dashboard/trends';
    if (year && year !== 'all') {
      url += `?year=${year}`;
    }
    const res = await baseURL.get(url);
    console.log("Fetched Trends Data:", res.data)
    return res?.data?.data || {};
  },

  fetchUsers: async (params: AdminQueryParams): Promise<{ data: AdminUser[]; total: number }> => {
    // TODO: Replace with actual API call
    // const response = await axios.get('/api/admin/users', { params });

    const res = await baseURL.get('/admin/users')
    // console.log("Fetched Users:", res.data)
    
    // Mock implementation with filtering and pagination
    let filtered = Array.isArray(res?.data) ? res.data : res?.data?.data || res?.data?.users || [];
    // console.log("Initial Users:", filtered)
    // console.log("Filtered length:", filtered.length)

    
    // Apply search filter
    if (params.search && params.search.trim() !== '') {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (u: AdminUser) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (params.filters?.role) {
      filtered = filtered.filter((u: AdminUser) => u.role === params.filters?.role);

    }
    
    // Apply status filter
    if (params.filters?.status) {
      filtered = filtered.filter((u: AdminUser) => u.status === params.filters?.status);
    }
    
    // Apply sorting
    if (params.sortBy) {
      filtered.sort((a: AdminUser, b: AdminUser) => {
        const aVal = a[params.sortBy as keyof AdminUser];
        const bVal = b[params.sortBy as keyof AdminUser];
        const order = params.sortOrder === 'desc' ? -1 : 1;
        if (aVal == null || bVal == null) return 0;
        return aVal > bVal ? order : -order;
      });
    }
    
    const total = filtered.length;
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);
    console.log("Filtered Users:", data)
    
    return { data, total };
  },

  fetchUploads: async (params: AdminQueryParams): Promise<{ data: AdminUpload[]; total: number }> => {
    // TODO: Replace with actual API call
    // const response = await axios.get('/api/admin/uploads', { params });

    const res = await baseURL.get('/admin/uploads')
    console.log("Fetched Uploads:", res.data)
    
    let filtered = res?.data?.data || (Array.isArray(res?.data) ? res.data : res?.data?.uploads) || [];
    
    if (params.search && params.search.trim() !== '') {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter((u: AdminUpload) =>
        u.fileName.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.filters?.status) {
      filtered = filtered.filter((u: AdminUpload) => u.status === params.filters?.status);
    }
    
    const total = filtered.length;
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);
    
    return { data, total };
  },

  fetchSessions: async (params: AdminQueryParams): Promise<{ data: AdminSession[]; total: number }> => {
    // TODO: Replace with actual API call
    // const response = await axios.get('/api/admin/sessions', { params });
    const res = await baseURL.get('/admin/sessions')
    console.log("Fetched Sessions:", res.data)
    let filtered = res?.data?.data || [];
    
    if (params.search && params.search.trim() !== '') {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter((s: AdminSession) =>
        s.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.filters?.status) {
      filtered = filtered.filter((s: AdminSession) => s.status === params.filters?.status);
    }
    
    const total = filtered.length;
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);
    
    return { data, total };
  },

  fetchSubscriptions: async (
    params: AdminQueryParams
  ): Promise<{ data: AdminSubscription[]; total: number }> => {
    // TODO: Replace with actual API call
    // const response = await axios.get('/api/admin/subscriptions', { params });
    
    let filtered = mockSubscriptions;
    
    if (params.search && params.search.trim() !== '') {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (s: AdminSubscription) =>
          s.userName.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.filters?.plan) {
      filtered = filtered.filter((s: AdminSubscription) => s.plan === params.filters?.plan);
    }

    if (params.filters?.status) {
      filtered = filtered.filter((s: AdminSubscription) => s.status === params.filters?.status);
    }
    
    const total = filtered.length;
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);
    
    return { data, total };
  },
};

// Provider Component
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<FilterParams>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardYear, setDashboardYear] = useState<string | null>('all');

  // Dashboard Query (Stats only, not year-dependent)
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.fetchDashboard(),
    staleTime: 30 * 60 * 1000, // 30 minutes - long cache since stats don't change often
    gcTime: 60 * 60 * 1000, // 60 minutes
  });

  const trendsQuery = useQuery({
    queryKey: ['admin-dashboard-trends', dashboardYear],
    queryFn: () => adminApi.fetchTrends(dashboardYear),
    staleTime: 5 * 60 * 1000, // 5 mins cache
  });

  // Users Query
  const usersQuery = useQuery({
    queryKey: ['admin-users', pagination, filters, searchQuery],
    queryFn: () =>
      adminApi.fetchUsers({
        ...pagination,
        search: searchQuery,
        filters,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Uploads Query
  const uploadsQuery = useQuery({
    queryKey: ['admin-uploads', pagination, filters, searchQuery],
    queryFn: () =>
      adminApi.fetchUploads({
        ...pagination,
        search: searchQuery,
        filters,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Sessions Query
  const sessionsQuery = useQuery({
    queryKey: ['admin-sessions', pagination, filters, searchQuery],
    queryFn: () =>
      adminApi.fetchSessions({
        ...pagination,
        search: searchQuery,
        filters,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Subscriptions Query
  const subscriptionsQuery = useQuery({
    queryKey: ['admin-subscriptions', pagination, filters, searchQuery],
    queryFn: () =>
      adminApi.fetchSubscriptions({
        ...pagination,
        search: searchQuery,
        filters,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Refetch all queries
  const refetchAll = useCallback(() => {
    dashboardQuery.refetch();
    usersQuery.refetch();
    uploadsQuery.refetch();
    sessionsQuery.refetch();
    subscriptionsQuery.refetch();
    trendsQuery.refetch();
  }, [dashboardQuery, usersQuery, uploadsQuery, sessionsQuery, subscriptionsQuery, trendsQuery]);

  const value: AdminContextType = {
    pagination,
    setPagination,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    dashboardYear,
    setDashboardYear,
    dashboardQuery,
    usersQuery,
    uploadsQuery,
    sessionsQuery,
    subscriptionsQuery,
    trendsQuery,
    refetchAll,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

// Hook to use Admin Context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
