'use client';

import { useState } from 'react';

interface BottomNavigationProps {
  activeTab: 'chat' | 'history' | 'info' | 'profile';
  onTabChange: (tab: 'chat' | 'history' | 'info' | 'profile') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] px-4 py-4 rounded-t-3xl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {/* Chat Icon - House/Pentagon Shape */}
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
            activeTab === 'chat' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            <circle cx="12" cy="8" r="1" fill="currentColor"/>
          </svg>
        </button>

        {/* Recent History Icon */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
            activeTab === 'history' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
        </button>

        {/* App Info Icon */}
        <button
          onClick={() => onTabChange('info')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
            activeTab === 'info' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        </button>

        {/* Profile Icon */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
            activeTab === 'profile' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
