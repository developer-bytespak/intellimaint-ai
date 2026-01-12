'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';


import { Users, Upload, MessageSquare, CreditCard, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

// Glassmorphism skeleton box
const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`bg-slate-700/20 dark:bg-slate-400/10 border border-slate-600/30 dark:border-slate-400/20 backdrop-blur-sm animate-pulse rounded ${className || ''}`}></div>
);

const DashboardOverview = () => {
  const { dashboardQuery, dashboardYear, setDashboardYear } = useAdmin();
  const { data, isLoading } = dashboardQuery;


  if (isLoading) {
    // Skeleton layout mimicking the dashboard
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <SkeletonBox className="h-4 w-20 mb-2" />
                    <SkeletonBox className="h-8 w-24 mb-1" />
                    <SkeletonBox className="h-3 w-16" />
                  </div>
                  <SkeletonBox className="h-10 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth Chart Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-72 w-full" />
            </CardContent>
          </Card>
          {/* Users by Role Pie Skeleton */}
          <Card>
            <CardHeader>
              <SkeletonBox className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-72 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Trends Skeleton */}
          <Card>
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-72 w-full" />
            </CardContent>
          </Card>
          {/* Session Trends Skeleton */}
          <Card>
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-72 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Upload Status Chart Skeleton */}
        <Card>
          <CardHeader>
            <SkeletonBox className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-4">
                  <SkeletonBox className="h-8 w-8 mx-auto mb-2" />
                  <SkeletonBox className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
            <SkeletonBox className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">No data available</div>;
  }

  const { analytics, userGrowth, uploadTrends, sessionTrends } = data;

  // Extract available years from userGrowth data (works for yearly or monthly data)
  const availableYears = Array.from(
    new Set(
      (userGrowth || []).map((item: { date: string; value: number }) =>
        item.date.length === 4 ? item.date : item.date.slice(0, 4)
      )
    )
  );

  // Add 'All Years' option
  if (!availableYears.includes('all')) availableYears.unshift('all');

  // Filter userGrowth for selected year (if monthly data)
  const filteredUserGrowth =
    dashboardYear && dashboardYear !== 'all' && userGrowth && userGrowth.length > 0 && userGrowth[0].date.length > 4
      ? userGrowth.filter((item: { date: string; value: number }) => item.date.startsWith(dashboardYear))
      : userGrowth;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
  const userRoleData = [
    { name: 'Student', value: analytics.usersByRole.student },
    { name: 'Military', value: analytics.usersByRole.military },
    { name: 'Civilian', value: analytics.usersByRole.civilian },
  ];

  const uploadStatusData = [
    { name: 'Ready', value: analytics.ready },
    { name: 'Processing', value: 12 },
    { name: 'Uploading', value: 1},
    { name: 'Failed', value: 1},
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="   grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers}
          subtitle={`${analytics.activeUsers} active`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          
        />
        <StatCard
          title="Total Uploads"
          value={analytics.totalUploads}
          subtitle={`${analytics.ready} ready`}
          icon={<Upload className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Active Sessions"
          value={analytics.totalSessions}
          subtitle="chat sessions"
          icon={<MessageSquare className="w-6 h-6" />}
          color="green"
        />
        {/* <StatCard
          title="Subscriptions"
          value={analytics.totalSubscriptions}
          subtitle="active subscriptions"
          icon={<CreditCard className="w-6 h-6" />}
          color="orange"
        /> */}
        <StatCard
          title="Growth"
          value={
            analytics.lastMonthUsers && analytics.lastMonthUsers > 0
              ? `${analytics.totalUsers - analytics.lastMonthUsers >= 0 ? '+' : ''}${Math.round(((analytics.totalUsers - analytics.lastMonthUsers) / analytics.lastMonthUsers) * 100)}%`
              : 'N/A'
          }
          subtitle={`last month: ${analytics.lastMonthUsers || 'N/A'}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="pink"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2 bg-black/30 dark:bg-black/40 border border-slate-600/30 dark:border-slate-500/30 backdrop-blur-xl shadow-2xl hover:shadow-2xl transition-all duration-300 hover:bg-black/40">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-white">User Growth</CardTitle>
              {availableYears.length > 1 && (
                <Select value={dashboardYear || 'all'} onValueChange={setDashboardYear}>
                  <SelectTrigger className="w-32 bg-black/40 border-slate-600/30 text-slate-200">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year: string) => (
                      <SelectItem key={year} value={year}>
                        {year === 'all' ? 'All Years' : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredUserGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User by Role Pie Chart */}
        <Card className="bg-black/30 dark:bg-black/50 border border-slate-600/30 dark:border-slate-500/30 backdrop-blur-xl shadow-2xl hover:shadow-2xl transition-all duration-300 hover:bg-black/40">
          <CardHeader>
            <CardTitle className="text-lg text-white">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value, entry) => {
                    const item = userRoleData.find(d => d.name === value);
                    return `${value}: ${item ? item.value : 0}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trends */}
        <Card className="bg-black/30 dark:bg-black/50 border border-slate-600/30 dark:border-slate-500/30 backdrop-blur-xl shadow-2xl hover:shadow-2xl transition-all duration-300 hover:bg-black/40">
          <CardHeader className="flex flex-col gap-2 ">
            <div className="flex items-center justify-between w-full ">
              <CardTitle className="text-white">Upload Trends</CardTitle>
              {availableYears.length > 1 && (
                <Select value={dashboardYear || 'all'} onValueChange={setDashboardYear}>
                  <SelectTrigger className="w-32 bg-black/40 border-slate-600/30 text-slate-200">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year: string) => (
                      <SelectItem key={year} value={year}>
                        {year === 'all' ? 'All Years' : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={uploadTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    // border: 'none',
                    // borderRadius: '8px',
                    // color: '#fff',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6"  isAnimationActive={true}  />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Trends */}
        <Card className="bg-black/30 dark:bg-black/50 border border-slate-600/30 dark:border-slate-500/30 backdrop-blur-xl shadow-2xl hover:shadow-2xl transition-all duration-300 hover:bg-black/40">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-white">Session Trends</CardTitle>
              {availableYears.length > 1 && (
                <Select value={dashboardYear || 'all'} onValueChange={setDashboardYear}>
                  <SelectTrigger className="w-32 bg-black/40 border-slate-600/30 text-slate-200">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year: string) => (
                      <SelectItem key={year} value={year}>
                        {year === 'all' ? 'All Years' : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upload Status Chart */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Upload Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {uploadStatusData.map((item, idx) => (
              <div key={idx} className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {item.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{item.name}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={uploadStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" fill="#f59e0b" isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300',
  };

  const iconGradient = {
    blue: 'from-blue-500/20 to-cyan-500/10',
    purple: 'from-purple-500/20 to-pink-500/10',
    green: 'from-emerald-500/20 to-teal-500/10',
    orange: 'from-orange-500/20 to-red-500/10',
    pink: 'from-pink-500/20 to-rose-500/10',
  };

  const borderColor = {
    blue: 'border-blue-500/30',
    purple: 'border-purple-500/30',
    green: 'border-emerald-500/30',
    orange: 'border-orange-500/30',
    pink: 'border-pink-500/30',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${borderColor[color]} backdrop-blur-xl bg-black/30 dark:bg-black/50 p-6 shadow-2xl transition-all duration-300 hover:shadow-2xl hover:bg-black/40 dark:hover:bg-black/60 hover:border-opacity-50 group`}>
      {/* Glassmorphism gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${iconGradient[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Border glow effect */}
      <div className={`absolute inset-0 rounded-2xl border ${borderColor[color]} opacity-0 group-hover:opacity-100 blur transition-opacity duration-300`}></div>

      <div className="relative z-10 flex items-start justify-between p-2 text-center">
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-slate-300 dark:text-slate-300 uppercase tracking-wide">{title}</p>
          <p className="text-3xl md:text-4xl font-bold text-white dark:text-white mt-3 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-2">{subtitle}</p>
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${iconGradient[color]} border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
          <div className="text-white opacity-80 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
