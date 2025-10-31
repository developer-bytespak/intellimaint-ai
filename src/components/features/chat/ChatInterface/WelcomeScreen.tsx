'use client';

export default function WelcomeScreen() {
  return (
    <div className="flex-1 bg-[#1f2632] text-white flex flex-col h-[calc(100vh-110px)] md:overflow-y-hidden overflow-y-auto items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl text-center space-y-4 sm:space-y-6">
        {/* Logo or Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome to IntelliMaint AI</h1>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 sm:mt-8">
          <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
            <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-white font-semibold mb-1">Fast Response</h3>
            <p className="text-gray-400 text-sm">Get instant AI-powered answers</p>
          </div>
          <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
            <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-white font-semibold mb-1">Expert Knowledge</h3>
            <p className="text-gray-400 text-sm">Access comprehensive maintenance data</p>
          </div>
          <div className="bg-[#2a3441] p-3 sm:p-4 rounded-xl">
            <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-white font-semibold mb-1">24/7 Available</h3>
            <p className="text-gray-400 text-sm">Always here when you need help</p>
          </div>
        </div>
      </div>
    </div>
  );
}

