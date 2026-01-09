"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import AccountDetailsSkeleton from "@/components/shared/AccountDetailsSkeleton"
import { useUser } from "@/hooks/useUser"
import PageTransition from '@/components/ui/PageTransition'

// Icons
function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// Form validation schema
const accountDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional(), // Password is not used in profile updates, handled separately
  accountType: z.string(),
})

type AccountDetailsForm = z.infer<typeof accountDetailsSchema>

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { user, isLoading, updateUser, changePassword, uploadProfileImage, deleteProfileImage } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showCameraMenu, setShowCameraMenu] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AccountDetailsForm>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: "",
    },
  })

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        password: "", // Password is not stored/displayed for security
        accountType: user.accountType || "",
      })
    }
  }, [user, reset])

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

  const onSubmit = async (data: AccountDetailsForm) => {
    try {
      console.log("Form submitted with data:", data)
      console.log("Saving profile with name:", data.name)
      
      // Only send name since email and accountType are disabled (read-only)
      if (!data.name || data.name.trim().length < 2) {
        toast.error("Name must be at least 2 characters")
        return
      }
      
      console.log("Calling updateUser mutation...")
      const result = await updateUser.mutateAsync({
        name: data.name.trim(),
      })
      console.log("Profile update result:", result)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error: unknown) {
      console.error("Failed to update account details:", error)
      const axiosError = error as { response?: { data?: { message?: string; data?: string[] } }; message?: string }
      console.error("Error response:", axiosError?.response)
      console.error("Error response data:", axiosError?.response?.data)
      const errorMessage = 
        axiosError?.response?.data?.message || 
        axiosError?.response?.data?.data?.[0] || 
        axiosError?.message || 
        "Failed to update account details. Please check your connection and try again."
      toast.error(errorMessage)
    }
  }

  const handleEditName = () => {
    setIsEditing(true)
  }

  const handleChangePassword = () => {
    setShowChangePasswordModal(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
  }

  const handleClosePasswordModal = () => {
    setShowChangePasswordModal(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleSubmitPasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      })
      handleClosePasswordModal()
      toast.success("Password changed successfully")
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      setPasswordError(axiosError?.response?.data?.message || "Failed to change password")
    }
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
      toast.error('Unable to access camera. Please check your permissions.')
    }
  }

  const handleUploadImage = () => {
    fileInputRef.current?.click()
    setShowCameraMenu(false)
  }

  const handleTakePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        handleCloseCamera()
        
        setIsUploadingImage(true)
        try {
          // Convert canvas to blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              setIsUploadingImage(false)
              toast.error('Failed to capture image')
              return
            }

            try {
              // Delete old image if exists
              const currentImageUrl = user?.profileImage || user?.profileImageUrl
              if (currentImageUrl && currentImageUrl.includes('blob.vercel-storage.com')) {
                try {
                  await deleteProfileImage.mutateAsync(currentImageUrl)
                } catch (error) {
                  console.warn('Failed to delete old image:', error)
                  // Continue with upload even if delete fails
                }
              }

              // Convert blob to File
              const file = new File([blob], 'captured-image.png', { type: 'image/png' })
              
              // Upload new image
              const result = await uploadProfileImage.mutateAsync(file)
              toast.success('Profile image updated successfully')
            } catch (error) {
              console.error('Failed to update profile image:', error)
              toast.error(error instanceof Error ? error.message : 'Failed to update profile image')
            } finally {
              setIsUploadingImage(false)
            }
          }, 'image/png')
        } catch (error) {
          console.error('Failed to process captured image:', error)
          toast.error('Failed to process captured image')
          setIsUploadingImage(false)
        }
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

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)")
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB")
      return
    }

    setIsUploadingImage(true)
    try {
      // Delete old image if exists
      const currentImageUrl = user?.profileImage || user?.profileImageUrl
      if (currentImageUrl && currentImageUrl.includes('blob.vercel-storage.com')) {
        try {
          await deleteProfileImage.mutateAsync(currentImageUrl)
        } catch (error) {
          console.warn("Failed to delete old image:", error)
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      const result = await uploadProfileImage.mutateAsync(file)
      toast.success("Profile image updated successfully")
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: unknown) {
      console.error("Failed to update profile image:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile image"
      toast.error(errorMessage)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteProfileImage = async () => {
    const currentImageUrl = user?.profileImage || user?.profileImageUrl
    if (!currentImageUrl || currentImageUrl === '/images/img1.png') {
      toast.info("No profile image to delete")
      return
    }

    if (!confirm("Are you sure you want to remove your profile image?")) {
      return
    }

    try {
      // Only delete from Vercel Blob if it's a Vercel Blob URL
      if (currentImageUrl.includes('blob.vercel-storage.com')) {
        await deleteProfileImage.mutateAsync(currentImageUrl)
      } else {
        // For non-Vercel Blob URLs (e.g., base64), just remove from profile
        await updateUser.mutateAsync({ profileImageUrl: '' })
      }
      // User query will be invalidated by the mutation, causing immediate UI update
      toast.success("Profile image removed successfully")
    } catch (error: unknown) {
      console.error("Failed to delete profile image:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete profile image"
      toast.error(errorMessage)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <PageTransition>
        <AccountDetailsSkeleton />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="w-full h-full space-y-4 bg-[#1f2632] text-white">
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
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1 pr-4">Account Details</h1>
        </div>
      </header>

      {/* Content (scrollable) */}
      <div className="flex-1 overflow-y-auto scroll-smooth pb-24 sm:pb-12">
        <section className="">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center mb-1">
              <div className="relative camera-menu-container">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-blue-400 overflow-hidden bg-white/10 backdrop-blur-sm ring-4 ring-white/10 shadow-lg">
                  {isUploadingImage ? (
                    <div className="h-full w-full flex items-center justify-center bg-white/5">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (user?.profileImage || user?.profileImageUrl) ? (
                    <img
                      src={user.profileImage || user.profileImageUrl}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-white/5">
                      <IconUser className="h-12 w-12 md:h-14 md:w-14 text-white/50" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCameraClick}
                  disabled={isUploadingImage}
                  className="absolute bottom-1 right-1 inline-flex items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white/10 h-6 w-6 shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                >
                  <IconCamera className="h-3 w-3" />
                </button>
                
                {/* Delete button - visible when image exists (not default placeholder) */}
                {((user?.profileImage || user?.profileImageUrl) && 
                  (user?.profileImage !== '/images/img1.png' && user?.profileImageUrl !== '/images/img1.png') && 
                  !isUploadingImage) && (
                  <button
                    type="button"
                    onClick={handleDeleteProfileImage}
                    disabled={deleteProfileImage.isPending}
                    className="absolute top-1 right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white ring-2 ring-white/10 h-6 w-6 shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    aria-label="Remove profile picture"
                    title="Remove profile picture"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {/* Camera menu dropdown */}
                {showCameraMenu && !isUploadingImage && (
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-300 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-400 dark:border-gray-600 py-2 min-w-[180px] z-20">
                    <button
                      type="button"
                      onClick={handleCaptureImage}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <IconCamera className="h-4 w-4" />
                      Capture Image
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <IconFolder className="h-4 w-4" />
                      Upload from Media
                    </button>
                    {(user?.profileImage || user?.profileImageUrl) && 
                     (user?.profileImage !== '/images/img1.png' && user?.profileImageUrl !== '/images/img1.png') && (
                      <>
                        <div className="border-t border-gray-400 dark:border-gray-600 my-1"></div>
                        <button
                          type="button"
                          onClick={handleDeleteProfileImage}
                          disabled={deleteProfileImage.isPending}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove Image
                        </button>
                      </>
                    )}
                  </div>
                )}

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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleProfileImageChange}
                  disabled={isUploadingImage}
                />
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-white">
                Name
              </label>
              <div className="relative">
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter your name"
                />
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleEditName}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                disabled
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  disabled
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Account Type Field */}
            <div className="space-y-2">
              <label htmlFor="accountType" className="block text-sm font-medium text-white">
                Account type
              </label>
              <div className="relative">
                <input
                  {...register("accountType")}
                  type="text"
                  id="accountType"
                  disabled
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Account type"
                />
                {user?.isVerified && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm font-medium">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    if (user) {
                      reset({
                        name: user.name || "",
                        email: user.email || "",
                        password: "", // Password is not stored/displayed for security
                        accountType: user.accountType || "",
                      })
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/15 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>

          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <g fill="currentColor">
                              <path clipRule="evenodd" d="m20.5303 4.53033c.2929-.29289.2929-.76777 0-1.06066s-.7677-.29289-1.0606 0l-16.00003 16.00003c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0l2.8469-2.8469c1.3663.6432 2.93997 1.0666 4.62277 1.0666 2.684 0 5.0903-1.0771 6.8206-2.405.8668-.6653 1.5826-1.4074 2.0883-2.1361.4917-.7086.8411-1.4862.8411-2.2089s-.3494-1.5003-.8411-2.20885c-.5057-.72871-1.2215-1.47087-2.0883-2.13612-.2621-.20118-.5398-.39661-.8316-.5834zm-3.6308 3.6308-1.7708 1.77083c.3926.59284.6213 1.30374.6213 2.06804 0 2.0711-1.6789 3.75-3.75 3.75-.7643 0-1.4752-.2287-2.06804-.6213l-1.41672 1.4167c1.06553.4341 2.24686.7046 3.48476.7046 2.2865 0 4.3802-.9229 5.9073-2.095.7619-.5847 1.3641-1.2176 1.7693-1.8014.4191-.6039.5734-1.0763.5734-1.3536s-.1543-.7497-.5734-1.3536c-.4052-.5838-1.0074-1.21668-1.7693-1.80143-.3132-.24036-.6502-.47025-1.0078-.68384zm-5.8696 5.86957c.2938.1406.6227.2193.9701.2193 1.2426 0 2.25-1.0074 2.25-2.25 0-.3474-.0787-.6763-.2193-.9701z" fillRule="evenodd"></path>
                              <path d="m12 5.25c1.0323 0 2.0236.15934 2.9511.43101.1785.05227.2316.27561.1002.40709l-.8246.82455c-.0619.06186-.1515.08663-.2367.06702-.6394-.1471-1.3061-.22967-1.99-.22967-2.28655 0-4.38022.92292-5.90733 2.09497-.76189.58475-1.3641 1.21763-1.76924 1.80143-.41912.6039-.57343 1.0763-.57343 1.3536s.15431.7497.57343 1.3536c.35382.5099.85795 1.0571 1.48748 1.5771.11586.0957.1269.2708.02065.3771l-.70891.7089c-.09031.0903-.23442.0982-.33228.0162-.69298-.5812-1.27135-1.2074-1.69927-1.824-.49173-.7086-.8411-1.4862-.8411-2.2089s.34937-1.5003.8411-2.20885c.50571-.72871 1.22152-1.47087 2.08831-2.13612 1.73024-1.32795 4.13657-2.40503 6.82059-2.40503z"></path>
                              <path d="m12 8.25c.1185 0 .2357.00549.3513.01624.1969.01829.2681.25367.1283.39346l-1.2122 1.21226c-.6533.22484-1.1706.74214-1.39544 1.39544l-1.21226 1.2122c-.13979.1398-.37517.0686-.39346-.1283-.01075-.1156-.01624-.2328-.01624-.3513 0-2.07107 1.67893-3.75 3.75-3.75z"></path>
                            </g>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <g fill="currentColor">
                              <path clipRule="evenodd" d="m20.5303 4.53033c.2929-.29289.2929-.76777 0-1.06066s-.7677-.29289-1.0606 0l-16.00003 16.00003c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0l2.8469-2.8469c1.3663.6432 2.93997 1.0666 4.62277 1.0666 2.684 0 5.0903-1.0771 6.8206-2.405.8668-.6653 1.5826-1.4074 2.0883-2.1361.4917-.7086.8411-1.4862.8411-2.2089s-.3494-1.5003-.8411-2.20885c-.5057-.72871-1.2215-1.47087-2.0883-2.13612-.2621-.20118-.5398-.39661-.8316-.5834zm-3.6308 3.6308-1.7708 1.77083c.3926.59284.6213 1.30374.6213 2.06804 0 2.0711-1.6789 3.75-3.75 3.75-.7643 0-1.4752-.2287-2.06804-.6213l-1.41672 1.4167c1.06553.4341 2.24686.7046 3.48476.7046 2.2865 0 4.3802-.9229 5.9073-2.095.7619-.5847 1.3641-1.2176 1.7693-1.8014.4191-.6039.5734-1.0763.5734-1.3536s-.1543-.7497-.5734-1.3536c-.4052-.5838-1.0074-1.21668-1.7693-1.80143-.3132-.24036-.6502-.47025-1.0078-.68384zm-5.8696 5.86957c.2938.1406.6227.2193.9701.2193 1.2426 0 2.25-1.0074 2.25-2.25 0-.3474-.0787-.6763-.2193-.9701z" fillRule="evenodd"></path>
                              <path d="m12 5.25c1.0323 0 2.0236.15934 2.9511.43101.1785.05227.2316.27561.1002.40709l-.8246.82455c-.0619.06186-.1515.08663-.2367.06702-.6394-.1471-1.3061-.22967-1.99-.22967-2.28655 0-4.38022.92292-5.90733 2.09497-.76189.58475-1.3641 1.21763-1.76924 1.80143-.41912.6039-.57343 1.0763-.57343 1.3536s.15431.7497.57343 1.3536c.35382.5099.85795 1.0571 1.48748 1.5771.11586.0957.1269.2708.02065.3771l-.70891.7089c-.09031.0903-.23442.0982-.33228.0162-.69298-.5812-1.27135-1.2074-1.69927-1.824-.49173-.7086-.8411-1.4862-.8411-2.2089s.34937-1.5003.8411-2.20885c.50571-.72871 1.22152-1.47087 2.08831-2.13612 1.73024-1.32795 4.13657-2.40503 6.82059-2.40503z"></path>
                              <path d="m12 8.25c.1185 0 .2357.00549.3513.01624.1969.01829.2681.25367.1283.39346l-1.2122 1.21226c-.6533.22484-1.1706.74214-1.39544 1.39544l-1.21226 1.2122c-.13979.1398-.37517.0686-.39346-.1283-.01075-.1156-.01624-.2328-.01624-.3513 0-2.07107 1.67893-3.75 3.75-3.75z"></path>
                            </g>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <g fill="currentColor">
                              <path clipRule="evenodd" d="m20.5303 4.53033c.2929-.29289.2929-.76777 0-1.06066s-.7677-.29289-1.0606 0l-16.00003 16.00003c-.29289.2929-.29289.7677 0 1.0606s.76777.2929 1.06066 0l2.8469-2.8469c1.3663.6432 2.93997 1.0666 4.62277 1.0666 2.684 0 5.0903-1.0771 6.8206-2.405.8668-.6653 1.5826-1.4074 2.0883-2.1361.4917-.7086.8411-1.4862.8411-2.2089s-.3494-1.5003-.8411-2.20885c-.5057-.72871-1.2215-1.47087-2.0883-2.13612-.2621-.20118-.5398-.39661-.8316-.5834zm-3.6308 3.6308-1.7708 1.77083c.3926.59284.6213 1.30374.6213 2.06804 0 2.0711-1.6789 3.75-3.75 3.75-.7643 0-1.4752-.2287-2.06804-.6213l-1.41672 1.4167c1.06553.4341 2.24686.7046 3.48476.7046 2.2865 0 4.3802-.9229 5.9073-2.095.7619-.5847 1.3641-1.2176 1.7693-1.8014.4191-.6039.5734-1.0763.5734-1.3536s-.1543-.7497-.5734-1.3536c-.4052-.5838-1.0074-1.21668-1.7693-1.80143-.3132-.24036-.6502-.47025-1.0078-.68384zm-5.8696 5.86957c.2938.1406.6227.2193.9701.2193 1.2426 0 2.25-1.0074 2.25-2.25 0-.3474-.0787-.6763-.2193-.9701z" fillRule="evenodd"></path>
                              <path d="m12 5.25c1.0323 0 2.0236.15934 2.9511.43101.1785.05227.2316.27561.1002.40709l-.8246.82455c-.0619.06186-.1515.08663-.2367.06702-.6394-.1471-1.3061-.22967-1.99-.22967-2.28655 0-4.38022.92292-5.90733 2.09497-.76189.58475-1.3641 1.21763-1.76924 1.80143-.41912.6039-.57343 1.0763-.57343 1.3536s.15431.7497.57343 1.3536c.35382.5099.85795 1.0571 1.48748 1.5771.11586.0957.1269.2708.02065.3771l-.70891.7089c-.09031.0903-.23442.0982-.33228.0162-.69298-.5812-1.27135-1.2074-1.69927-1.824-.49173-.7086-.8411-1.4862-.8411-2.2089s.34937-1.5003.8411-2.20885c.50571-.72871 1.22152-1.47087 2.08831-2.13612 1.73024-1.32795 4.13657-2.40503 6.82059-2.40503z"></path>
                              <path d="m12 8.25c.1185 0 .2357.00549.3513.01624.1969.01829.2681.25367.1283.39346l-1.2122 1.21226c-.6533.22484-1.1706.74214-1.39544 1.39544l-1.21226 1.2122c-.13979.1398-.37517.0686-.39346-.1283-.01075-.1156-.01624-.2328-.01624-.3513 0-2.07107 1.67893-3.75 3.75-3.75z"></path>
                            </g>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitPasswordChange}
                    disabled={changePassword.isPending}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {changePassword.isPending ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </section>
      </div>
      </main>
    </PageTransition>
  )
}