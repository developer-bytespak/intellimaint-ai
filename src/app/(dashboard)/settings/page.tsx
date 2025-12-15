"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconQuestionMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Toggle Switch Component
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 ${
        enabled ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { getSettings, updateSettings, deleteAccount, sendDeleteAccountOtp, user } = useUser()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteOtp, setDeleteOtp] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [isOAuthAccount, setIsOAuthAccount] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // Load settings from backend
  useEffect(() => {
    if (getSettings.data) {
      setNotificationsEnabled(getSettings.data.emailNotifications)
    }
  }, [getSettings.data])

  const handleBack = () => {
    router.back()
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    try {
      await updateSettings.mutateAsync({ emailNotifications: enabled })
    } catch (error) {
      console.error('Failed to update notifications:', error)
      // Revert on error
      setNotificationsEnabled(!enabled)
      alert('Failed to update notification settings')
    }
  }

  // Check if account is OAuth (no password) when modal opens
  const handleDeleteAccount = () => {
    // Determine account type from user data (hasPassword: false = OAuth account)
    const isOAuth = user ? !user.hasPassword : false
    setIsOAuthAccount(isOAuth)
    setShowDeleteConfirm(true)
    setDeletePassword("")
    setDeleteOtp("")
    setDeleteError("")
    setOtpSent(false)
  }

  const handleRequestOtp = async () => {
    try {
      await sendDeleteAccountOtp.mutateAsync()
      setOtpSent(true)
      setDeleteError("")
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      setDeleteError(axiosError?.response?.data?.message || "Failed to send OTP")
    }
  }

  const handleConfirmDelete = async () => {
    try {
      if (isOAuthAccount) {
        // OAuth account - require OTP
        if (!deleteOtp) {
          setDeleteError("Please enter the OTP code to delete your account.")
          return
        }
        await deleteAccount.mutateAsync({ otp: deleteOtp })
      } else {
        // Regular account - require password
        if (!deletePassword) {
          setDeleteError("Password is required to delete your account.")
          return
        }
        await deleteAccount.mutateAsync({ password: deletePassword })
      }
      // Success, will redirect automatically via mutation's onSuccess
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      const errorMessage = axiosError?.response?.data?.message || "Failed to delete account"
      setDeleteError(errorMessage)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeletePassword("")
    setDeleteOtp("")
    setDeleteError("")
    setIsOAuthAccount(false)
    setOtpSent(false)
  }

  const handleCustomerSupport = () => {
    // Implement customer support logic
    console.log('Customer support clicked')
  }

  return (
    <main className="min-h-screen space-y-4 bg-[#1f2632] text-white">
      {/* Header */}
      <header className=" text-white rounded-b-[28px] shadow-sm"
         style={{ background: 'linear-gradient(90deg,#006EE6 0%,#00A0FF 100%)' }}>
        <div className="flex items-center gap-2 pt-6 pb-8">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-blue-500 dark:hover:bg-blue-700 rounded-full transition-colors ml-4"
            aria-label="Go back"
          >
            <IconChevronLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1 pr-4">Settings</h1>
        </div>
      </header>

      {/* Settings Content */}
      <section className="pt-6">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          
          {/* Notifications Section */}
          <div className="mb-2">
            <h2 className="text-md font-semibold text-white mb-4">Notifications</h2>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg">
              <div className="px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="">
                    <IconBell className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm md:text-base lg:text-lg font-medium text-white">Notifications</span>
                </div>
                <ToggleSwitch 
                  enabled={notificationsEnabled} 
                  onChange={handleToggleNotifications} 
                />
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-2">
            <h2 className="text-md font-semibold text-white mb-4">Support</h2>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg">
              <button
                onClick={handleCustomerSupport}
                className="w-full px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center gap-3 hover:bg-white/15 transition-colors rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              >
                <div className="">
                  <IconQuestionMark className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm md:text-base lg:text-lg font-medium text-white">Customer Support</span>
              </button>
            </div>
          </div>

          {/* Account Management Section */}
          <div className="mb-2">
            <h2 className="text-md font-semibold text-white mb-4">Account Management</h2>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg">
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center gap-3 hover:bg-red-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
              >
                <div className="">
                  <IconTrash className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-sm md:text-base lg:text-lg font-medium text-red-400">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Delete Account
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            
            {/* Password Input (for regular accounts) */}
            {!isOAuthAccount && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password (required)
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                />
              </div>
            )}

            {/* OTP Input (for OAuth accounts) */}
            {isOAuthAccount && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OTP Verification Code (required)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter OTP code"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={sendDeleteAccountOtp.isPending || otpSent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {sendDeleteAccountOtp.isPending ? "Sending..." : otpSent ? "OTP Sent" : "Request OTP"}
                  </button>
                </div>
                {otpSent && (
                  <p className="text-sm text-green-500 mt-2">
                    OTP sent to {user?.email}. Please check your email.
                  </p>
                )}
              </div>
            )}

            {deleteError && (
              <p className="text-sm text-red-500 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteAccount.isPending || (!isOAuthAccount && !deletePassword) || (isOAuthAccount && (!otpSent || !deleteOtp || deleteOtp.length !== 6))}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}