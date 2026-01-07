"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackClient() {
  const params = useSearchParams();
  const router = useRouter();

  const error = params.get('error');
  // Support both old format (token) and new format (accessToken, refreshToken)
  const token = params.get('token');
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');

  useEffect(() => {
    if (error) return;

    // CROSS-DOMAIN FIX: Store tokens in localStorage for production
    // This works when frontend and backend are on different domains
    if (accessToken) {
      console.log('[Callback] Storing accessToken in localStorage');
      localStorage.setItem('accessToken', accessToken);
    }
    
    if (refreshToken) {
      console.log('[Callback] Storing refreshToken in localStorage');
      localStorage.setItem('refreshToken', refreshToken);
    }

    if (token || accessToken) {
      // Set cookie for middleware to detect authentication (fallback for local dev)
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      const isProduction = window.location.hostname !== 'localhost';
      const sameSite = isProduction ? 'Lax' : 'Lax';
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `google_access=true; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}${secure}`;
      console.log('[Callback] Successfully set google_access cookie, redirecting to /chat');
      router.replace("/chat");
    }
  }, [error, token, accessToken, refreshToken, router]);

  const handleGoToLogin = () => router.push('/login');

  return (
    <div className="min-h-screen bg-[#1A1D26] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 text-center">

        {error ? (
          <>
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-6">
              <svg
                className="w-full h-full text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Authentication Error
            </h1>

            <div className="bg-[#2C303A] border border-[#4A4E57] rounded-2xl p-4 sm:p-6 mb-6">
              <p className="text-[#A0A0A0] text-sm sm:text-base break-words">
                {decodeURIComponent(error)}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-6">
              <svg
                className="w-full h-full text-blue-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Processing authentication...
            </h1>
          </>
        )}

        <button
          onClick={handleGoToLogin}
          className="w-full bg-[#2196F3] text-white font-semibold py-3 px-6 rounded-3xl hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1A1D26]"
        >
          Go to Login Page
        </button>

      </div>
    </div>
  );
}
