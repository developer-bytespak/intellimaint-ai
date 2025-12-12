import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const routeRules = [
  { path: '/login', protect: false },
  { path: '/signup', protect: false },
  { path: '/reset-password', protect: false },
  { path: '/verify', protect: false },
  { path: '/callback', protect: false },
  { path: '/form', protect: false },
  { path: '/representative', protect: false },
  { path: '/chat', protect: true },
  { path: '/account', protect: true },
  { path: '/credits', protect: true },
  { path: '/saved-prompts', protect: true },
  { path: '/repository', protect: true },
  { path: '/settings', protect: true },
  { path: '/subscription', protect: true },
  { path: '/how-it-works', protect: true },
  { path: '/blogs', protect: true },
  { path: '/about', protect: true },
];

export function middleware(req: NextRequest) {
  // Check for both local_access and google_access cookies
  const localToken = req.cookies.get('local_access')?.value;
  const googleToken = req.cookies.get('google_access')?.value;
  const hasToken = localToken || googleToken;
  
  const pathname = req.nextUrl.pathname;

  // Debug logging (can be removed after testing)
  console.log('[Middleware]', {
    pathname,
    hasLocalToken: !!localToken,
    hasGoogleToken: !!googleToken,
    hasToken,
    allCookies: req.cookies.getAll().map(c => c.name)
  });

  // Find matching route rule
  const rule = routeRules.find(r => pathname.startsWith(r.path));

  // If no matching rule → allow request
  if (!rule) return NextResponse.next();

  // -------- PROTECTED ROUTES ----------
  if (rule.protect && !hasToken) {
    console.log('[Middleware] Redirecting to /login - no token found for protected route:', pathname);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // -------- PUBLIC ROUTES ------------
  if (!rule.protect && hasToken) {
    console.log('[Middleware] Redirecting to /chat - user already authenticated on public route:', pathname);
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login/:path*',
    '/signup/:path*',
    '/reset-password/:path*',
    '/verify/:path*',
    '/callback/:path*',
    '/form/:path*',
    '/representative/:path*',
    '/chat/:path*',
    '/account/:path*',
    '/credits/:path*',
    '/saved-prompts/:path*',
    '/repository/:path*',
    '/settings/:path*',
    '/subscription/:path*',
    '/how-it-works/:path*',
    '/blogs/:path*',
    '/about/:path*',
  ],
};