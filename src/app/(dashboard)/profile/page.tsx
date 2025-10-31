"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFolder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 7h5l2 2h11v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.07a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.07a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 114 3.29l.06.06a1.65 1.65 0 001.82.33H6a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.07a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c0 .66.39 1.26 1 1.51.2.09.42.14.64.14H21a2 2 0 110 4h-.07c-.22 0-.44.05-.64.14-.61.25-1 .85-1 1.51z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCamera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 8h3l2-2h6l2 2h3v10H4V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
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

export default function ProfilePage() {
  const router = useRouter()
  
  const items = [
    { label: "Account Details", icon: IconUser, href: "/account" },
    { label: "Credits", icon: IconWallet, href: "/credits" },
    { label: "Saved Prompts", icon: IconHeart, href: "/saved-prompts" },
    { label: "Repository (Military Products)", icon: IconFolder, href: "/repository" },
    { label: "Settings", icon: IconSettings, href: "/settings" },
  ]

  const handleItemClick = (href: string) => {
    router.push(href)
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Header */}
      <header className="bg-[var(--color-brand)] text-[var(--color-brand-foreground)] rounded-b-[28px]">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6 pt-10 pb-24 md:pb-28">
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold">Your Profile</h1>
        </div>
      </header>

      {/* Profile section */}
      <section className="relative  pb-8 -mt-16 md:-mt-20">
        <div className="mx-auto   max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          <div className="relative   mx-auto h-28 w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 rounded-full overflow-hidden bg-[var(--color-card)] ring-4 ring-[var(--color-background)] shadow-lg">
            <Image
              src="/diverse-profile-avatars.png"
              alt="Profile avatar"
              width={144}
              height={144}
              className="h-full w-full  object-cover"
            />
            {/* camera badge */}
            <span
              aria-hidden="true"
              className="absolute  bottom-1.5 right-1.5 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-brand-foreground)] ring-2 ring-[var(--color-background)] h-7 w-7 shadow-md"
            >
              <IconCamera className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-4 text-center">
            <p className="text-base md:text-lg lg:text-xl font-semibold tracking-tight">Leslie Moses</p>
            <p className="text-sm md:text-base lg:text-lg text-[color:var(--muted-foreground)]">lesliemoses874@gmail.com</p>
          </div>

          {/* list card */}
          <div className="mt-6 rounded-2xl bg-[var(--color-secondary)] border border-[color:var(--border)]/10 shadow-lg">
            <ul role="list" className="divide-y divide-[color:var(--border)]/10">
              {items.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(href)}
                    className="w-full px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/60 rounded-2xl hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] transition-colors"
                    aria-label={label}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-[color:var(--muted-foreground)]" />
                      <span className="text-sm md:text-base lg:text-lg">{label}</span>
                    </span>
                    <IconChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-[color:var(--muted-foreground)]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* subscription card */}
          <div className="mt-6 rounded-2xl bg-[var(--color-secondary)] border border-[color:var(--border)]/10 p-1 shadow-lg">
            <div className="rounded-xl bg-[var(--color-brand)] text-[var(--color-brand-foreground)] px-5 py-4 lg:px-6 lg:py-5 flex items-center justify-between">
              <span className="font-medium text-sm md:text-base lg:text-lg">Subscription</span>
              <span className="text-xs md:text-sm lg:text-base px-3 py-1 rounded-full bg-[var(--color-brand-foreground)]/15 text-[var(--color-brand-foreground)] flex items-center gap-1">
                <IconCrown className="h-4 w-4" />
                Premium
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
