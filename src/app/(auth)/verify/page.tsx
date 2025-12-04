'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { toast } from 'react-toastify';
import { IAxiosError, IAxiosResponse } from '@/types/response';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(0); // Start with 0, will be set based on source
  const { verifyOtp, resendOtp } = useUser();
  const email = searchParams.get('email');
  const forgotPassword = searchParams.get('forgotPassword') === 'true';

  // Check if coming from signup on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromSignup = sessionStorage.getItem('fromSignup');
      if (fromSignup === 'true') {
        // User came from signup, start timer
        setTimer(300); // 5 minutes
        // Remove flag so refresh won't trigger timer
        sessionStorage.removeItem('fromSignup');
      } else {
        // Page refresh or direct navigation, timer stays at 0
        setTimer(0);
      }
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  // Format timer as MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
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
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setCode(newCode);
  };

  const handleResend = async () => {
    setIsResending(true);
    if(email){
      resendOtp.mutate({email:email},{
        onSuccess: (data) => {
          console.log('OTP resent:', data);
          const response = data as IAxiosResponse;
          toast.success(response.message);
          setIsResending(false);
          // Timer only starts when API call is successful
          setTimer(300); // Reset timer to 5 minutes
        },
        onError: (error) => {
          console.error('OTP resend error:', error);
          const axiosError = error as unknown as IAxiosError;
          toast.error(axiosError?.response?.data?.message); 
          setIsResending(false);
          // Timer does NOT start/reset on error
        }
      });
    } else {
      toast.error('Email is required');
      setIsResending(false);
      // Timer does NOT start if email is missing
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      const emailValue = email ;
      if(!emailValue){
        toast.error('Email is required');
        return;
      }

      verifyOtp.mutate({email:emailValue,otp:fullCode},{
        onSuccess: (data) => {
          console.log('Verification successful:', data);
          const response = data as IAxiosResponse;
          toast.success(response.message);
          // If coming from forgot password flow, redirect to reset password page
          if (forgotPassword) {
            router.push(`/reset-password?email=${encodeURIComponent(emailValue)}&otp=${encodeURIComponent(fullCode)}`);
          } else {
            router.push('/login');
          }
        },
        onError: (error) => {
          console.error('Verification error:', error);
          const axiosError = error as unknown as IAxiosError;
          toast.error(axiosError?.response?.data?.message);
        }
      });
    }else{
      toast.error('Code is required');
      return;
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
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-center text-lg sm:text-2xl lg:text-3xl font-semibold bg-transparent border-2 border-[#2196F3] rounded-xl sm:rounded-2xl lg:rounded-3xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ))}
            </div>

            {/* Resend Option */}
            <div className="text-center px-0">
              <span className="text-[#A0A0A0] text-sm sm:text-base lg:text-base font-medium">
                Didn&apos;t get a code?{' '}
                <button
                  onClick={handleResend}
                  disabled={isResending || resendOtp.isPending || timer > 0}
                  className="
                  cursor-pointer
                  text-[#2196F3] font-semibold hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending || resendOtp.isPending 
                    ? 'Sending...' 
                    : timer > 0 
                    ? `Resend in ${formatTimer(timer)}` 
                    : 'Resend'}
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
            style={{ width: 'calc(6 * 80px + 5 * 24px)' }} // Width of 6 code boxes + 5 gaps
          >
            {verifyOtp.isPending ? 'Verifying...' : 'Verify Code'}
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
