# Admin Panel - Quick Start

## ✅ What's Implemented

### 1. **Core Files Created**
- ✅ `src/hooks/useAdmin.tsx` - Context + TanStack Query management
- ✅ `src/types/admin.ts` - TypeScript interfaces
- ✅ `src/data/mockAdminData.ts` - Dummy data (8 users, 8 uploads, 6 sessions, 8 subscriptions)
- ✅ `src/app/(dashboard)/admin/page.tsx` - Main dashboard layout with 6 tabs
- ✅ `src/app/(dashboard)/admin/tabs/*.tsx` - 6 tab components

### 2. **Features Completed**
- ✅ Dashboard overview with 5 stat cards
- ✅ User growth, upload trends, session trends charts
- ✅ Users management table with filtering & pagination
- ✅ Uploads table with status filtering
- ✅ Sessions monitoring with duration tracking
- ✅ Subscriptions tracking with expiry dates
- ✅ Advanced analytics with JSON/CSV export
- ✅ Mobile responsive design (cards on small screens)
- ✅ Dark mode support
- ✅ Search & filter functionality
- ✅ Pagination (10 items per page)

### 3. **Libraries Installed**
- ✅ Recharts (charts and graphs)
- ✅ @radix-ui/react-tabs (tab component)
- ✅ @radix-ui/react-select (select dropdown)
- ✅ TanStack Query (already installed)

### 4. **UI Components Updated**
- ✅ Card component (Card, CardHeader, CardTitle, CardContent)
- ✅ Button component (multiple variants)
- ✅ Input component
- ✅ Badge component (multiple variants)
- ✅ Tabs component (Radix UI)
- ✅ Select component (Radix UI)

---

## 🚀 How to Use

### Access the Admin Dashboard
```bash
# After running the dev server
# Navigate to: http://localhost:3001/dashboard/admin
```

### Tabs Available
1. **Dashboard** - Overview with statistics and charts
2. **Users** - Manage all users with filters
3. **Uploads** - Track file uploads
4. **Sessions** - Monitor chat sessions
5. **Subscriptions** - View subscription data
6. **Analytics** - Advanced analytics with export

### Features by Tab

#### 📊 Dashboard Overview
- Summary cards: Total Users, Uploads, Sessions, Subscriptions, Growth%
- Line chart: User growth over time
- Bar chart: Upload trends
- Line chart: Session trends
- Pie chart: Users by role
- Status distribution cards

#### 👥 Users Management
- **Filters**: Role (Student/Military/Civilian), Status (Active/Inactive)
- **Search**: By name or email
- **Pagination**: 10 users per page
- **Actions**: Edit, Delete buttons
- **Mobile**: Card-based view

#### 📁 Uploads/Repositories
- **Filters**: Status (Uploading/Processing/Ready/Failed)
- **Search**: By filename
- **Info**: File size formatting, upload date, error messages
- **Actions**: Download, Delete (for ready files)

#### 💬 Sessions & Chat
- **Filters**: Status (Active/Ended/Inactive)
- **Search**: By user name
- **Display**: Message count, duration formatting
- **Action**: View session details

#### 💳 Subscriptions
- **Filters**: Plan type, Status
- **Search**: By username or email
- **Info**: Days until expiry, color-coded plans
- **Display**: Revenue amounts

#### 📈 Analytics & Export
- **Export**: JSON or CSV format
- **Charts**: All trend data in interactive charts
- **Breakdown**: Users by role, uploads by status, subscriptions by plan
- **Progress bars**: Visual distribution indicators

---

## 🔄 Current Data (Mock/Dummy)

The dashboard uses mock data that mimics real backend responses:

```typescript
// Example mock structure
{
  totalUsers: 88,
  activeUsers: 72,
  totalUploads: 56,
  totalSessions: 168,
  usersByRole: { student: 32, military: 28, civilian: 28 },
  uploadsByStatus: { uploading: 1, processing: 1, ready: 52, failed: 2 },
  subscriptionsByPlan: { free: 8, basic: 10, pro: 15, enterprise: 5 }
}
```

---

## 🔗 Backend Integration (Next Steps)

### Update API Endpoints
In `src/hooks/useAdmin.tsx`, replace mock data with real API calls:

```typescript
// Replace this:
const adminApi = {
  fetchDashboard: async () => {
    return getMockDashboardData();
  },
  
  // With this:
  fetchDashboard: async () => {
    const response = await axios.get('/api/admin/dashboard');
    return response.data;
  }
}
```

### Required API Endpoints
Backend should provide:
- `GET /api/admin/dashboard` - Overview stats & trends
- `GET /api/admin/users?page=X&limit=10` - Users list
- `GET /api/admin/uploads?page=X&limit=10` - Uploads list
- `GET /api/admin/sessions?page=X&limit=10` - Sessions list
- `GET /api/admin/subscriptions?page=X&limit=10` - Subscriptions list
- `POST /api/admin/export` - Export data (JSON/CSV)

### Response Format Expected
```typescript
// For paginated endpoints
{
  data: Array<T>,
  total: number
}

// For dashboard
{
  analytics: {...},
  recentUsers: [...],
  recentUploads: [...],
  userGrowth: [...],
  uploadTrends: [...]
}
```

---

## 📱 Mobile Responsive Features

✅ Works on all screen sizes:
- **Desktop** (1024px+): Full tables, side-by-side charts
- **Tablet** (768px-1023px): Adjusted layouts
- **Mobile** (<768px): Card-based views, stacked content

Specific responsive behaviors:
- Tabs go to 2 columns on mobile (Dashboard, Users, Uploads, Sessions)
- Tables convert to cards on mobile with all info
- Charts stack vertically
- Filters adjust to single column

---

## 🎨 Styling & Theming

- **Framework**: Tailwind CSS v4
- **Components**: Shadcn/ui (headless)
- **Dark Mode**: Supported throughout
- **Colors**: Slate (primary), Blue, Purple, Green, Orange, Red
- **Icons**: Lucide React

---

## ⚙️ Configuration

### Pagination
Change items per page in `useAdmin` hook:
```typescript
const [pagination, setPagination] = useState<PaginationParams>({
  page: 1,
  limit: 10,  // Change this number
});
```

### Stale Time
Change data cache duration:
```typescript
staleTime: 5 * 60 * 1000,  // 5 minutes
gcTime: 10 * 60 * 1000,    // 10 minutes
```

---

## 🐛 Troubleshooting

**Charts not showing?**
- Check if Recharts is installed: `npm list recharts`
- Ensure ResponsiveContainer has parent with defined height

**Filters not working?**
- Check console for errors
- Verify mock data filter logic in `useAdmin.tsx`

**Mobile layout broken?**
- Clear browser cache
- Check Tailwind breakpoint settings

---

## 📝 Notes

- All components are fully typed with TypeScript
- Mock data matches expected API response format
- Ready for seamless backend integration
- No breaking changes when switching to real APIs
- All loading/error states handled
- Pagination works client-side with mock data, will work server-side with API

---

**Status**: ✅ Implementation Complete | 🚀 Ready to Use | 🔗 Awaiting Backend Integration
