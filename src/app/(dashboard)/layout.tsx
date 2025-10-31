"use client"

import { BottomNavigation } from '@/components/features/chat/Navigation'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'info' | 'profile'>('chat')
  const [isMobile, setIsMobile] = useState(false)

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
      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ease-in-out overflow-x-hidden ${
        isMobile ? 'pb-0' : ''
      }`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      {isMobile && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      )}
    </div>
  );
}


