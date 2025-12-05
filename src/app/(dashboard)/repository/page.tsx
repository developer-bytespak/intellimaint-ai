"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useRepository, useDocuments, RepositoryDocument } from "@/hooks/useRepository"

// Dynamically import PDF.js only on client side
let pdfjsLib: typeof import('pdfjs-dist') | null = null

const loadPdfJs = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }
  return pdfjsLib
}

// Icon Components
function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  preview: string
  name: string
  size: number
  type: 'image' | 'video' | 'document'
  uploadProgress?: number
  isUploading?: boolean
  fileId?: string
  blobPath?: string
}

export default function RepositoryPage() {
  const router = useRouter()
  const [view, setView] = useState<'upload' | 'repository'>('upload')
  const [selectedFiles, setSelectedFiles] = useState<UploadedItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getUploadUrls, uploadToVercelBlob, saveDocuments, deleteDocument } = useRepository()
  
  // Fetch documents from API
  const { data: documentsData, isLoading: isLoadingDocuments } = useDocuments(1, 100)
  const uploadedItems: RepositoryDocument[] = documentsData?.documents || []

  const handleBack = () => {
    router.back()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  const generatePDFPreview = async (file: File): Promise<string> => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return ''
    }
    
    try {
      const pdfjs = await loadPdfJs()
      if (!pdfjs) {
        return ''
      }
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1) // Get first page
      
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      if (!context) throw new Error('Could not get canvas context')
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }).promise
      
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error generating PDF preview:', error)
      return ''
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: UploadedItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const type = getFileType(file)
      let preview = ''
      
      if (type === 'image' || type === 'video') {
        preview = URL.createObjectURL(file)
      } else if (type === 'document') {
        // Generate preview for PDF files
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          try {
            preview = await generatePDFPreview(file)
          } catch (error) {
            console.error('Failed to generate PDF preview:', error)
            // Preview will remain empty, will show document icon
          }
        }
        // For DOCX and other documents, preview will remain empty and we'll show an icon
      }

      newItems.push({
        id: Date.now().toString() + '-' + i,
        file,
        preview,
        name: file.name,
        size: file.size,
        type,
        uploadProgress: 0,
        isUploading: false,
      })
    }

    setSelectedFiles(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeSelectedFile = (id: string) => {
    setSelectedFiles(prev => {
      const item = prev.find(item => item.id === id)
      if (item?.preview && item.preview.startsWith('blob:')) {
        // Only revoke object URLs (blob:), not data URLs (data:)
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter(item => item.id !== id)
    })
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

      // Step 1: Get upload URLs from backend
      const filesMetadata = selectedFiles.map(item => ({
        fileName: item.name,
        fileSize: item.size,
        contentType: item.file.type || 'application/octet-stream',
      }))

      const uploadUrls = await getUploadUrls.mutateAsync(filesMetadata)

      // Step 2: Upload files to Vercel Blob and track progress
      const uploadPromises = selectedFiles.map(async (item, index) => {
        const uploadInfo = uploadUrls[index]
        if (!uploadInfo) {
          throw new Error(`No upload URL for file: ${item.name}`)
        }

        try {
          // Update progress: 0-50% for blob upload
          for (let progress = 0; progress <= 50; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))
            setSelectedFiles(prev => 
              prev.map(p => p.id === item.id ? { ...p, uploadProgress: progress } : p)
            )
          }

          // Upload to Vercel Blob
          const fileUrl = await uploadToVercelBlob(item.file, uploadInfo.blobPath)

          // Update progress: 50-90% for saving metadata
          for (let progress = 50; progress <= 90; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 50))
            setSelectedFiles(prev => 
              prev.map(p => p.id === item.id ? { ...p, uploadProgress: progress } : p)
            )
          }

          // Store fileId and blobPath for metadata saving
          setSelectedFiles(prev => 
            prev.map(p => p.id === item.id ? { 
              ...p, 
              uploadProgress: 90,
              fileId: uploadInfo.fileId,
              blobPath: uploadInfo.blobPath
            } : p)
          )

          return {
            fileId: uploadInfo.fileId,
            fileName: item.name,
            fileUrl,
            fileSize: item.size,
            blobPath: uploadInfo.blobPath,
          }
        } catch (error) {
          console.error(`Error uploading ${item.name}:`, error)
          throw error
        }
      })

      // Wait for all uploads to complete
      const uploadedDocuments = await Promise.all(uploadPromises)

      // Step 3: Save metadata to database
      await saveDocuments.mutateAsync(uploadedDocuments)

      // Mark all as complete
      setSelectedFiles(prev => 
        prev.map(p => ({ ...p, isUploading: false, uploadProgress: 100 }))
      )

      // Clear selected files and switch to repository view
      setTimeout(() => {
        setSelectedFiles([])
        toast.success('Files uploaded successfully!')
        setView('repository')
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
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete document')
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(item => {
        if (item.preview && item.preview.startsWith('blob:')) {
          // Only revoke object URLs (blob:), not data URLs (data:)
          URL.revokeObjectURL(item.preview)
        }
      })
    }
  }, [selectedFiles])

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
            {view === 'upload' ? 'Upload More Pictures and Videos' : 'Repository'}
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
                        {file.type === 'image' && file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : file.type === 'video' && file.preview ? (
                          <video
                            src={file.preview}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : file.type === 'document' && file.preview ? (
                          // PDF preview
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : file.type === 'document' ? (
                          // DOCX or other document - show document icon with file info
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4">
                            {file.file.name.toLowerCase().endsWith('.docx') || file.file.name.toLowerCase().endsWith('.doc') ? (
                              <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ) : (
                              <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                            <p className="text-white text-xs text-center font-medium truncate w-full px-2" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-white/60 text-xs mt-1">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IconImage className="h-8 w-8 text-white/50" />
                          </div>
                        )}
                        <button
                          onClick={() => removeSelectedFile(file.id)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
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
                accept="image/*,video/*,.pdf,.doc,.docx"
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
                <div className="space-y-4">
                  {uploadedItems.map((item) => {
                    const fileExtension = item.fileName.split('.').pop()?.toLowerCase() || ''
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)
                    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension)
                    const isPdf = fileExtension === 'pdf'
                    const isDocx = ['doc', 'docx'].includes(fileExtension)

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg overflow-hidden"
                      >
                        {/* Image/Preview */}
                        <div className="relative aspect-video bg-white/5">
                          {isImage ? (
                            <img
                              src={item.fileUrl}
                              alt={item.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : isVideo ? (
                            <video
                              src={item.fileUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : isPdf ? (
                            // For PDFs, we could show a preview if we stored it, but for now show icon
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
                              <svg className="w-20 h-20 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <p className="text-white text-sm font-medium text-center truncate w-full px-4" title={item.fileName}>
                                {item.fileName}
                              </p>
                            </div>
                          ) : isDocx ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6">
                              <svg className="w-20 h-20 text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-white text-sm font-medium text-center truncate w-full px-4" title={item.fileName}>
                                {item.fileName}
                              </p>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IconImage className="h-16 w-16 text-white/30" />
                            </div>
                          )}
                          {/* Download Button */}
                          <button
                            onClick={() => handleDownload(item)}
                            className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors border border-white/10"
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
                              onClick={() => handleDelete(item.id)}
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
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

