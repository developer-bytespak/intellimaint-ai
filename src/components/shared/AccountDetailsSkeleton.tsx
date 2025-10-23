import type React from "react"


export default function AccountDetailsSkeleton() {
  return (
    <main className="min-h-screen pt-3 space-y-4">
      {/* Header */}
      <header className="">
        {/* <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6 pt-10 pb-24 md:pb-28"> */}
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 bg-white/20 rounded animate-pulse" />
            <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1">Account Details</h1>
          </div>
        {/* </div> */}
      </header>

      {/* Content */}
      <section className="">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          {/* Profile Picture Skeleton */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-24  w-24 md:h-28 md:w-28 rounded-full bg-gray-300 animate-pulse" />
              <div className="absolute bottom-1 right-1 h-6 w-6 bg-gray-300 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
              <div className="h-12 bg-gray-300 rounded-lg animate-pulse" />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
              <div className="h-12 bg-gray-300 ro unded-lg animate-pulse" />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
              <div className="h-12 bg-gray-300 rounded-lg animate-pulse" />
            </div>

            {/* Account Type Field */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
              <div className="h-12 bg-gray-300 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
