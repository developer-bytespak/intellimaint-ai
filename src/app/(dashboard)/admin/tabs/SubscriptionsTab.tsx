'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { AdminSubscription } from '@/types/admin';

const SubscriptionsTab = () => {
  const {
    subscriptionsQuery,
    pagination,
    setPagination,
    setFilters,
    filters,
    searchQuery,
    setSearchQuery,
  } = useAdmin();
  const { data, isLoading } = subscriptionsQuery;

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [planFilter, setPlanFilter] = useState(filters.plan || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

  const handleSearch = () => {
    setSearchQuery(localSearch);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePlanChange = (value: string) => {
    const newFilters: any = {};
    if (value !== 'all') newFilters.plan = value;
    if (statusFilter !== 'all') newFilters.status = statusFilter;
    setFilters(newFilters);
    setPlanFilter(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    const newFilters: any = {};
    if (planFilter !== 'all') newFilters.plan = planFilter;
    if (value !== 'all') newFilters.status = value;
    setFilters(newFilters);
    setStatusFilter(value);
    setPagination({ ...pagination, page: 1 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'expired':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
      case 'basic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'enterprise':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
    }
  };

  const daysUntilExpiry = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPages = data ? Math.ceil(data.total / pagination.limit) : 1;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or email..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="default" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <Select value={planFilter} onValueChange={handlePlanChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No subscriptions found</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        User Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Plan
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Start Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        End Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((sub: AdminSubscription) => {
                      const daysLeft = daysUntilExpiry(sub.endDate);
                      return (
                        <tr
                          key={sub.id}
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {sub.userName}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                            {sub.email}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getPlanColor(sub.plan)}>
                              {sub.plan}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(sub.status)}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(sub.startDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date(sub.endDate).toLocaleDateString()}
                              </p>
                              {daysLeft > 0 && sub.status === 'active' && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  {daysLeft} days left
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                            ${sub.amount?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {data.data.map((sub: AdminSubscription) => {
                  const daysLeft = daysUntilExpiry(sub.endDate);
                  return (
                    <div
                      key={sub.id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {sub.userName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{sub.email}</p>
                        </div>
                        <Badge className={getStatusColor(sub.status)}>
                          {sub.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <p className="text-slate-500 mb-1">Plan</p>
                          <Badge className={getPlanColor(sub.plan)}>
                            {sub.plan}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Amount</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            ${sub.amount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Start Date</p>
                          <p className="text-slate-900 dark:text-white">
                            {new Date(sub.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">End Date</p>
                          <p className="text-slate-900 dark:text-white">
                            {new Date(sub.endDate).toLocaleDateString()}
                          </p>
                          {daysLeft > 0 && sub.status === 'active' && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              {daysLeft} days left
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Page {pagination.page} of {totalPages} • Total: {data.total} subscriptions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: Math.max(1, pagination.page - 1),
                      })
                    }
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: Math.min(totalPages, pagination.page + 1),
                      })
                    }
                    disabled={pagination.page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsTab;
