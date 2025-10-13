'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = () => {
    // Navigate to verify account page with sign-up flow
    router.push('/verify?flow=signup');
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in
    console.log('Google sign in');
  };

  const handleAppleSignIn = () => {
    // Handle Apple sign in
    console.log('Apple sign in');
  };

  const handleSignIn = () => {
    // Navigate to login page
    router.push('/login');
  };

  const isFormValid = formData.fullName.trim() && formData.email.trim() && formData.password.trim() && formData.confirmPassword.trim();

  return (
    <div className="min-h-screen bg-[#1A1D26] flex flex-col">
      {/* Navigation Header */}
      <div className="px-4 sm:px-6 py-4 pt-8 pb-8 sm:pb-10 lg:pb-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="bg-[#2C303A] border border-[#4A4E57] rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-[#A0A0A0] hover:text-white hover:bg-[#3A404C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between px-6 sm:px-8 lg:px-12 pt-4 sm:pt-6 lg:pt-8">
        {/* Heading Section */}
        <div className="text-center lg:text-left mb-8 sm:mb-10 lg:mb-0 lg:flex-1 lg:pr-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Start Your Smart Support{' '}
            <span className="text-[#2196F3]">Journey Today.</span>
          </h1>
          <p className="text-[#A0A0A0] text-base sm:text-lg lg:text-xl">
            Smart. Secure. Tailored for your operations.
          </p>
        </div>

        {/* Form Section - Left Side (Desktop) */}
        <div className="max-w-md mx-auto lg:mx-0 w-full lg:flex-1">
          {/* Full Name Field */}
          <div className="mb-4 sm:mb-5">
            <input
              type="text"
              placeholder="Full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 sm:py-4 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base sm:text-lg"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4 sm:mb-5">
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 sm:py-4 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base sm:text-lg"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4 sm:mb-5 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 sm:py-4 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base sm:text-lg pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6C707B] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6 sm:mb-8 relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 sm:py-4 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base sm:text-lg pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6C707B] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showConfirmPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            disabled={!isFormValid}
            className="w-full bg-[#2196F3] text-white font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-6 sm:mb-8 lg:mb-0"
          >
            Sign Up
          </button>
        </div>

        {/* Vertical OR Divider - Desktop Only */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-4 lg:py-20">
          <div className="w-px h-20 bg-[#4A4E57]"></div>
          <span className="px-2 py-2 text-[#6C707B] text-sm bg-[#1A1D26]">OR</span>
          <div className="w-px h-20 bg-[#4A4E57]"></div>
        </div>

        {/* Social Sign In Section - Right Side (Desktop) */}
        <div className="max-w-md mx-auto lg:mx-0 w-full lg:flex-1">
          {/* Horizontal OR Divider - Mobile Only */}
          <div className="flex items-center mb-6 sm:mb-8 lg:hidden">
            <div className="flex-1 h-px bg-[#4A4E57]"></div>
            <span className="px-4 text-[#6C707B] text-sm sm:text-base">OR</span>
            <div className="flex-1 h-px bg-[#4A4E57]"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-[#2C303A] border border-[#4A4E57] text-white font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-3xl hover:bg-[#3A404C] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4 sm:mb-5 flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Apple Sign In Button */}
          <button
            onClick={handleAppleSignIn}
            className="w-full bg-[#2C303A] border border-[#4A4E57] text-white font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-3xl hover:bg-[#3A404C] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-8 sm:mb-10 flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
            <span>Sign in with Apple</span>
          </button>
        </div>
      </div>

      {/* Bottom Sign In Link */}
      <div className="px-6 sm:px-8 lg:px-12 pb-8 sm:pb-10">
        <p className="text-center text-[#6C707B] text-sm sm:text-base">
          Already have an Account?{' '}
          <button
            onClick={handleSignIn}
            className="text-[#2196F3] hover:text-blue-400 transition-colors font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}