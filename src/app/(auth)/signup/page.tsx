'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData, type RegisterFormValues } from '@/lib/validations/register';
import { UserRole } from '@/types/auth';
import { useUser } from '@/hooks/useUser';
import { toast } from 'react-toastify';
import { IAxiosError, IAxiosResponse } from '@/types/response';

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUpUser } = useUser();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: '' as '' | UserRole,
      firstName: '',
      lastName: '',
      company: '',
    },
  });

  // Watch role field to conditionally show company field
  const selectedRole = watch('role');
  const showCompanyField = selectedRole === UserRole.CIVILIAN;

  // Clear company field when role changes away from civilian
  useEffect(() => {
    if (selectedRole && selectedRole !== UserRole.CIVILIAN) {
      setValue('company', '');
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    const roleValue = data.role;
    if (roleValue === '' || !Object.values(UserRole).includes(roleValue as UserRole)) {
      return; // Should not happen due to validation
    }

    const formData: RegisterFormData = {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: roleValue as UserRole,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
    };

    // TODO: Integrate with API
    // console.log('Form data:', formData);
    // Navigate to verify account page with sign-up flow
    signUpUser.mutate(formData, {
      onSuccess: (data) => {
        console.log('Sign up success:', data);
        const response = data as IAxiosResponse;
        toast.success(response.message);
        // Set flag in sessionStorage to indicate coming from signup
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('fromSignup', 'true');
        }
        router.push(`/verify?email=${formData.email}`);
      },
      onError: (error) => {
        console.error('Sign up error:', error);
        const axiosError = error as unknown as IAxiosError;
        toast.error(axiosError?.response?.data?.message);
        router.push('/signup');
      }
    });
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in
    console.log('Google sign in');
  };

  const handleSignIn = () => {
    // Navigate to login page
    router.push('/login');
  };

  return (
    <div className="h-screen bg-[#1A1D26] flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <div className="px-4 sm:px-6 py-2 lg:py-3 flex-shrink-0">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="bg-[#2C303A] border border-[#4A4E57] rounded-2xl p-2.5 sm:p-3 text-[#A0A0A0] hover:text-white hover:bg-[#3A404C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-center px-4 sm:px-6 lg:px-8 gap-4 lg:gap-6 overflow-y-auto">
        {/* Heading Section */}
        <div className="text-center lg:text-left lg:flex-1 lg:pr-6 flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            Start Your Smart Support{' '}
            <span className="text-[#2196F3]">Journey Today.</span>
          </h1>
          <p className="text-[#A0A0A0] text-sm sm:text-base lg:text-lg">
            Smart. Secure. Tailored for your operations.
          </p>
        </div>

        {/* Form Section - Left Side (Desktop) */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto lg:mx-0 w-full lg:flex-1 space-y-2.5 sm:space-y-3">
          {/* First Name Field */}
          <div>
            <input
              type="text"
              placeholder="First name"
              {...register('firstName')}
              className={`w-full px-4 py-2.5 sm:py-3 bg-[#2C303A] border rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base ${errors.firstName ? 'border-red-500' : 'border-[#4A4E57] focus:border-[#2196F3]'
                }`}
            />
            {errors.firstName && (
              <p className="mt-0.5 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name Field */}
          <div>
            <input
              type="text"
              placeholder="Last name"
              {...register('lastName')}
              className={`w-full px-4 py-2.5 sm:py-3 bg-[#2C303A] border rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base ${errors.lastName ? 'border-red-500' : 'border-[#4A4E57] focus:border-[#2196F3]'
                }`}
            />
            {errors.lastName && (
              <p className="mt-0.5 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className={`w-full px-4 py-2.5 sm:py-3 bg-[#2C303A] border rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base ${errors.email ? 'border-red-500' : 'border-[#4A4E57] focus:border-[#2196F3]'
                }`}
            />
            {errors.email && (
              <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <select
              {...register('role')}
              className={`w-full px-4 py-2.5 sm:py-3 bg-[#2C303A] border rounded-3xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base appearance-none cursor-pointer ${errors.role ? 'border-red-500' : 'border-[#4A4E57] focus:border-[#2196F3]'
                }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A0A0A0' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 1rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em',
                paddingRight: '2.75rem',
              }}
            >
              <option value="" className="bg-[#2C303A] text-white">
                Select your role
              </option>
              <option value={UserRole.STUDENT} className="bg-[#2C303A] text-white">
                Student
              </option>
              <option value={UserRole.MILITARY} className="bg-[#2C303A] text-white">
                Military
              </option>
              <option value={UserRole.CIVILIAN} className="bg-[#2C303A] text-white">
                Civilian
              </option>
            </select>
            {errors.role && (
              <p className="mt-0.5 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Company Field - Only show when role is CIVILIAN */}
          {showCompanyField && (
            <div className="overflow-hidden transition-all duration-300 ease-out">
              <input
                type="text"
                placeholder="Company (optional)"
                {...register('company')}
                className={`w-full px-4 py-2.5 sm:py-3 bg-[#2C303A] border rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base ${errors.company ? 'border-red-500' : 'border-[#4A4E57] focus:border-[#2196F3]'
                  }`}
              />
              {errors.company && (
                <p className="mt-0.5 text-xs text-red-500">{errors.company.message}</p>
              )}
            </div>
          )}

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register('password')}
              className={`w-full px-4 py-2.5 sm:py-3 bg-[#2C303A] border rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base pr-10 ${errors.password ? 'border-red-500' : 'border-[#4A4E57] focus:border-[#2196F3]'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C707B] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {errors.password && (
              <p className="mt-0.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              {...register('confirmPassword')}
              className={`w-full px-4 py-2.5 sm:py-3 bg-[#2C303A] border rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-[#4A4E57] focus:border-[#2196F3]'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C707B] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {errors.confirmPassword && (
              <p className="mt-0.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting || signUpUser.isPending}
            className="w-full bg-[#2196F3] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isSubmitting || signUpUser.isPending ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* Vertical OR Divider - Desktop Only */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-3">
          <div className="w-px h-12 bg-[#4A4E57]"></div>
          <span className="px-2 py-1 text-[#6C707B] text-xs bg-[#1A1D26]">OR</span>
          <div className="w-px h-12 bg-[#4A4E57]"></div>
        </div>

        {/* Social Sign In Section - Right Side (Desktop) */}
        <div className="max-w-md mx-auto lg:mx-0 w-full lg:flex-1 flex-shrink-0">
          {/* Horizontal OR Divider - Mobile Only */}
          <div className="flex items-center mb-3 lg:hidden">
            <div className="flex-1 h-px bg-[#4A4E57]"></div>
            <span className="px-3 text-[#6C707B] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#4A4E57]"></div>
          </div>

          <div className="space-y-2.5">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-[#2C303A] border border-[#4A4E57] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-3xl hover:bg-[#3A404C] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Apple Sign In Button */}
            {/* <button
              onClick={handleAppleSignIn}
              className="w-full bg-[#2C303A] border border-[#4A4E57] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-3xl hover:bg-[#3A404C] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
              </svg>
              <span>Sign in with Apple</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Bottom Sign In Link */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4 flex-shrink-0">
        <p className="text-center text-[#6C707B] text-xs sm:text-sm">
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