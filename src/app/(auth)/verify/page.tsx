'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const { verifyOtp, resendOtp } = useUser();
  const email = searchParams.get('email');
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newCode = [...code];
    
    for (let i = 0; i < 4; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setCode(newCode);
  };

  const handleResend = async () => {
    setIsResending(true);
    if(email){
      resendOtp.mutate({email:email},{
        onSuccess: (data: any) => {
          console.log('OTP resent:', data);
          setIsResending(false);
        },
        onError: (error) => {
          console.error('OTP resend error:', error);
          setIsResending(false);
        }
      });
    } else {
      setIsResending(false);
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      const emailValue = email || '';

      verifyOtp.mutate({email:emailValue,otp:fullCode},{
        onSuccess: (data: any) => {
          console.log('Verification successful:', data);
          router.push('/login');
        },
        onError: (error) => {
          console.error('Verification error:', error);
        }
      });
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className="h-screen bg-[#1A1D26] flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <div className="px-4 sm:px-6 py-4 pt-6 pb-4 sm:pb-6 lg:pb-4">
        <button
          onClick={() => router.back()}
          className="bg-[#2C303A] border border-[#4A4E57] rounded-xl p-2 text-[#A0A0A0] hover:text-white hover:bg-[#3A404C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between lg:justify-center items-center px-4 sm:px-6 lg:px-8">
        {/* Top Content - Left aligned on mobile, centered on desktop */}
        <div className="lg:text-center lg:mb-16">
          {/* Page Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-6 text-center">
            Verify Your Account
          </h1>
          
          {/* Instructional Text */}
          <p className="text-[#A0A0A0] text-base sm:text-lg lg:text-lg leading-relaxed max-w-xs sm:max-w-sm lg:max-w-md lg:mx-auto text-center mb-6 sm:mb-8 lg:mb-8 font-medium">
            Enter the code we&apos;ve sent by text to{' '}
            <span className="text-white font-semibold">{email || 'your email'}</span>
          </p>

          {/* Code Input Section */}
          <div className="lg:mb-6">
            {/* Input Label */}
            <label className="block text-[#A0A0A0] text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center">
              Enter code
            </label>
            
            {/* Code Input Fields */}
            <div className="flex justify-center space-x-3 sm:space-x-4 lg:space-x-6 mb-4 sm:mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-center text-lg sm:text-2xl lg:text-3xl font-semibold bg-transparent border-2 border-[#2196F3] rounded-xl sm:rounded-2xl lg:rounded-3xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                />
              ))}
            </div>

            {/* Resend Option */}
            <div className="text-center px-0">
              <span className="text-[#A0A0A0] text-sm sm:text-base lg:text-base font-medium">
                Didn&apos;t get a code?{' '}
                <button
                  onClick={handleResend}
                  disabled={isResending || resendOtp.isPending}
                  className="text-[#2196F3] font-semibold hover:text-blue-400 transition-colors disabled:opacity-50"
                >
                  {isResending || resendOtp.isPending ? 'Sending...' : 'Resend'}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 lg:pb-8">
        {/* Mobile/Tablet: Full width button with margins */}
        <div className="block lg:hidden">
          <button
            onClick={handleVerify}
            disabled={!isCodeComplete || verifyOtp.isPending}
            className="w-full bg-[#2196F3] text-white font-semibold py-3 sm:py-4 text-sm sm:text-base rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {verifyOtp.isPending ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
        
        {/* Desktop: Small button within code boxes width */}
        <div className="hidden lg:flex lg:justify-center">
          <button
            onClick={handleVerify}
            disabled={!isCodeComplete}
            className="bg-[#2196F3] text-white font-semibold py-3 px-8 text-base rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            style={{ width: 'calc(4 * 80px + 3 * 24px)' }} // Width of 4 code boxes + 3 gaps
          >
            Verify Code
          </button>
        </div>
      </div>

    </div>
  );
}


export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#1A1D26] flex items-center justify-center overflow-hidden">
      <div className="text-white">Loading...</div>
    </div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
