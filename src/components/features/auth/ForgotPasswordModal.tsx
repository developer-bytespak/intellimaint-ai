'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useUser } from '@/hooks/useUser';
import { IAxiosError, IAxiosResponse } from '@/types/response';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { forgotPassword } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    forgotPassword.mutate(
      { email },
      {
        onSuccess: (data) => {
          console.log('OTP sent successfully:', data);
          const response = data as IAxiosResponse;
          toast.success(response.message || 'OTP sent to your email');
          // Redirect to verify page with email and forgotPassword flag
          router.push(`/verify?email=${encodeURIComponent(email)}&forgotPassword=true`);
          onClose();
        },
        onError: (error) => {
          console.error('Forgot password error:', error);
          const axiosError = error as unknown as IAxiosError;
          toast.error(axiosError?.response?.data?.message || 'Failed to send OTP');
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="relative bg-[#2C303A] rounded-3xl p-6 sm:p-8 w-full max-w-md border border-[#4A4E57]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white transition-colors"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-[#A0A0A0] text-sm">
              Enter your email address and we&apos;ll send you an OTP to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[#1A1D26] border border-[#4A4E57] rounded-3xl text-white placeholder-[#6C707B] focus:outline-none focus:border-blue-500"
                disabled={forgotPassword.isPending}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-[#3A404C] text-white font-medium rounded-3xl hover:bg-[#4A505C] transition-colors"
                disabled={forgotPassword.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#2196F3] text-white font-semibold rounded-3xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={forgotPassword.isPending}
              >
                {forgotPassword.isPending ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

