import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// DISABLED: Server middleware checking for cross-domain cookies doesn't work
// Backend cookies (set on intellimaint-ai-backend.onrender.com) cannot be read 
// by the frontend middleware running on intellimaint-ai.vercel.app
// 
// SOLUTION: Use client-side authentication checks instead (see useAuth hook)

// Minimal middleware export required by Next.js (even when disabled)
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

// const routeRules = [
//   { path: "/login", protect: false },
//   { path: "/signup", protect: false },
//   { path: "/reset-password", protect: false },
//   { path: "/verify", protect: false },
//   { path: "/callback", protect: false },
//   { path: "/form", protect: false },
//   { path: "/representative", protect: false },
//   { path: "/chat", protect: true },
//   { path: "/account", protect: true },
//   { path: "/credits", protect: true },
//   { path: "/saved-prompts", protect: true },
//   { path: "/repository", protect: true },
//   { path: "/settings", protect: true },
//   { path: "/subscription", protect: true },
//   { path: "/how-it-works", protect: true },
//   { path: "/blogs", protect: true },
//   { path: "/about", protect: true },
// ];

// export function middleware_DISABLED(req: NextRequest) {
//   // Check for both local_access and google_access cookies
//   const localToken = req.cookies.get("local_accessToken")?.value;
//   const googleToken = req.cookies.get("google_access")?.value;
//   const hasToken = localToken || googleToken;

//   // console.log(localToken, googleToken);

//   const pathname = req.nextUrl.pathname;

//   // Debug logging (can be removed after testing)
//   // console.log("[Middleware]", {
//   //   pathname,
//   //   hasLocalToken: !!localToken,
//   //   hasGoogleToken: !!googleToken,
//   //   hasToken,
//   //   allCookies: req.cookies.getAll().map((c) => c.name),
//   // });

//   // Find matching route rule
//   const rule = routeRules.find((r) => pathname.startsWith(r.path));

//   // If no matching rule → allow request
//   if (!rule) return NextResponse.next();

//   // -------- PROTECTED ROUTES ----------
//   // if (rule.protect && !hasToken) {
//   //   console.log(
//   //     "[Middleware] Redirecting to /login - no token found for protected route:",
//   //     pathname
//   //   );
//   //   return NextResponse.redirect(new URL("/login", req.url));
//   // }

//   // -------- PUBLIC ROUTES ------------
//   if (!rule.protect && hasToken) {
//     console.log(
//       "[Middleware] Redirecting to /chat - user already authenticated on public route:",
//       pathname
//     );
//     return NextResponse.redirect(new URL("/chat", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/login/:path*",
//     "/signup/:path*",
//     "/reset-password/:path*",
//     "/verify/:path*",
//     "/callback/:path*",
//     "/form/:path*",
//     "/representative/:path*",
//     "/chat/:path*",
//     "/account/:path*",
//     "/credits/:path*",
//     "/saved-prompts/:path*",
//     "/repository/:path*",
//     "/settings/:path*",
//     "/subscription/:path*",
//     "/how-it-works/:path*",
//     "/blogs/:path*",
//     "/about/:path*",
//   ],
// };

// DISABLED: Server middleware checking for cross-domain cookies doesn't work
// Backend cookies (set on intellimaint-ai-backend.onrender.com) cannot be read 
// by the frontend middleware running on intellimaint-ai.vercel.app
// 
// SOLUTION: Use client-side authentication checks instead (see useAuth hook)
// 
// To re-enable in future if backend and frontend are on same domain:
// 1. Uncomment the code below
// 2. Update the routes as needed

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
//
// const routeRules = [
//   { path: "/login", protect: false },
//   { path: "/signup", protect: false },
//   { path: "/reset-password", protect: false },
//   { path: "/verify", protect: false },
//   { path: "/callback", protect: false },
//   { path: "/form", protect: false },
//   { path: "/representative", protect: false },
//   { path: "/chat", protect: true },
//   { path: "/account", protect: true },
//   { path: "/credits", protect: true },
//   { path: "/saved-prompts", protect: true },
//   { path: "/repository", protect: true },
//   { path: "/settings", protect: true },
//   { path: "/subscription", protect: true },
//   { path: "/how-it-works", protect: true },
//   { path: "/blogs", protect: true },
//   { path: "/about", protect: true },
// ];
//
// export function middleware(req: NextRequest) {
//   const pathname = req.nextUrl.pathname;
//   const localAccess = req.cookies.get("local_accessToken")?.value;
//   const localRefresh = req.cookies.get("local_refreshToken")?.value;
//   const googleAccess = req.cookies.get("google_accessToken")?.value;
//   const googleRefresh = req.cookies.get("google_refreshToken")?.value;
//   const isAuthenticated = Boolean(localAccess || localRefresh || googleAccess || googleRefresh);
//   const rule = routeRules.find((r) => pathname.startsWith(r.path));
//   if (!rule) return NextResponse.next();
//   if (rule.protect && !isAuthenticated) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
//   if (!rule.protect && isAuthenticated) {
//     return NextResponse.redirect(new URL("/chat", req.url));
//   }
//   return NextResponse.next();
// }
//
// export const config = {
//   matcher: [
//     "/login/:path*",
//     "/signup/:path*",
//     "/reset-password/:path*",
//     "/verify/:path*",
//     "/callback/:path*",
//     "/form/:path*",
//     "/representative/:path*",
//     "/chat/:path*",
//     "/account/:path*",
//     "/credits/:path*",
//     "/saved-prompts/:path*",
//     "/repository/:path*",
//     "/settings/:path*",
//     "/subscription/:path*",
//     "/how-it-works/:path*",
//     "/blogs/:path*",
//     "/about/:path*",
//   ],
// };

