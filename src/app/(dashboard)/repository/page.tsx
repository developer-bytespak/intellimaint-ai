"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useRepository, useDocuments, RepositoryDocument } from "@/hooks/useRepository"

// Icon Components
function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


function IconImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLandscape(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {/* Mountains/Hills */}
      <path d="M3 18l4-4 4 2 4-3 4 5H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      {/* Sun/Moon */}
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  )
}

function IconDownload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Types
interface UploadedItem {
  id: string
  file: File
  name: string
  size: number
  uploadProgress?: number
  isUploading?: boolean
  fileId?: string
  blobPath?: string
}

export default function RepositoryPage() {
  const router = useRouter()
  const [view, setView] = useState<'upload' | 'repository'>('upload')
  const [selectedFiles, setSelectedFiles] = useState<UploadedItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadDocument, deleteDocument } = useRepository()
  
  // Fetch documents from API with pagination (10 per page)
  const { data: documentsData, isLoading: isLoadingDocuments } = useDocuments(currentPage, 10)
  const uploadedItems: RepositoryDocument[] = documentsData?.documents || []
  const pagination = documentsData?.pagination
  const totalPages = pagination?.totalPages || 1

  const handleBack = () => {
    router.back()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleOpenDocument = (fileUrl: string) => {
    window.open(fileUrl, '_blank')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: UploadedItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate that it's a PDF
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        toast.error(`${file.name} is not a PDF file. Only PDF files are allowed.`)
        continue
      }

      newItems.push({
        id: Date.now().toString() + '-' + i,
        file,
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        isUploading: false,
      })
    }

    setSelectedFiles(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeSelectedFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(item => item.id !== id))
  }

  const handleSend = async () => {
    if (selectedFiles.length === 0) {
      toast.info('Please select at least one file to upload')
      return
    }

    try {
      // Set all files to uploading state
      const itemsWithProgress = selectedFiles.map(item => ({
        ...item,
        isUploading: true,
        uploadProgress: 0,
      }))
      setSelectedFiles(itemsWithProgress)

      // Upload files one by one with progress tracking
      const uploadPromises = selectedFiles.map(async (item) => {
        try {
          // Simulate progress: 0-30% (starting upload)
          for (let progress = 0; progress <= 30; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 50))
            setSelectedFiles(prev => 
              prev.map(p => p.id === item.id ? { ...p, uploadProgress: progress } : p)
            )
          }

          // Upload to server (which handles blob upload and DB save)
          await uploadDocument.mutateAsync(item.file)

          // Simulate progress: 30-100% (completing)
          for (let progress = 30; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 30))
            setSelectedFiles(prev => 
              prev.map(p => p.id === item.id ? { ...p, uploadProgress: progress } : p)
            )
          }

          return true
        } catch (error) {
          console.error(`Error uploading ${item.name}:`, error)
          throw error
        }
      })

      // Wait for all uploads to complete
      await Promise.all(uploadPromises)

      // Mark all as complete
      setSelectedFiles(prev => 
        prev.map(p => ({ ...p, isUploading: false, uploadProgress: 100 }))
      )

      // Clear selected files and switch to repository view
      setTimeout(() => {
        setSelectedFiles([])
        toast.success('Files uploaded successfully!')
        setView('repository')
        setCurrentPage(1) // Reset to first page after upload
      }, 500)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload files')
      // Reset uploading state
      setSelectedFiles(prev => 
        prev.map(p => ({ ...p, isUploading: false, uploadProgress: 0 }))
      )
    }
  }

  const handleDownload = async (item: RepositoryDocument) => {
    try {
      // Fetch the file to ensure we can download it
      const response = await fetch(item.fileUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch file')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = item.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      await deleteDocument.mutateAsync(id)
      toast.success('Document deleted successfully')
      // If we deleted the last item on the page and it's not page 1, go to previous page
      if (uploadedItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete document')
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }


  // Generate grid slots - show filled slots + empty slots (minimum 6, extends as needed)
  const minSlots = 6
  const maxSlots = Math.max(minSlots, Math.ceil(selectedFiles.length / 3) * 3)
  const slots = Array.from({ length: maxSlots }, (_, index) => {
    const file = selectedFiles[index]
    return { index, file }
  })

  return (
    <main className="min-h-screen bg-[#1f2632] text-white">
      {/* Header */}
      <header className="bg-blue-400 dark:bg-blue-600 text-white rounded-b-[28px] shadow-sm">
        <div className="flex items-center gap-2 pt-6 pb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-blue-500 dark:hover:bg-blue-700 rounded-full transition-colors ml-4"
            aria-label="Go back"
          >
            <IconChevronLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-center text-pretty text-xl md:text-2xl font-semibold flex-1 pr-4">
            {view === 'upload' ? 'Upload PDF Documents' : 'Repository'}
          </h1>
        </div>
      </header>

      {/* Toggle Button */}
      <div className="flex justify-center mt-6 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex gap-2">
          <button
            onClick={() => setView('upload')}
            className={`px-6 py-2 rounded-full transition-all text-sm font-medium ${
              view === 'upload'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setView('repository')}
            className={`px-6 py-2 rounded-full transition-all text-sm font-medium ${
              view === 'repository'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Repository
          </button>
        </div>
      </div>

      {/* Content */}
      <section className="pb-8">
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-6">
          {view === 'upload' ? (
            <>
              {/* Upload Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {slots.map(({ index, file }) => {
                  if (file) {
                    // Render filled slot with file
                    return (
                      <div
                        key={file.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border-2 border-white/10"
                      >
                        {/* PDF icon */}
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20 p-4">
                          <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="text-white text-xs text-center font-medium truncate w-full px-2" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-white/60 text-xs mt-1">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSelectedFile(file.id)
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
                          aria-label="Remove file"
                        >
                          <IconX className="h-4 w-4 text-white" />
                        </button>
                        {file.isUploading && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${file.uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    // Render empty slot placeholder
                    return (
                      <button
                        key={`empty-${index}`}
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#6B9BD1] bg-white/5 flex flex-col items-center justify-center gap-2 hover:border-[#8BB5E8] hover:bg-white/10 transition-colors"
                      >
                        <IconLandscape className="h-10 w-10 text-[#6B9BD1]" />
                      </button>
                    )
                  }
                })}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={selectedFiles.length === 0 || selectedFiles.some(f => f.isUploading)}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-colors shadow-lg mt-6"
              >
                {selectedFiles.some(f => f.isUploading) ? 'Uploading...' : 'Send'}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          ) : (
            <>
              {/* Repository View */}
              <div className="mb-4">
                <p className="text-white/70 text-sm">For Military Equipment</p>
              </div>

              {isLoadingDocuments ? (
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-white/70">Loading documents...</p>
                </div>
              ) : uploadedItems.length === 0 ? (
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg p-8 text-center">
                  <IconImage className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No items uploaded yet</p>
                  <p className="text-white/50 text-sm mt-2">Switch to Upload view to add files</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {uploadedItems.map((item) => {
                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer hover:bg-white/15 transition-colors"
                          onClick={() => handleOpenDocument(item.fileUrl)}
                        >
                          {/* PDF Icon */}
                          <div className="relative aspect-video bg-white/5">
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
                              <svg className="w-20 h-20 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <p className="text-white text-sm font-medium text-center truncate w-full px-4" title={item.fileName}>
                                {item.fileName}
                              </p>
                            </div>
                            {/* Download Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(item)
                              }}
                              className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors border border-white/10 z-10"
                              aria-label="Download"
                            >
                              <IconDownload className="h-5 w-5 text-white" />
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            {/* Title */}
                            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                              {item.fileName}
                            </h3>
                            {/* File Info */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-white/50 text-xs">
                                {formatFileSize(item.fileSize)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(item.id)
                                }}
                                className="text-red-400 hover:text-red-300 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4 mt-6">
                      {/* Pagination Info */}
                      <p className="text-white/60 text-sm">
                        Page {currentPage} of {totalPages} • {pagination?.total || 0} total documents
                      </p>

                      {/* Pagination Controls */}
                      <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            currentPage === 1
                              ? 'bg-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                          aria-label="Previous page"
                        >
                          <IconChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg transition-colors ${
                            currentPage === totalPages
                              ? 'bg-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                          aria-label="Next page"
                        >
                          <IconChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

