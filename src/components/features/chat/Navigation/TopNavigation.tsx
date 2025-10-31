'use client';

import { useRouter } from "next/navigation";

export default function TopNavigation() {
  const router = useRouter();
  return (
    <div className="fixed top-3 right-4 bg-[#2a3441] px-3 py-1 rounded-full flex gap-3 z-50">
      {/* App Info Icon */}
      <button
        onClick={() => router.push('/app-info')}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-white hover:text-white hover:bg-[#3a4a5a] transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Profile Icon */}
      <button
        onClick={() => router.push('/profile')}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-white hover:text-white hover:bg-[#3a4a5a] transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </div>
  );
}

