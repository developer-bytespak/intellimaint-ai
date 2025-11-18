'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RepresentativePage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('civilian');
  const [progressWidth, setProgressWidth] = useState(50);
  const searchParams = useSearchParams();

  const company = searchParams.get('company');

  useEffect(() => {
    // Animate progress bar from 50% to 80% when component mounts
    const timer = setTimeout(() => {
      setProgressWidth(80);
    }, 300); // Small delay for smooth entrance

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    // Navigate to next page or process selection
    console.log('Selected option:', selectedOption);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

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
            Let us Know Who You Are or Who You Represent
          </h1>

          {/* Radio Button Options */}
          <div className="lg:max-w-md lg:mx-auto">
            {/* Top Divider Line */}
            <div className="w-full h-px bg-[#4A4E57] mb-1 sm:mb-2 lg:mb-2"></div>

             {/* Civilian Option */}
             <div className="ml-4 sm:ml-6 lg:ml-0">
               <div className="flex items-center justify-start lg:justify-start space-x-3 sm:space-x-4 py-1 sm:py-1 lg:py-2">
                 <div className="flex-shrink-0">
                   <input
                     type="radio"
                     id="civilian"
                     name="representative"
                     value="civilian"
                     checked={selectedOption === 'civilian'}
                     onChange={() => handleOptionChange('civilian')}
                     className="w-5 h-5 sm:w-6 sm:h-6 text-[#2196F3] bg-transparent border-2 border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                     style={{
                       appearance: 'none',
                       WebkitAppearance: 'none',
                       MozAppearance: 'none',
                       borderRadius: '50%',
                       backgroundColor: selectedOption === 'civilian' ? '#2196F3' : 'transparent',
                       border: selectedOption === 'civilian' ? '2px solid #2196F3' : '2px solid #6B7280',
                       backgroundImage: selectedOption === 'civilian' 
                         ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e\")"
                         : 'none',
                       backgroundSize: '100% 100%',
                       backgroundPosition: 'center',
                       backgroundRepeat: 'no-repeat',
                     }}
                   />
                 </div>
                 <label htmlFor="civilian" className="text-white text-base sm:text-lg lg:text-lg font-medium cursor-pointer">
                   Civilian
                 </label>
               </div>
             </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-[#4A4E57] mb-1 sm:mb-1 lg:mb-1"></div>

             {/* Military Option */}
             <div className="ml-4 sm:ml-6 lg:ml-0">
               <div className="flex items-start justify-start space-x-3 sm:space-x-4 py-1 sm:py-1 lg:py-2">
                 <div className="flex-shrink-0 mt-1 lg:mt-0">
                   <input
                     type="radio"
                     id="military"
                     name="representative"
                     value="military"
                     checked={selectedOption === 'military'}
                     onChange={() => handleOptionChange('military')}
                     className="w-5 h-5 sm:w-6 sm:h-6 text-[#2196F3] bg-transparent border-2 border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                     style={{
                       appearance: 'none',
                       WebkitAppearance: 'none',
                       MozAppearance: 'none',
                       borderRadius: '50%',
                       backgroundColor: selectedOption === 'military' ? '#2196F3' : 'transparent',
                       border: selectedOption === 'military' ? '2px solid #2196F3' : '2px solid #6B7280',
                       backgroundImage: selectedOption === 'military' 
                         ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e\")"
                         : 'none',
                       backgroundSize: '100% 100%',
                       backgroundPosition: 'center',
                       backgroundRepeat: 'no-repeat',
                     }}
                   />
                 </div>
                 <div className="flex flex-col items-start">
                   <label htmlFor="military" className="text-white text-base sm:text-lg lg:text-lg font-medium cursor-pointer">
                     Military
                   </label>
                   <p className="text-[#A0A0A0] text-sm sm:text-base mt-1">
                     (Requires Valid Military Email Address)
                   </p>
                 </div>
               </div>
             </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-[#4A4E57] mb-1 sm:mb-1 lg:mb-1"></div>

             {/* Student Option */}
             <div className="ml-4 sm:ml-6 lg:ml-0">
               <div className="flex items-start justify-start space-x-3 sm:space-x-4 py-1 sm:py-1 lg:py-2">
                 <div className="flex-shrink-0 mt-1 lg:mt-0">
                   <input
                     type="radio"
                     id="student"
                     name="representative"
                     value="student"
                     checked={selectedOption === 'student'}
                     onChange={() => handleOptionChange('student')}
                     className="w-5 h-5 sm:w-6 sm:h-6 text-[#2196F3] bg-transparent border-2 border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                     style={{
                       appearance: 'none',
                       WebkitAppearance: 'none',
                       MozAppearance: 'none',
                       borderRadius: '50%',
                       backgroundColor: selectedOption === 'student' ? '#2196F3' : 'transparent',
                       border: selectedOption === 'student' ? '2px solid #2196F3' : '2px solid #6B7280',
                       backgroundImage: selectedOption === 'student' 
                         ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e\")"
                         : 'none',
                       backgroundSize: '100% 100%',
                       backgroundPosition: 'center',
                       backgroundRepeat: 'no-repeat',
                     }}
                   />
                 </div>
                 <div className="flex flex-col items-start">
                   <label htmlFor="student" className="text-white text-base sm:text-lg lg:text-lg font-medium cursor-pointer">
                     Student
                   </label>
                   <p className="text-[#A0A0A0] text-sm sm:text-base mt-1">
                     (Requires Valid Institution Email Address)
                   </p>
                 </div>
               </div>
             </div>

             {/* Bottom Divider Line */}
             <div className="w-full h-px bg-[#4A4E57] mt-1 sm:mt-1 lg:mt-1"></div>
           </div>
         </div>
       </div>

      {/* Bottom Action Button */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8 lg:pb-10">
        {/* Mobile/Tablet: Full width button with margins */}
        <div className="block lg:hidden">
          <button
            onClick={handleNext}
            className="w-full bg-[#2196F3] text-white font-semibold py-3 sm:py-4 text-sm sm:text-base rounded-3xl hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Next
          </button>
        </div>
        
        {/* Desktop: Small button within form width */}
        <div className="hidden lg:flex lg:justify-center">
          <button
            onClick={handleNext}
            className="bg-[#2196F3] text-white font-semibold py-3 px-8 text-base rounded-3xl hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            style={{ width: '448px' }} // Width to match form fields
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
