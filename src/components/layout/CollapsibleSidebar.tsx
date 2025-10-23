"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconMessage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 22a9 9 0 1118 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCrown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const navigationItems = [
  { name: 'Chat', href: '/chat', icon: IconMessage },
  { name: 'History', href: '/saved-prompts', icon: IconClock },
  { name: 'Account', href: '/account', icon: IconUser },
  { name: 'Profile', href: '/profile', icon: IconUser },
]

export default function CollapsibleSidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-full bg-[var(--color-secondary)] border-r border-[color:var(--border)]/10 transition-all duration-300 ease-in-out hidden lg:block ${
        isHovered ? 'w-64' : 'w-12' // -4
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Brand area */}
        <div className="flex h-16 items-center justify-center border-b border-[color:var(--border)]/10">
          {isHovered ? (
            <span className="text-lg font-semibold text-[var(--color-foreground)]">IntelliMaint</span>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center">
              <span className="text-sm font-bold text-[var(--color-brand-foreground)]">IM</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-1 py-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--color-brand)] text-[var(--color-brand-foreground)]'
                        : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]'
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-[var(--color-brand-foreground)]' : 'text-[var(--color-muted-foreground)]'
                      }`}
                    />
                    {isHovered && (
                      <span className="ml-3 transition-opacity duration-200">{item.name}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
