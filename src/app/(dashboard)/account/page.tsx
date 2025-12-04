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
  const router = useRouter()
  const { user, isLoading, updateUser, changePassword } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string
        try {
          await updateUser.mutateAsync({ profileImageUrl: imageDataUrl })
          toast.success("Profile image updated successfully")
        } catch (error) {
          console.error("Failed to update profile image:", error)
          toast.error("Failed to update profile image")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return <AccountDetailsSkeleton />
  }

  return (
    <main className="min-h-screen space-y-4 bg-[#1f2632] text-white">
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
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1 pr-4">Account Details</h1>
        </div>
      </header>

      {/* Content */}
      <section className="">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center mb-1">
              <div className="relative">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-blue-400 overflow-hidden bg-white/10 backdrop-blur-sm ring-4 ring-white/10 shadow-lg">
                  <Image
                    src={user?.profileImage || user?.profileImageUrl || "/images/img1.png"}
                    alt="Profile avatar"
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 inline-flex items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white/10 h-6 w-6 shadow-md hover:bg-blue-600 transition-colors"
                  aria-label="Change profile picture"
                >
                  <IconCamera className="h-3 w-3" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
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
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Confirm new password"
                    />
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
    </main>
  )
}