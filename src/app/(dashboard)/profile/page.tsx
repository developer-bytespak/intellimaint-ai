"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [showCameraMenu, setShowCameraMenu] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  const handleBack = () => {
    router.push("/chat")
  }

  const handleCameraClick = () => {
    setShowCameraMenu(!showCameraMenu)
  }

  const handleCaptureImage = async () => {
    setShowCameraMenu(false)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(mediaStream)
      setShowCameraModal(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check your permissions.')
    }
  }

  const handleUploadImage = () => {
    fileInputRef.current?.click()
    setShowCameraMenu(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageDataUrl = canvas.toDataURL('image/png')
        setProfileImage(imageDataUrl)
        handleCloseCamera()
      }
    }
  }

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCameraModal(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCameraMenu && !(event.target as Element).closest('.camera-menu-container')) {
        setShowCameraMenu(false)
      }
    }

    if (showCameraMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showCameraMenu])

  // Set video stream when modal opens and stream is available
  useEffect(() => {
    if (showCameraModal && stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error)
      })
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [showCameraModal, stream])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Header */}
      <header className="bg-blue-400 dark:bg-blue-600 text-white rounded-b-[28px] shadow-sm">
        <div className="flex items-center gap-2 pt-6 pb-24 md:pb-28">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-blue-500 dark:hover:bg-blue-700 rounded-full transition-colors ml-4"
            aria-label="Go back"
          >
            <IconChevronLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1 pr-4">Your Profile</h1>
        </div>
      </header>

      {/* Profile section */}
      <section className="relative pb-8 -mt-16 md:-mt-20">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          <div className="relative mx-auto h-28 w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 rounded-full bg-gray-100 dark:bg-gray-800 ring-4 ring-gray-50 dark:ring-gray-900 shadow-xl camera-menu-container">
            <div className="h-full w-full rounded-full overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <IconUser className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            {/* camera badge */}
            <button
              type="button"
              onClick={handleCameraClick}
              className="absolute bottom-1.5 right-1.5 inline-flex items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-white ring-2 ring-gray-50 dark:ring-gray-900 h-7 w-7 shadow-lg hover:scale-110 transition-transform z-10"
              aria-label="Change profile picture"
            >
              <IconCamera className="h-4 w-4" />
            </button>
            
            {/* Camera menu dropdown */}
            {showCameraMenu && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-20">
                <button
                  type="button"
                  onClick={handleCaptureImage}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IconCamera className="h-4 w-4" />
                  Capture Image
                </button>
                <button
                  type="button"
                  onClick={handleUploadImage}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IconFolder className="h-4 w-4" />
                  Upload from Media
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Camera Modal */}
          {showCameraModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full">
                <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                  >
                    Capture
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-base md:text-lg lg:text-xl font-semibold tracking-tight text-[var(--color-foreground)]">Leslie Moses</p>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 mt-1">lesliemoses874@gmail.com</p>
          </div>

          {/* list card */}
          <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(href)}
                    className="w-full px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/60 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                    aria-label={label}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500 dark:text-gray-400 group-hover:text-[var(--color-brand)] transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg text-[var(--color-foreground)]">{label}</span>
                    </span>
                    <IconChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-500 group-hover:text-[var(--color-brand)] transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* subscription card */}
          <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 shadow-lg">
            <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-5 py-4 lg:px-6 lg:py-5 flex items-center justify-between">
              <span className="font-medium text-sm md:text-base lg:text-lg">Subscription</span>
              <span className="text-xs md:text-sm lg:text-base px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center gap-1.5 font-medium">
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
