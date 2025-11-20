"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  password: z.string().min(8, "Password must be at least 8 characters"),
  accountType: z.string(),
})

type AccountDetailsForm = z.infer<typeof accountDetailsSchema>

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { user, isLoading, updateUser } = useUser()

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
        name: user.name,
        email: user.email,
        password: user.password,
        accountType: user.accountType,
      })
    }
  }, [user, reset])

  const onSubmit = async (data: AccountDetailsForm) => {
    try {
      await updateUser.mutateAsync({
        name: data.name,
        email: data.email,
        accountType: data.accountType,
      })
      setIsEditing(false)
      // Show success message or toast here
    } catch (error) {
      console.error("Failed to update account details:", error)
    }
  }

  const handleEditName = () => {
    setIsEditing(true)
  }

  const handleChangePassword = () => {
    // Navigate to change password page or open modal
    console.log("Change password clicked")
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
                    src={user?.profileImage || "/images/img1.png"}
                    alt="Profile avatar"
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute bottom-1 right-1 inline-flex items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white/10 h-6 w-6 shadow-md hover:bg-blue-600 transition-colors"
                  aria-label="Change profile picture"
                >
                  <IconCamera className="h-3 w-3" />
                </button>
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
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        accountType: user.accountType,
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
        </div>
      </section>
    </main>
  )
}