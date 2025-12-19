# Debug Login Issues - Step by Step

## Quick Diagnosis

When login fails with "failed to authenticate user", follow these steps:

### Step 1: Check Browser Console
Open DevTools → Console and look for errors:
- Network errors = CORS issue or backend not running
- Authorization errors = Token/credential issue
- Other errors = Response structure mismatch

### Step 2: Check Network Tab
Open DevTools → Network tab → Type in email/password and click login
- Find the request to `POST /auth/login`
- Check the **Request Headers** - should show `Content-Type: application/json`
- Check the **Response Status** - should be `200 OK`
- Check the **Response Body** - should look like:
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  },
  "message": "Login successful"
}
```

### Step 3: Check localStorage
After clicking login, open DevTools → Application → LocalStorage:
```javascript
// In console:
localStorage.getItem('accessToken')  // Should have a token, not null
localStorage.getItem('refreshToken') // Should have a token, not null
```

---

## Common Issues & Fixes

### Issue: "Network Error" or "ERR_FAILED"
**This means the request never reached the backend**

**Cause**: CORS not configured on backend

**Fix**: Add CORS to backend (see BACKEND_SETUP.md)

---

### Issue: "401 Unauthorized" or "Invalid credentials"
**This means request reached backend but auth failed**

**Possible causes**:
1. Wrong email/password
2. User account doesn't exist
3. Backend not validating correctly

**Fix**:
- Verify email/password are correct
- Check backend logs for validation errors
- Ensure `/auth/login` endpoint returns proper response

---

### Issue: Login shows success but redirects back to login page
**This means token was stored but user profile fetch failed**

**Cause**: One of these:
1. Token was stored in localStorage but is invalid
2. Axios interceptor not sending token in Authorization header
3. Backend `/user/profile` endpoint returning 401
4. CORS issue on `/user/profile` endpoint

**Fix**: 
Check in console:
```javascript
// After login succeeds, check:
localStorage.getItem('accessToken')

// Then manually check if user profile can be fetched:
fetch('http://localhost:3000/api/v1/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
}).then(r => r.json()).then(console.log)
```

---

## Backend CORS Configuration Required

### For NestJS with @nestjs/websockets:

**In `main.ts`**:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins in development
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
}
bootstrap();
```

### For production:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'https://intellimaint-ai.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## Testing the Login Flow

### Manual Test in Browser Console:

```javascript
// 1. Test if backend is reachable
fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'password' })
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', r.headers);
  return r.json();
})
.then(data => {
  console.log('Response:', data);
  if (data.data?.accessToken) {
    console.log('✅ Token received:', data.data.accessToken.substring(0, 20) + '...');
    localStorage.setItem('accessToken', data.data.accessToken);
  }
})
.catch(err => console.error('❌ Error:', err));
```

---

## Files to Check

1. **Frontend Login**: [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx)
2. **useUser Hook**: [src/hooks/useUser.tsx](src/hooks/useUser.tsx#L280)
3. **Axios Config**: [src/lib/api/axios.ts](src/lib/api/axios.ts)
4. **Response Types**: [src/types/response.ts](src/types/response.ts)

---

## Next Steps

1. **Check browser console** for the exact error
2. **Share the error message** from DevTools Network tab
3. **Verify backend CORS** is configured
4. **Run manual test** above to verify connectivity
