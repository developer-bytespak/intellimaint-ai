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
import { ChevronLeft, ChevronRight, Search, Eye } from 'lucide-react';
import { AdminSession } from '@/types/admin';

const SessionsChat = () => {
  const {
    sessionsQuery,
    pagination,
    setPagination,
    setFilters,
    filters,
    searchQuery,
    setSearchQuery,
  } = useAdmin();
  const { data, isLoading } = sessionsQuery;
  console.log("Sessions Data in Component:", data);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

  const handleSearch = () => {
    setSearchQuery(localSearch);
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    const newFilters: any = {};
    if (value !== 'all') newFilters.status = value;
    setFilters(newFilters);
    setStatusFilter(value);
    setPagination({ ...pagination, page: 1 });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ended':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by user name..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="default" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No sessions found</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className=" text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Email
                      </th>
                      <th className=" text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Sessions
                      </th>
                      <th className=" text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Messages
                      </th>
                      {/* <th className=" text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        User Token
                      </th>
                      <th className=" text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        System Token
                      </th> */}
                      <th className=" text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Total Tokens
                      </th>
                      <th>
                        Total Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((session: AdminSession) => (
                      <tr
                        key={session.id}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {session.email}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {session.totalSessions}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {session.totalMessages}
                        </td>
                        {/* <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {session.userToken}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {session.systemToken}
                        </td> */}
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {session.totalToken}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          ${session.totalPrice.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {data.data.map((session: AdminSession) => (
                  <div
                    key={session.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {session.email}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {session.totalSessions}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {session.totalMessages}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {session.totalToken}
                        </p>
                      </div>
                        <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          ${session.totalPrice.toFixed(4)}
                        </p>
                        </div>
                    </div>
                      </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Page {pagination.page} of {totalPages} • Total: {data.total} sessions
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

export default SessionsChat;
