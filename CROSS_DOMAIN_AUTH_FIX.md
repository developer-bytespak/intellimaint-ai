# Cross-Domain Authentication Fix

## The Problem ❌

Your frontend (`intellimaint-ai.vercel.app`) and backend (`intellimaint-ai-backend.onrender.com`) are on **different domains**.

When you tried to use **HttpOnly cookies for authentication**, browsers (especially Safari) blocked them because they're "third-party" cookies.

### What Happened
1. ✅ Login to backend worked - got tokens in response
2. ✅ Cookies were set on backend domain (`intellimaint-ai-backend.onrender.com`)
3. ❌ But these cookies couldn't be read by frontend middleware on `intellimaint-ai.vercel.app`
4. ❌ Middleware redirected to `/login` because it couldn't see any auth cookies
5. ❌ Redirect loop!

## The Solution ✅

**Use `localStorage` + Authorization header instead of cross-domain cookies**

### What Changed

#### 1. **Disabled Server Middleware** ✅
- File: [src/middleware.ts](src/middleware.ts)
- Problem: Server middleware can't see cookies from different domains
- Solution: Disabled server-side route protection, moved to client-side

#### 2. **Updated Axios Configuration** ✅
- File: [src/lib/api/axios.ts](src/lib/api/axios.ts)
- Now sends `Authorization: Bearer <token>` header with every request
- Token comes from `localStorage.getItem('accessToken')`
- Works on both login and protected routes

#### 3. **Enhanced useUser Hook** ✅
- File: [src/hooks/useUser.tsx](src/hooks/useUser.tsx)
- Only fetches user profile if:
  - Component is mounted (pathname exists)
  - Not on public route
  - **Access token exists in localStorage** (user has logged in)

## How Authentication Works Now

### Login Flow
```
1. User fills login form
2. Frontend sends POST to `/auth/login` (no auth header needed)
3. Backend returns:
   {
     "data": {
       "accessToken": "eyJhbGciOi...",
       "refreshToken": "eyJhbGciOi...",
       "expiresIn": 3600
     }
   }
4. Frontend stores tokens:
   localStorage.setItem('accessToken', token)
   localStorage.setItem('refreshToken', token)
5. Frontend navigates to /chat
   → Dashboard layout uses useUser() to fetch user profile
   → Axios interceptor adds: Authorization: Bearer <token>
   → Backend validates token in Authorization header (not cookies!)
   → Returns user profile
   → Component loads ✅
```

### Protected Route Flow
```
1. User tries to access /chat
2. DashboardLayout checks if user is authenticated
3. useUser() hook fetches user profile
4. Axios adds Authorization header automatically
5. Backend receives Authorization: Bearer <token>
6. Backend validates token ✅
7. Route loads ✅
```

## Key Files Modified

| File | Change | Reason |
|------|--------|--------|
| [src/middleware.ts](src/middleware.ts) | Disabled all middleware | Server can't read cross-domain cookies |
| [src/lib/api/axios.ts](src/lib/api/axios.ts) | Send Authorization header | Client-side auth using localStorage |
| [src/hooks/useUser.tsx](src/hooks/useUser.tsx) | Check localStorage before fetching | Ensure token exists before API call |

## Deployment Checklist

- [x] Disabled server middleware
- [x] Updated axios to send Authorization header
- [x] Enhanced useUser hook to check localStorage
- [ ] Deploy to Vercel
- [ ] Test login flow
- [ ] Test protected routes
- [ ] Clear browser localStorage and cookies, test again
- [ ] Test on Safari iOS (should work now)

## Testing

### Local Testing
```bash
cd <frontend-repo>
npm run dev
# Navigate to login
# Login with valid credentials
# Should redirect to /chat ✅
# Check Network tab:
#  - Authorization: Bearer <token> header should be present
```

### Production Testing
```
1. Go to https://intellimaint-ai.vercel.app
2. Login with valid credentials
3. Should redirect to /chat (no more 307 redirect to /login)
4. Check DevTools Network tab:
   - POST /auth/login → 200 OK
   - GET /user/profile → 200 OK
   - Request headers should include: Authorization: Bearer <token>
```

### Safari iOS Testing
```
1. On iPhone with Safari:
   - Settings → Safari → Unblock "Prevent Cross-Site Tracking"
2. Go to https://intellimaint-ai.vercel.app
3. Login should work ✅
4. Should stay on /chat page ✅
```

## Why This Works

✅ **localStorage** is accessible from any page on your domain  
✅ **Authorization header** is sent with every request to any domain (CORS handles it)  
✅ **Backend validates** tokens from Authorization header, doesn't care where cookies come from  
✅ **Works cross-domain** without third-party cookie restrictions  
✅ **Works in Safari** because we're not relying on cookies at all  

## Common Issues & Fixes

### Issue: Still getting redirected to /login

**Check 1**: Does localStorage have accessToken?
```javascript
// Open browser DevTools console on /chat
localStorage.getItem('accessToken') // Should return token, not null
```

**Check 2**: Is Authorization header being sent?
```
DevTools → Network tab → Find request to /user/profile
Look for header: Authorization: Bearer eyJhbGc...
```

**Check 3**: Backend returning 401?
```
DevTools → Network tab → Response from /user/profile
Should be 200 OK with user data, not 401 Unauthorized
```

### Fix: Clear localStorage and login again
```javascript
// In browser console
localStorage.clear()
// Then login again
```

## Backend Integration

Your backend already supports this! It just needs to:

1. ✅ Return tokens in response body after login
```typescript
res.json({
  data: {
    accessToken: token,
    refreshToken: refreshToken,
    expiresIn: 3600
  }
});
```

2. ✅ Accept Bearer tokens in Authorization header
```typescript
// Your JWT guard should check:
const token = req.headers.authorization?.replace('Bearer ', '');
```

## Future Improvements

If you want to move back to cookies in the future:

1. **Use same domain**: Deploy backend to `api.intellimaint-ai.vercel.app` (subdomain of frontend)
2. **Then re-enable server middleware** for route protection
3. **Cookies will work** because they're first-party, not third-party

For now, **localStorage + Authorization header is the best solution** for your multi-domain setup.
