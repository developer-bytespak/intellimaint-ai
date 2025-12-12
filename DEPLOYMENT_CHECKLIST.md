# Deployment Checklist for Intellimaint AI

## Issue: Login Redirect Loop on Production

### Root Cause
When deployed to production (Render + Vercel), users can log in successfully but are immediately redirected back to login. This happens because:
1. Backend (Render) sets HTTP-only cookies with `sameSite: 'none'`
2. Browser may not be sending these cookies back with API requests
3. API requests fail with 401
4. Axios interceptor triggers token refresh
5. Refresh also fails (no cookies)
6. User is redirected to login

### Required Environment Variables

#### Backend (Render)
Ensure these are set in your Render dashboard:

1. **`NODE_ENV`** = `production`
2. **`FRONTEND_URL`** = `https://your-app.vercel.app` (NO trailing slash!)
3. **`JWT_SECRET`** = (your secret)
4. **`REFRESH_SECRET`** = (your secret)
5. **`DATABASE_URL`** = (your database connection)
6. **`GOOGLE_CLIENT_ID`** = (if using Google OAuth)
7. **`GOOGLE_CLIENT_SECRET`** = (if using Google OAuth)
8. **`REDIS_URL`** = (your Redis connection)

#### Frontend (Vercel)
Ensure these are set in your Vercel project settings > Environment Variables:

1. **`NEXT_PUBLIC_NEST_URL`** = `https://intellimaint-ai-backend.onrender.com`
   - ⚠️ **CRITICAL**: Must match your actual Render backend URL
   - NO trailing slash!
   - NO `/api/v1` suffix (the code adds this automatically)

### Verification Steps

#### 1. Check Browser Console (DevTools)
After logging in, check the console for these logs:

```
Successfully set local_access cookie
```

Then when navigating to chat, you should see:
```
[Axios Interceptor] Error caught: { status: ..., url: ..., cookies: ... }
```

#### 2. Check Browser Cookies (DevTools > Application > Cookies)
You should see these cookies:

**On your frontend domain** (e.g., `your-app.vercel.app`):
- `local_access` = `true` (or `google_access` for Google login)
  - SameSite: `Lax`
  - Secure: `true` (in production)
  - HttpOnly: `false`
  - Path: `/`

**On your backend domain** (e.g., `intellimaint-ai-backend.onrender.com`):
- `local_access` (HTTP-only cookie from backend)
  - SameSite: `None`
  - Secure: `true`
  - HttpOnly: `true`
  - Path: `/`
- `refresh` (HTTP-only cookie from backend)
  - SameSite: `None`
  - Secure: `true`
  - HttpOnly: `true`
  - Path: `/`

#### 3. Check Network Tab (DevTools > Network)
When you make an API request (e.g., `/api/v1/user/profile`), check:
- Request Headers should include `Cookie: local_access=...; refresh=...`
- Response headers should NOT have CORS errors
- Status should be `200`, NOT `401`

### Common Issues & Solutions

#### Issue 1: Cookies not being sent with requests
**Symptoms**: 401 errors on all API calls after login

**Solution**:
1. Verify `NEXT_PUBLIC_NEST_URL` is set correctly in Vercel
2. Verify `FRONTEND_URL` matches your Vercel domain exactly (no trailing slash)
3. Check that both frontend and backend are using HTTPS
4. Verify browser supports `sameSite: 'none'` cookies (all modern browsers do)

#### Issue 2: CORS errors
**Symptoms**: Console shows CORS policy errors

**Solution**:
1. Verify `FRONTEND_URL` in Render matches your Vercel domain exactly
2. Check backend CORS configuration in `main.ts`
3. Ensure backend has:
   ```typescript
   app.enableCors({
     origin: process.env.FRONTEND_URL.split(','),
     credentials: true,
     exposedHeaders: ['Set-Cookie'],
     allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
   });
   ```

#### Issue 3: Middleware redirects before cookies are set
**Symptoms**: Infinite redirect loop, cookies never set

**Solution**:
The middleware should check for the frontend cookie (`local_access` or `google_access`), not the backend HTTP-only cookies. This is already implemented.

#### Issue 4: Cookies set but middleware can't read them
**Symptoms**: Cookies visible in DevTools but user still redirected

**Solution**:
Check middleware logs in Vercel logs (run `vercel logs` or check Vercel dashboard). The logs will show:
```
[Middleware] { pathname: '/chat', hasLocalToken: false, hasGoogleToken: false, hasToken: false, allCookies: [...] }
```

If `allCookies` shows the cookies but `hasLocalToken` is false, the cookie name might be wrong.

### Testing Locally with Production Settings

To test the production setup locally:

1. Update your local `.env`:
   ```env
   NEXT_PUBLIC_NEST_URL=https://intellimaint-ai-backend.onrender.com
   ```

2. Run `npm run build` then `npm start` (not `npm run dev`)

3. Access via `https://localhost:3000` (you may need to set up local SSL)

### Debugging Commands

```bash
# Check Vercel logs
vercel logs

# Check Render logs
# Go to Render dashboard > your service > Logs tab

# Check environment variables on Vercel
vercel env ls

# Pull environment variables from Vercel
vercel env pull .env.local
```

### Post-Deployment Verification

After deploying, test this flow:

1. ✅ Visit homepage
2. ✅ Click login
3. ✅ Enter credentials and submit
4. ✅ See success message
5. ✅ Redirected to /chat
6. ✅ Chat page loads successfully (not redirected to login)
7. ✅ Can send messages
8. ✅ Can refresh page and stay logged in
9. ✅ Can logout successfully

If any step fails, check the specific issue above.

### Additional Notes

- The frontend sets its own `local_access`/`google_access` cookie for middleware routing
- The backend sets HTTP-only `local_access`/`google_access` and `refresh` cookies for API authentication
- These are separate cookies on different domains
- Both are required for the app to function properly

