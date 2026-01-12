'use client';

import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

const AnalyticsTab = () => {
  const { dashboardQuery } = useAdmin();
  const { data, isLoading } = dashboardQuery;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">No data available</div>;
  }

  const { userGrowth, uploadTrends, sessionTrends, subscriptionTrends, analytics } = data;

  // Export functions
  const exportAsJSON = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      analytics: data.analytics,
      trends: {
        userGrowth,
        uploadTrends,
        sessionTrends,
        subscriptionTrends,
      },
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(dataBlob, `admin-analytics-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportAsCSV = () => {
    let csvContent =
      'Date,Users,Uploads,Sessions,Subscriptions\n';

    // Combine all trends data
    const maxLength = Math.max(
      userGrowth.length,
      uploadTrends.length,
      sessionTrends.length,
      subscriptionTrends.length
    );

    for (let i = 0; i < maxLength; i++) {
      const user = userGrowth[i]?.value || '-';
      const upload = uploadTrends[i]?.value || '-';
      const session = sessionTrends[i]?.value || '-';
      const subscription = subscriptionTrends[i]?.value || '-';
      const date = userGrowth[i]?.date || `Day ${i + 1}`;

      csvContent += `${date},${user},${upload},${session},${subscription}\n`;
    }

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(dataBlob, `admin-analytics-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={exportAsJSON}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              <FileJson className="w-4 h-4 mr-2" /> Export as JSON
            </Button>
            <Button
              onClick={exportAsCSV}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStat label="Total Users" value={analytics.totalUsers} change="+15%" />
        <SummaryStat label="Total Uploads" value={analytics.totalUploads} change="+22%" />
        <SummaryStat label="Active Sessions" value={analytics.totalSessions} change="+18%" />
        <SummaryStat label="Total Revenue" value={`$${(analytics.totalSubscriptions * 99.99).toFixed(0)}`} change="+25%" />
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorUsers)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-Series Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={uploadTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Session Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
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

      {/* Subscription Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={subscriptionTrends}>
              <defs>
                <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorSubs)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Student</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {analytics.usersByRole.student}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${(analytics.usersByRole.student / analytics.totalUsers) * 100}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Military</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {analytics.usersByRole.military}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{
                  width: `${(analytics.usersByRole.military / analytics.totalUsers) * 100}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Civilian</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {analytics.usersByRole.civilian}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(analytics.usersByRole.civilian / analytics.totalUsers) * 100}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploads Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Ready</span>
              <span className="font-bold text-green-600">{analytics.uploadsByStatus.ready}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(analytics.uploadsByStatus.ready / analytics.totalUploads) * 100}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Processing</span>
              <span className="font-bold text-blue-600">
                {analytics.uploadsByStatus.processing}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${(analytics.uploadsByStatus.processing / analytics.totalUploads) * 100}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Failed</span>
              <span className="font-bold text-red-600">{analytics.uploadsByStatus.failed}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${(analytics.uploadsByStatus.failed / analytics.totalUploads) * 100}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Free</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {analytics.subscriptionsByPlan.free}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Basic</span>
              <span className="font-bold text-blue-600">{analytics.subscriptionsByPlan.basic}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Pro</span>
              <span className="font-bold text-purple-600">{analytics.subscriptionsByPlan.pro}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Enterprise</span>
              <span className="font-bold text-yellow-600">
                {analytics.subscriptionsByPlan.enterprise}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface SummaryStatProps {
  label: string;
  value: string | number;
  change: string;
}

const SummaryStat: React.FC<SummaryStatProps> = ({ label, value, change }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{change}</p>
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsTab;
