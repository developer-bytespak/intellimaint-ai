'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: ''
  });
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    // Animate progress bar to 50% when component mounts
    const timer = setTimeout(() => {
      setProgressWidth(50);
    }, 300); // Small delay for smooth entrance

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    // Navigate to representative page
    router.push('/representative');
  };

  const isFormValid = formData.fullName.trim() && formData.companyName.trim();

  return (
    <div className="min-h-screen bg-[#1A1D26] flex flex-col">
      {/* Navigation Header */}
      <div className="px-4 sm:px-6 py-4 pt-8 pb-8 sm:pb-10 lg:pb-4">
        {/* Mobile/Tablet: Progress bar in header */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="bg-[#2C303A] border border-[#4A4E57] rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-[#A0A0A0] hover:text-white hover:bg-[#3A404C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Progress Bar */}
            <div className="flex-1 mx-4 sm:mx-6 flex justify-center">
              <div className="w-1/2 sm:w-full max-w-xs sm:max-w-sm">
                <div className="w-full bg-[#4A4E57] rounded-full h-1 sm:h-2.5 overflow-hidden shadow-inner">
                  <div 
                    className="bg-[#2196F3] h-1 sm:h-2.5 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ 
                      width: `${progressWidth}%`,
                      transform: 'translateZ(0)',
                      willChange: 'width',
                      boxShadow: progressWidth > 0 ? '0 0 8px rgba(33, 150, 243, 0.3)' : 'none'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Only back button in header */}
        <div className="hidden lg:block">
          <button
            onClick={() => router.back()}
            className="bg-[#2C303A] border border-[#4A4E57] rounded-3xl p-4 text-[#A0A0A0] hover:text-white hover:bg-[#3A404C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between lg:justify-center px-4 sm:px-6 lg:px-8">
        {/* Top Content - Left aligned on mobile, centered on desktop */}
        <div className="lg:text-center lg:mb-16">
          {/* Desktop Progress Bar - Above heading */}
          <div className="hidden lg:block mb-8">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="w-full bg-[#4A4E57] rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-[#2196F3] h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ 
                      width: `${progressWidth}%`,
                      transform: 'translateZ(0)',
                      willChange: 'width',
                      boxShadow: progressWidth > 0 ? '0 0 8px rgba(33, 150, 243, 0.3)' : 'none'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-white mb-8 sm:mb-10 lg:mb-12 text-left lg:text-center ml-4 sm:ml-6 lg:ml-0">
            Fill Out the Quick Form
          </h1>

          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6 lg:max-w-md lg:mx-auto">
            {/* Full Name Field */}
            <div>
              <input
                type="text"
                placeholder="Full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-transparent border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base sm:text-lg"
              />
            </div>

            {/* Company Name Field */}
            <div>
              <input
                type="text"
                placeholder="Company name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-transparent border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base sm:text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8 lg:pb-10">
        {/* Mobile/Tablet: Full width button with margins */}
        <div className="block lg:hidden">
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className="w-full bg-[#2196F3] text-white font-semibold py-3 sm:py-4 text-sm sm:text-base rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Next
          </button>
        </div>
        
        {/* Desktop: Small button within form width */}
        <div className="hidden lg:flex lg:justify-center">
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className="bg-[#2196F3] text-white font-semibold py-3 px-8 text-base rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            style={{ width: '448px' }} // Width to match form fields
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
