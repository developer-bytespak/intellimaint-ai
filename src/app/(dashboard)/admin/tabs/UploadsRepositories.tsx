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
import { ChevronLeft, ChevronRight, Search, Download, Trash2 } from 'lucide-react';
import { AdminUpload } from '@/types/admin';

const UploadsRepositories = () => {
  const {
    uploadsQuery,
    pagination,
    setPagination,
    setFilters,
    filters,
    searchQuery,
    setSearchQuery,
  } = useAdmin();
  const { data, isLoading } = uploadsQuery;

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'uploading':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
                placeholder="Search by file name..."
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
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Uploads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Uploads & Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No uploads found</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        File Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Size
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Date
                      </th>
                      {/* <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        Actions
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((upload: AdminUpload) => (
                      <tr
                        key={upload.id}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {upload.fileName}
                          </p>
                          {upload.error && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {upload.error}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {upload.userName}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{upload.fileType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {formatFileSize(upload.fileSize)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(upload.status)}>
                            {upload.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                        </td>
                        {/* <td className="py-3 px-4 text-sm">
                          {upload.status === 'ready' && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {data.data.map((upload: AdminUpload) => (
                  <div
                    key={upload.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="mb-3">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {upload.fileName}
                      </p>
                      {upload.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {upload.error}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <p className="text-slate-500 mb-1">User</p>
                        <p className="text-slate-900 dark:text-white">{upload.userName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Type</p>
                        <Badge variant="outline">{upload.fileType}</Badge>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Size</p>
                        <p className="text-slate-900 dark:text-white">
                          {formatFileSize(upload.fileSize)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Status</p>
                        <Badge className={getStatusColor(upload.status)}>
                          {upload.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Page {pagination.page} of {totalPages} • Total: {data.total} uploads
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

export default UploadsRepositories;
