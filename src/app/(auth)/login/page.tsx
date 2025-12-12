'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { IAxiosError, IAxiosResponse } from '@/types/response';
import { toast } from 'react-toastify';
import ForgotPasswordModal from '@/components/features/auth/ForgotPasswordModal';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { loginUser } = useUser();

  const handleSignIn = () => {
    // Navigate to verify page with sign-in flow
    const data = {
      email,
      password,
    };
    // console.log(data);
    loginUser.mutate(data,{
      onSuccess: (data) => {
        console.log('Login successful:', data);
        const response = data as IAxiosResponse;
        toast.success(response.message);
        
        // Set transition state for smooth UI transition
        setIsTransitioning(true);
        
        try {
          // cookie applies to the frontend domain (Vercel). Use SameSite=Lax for same-site
          const cookieValue = 'true';
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          const isProduction = window.location.hostname !== 'localhost';
          const sameSite = isProduction ? 'Lax' : 'Lax';
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          const cookieString = `local_access=${cookieValue}; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}${secure}`;
          
          document.cookie = cookieString;
          
          // Verify cookie was set
          const cookiesAfter = document.cookie;
          const wasSet = cookiesAfter.includes('local_access=');
          
          console.log('Cookie setting attempt:', {
            cookieString,
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            isProduction,
            cookiesBefore: document.cookie || 'No cookies',
            cookiesAfter,
            wasSet
          });
          
          if (wasSet) {
            console.log('✅ Successfully set local_access cookie');
          } else {
            console.error('❌ Failed to set local_access cookie');
            toast.warning('Cookie setting failed - you may be redirected to login');
          }
        } catch (err) {
          console.error('Failed to set local_access cookie:', err);
          toast.error('Authentication setup failed. Please try again.');
        }

        // Small delay to show transition animation before navigation
        setTimeout(() => {
          router.push('/chat');
        }, 500);
      },
      onError: (error) => {
        console.error('Login error:', error);
        const axiosError = error as unknown as IAxiosError;
        toast.error(axiosError?.response?.data?.message);
      }
    });
  };

  const handleSignUp = () => {
    // Navigate to signup page
    console.log('Navigating to signup page');
    router.push('/signup');
  };

  const handleGoogleSignIn = () => {
    router.replace('/form');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Trigger sign in when Enter is pressed in email or password fields
    if (e.key === 'Enter' && !loginUser.isPending && email && password) {
      e.preventDefault();
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1D26] flex flex-col lg:flex-row">
      {/* Transition Overlay - Smooth fade out when logging in */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-[#1A1D26] z-50 pointer-events-none animate-[fadeOut_500ms_ease-in_forwards]" style={{
          animation: 'fadeOut 500ms ease-in forwards'
        }} />
      )}
      <style jsx>{`
        @keyframes fadeOut {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      {/* Mobile/Tablet: Single Column Layout (matches image exactly) */}
      <div className="lg:hidden flex flex-col items-center justify-center p-4 sm:p-6 min-h-screen">
        {/* Logo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 relative">
          <Image
            src="/logo.svg"
            alt="Intellimaint AI Logo"
            width={96}
            height={96}
            className="w-full h-full"
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
          Login to Intellimaint AI
        </h1>

        {/* Subheading */}
        <p className="text-[#A0A0A0] text-base sm:text-lg text-center mb-8 sm:mb-10">
          Smart. Secure. Tailored for your operations.
        </p>

        {/* Login Form */}
        <div className="w-full max-w-sm sm:max-w-md space-y-6">
          {/* Email Field */}
          <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
             htmlFor="email"
             className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
             htmlFor="password"
             className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                value={password}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-blue-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C707B] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m1.414 1.414l4.242 4.242M8.464 8.464L7.05 7.05m1.414 1.414L7.05 7.05m1.414 1.414l4.242 4.242M7.05 7.05L5.636 5.636m1.414 1.414L5.636 5.636m1.414 1.414l4.242 4.242" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          </form>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            {/* <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-gray-400 text-[#2196F3] bg-transparent checked:bg-[#2196F3] checked:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: rememberMe
                    ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                    : 'none',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <span className="ml-2 text-white text-sm">Remember me</span>
            </label> */}
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-[#2196F3] text-sm hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button 
          type="button"
            onClick={handleSignIn}
            disabled={loginUser.isPending}
            className="w-full bg-[#2196F3] text-white font-semibold py-3 rounded-3xl hover:bg-blue-600 transition-colors"
          >
            {loginUser.isPending ? 'Signing in...' : 'Sign In'}
          </button>

          {/* OR Separator */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[#4A4E57]"></div>
            <span className="px-4 text-[#6C707B] text-sm">OR</span>
            <div className="flex-1 border-t border-[#4A4E57]"></div>
          </div>

          {/* Google Sign In */}
          <button 
          onClick={handleGoogleSignIn}
          className="w-full bg-[#3A404C] text-white font-medium py-3 rounded-3xl hover:bg-[#4A505C] transition-colors flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-[#3A404C] font-bold text-sm">G</span>
            </div>
            Sign in with Google
          </button>

          {/* Apple Sign In */}
          {/* <button className="w-full bg-[#3A404C] text-white font-medium py-3 rounded-3xl hover:bg-[#4A505C] transition-colors flex items-center justify-center">
            <div className="w-6 h-6 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            Sign in with Apple
          </button> */}

          {/* Footer */}
          <div className="text-center pt-4">
            <span className="text-[#6C707B] text-sm">New to Energy Solution? </span>
            <button 
              onClick={handleSignUp}
              className="text-white text-sm hover:underline cursor-pointer transition-colors hover:text-blue-400 focus:outline-none focus:text-blue-400 active:text-blue-400"
              type="button"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Split Layout (Left: Logo/Branding, Right: Form) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:p-8">
        {/* Logo */}
        <div className="w-40 h-40 mb-8 relative">
          <Image
            src="/logo.svg"
            alt="Intellimaint AI Logo"
            width={160}
            height={160}
            className="w-full h-full"
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          Login to Intellimaint AI
        </h1>

        {/* Subheading */}
        <p className="text-[#A0A0A0] text-2xl text-center max-w-lg">
          Smart. Secure. Tailored for your operations.
        </p>
      </div>

      {/* Desktop: Right Side - Login Form */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:p-8">
        <div className="w-full max-w-md md:space-y-3">
          {/* Email Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Password"
                className="w-full px-4 py-3 bg-[#2C303A] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-blue-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C707B] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m1.414 1.414l4.242 4.242M8.464 8.464L7.05 7.05m1.414 1.414L7.05 7.05m1.414 1.414l4.242 4.242M7.05 7.05L5.636 5.636m1.414 1.414L5.636 5.636m1.414 1.414l4.242 4.242" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            {/* <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-gray-400 text-[#2196F3] bg-transparent checked:bg-[#2196F3] checked:border-[#2196F3] focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: rememberMe
                    ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                    : 'none',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <span className="ml-2 text-white text-sm">Remember me</span>
            </label> */}
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-[#2196F3] text-sm hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button 
            onClick={handleSignIn}
            disabled={loginUser.isPending}
            className="w-full bg-[#2196F3] text-white font-semibold md:py-3  rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginUser.isPending ? 'Signing in...' : 'Sign In'}
          </button>

          {/* OR Separator */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[#4A4E57]"></div>
            <span className="px-4 text-[#6C707B] text-sm">OR</span>
            <div className="flex-1 border-t border-[#4A4E57]"></div>
          </div>

          {/* Google Sign In */}
          <button 
          onClick={handleGoogleSignIn}
          className="w-full bg-[#3A404C] text-white font-medium py-3 rounded-3xl hover:bg-[#4A505C] transition-colors flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-[#3A404C] font-bold text-sm">G</span>
            </div>
            Sign in with Google
          </button>

          {/* Apple Sign In */}
          {/* <button className="w-full bg-[#3A404C] text-white font-medium py-3 rounded-3xl hover:bg-[#4A505C] transition-colors flex items-center justify-center">
            <div className="w-6 h-6 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            Sign in with Apple
          </button> */}

          {/* Footer */}
          <div className="text-center pt-4">
            <span className="text-[#6C707B] text-sm">New to Energy Solution? </span>
            <button 
              onClick={handleSignUp}
              className="text-white text-sm hover:underline cursor-pointer transition-colors hover:text-blue-400 focus:outline-none focus:text-blue-400 active:text-blue-400 touch-manipulation"
              type="button"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
}


