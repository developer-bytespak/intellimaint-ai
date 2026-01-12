'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminProvider } from '@/hooks/useAdmin';
import { useUser } from '@/hooks/useUser';
import DashboardOverview from './tabs/DashboardOverview';
import UsersManagement from './tabs/UsersManagement';
import UploadsRepositories from './tabs/UploadsRepositories';
import SessionsChat from './tabs/SessionsChat';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import AnalyticsTab from './tabs/AnalyticsTab';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Check if user is admin
  useEffect(() => {
    if (!isLoading) {
      // If user is not admin, redirect to login
      if (!user || user?.role !== 'admin') {
        console.log('[AdminPage] User is not admin or not authenticated, redirecting to login');
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render if user is not admin (will redirect)
  if (!user || user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage users, uploads, sessions, and view analytics
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6 p-1 bg-slate-100 dark:bg-slate-700">
                <TabsTrigger value="overview" className="text-xs md:text-sm">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs md:text-sm">
                  Users
                </TabsTrigger>
                <TabsTrigger value="uploads" className="text-xs md:text-sm">
                  Uploads
                </TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs md:text-sm">
                  Sessions
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <TabsContent value="overview" className="space-y-6">
                <DashboardOverview />
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <UsersManagement />
              </TabsContent>

              <TabsContent value="uploads" className="space-y-6">
                <UploadsRepositories />
              </TabsContent>

              <TabsContent value="sessions" className="space-y-6">
                <SessionsChat />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminProvider>
  );
};

export default AdminPage;