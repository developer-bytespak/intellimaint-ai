"use client"

import { BottomNavigation } from '@/components/features/chat/Navigation'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'info' | 'profile'>('chat')
  const [isMobile, setIsMobile] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    // If user data is still loading, wait for it
    if (isLoading) {
      console.log('[DashboardLayout] User data is loading...')
      return
    }

    // If user is not authenticated and loading is done, redirect to login
    if (!user && !isLoading) {
      console.log('[DashboardLayout] User not authenticated, redirecting to login', { user, isLoading })
      router.replace('/login')
    } else if (user) {
      // User is authenticated
      console.log('[DashboardLayout] User authenticated:', user.email)
      setIsChecking(false)
    }
  }, [user, isLoading, router])

  // Update active tab based on current pathname
  useEffect(() => {
    if (pathname === '/chat') setActiveTab('chat')
    else if (pathname === '/recent-history') setActiveTab('history')
    else if (pathname === '/app-info') setActiveTab('info')
    else if (pathname === '/profile') setActiveTab('profile')
  }, [pathname])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
      console.log(window.innerWidth)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleTabChange = (tab: 'chat' | 'history' | 'info' | 'profile') => {
    setActiveTab(tab)
    // Navigate to the appropriate route
    const routes = {
      chat: '/chat',
      history: '/recent-history',
      info: '/app-info',
      profile: '/profile'
    }
    router.push(routes[tab])
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] ">
      {/* Show loading spinner while checking authentication */}
      {(isLoading || isChecking) ? (
        <div className="flex items-center justify-center w-full h-screen">
          <LoadingSpinner />
        </div>
      ) : !user ? (
        // User not authenticated - will redirect via useEffect
        <div className="flex items-center justify-center w-full h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Main content */}
          <main
            className={`flex-1 transition-all duration-300 ease-in-out overflow-x-hidden ${isMobile ? 'pb-28' : ''}`}
            style={isMobile ? { paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' } : undefined}
          >
            {children}
          </main>

          {/* Mobile Bottom Navigation - Only visible on mobile */}
          {isMobile && (
            <BottomNavigation 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
            />
          )}
        </>
      )}
    </div>
  );
}
