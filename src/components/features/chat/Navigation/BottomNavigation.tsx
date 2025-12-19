'use client';

interface BottomNavigationProps {
  activeTab: 'chat' | 'history' | 'info' | 'profile';
  onTabChange: (tab: 'chat' | 'history' | 'info' | 'profile') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-2 left-4 right-4 bg-[#2a3441] rounded-2xl flex-shrink-0 z-30 shadow-lg mb-2" style={{ height: '70px', boxShadow: '0 -4px 20px rgba(255, 255, 255, 0.15), 0 -2px 10px rgba(255, 255, 255, 0.08)' }}>
      <div className="flex justify-around items-center h-full px-1">
        {/* Chat Icon - House/Pentagon Shape */}
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center w-13 h-13 rounded-full border border-white/20 transition-all duration-200 ${
            activeTab === 'chat' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'text-white hover:text-white hover:bg-white/10'
          }`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'chat' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        {/* Recent History Icon - Clock */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center w-13 h-13 rounded-full border border-white/20 transition-all duration-200 ${
            activeTab === 'history' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'text-white hover:text-white hover:bg-white/10'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* App Info Icon - Document */}
        <button
          onClick={() => onTabChange('info')}
          className={`flex flex-col items-center justify-center w-13 h-13 rounded-full border border-white/20 transition-all duration-200 ${
            activeTab === 'info' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'text-white hover:text-white hover:bg-white/10'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        {/* Profile Icon */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center w-13 h-13 rounded-full border border-white/20 transition-all duration-200 ${
            activeTab === 'profile' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'text-white hover:text-white hover:bg-white/10'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}