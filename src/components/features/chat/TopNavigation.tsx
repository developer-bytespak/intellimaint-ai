'use client';

interface TopNavigationProps {
  onTabChange: (tab: 'info' | 'profile') => void;
}

export default function TopNavigation({ onTabChange }: TopNavigationProps) {
  return (
    <div className="fixed top-4 right-4 flex gap-2 z-50">
      {/* App Info Icon */}
      <button
        onClick={() => onTabChange('info')}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#3a3a3a] transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      </button>

      {/* Profile Icon */}
      <button
        onClick={() => onTabChange('profile')}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#3a3a3a] transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </button>
    </div>
  );
}
