"use client"

import type React from "react"
import { useRouter } from "next/navigation"

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function RepositoryPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
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
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1 pr-4">Repository</h1>
        </div>
      </header>

      {/* Content */}
      <section className="">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Repository (Military Products)</h2>
            <p className="text-gray-600 dark:text-gray-400">Product grid and filters will be displayed here</p>
          </div>
        </div>
      </section>
    </main>
  )
}


