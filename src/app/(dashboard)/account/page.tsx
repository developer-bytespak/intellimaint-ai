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
function IconArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const { user, isLoading, error, updateUser } = useUser()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
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
      await updateUser({
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
    <main className=" min-h-screen pt-3 space-y-4">
      {/* Header */}
      <header className="">
        {/* <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6 pt-10 pb-24 md:pb-28"> */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <IconArrowLeft className="h-6 w-6 border border-white/10 rounded p-.5" />
            </button>
            <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1">Account Details</h1>
          </div>
        {/* </div> */}
      </header>

      {/* Content */}
      <section className="">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center mb-1 ">
              <div className="relative">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-blue-400 overflow-hidden bg-[var(--color-card)] ring-4 ring-[var(--color-background)] shadow-lg">
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
                  className="absolute bottom-1 right-1 inline-flex items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-brand-foreground)] ring-2 ring-[var(--color-background)] h-6 w-6 shadow-md hover:bg-[var(--color-brand)]/90 transition-colors"
                  aria-label="Change profile picture"
                >
                  <IconCamera className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-foreground)]">
                Name
              </label>
              <div className="relative">
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-transparent border border-[color:var(--border)]/20 rounded-full text-[#f0f0f0] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter your name"
                />
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleEditName}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-brand)] hover:text-[var(--color-brand)]/80 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-foreground)]">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                disabled
                className="w-full px-4 py-3 bg-transparent  border border-[color:var(--border)]/20 rounded-full text-[#f0f0f0] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-foreground)]">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  disabled
                  className="w-full px-4 py-3 bg-transparent  border border-[color:var(--border)]/20 rounded-full text-[#f0f0f0] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-brand)] hover:text-[var(--color-brand)]/80 text-sm font-medium transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Account Type Field */}
            <div className="space-y-2">
              <label htmlFor="accountType" className="block text-sm font-medium text-[var(--color-foreground)]">
                Account type
              </label>
              <div className="relative">
                <input
                  {...register("accountType")}
                  type="text"
                  id="accountType"
                  disabled
                  className="w-full px-4 py-3 bg-bg-transparent  border border-[color:var(--border)]/20 rounded-full text-[#f0f0f0] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Account type"
                />
                {user?.isVerified && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm font-medium">
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
                  className="flex-1 px-4 py-3 bg-[var(--color-secondary)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-accent)] hover:text-[#000] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-[var(--color-brand)] text-[var(--color-brand-foreground)] rounded-lg hover:bg-[var(--color-brand)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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