"use client"
import React from "react";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCall: () => void;
  isCallActive?: boolean;
  onEndCall?: () => void;
}

export const CallModal = ({ 
  isOpen, 
  onClose, 
  onStartCall, 

  isCallActive = false,
  onEndCall 
}: CallModalProps) => {
  // Close modal on Escape key (only when call is not active)
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCallActive && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isCallActive]);

  if (!isOpen) return null;

  // Close modal on backdrop click (only when call is not active)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isCallActive) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#2a3441] p-6 rounded-xl max-w-sm w-full mx-4">
        {!isCallActive ? (
          <>
            {/* Pre-call screen */}
            <h2 className="text-white text-xl font-bold mb-4">Are you ready to make a call?</h2>
            <p className="text-gray-400 mb-4">Click start to initiate the call or cancel to return to chat.</p>
            <div className="flex justify-between gap-4">
              <button 
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 flex-1" 
                onClick={onStartCall}
              >
                Start Call
              </button>
              <button 
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200 flex-1" 
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Active call screen */}
            <div className="flex flex-col items-center">
              {/* Call animation */}
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                {/* Ripple effects */}
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
              </div>

              <h2 className="text-white text-2xl font-bold mb-2">Call Active</h2>
              <p className="text-green-400 mb-2 text-sm font-semibold">● Connected</p>
              <p className="text-gray-400 mb-8 text-center">You are now speaking with IntelliMaint AI</p>
              
              {/* End Call button - Large red circular button */}
              <button 
                className="bg-red-500 text-white py-4 px-10 rounded-full hover:bg-red-600 transition duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105" 
                onClick={() => {
                  onEndCall?.();
                  onClose();
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)"/>
                </svg>
                <span className="font-semibold text-lg">End Call</span>
              </button>

              {/* Optional: Add mute/speaker controls */}
              <div className="flex gap-4 mt-6">
                <button className="p-3 bg-[#3a4a5a] rounded-full hover:bg-[#4a5a6a] transition duration-200" title="Mute">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button className="p-3 bg-[#3a4a5a] rounded-full hover:bg-[#4a5a6a] transition duration-200" title="Speaker">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};