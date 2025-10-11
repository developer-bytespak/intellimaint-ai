'use client';

interface BottomNavigationProps {
  activeTab: 'chat' | 'history' | 'info' | 'profile';
  onTabChange: (tab: 'chat' | 'history' | 'info' | 'profile') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-2 left-4 right-4 bg-[#2a3441] px-4 py-2 pt-3 rounded-[3rem] flex-shrink-0 z-50" style={{ height: '80px' }}>
      <div className="flex justify-around items-center max-w-md mx-auto gap-1">
        {/* Chat Icon - House/Pentagon Shape */}
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
            activeTab === 'chat' 
              ? 'bg-blue-500 text-white' 
              : 'text-white hover:text-white hover:bg-[#3a4a5a]'
          }`}
        >
          {activeTab === 'chat' ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              <circle cx="12" cy="8" r="1" fill="currentColor"/>
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              <circle cx="12" cy="8" r="1" fill="currentColor"/>
            </svg>
          )}
        </button>

        {/* Recent History Icon */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
            activeTab === 'history' 
              ? 'bg-blue-500 text-white' 
              : 'text-white hover:text-white hover:bg-[#3a4a5a]'
          }`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* App Info Icon */}
        <button
          onClick={() => onTabChange('info')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
            activeTab === 'info' 
              ? 'bg-blue-500 text-white' 
              : 'text-white hover:text-white hover:bg-[#3a4a5a]'
          }`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        {/* Profile Icon */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
            activeTab === 'profile' 
              ? 'bg-blue-500 text-white' 
              : 'text-white hover:text-white hover:bg-[#3a4a5a]'
          }`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
