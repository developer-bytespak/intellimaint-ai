"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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

function IconLogout(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleBack = () => {
    router.back()
  }

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked')
  }

  const handleDeleteAccount = () => {
    // Implement delete account logic
    console.log('Delete account clicked')
  }

  const handleCustomerSupport = () => {
    // Implement customer support logic
    console.log('Customer support clicked')
  }

  return (
    <main className="min-h-screen space-y-4 bg-gray-100 dark:bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-blue-400 dark:bg-blue-600 text-white rounded-b-[28px] shadow-sm">
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
            <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Notifications</h2>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="">
                    <IconBell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm md:text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100">Notifications</span>
                </div>
                <ToggleSwitch 
                  enabled={notificationsEnabled} 
                  onChange={setNotificationsEnabled} 
                />
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-2">
            <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Support</h2>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <button
                onClick={handleCustomerSupport}
                className="w-full px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              >
                <div className="">
                  <IconQuestionMark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm md:text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100">Customer Support</span>
              </button>
            </div>
          </div>

          {/* Account Management Section */}
          <div className="mb-2">
            <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Management</h2>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                >
                  <div className="">
                    <IconLogout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm md:text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100">Logout</span>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                >
                  <div className="">
                    <IconTrash className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm md:text-base lg:text-lg font-medium text-red-600 dark:text-red-400">Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}