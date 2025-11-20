"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useChat } from "@/hooks/useChat"
import { useState, useEffect, Suspense } from "react"

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function IconCopy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <polygon points="5,3 19,12 5,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SavedPromptsContent() {
  const router = useRouter()
  const { chats } = useChat()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filter: string) => {
    setActiveFilter(filter)
  }

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content)
    // You could add a toast notification here
  }

  const handleDeletePrompt = (chatId: string) => {
    // Implement delete functionality
    console.log('Delete prompt:', chatId)
  }

  const handleUsePrompt = (chatId: string) => {
    router.push(`/chat?prompt=${chatId}`)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getCategoryFromTitle = (title: string) => {
    if (title.toLowerCase().includes('generator')) return 'Generator'
    if (title.toLowerCase().includes('engine')) return 'Engine'
    if (title.toLowerCase().includes('power')) return 'Power'
    if (title.toLowerCase().includes('voltage')) return 'Electrical'
    return 'General'
  }

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (activeFilter === 'all') return matchesSearch
    
    const category = getCategoryFromTitle(chat.title)
    return matchesSearch && category.toLowerCase() === activeFilter.toLowerCase()
  })

  const categories = ['all', 'generator', 'engine', 'power', 'electrical']

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-[var(--color-background)]">
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
          <h1 className="text-center text-pretty text-2xl md:text-3xl font-semibold flex-1 pr-4">Saved Prompts</h1>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-4 pt-6">
        <section className="">
          <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
            
            {isInitialLoading ? (
              // Skeleton Loading State
              <>
                {/* Search Bar Skeleton */}
                <div className="mb-6">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>

                {/* Filter Tabs Skeleton */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>

                {/* Prompts List Skeleton */}
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ml-4" />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button Skeleton */}
                <div className="mt-8 text-center">
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto" />
                </div>
              </>
            ) : (
              // Actual Content
              <>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search saved prompts..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                  <div className="flex gap-2 overflow-x-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleFilter(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          activeFilter === category
                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompts List */}
                <div className="space-y-4">
                  {filteredChats.map((chat) => (
                    <div key={chat.id} className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{chat.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{formatDate(chat.updatedAt)}</span>
                            <span>•</span>
                            <span>{getCategoryFromTitle(chat.title)}</span>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                          <IconHeart className="h-5 w-5 text-red-500 dark:text-red-400" />
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                          {chat.messages[0]?.content || 'No content available'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full">
                            {chat.messages.length} messages
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {Math.ceil(chat.messages.reduce((acc, msg) => acc + msg.content.length, 0) / 100)} min read
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUsePrompt(chat.id)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Use this prompt"
                          >
                            <IconPlay className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(chat.messages[0]?.content || '')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy prompt"
                          >
                            <IconCopy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(chat.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete prompt"
                          >
                            <IconTrash className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {filteredChats.length > 0 && (
                  <div className="mt-8 text-center">
                    <button className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                      Load More Prompts
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {filteredChats.length === 0 && (
                  <div className="text-center py-12">
                    <IconHeart className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No saved prompts found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery ? 'Try adjusting your search terms' : 'Start saving prompts from your chat sessions'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
    </div>
    </main>
  )
}

export default function SavedPromptsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1A1D26] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <SavedPromptsContent />
    </Suspense>
  );
}


