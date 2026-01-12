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
import { AdminUser } from '@/types/admin';

const UsersManagement = () => {
  const { usersQuery, pagination, setPagination, setFilters, filters, searchQuery, setSearchQuery } =
    useAdmin();
  const { data, isLoading } = usersQuery;

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
//   console.log("Users Data in Component:", data);

  const handleSearch = () => {
    setSearchQuery(localSearch);
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = () => {
    const newFilters: any = {};
    if (roleFilter !== 'all') newFilters.role = roleFilter;
    if (statusFilter !== 'all') newFilters.status = statusFilter;
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [roleFilter, statusFilter]);

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

            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="military">Military</SelectItem>
                <SelectItem value="civilian">Civilian</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No users found</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Uploads
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Sessions
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Plan
                      </th>
                      {/* <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Actions
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((user: AdminUser) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg'}
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.uploads}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.sessions}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {user.subscriptionPlan || 'None'}
                          </Badge>
                        </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {data.data.map((user: AdminUser) => (
                  <div
                    key={user.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={user.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <p className="text-slate-500 mb-1">Role</p>
                        <Badge variant="outline" className="capitalize w-fit">
                          {user.role}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Status</p>
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize w-fit"
                        >
                          {user.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-500">Uploads: {user.uploads}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Sessions: {user.sessions}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 text-red-600">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Page {pagination.page} of {totalPages} • Total: {data.total} users
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

export default UsersManagement;
