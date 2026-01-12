# Admin Panel Implementation Guide

## Overview

A comprehensive admin dashboard with user management, upload tracking, session monitoring, subscription management, and analytics. Built with Next.js, TanStack Query, Recharts, and Shadcn/ui components with full mobile responsiveness.

## Project Structure

```
src/
├── hooks/
│   └── useAdmin.tsx                 # Admin context & TanStack Query hook
├── types/
│   └── admin.ts                     # Admin panel TypeScript interfaces
├── data/
│   └── mockAdminData.ts             # Mock/dummy data for testing
├── app/(dashboard)/
│   └── admin/
│       ├── page.tsx                 # Main admin dashboard layout
│       └── tabs/
│           ├── DashboardOverview.tsx    # Overview with charts
│           ├── UsersManagement.tsx      # Users table with filters
│           ├── UploadsRepositories.tsx  # Uploads table
│           ├── SessionsChat.tsx         # Sessions list
│           ├── SubscriptionsTab.tsx     # Subscriptions table
│           └── AnalyticsTab.tsx         # Advanced analytics & export
└── components/ui/
    ├── card.tsx                     # Card components
    ├── button.tsx                   # Button variants
    ├── input.tsx                    # Input field
    ├── badge.tsx                    # Badge component
    ├── tabs.tsx                     # Tabs component (Radix UI)
    └── select.tsx                   # Select dropdown (Radix UI)
```

## Features

### 1. **Dashboard Overview** 📊
- Real-time statistics cards (Total Users, Uploads, Sessions, Subscriptions, Growth%)
- User growth chart (Line graph)
- Upload trends (Bar chart)
- Session trends (Line graph)
- User breakdown by role (Pie chart)
- Upload status distribution

### 2. **Users Management** 👥
- List all users with pagination (10 per page)
- Filters: Role (Student/Military/Civilian), Status (Active/Inactive)
- Search by name or email
- Desktop table view & mobile card view
- Action buttons: Edit, Delete
- Displays: Name, Email, Role, Status, Uploads, Sessions, Subscription Plan

### 3. **Uploads/Repositories** 📁
- List all document uploads with pagination
- Filters: Status (Uploading/Processing/Ready/Failed)
- Search by filename
- Shows: Filename, User, Type, Size, Status, Upload Date, Error messages
- Download/Delete actions for ready files
- Mobile-responsive card layout

### 4. **Sessions & Chat** 💬
- Monitor all chat sessions
- Filters: Status (Active/Ended/Inactive)
- Search by user name
- Displays: Username, Message Count, Status, Started At, Duration
- View session details
- Mobile-responsive design

### 5. **Subscriptions** 💳
- Track all subscription plans
- Filters: Plan (Free/Basic/Pro/Enterprise), Status (Active/Inactive/Cancelled/Expired)
- Shows: Username, Email, Plan, Status, Start/End Dates, Amount
- Days until expiry indicator
- Plan-specific color coding

### 6. **Analytics & Export** 📈
- Multi-series trends (Users, Uploads, Sessions, Subscriptions)
- Export data as JSON or CSV
- User distribution by role (with progress bars)
- Upload status breakdown
- Subscription plan distribution
- Revenue calculations
- Interactive charts with tooltips

## Architecture

### State Management (useAdmin Hook)
```typescript
const useAdmin = () => {
  // TanStack Query for data fetching & caching
  // ContextAPI for pagination state, filters, search
  // Automatic refetch management
}
```

**Features:**
- Pagination state management (page, limit)
- Filter state (role, status, plan, date range)
- Search query state
- TanStack Query for server-side data caching
- Automatic stale-time management (5 minutes)

### Data Flow
1. Admin component calls `useAdmin()` hook
2. Hook provides pagination, filters, search state
3. TanStack Query fetches data based on state
4. Components render with loading/error states
5. Pagination controls update state
6. Filters trigger automatic refetch

### API Integration (Ready for Backend)
Currently using mock data with commented API endpoints:

```typescript
// TODO: Replace with actual API calls
// GET /api/admin/dashboard
// GET /api/admin/users?page=1&limit=10&role=student&status=active
// GET /api/admin/uploads?page=1&limit=10&status=ready
// GET /api/admin/sessions?page=1&limit=10
// GET /api/admin/subscriptions?page=1&limit=10&plan=pro
// POST /api/admin/export (CSV/JSON)
```

## Mobile Responsiveness

✅ **Fully responsive design:**
- **Desktop**: Full table views, side-by-side charts
- **Tablet**: Adjusted layouts, stacked charts
- **Mobile**: Card-based views, single-column layout
- Tabs adjust to grid layout on mobile
- Charts scale responsively with ResponsiveContainer

## Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.7",
    "recharts": "^1.8.5",
    "@radix-ui/react-tabs": "^1.x.x",
    "@radix-ui/react-select": "^2.x.x",
    "lucide-react": "^0.561.0"
  }
}
```

## Usage

### Access Admin Dashboard
```
/dashboard/admin
```

### Navigation
- Click tabs to switch between sections
- Use pagination buttons to navigate pages
- Apply filters using dropdown and search
- Export data in Analytics tab

## Dummy Data

Mock data includes:
- **8 Users** with different roles and statuses
- **8 Uploads** with various statuses and file types
- **6 Sessions** with different durations and states
- **8 Subscriptions** with all plan types
- **15-day trend data** for charts

All mock data is fully commented and ready to be swapped with real API calls.

## API Endpoints to Implement

Backend should provide these endpoints (see `useAdmin.tsx` for query params):

```
GET /api/admin/dashboard              # Get overview stats & trends
GET /api/admin/users                  # List users with filters & pagination
GET /api/admin/uploads                # List uploads with filters & pagination
GET /api/admin/sessions               # List sessions with filters & pagination
GET /api/admin/subscriptions          # List subscriptions with filters & pagination
POST /api/admin/export                # Export data (JSON/CSV)
GET /api/admin/analytics              # Get detailed analytics
```

## Component Composition

### Main Page Structure
```
AdminPage
├── AdminProvider (ContextAPI + TanStack Query)
│   └── Tabs
│       ├── DashboardOverview
│       ├── UsersManagement
│       ├── UploadsRepositories
│       ├── SessionsChat
│       ├── SubscriptionsTab
│       └── AnalyticsTab
```

### Reusable Patterns
- Filter + Search component in each tab
- Pagination controls (prev/next buttons)
- Desktop table + Mobile card views
- Loading spinners during data fetch
- Error handling states

## Future Enhancements

- [ ] Real-time updates via WebSocket
- [ ] Advanced date range filtering
- [ ] Bulk actions (delete, export)
- [ ] User role management UI
- [ ] System alerts & notifications
- [ ] Custom report generation
- [ ] Data visualization exports (PNG/PDF)
- [ ] Admin activity logging

## Styling Notes

- **Tailwind CSS** for all styling
- **Dark mode** support throughout
- **Color scheme**: Slate (primary), Blue, Purple, Green, Orange, Red (accents)
- **Responsive breakpoints**: sm, md, lg
- **Animations**: Smooth transitions, loading spinners

## Performance Optimization

- ✅ TanStack Query caching (5 min stale time)
- ✅ Pagination (10 items per page by default)
- ✅ Lazy loading of chart data
- ✅ Memoized components
- ✅ Server-side data aggregation (ready for backend)

---

**Status**: ✅ Complete with dummy data | Ready for backend API integration
