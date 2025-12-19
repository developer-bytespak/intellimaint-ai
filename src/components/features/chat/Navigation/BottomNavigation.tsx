'use client';

interface BottomNavigationProps {
  activeTab: 'chat' | 'history' | 'info' | 'profile';
  onTabChange: (tab: 'chat' | 'history' | 'info' | 'profile') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-[#2a3441] rounded-full flex-shrink-0 z-30 shadow-2xl" style={{ height: '60px', boxShadow: '0 -4px 30px rgba(42, 52, 65, 0.6), 0 -2px 15px rgba(42, 52, 65, 0.4)' }}>
      <div className="flex justify-between items-center h-full gap-6 px-6">
        {/* Chat Icon - House/Pentagon Shape */}
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            activeTab === 'chat' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 border border-blue-400' 
              : 'text-gray-400 border border-gray-600/40 hover:text-white hover:border-gray-400/60'
          }`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'chat' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        {/* Recent History Icon - Clock */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            activeTab === 'history' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 border border-blue-400' 
              : 'text-gray-400 border border-gray-600/40 hover:text-white hover:border-gray-400/60'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* App Info Icon - Document */}
        <button
          onClick={() => onTabChange('info')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            activeTab === 'info' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 border border-blue-400' 
              : 'text-gray-400 border border-gray-600/40 hover:text-white hover:border-gray-400/60'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        {/* Profile Icon */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            activeTab === 'profile' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 border border-blue-400' 
              : 'text-gray-400 border border-gray-600/40 hover:text-white hover:border-gray-400/60'
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