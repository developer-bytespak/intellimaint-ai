"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useCredits } from "@/hooks/useCredits"
import { useState, useEffect } from "react"

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconWallet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 7h14a4 4 0 014 4v2a4 4 0 01-4 4H3V7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 13h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CreditsPage() {
  const router = useRouter()
  const { balance, isLoading, transactions, packages, purchaseCredits } = useCredits()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handlePurchase = async (packageId: string) => {
    await purchaseCredits(packageId)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <IconPlus className="h-4 w-4 text-green-500" />
      case 'usage':
        return <IconArrowDown className="h-4 w-4 text-red-500" />
      case 'refund':
        return <IconArrowUp className="h-4 w-4 text-blue-500" />
      default:
        return <IconClock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 dark:bg-[var(--color-background)]">
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
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1 pr-4">Credits</h1>
        </div>
      </header>

      {/* Content */}
      <main className="space-y-4 pt-6">
        <section className="">
          <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
            
            {isInitialLoading ? (
              // Skeleton Loading State
              <>
                {/* Credits Balance Card Skeleton */}
                <div className="mb-6">
                  <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                    <div className="text-center">
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2" />
                      <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4" />
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                    </div>
                  </div>
                </div>

                {/* Purchase Options Skeleton */}
                <div className="mb-6">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                            <div>
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction History Skeleton */}
                <div className="mb-6">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                            <div>
                              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Actual Content
              <>
                {/* Credits Balance Card */}
                <div className="mb-6">
                  <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <IconWallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Available Credits</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{balance}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Credits remaining</div>
                    </div>
                  </div>
                </div>

                {/* Purchase Options */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Purchase Credits</h2>
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <IconWallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{pkg.name}</span>
                                {pkg.popular && (
                                  <span className="px-2 py-1 bg-green-600 dark:bg-green-500 text-white text-xs rounded-full">Popular</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{pkg.credits} credits</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handlePurchase(pkg.id)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                          >
                            ${pkg.price}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction History */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transaction History</h2>
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</div>
                            </div>
                          </div>
                          <div className={`font-medium ${
                            transaction.credits > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}



