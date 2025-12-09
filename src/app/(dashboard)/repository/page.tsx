"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useRepository, useDocuments, RepositoryDocument, useExtractionProgress, backgroundProcessingManager } from "@/hooks/useRepository"
import { useQueryClient } from '@tanstack/react-query'

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

const STORAGE_KEY = 'repository-extraction-job-id' // Using sessionStorage so it clears on tab close
const STORAGE_QUEUE_KEY = 'repository-processing-queue' // Store processing queue metadata
const STORAGE_SELECTED_FILES_KEY = 'repository-selected-files' // Store selected files metadata

export default function RepositoryPage() {
  const router = useRouter()
  const [view, setView] = useState<'upload' | 'repository'>('upload')
  const [selectedFiles, setSelectedFiles] = useState<UploadedItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [processingQueue, setProcessingQueue] = useState<UploadedItem[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const [isUploading, setIsUploading] = useState(false) // Track upload status
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTriggeredRef = useRef<boolean>(false)
  const processNextFileRef = useRef<(() => Promise<void>) | null>(null)
  const isInitialMountRef = useRef(true)
  const { uploadDocument, deleteDocument, extractDocument, getFileForJob, clearFileForJob, storeFileByFileId, getFileByFileId } = useRepository()
  const queryClient = useQueryClient()
  
  // Fetch documents from API with pagination (10 per page)
  const { data: documentsData, isLoading: isLoadingDocuments } = useDocuments(currentPage, 10)
  const uploadedItems: RepositoryDocument[] = documentsData?.documents || []
  const pagination = documentsData?.pagination
  const totalPages = pagination?.totalPages || 1
  
  // Restore state from sessionStorage on mount and resume background polling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Restore job ID and file name
      const storedJobId = sessionStorage.getItem(STORAGE_KEY)
      const storedFileName = sessionStorage.getItem(`${STORAGE_KEY}-filename`)
      const storedUploadTriggered = sessionStorage.getItem(`${STORAGE_KEY}-uploadTriggered`)
      
      if (storedJobId) {
        setActiveJobId(storedJobId)
        if (storedFileName) {
          setFileName(storedFileName)
        }
        // Restore upload trigger state
        if (storedUploadTriggered === 'true') {
          uploadTriggeredRef.current = true
        }
      }
      
      // Restore processing queue and file objects
      const restoreQueueWithFiles = async () => {
        try {
          const storedQueue = sessionStorage.getItem(STORAGE_QUEUE_KEY)
          if (storedQueue) {
            const queueMetadata: Array<{id: string, name: string, size: number}> = JSON.parse(storedQueue)
            
            // Restore files from storage
            const restoredQueuePromises = queueMetadata.map(async (meta) => {
              // Try to restore file from storage
              const restoredFile = await getFileByFileId(meta.id)
              
              return {
                id: meta.id,
                name: meta.name,
                size: meta.size,
                file: restoredFile || new File([], meta.name, { type: 'application/pdf' }),
                uploadProgress: 0,
                isUploading: false,
              }
            })
            
            const restoredQueue = await Promise.all(restoredQueuePromises)
            setProcessingQueue(restoredQueue)
            
            // If no active job ID but queue has files, start processing first file
            // This handles reload scenario where extraction completed but next file needs processing
            if (!storedJobId && restoredQueue.length > 0 && isInitialMountRef.current) {
              // Wait a bit for state to settle, then process next file
              setTimeout(() => {
                setIsProcessingQueue(false) // Ensure processing flag is false
                processNextFileRef.current?.()
              }, 1500)
            } else {
              setIsProcessingQueue(restoredQueue.length > 0)
            }
            
            // Mark that initial mount is complete
            isInitialMountRef.current = false
          }
        } catch (e) {
          console.error('Error restoring queue:', e)
        }
      }
      
      restoreQueueWithFiles()
      
      // Restore selected files (file metadata only)
      try {
        const storedSelectedFiles = sessionStorage.getItem(STORAGE_SELECTED_FILES_KEY)
        if (storedSelectedFiles) {
          const filesMetadata: Array<{id: string, name: string, size: number}> = JSON.parse(storedSelectedFiles)
          // Create placeholder UploadedItem objects for UI display
          const restoredFiles: UploadedItem[] = filesMetadata.map(meta => ({
            id: meta.id,
            name: meta.name,
            size: meta.size,
            // Create a dummy File object for UI
            file: new File([], meta.name, { type: 'application/pdf' }),
            uploadProgress: 0,
            isUploading: false,
          }))
          setSelectedFiles(restoredFiles)
        }
      } catch (e) {
        console.error('Error restoring selected files:', e)
      }
      
      // Resume background polling for all active jobs
      backgroundProcessingManager.setQueryClient(queryClient)
      
      // If we have an active job ID, immediately restore progress from storage
      if (storedJobId) {
        // First restore from sessionStorage for immediate display (synchronous)
        const cachedProgress = backgroundProcessingManager.getProgressFromStorage(storedJobId)
        if (cachedProgress && queryClient) {
          queryClient.setQueryData(['extraction-progress', storedJobId], cachedProgress)
        }
        
        // Then fetch fresh progress from API (async)
        backgroundProcessingManager.fetchCurrentProgress(storedJobId).then(() => {
          // Then resume polling
          backgroundProcessingManager.resumeAllPolling()
        })
      } else {
        // No active job, just resume polling for any other active jobs
        backgroundProcessingManager.resumeAllPolling()
      }
    }
  }, [queryClient])
  
  // Track extraction progress at the top level (hooks must be called at top level)
  const { data: extractionProgress, error: extractionError } = useExtractionProgress(activeJobId, !!activeJobId)
  const [, forceUpdate] = useState(0)
  
  // Subscribe to cache updates to force re-render when background manager updates progress
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Only update for extraction-progress queries
      if (event?.query?.queryKey?.[0] === 'extraction-progress') {
        forceUpdate(prev => prev + 1)
      }
    })
    return () => unsubscribe()
  }, [queryClient])
  
  if(extractionProgress?.status === "completed"){
    console.log('extractionProgress', extractionProgress.data);
  }
  // Calculate progress percentage (handle both decimal 0-1 and percentage 0-100 formats)
  const progressPercentage = Math.min(100, Math.max(0, 
    extractionProgress?.progress !== undefined
      ? Math.round(extractionProgress.progress > 1 ? extractionProgress.progress : extractionProgress.progress * 100)
      : extractionProgress?.percentage !== undefined
      ? Math.round(extractionProgress.percentage > 1 ? extractionProgress.percentage : extractionProgress.percentage * 100)
      : extractionProgress?.status === 'completed' 
      ? 100 
      : extractionProgress?.status === 'failed' 
      ? 0 
      : activeJobId && !extractionProgress
      ? 0 // Starting, show 0%
      : 0
  ))

  // Show error toast if extraction fails
  useEffect(() => {
    if (extractionError) {
      toast.error('Extraction failed. Please try again.')
      // Clear job ID on error
      setActiveJobId(null)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(`${STORAGE_KEY}-filename`)
      }
    }
  }, [extractionError])

  // Process next file from queue
  const processNextFile = useCallback(async () => {
    if (isProcessingQueue) {
      return
    }

    setProcessingQueue(prev => {
      if (prev.length === 0) {
        setIsProcessingQueue(false)
        return prev
      }

      const nextFile = prev[0]
      setIsProcessingQueue(true)

      // Start extraction for this file
      uploadTriggeredRef.current = false
      
      // Save queue metadata to sessionStorage
      if (typeof window !== 'undefined') {
        const queueMetadata = prev.map(f => ({ id: f.id, name: f.name, size: f.size }))
        sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
      }
      
      // Check if file is a placeholder (reload scenario) and restore it
      const isPlaceholder = nextFile.file.size === 0
      
      if (isPlaceholder) {
        // File object is placeholder, restore from storage
        getFileByFileId(nextFile.id).then(restoredFile => {
          if (restoredFile) {
            // Update queue with restored file
            setProcessingQueue(current => {
              const updatedQueue = current.map(f => 
                f.id === nextFile.id ? { ...f, file: restoredFile } : f
              )
              // Update sessionStorage
              if (typeof window !== 'undefined') {
                const queueMetadata = updatedQueue.map(f => ({ id: f.id, name: f.name, size: f.size }))
                sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
              }
              return updatedQueue
            })
            
            // Start processing with restored file
            setIsProcessingQueue(true)
            uploadTriggeredRef.current = false
            extractDocument.mutateAsync(restoredFile)
              .then((extractionJobId) => {
                if (extractionJobId?.job_id) {
                  setActiveJobId(extractionJobId.job_id)
                  setFileName(nextFile.name)
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem(STORAGE_KEY, extractionJobId.job_id)
                    sessionStorage.setItem(`${STORAGE_KEY}-filename`, nextFile.name)
                    sessionStorage.removeItem(`${STORAGE_KEY}-uploadTriggered`)
                  }
                }
              })
              .catch((error) => {
                console.error(`Error processing ${nextFile.name}:`, error)
                toast.error(`Failed to process ${nextFile.name}`)
                setProcessingQueue(current => current.slice(1))
                setIsProcessingQueue(false)
                setTimeout(() => processNextFileRef.current?.(), 500)
              })
          } else {
            // File not found in storage, skip this file
            console.warn('File not found in storage, skipping:', nextFile.name)
            setProcessingQueue(current => {
              const newQueue = current.slice(1)
              if (typeof window !== 'undefined') {
                if (newQueue.length > 0) {
                  const queueMetadata = newQueue.map(f => ({ id: f.id, name: f.name, size: f.size }))
                  sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
                } else {
                  sessionStorage.removeItem(STORAGE_QUEUE_KEY)
                }
              }
              return newQueue
            })
            setIsProcessingQueue(false)
            setTimeout(() => processNextFileRef.current?.(), 500)
          }
        })
        return prev
      }
      
      extractDocument.mutateAsync(nextFile.file)
        .then((extractionJobId) => {
          if (extractionJobId?.job_id) {
            setActiveJobId(extractionJobId.job_id)
            setFileName(nextFile.name)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(STORAGE_KEY, extractionJobId.job_id)
              sessionStorage.setItem(`${STORAGE_KEY}-filename`, nextFile.name)
              sessionStorage.removeItem(`${STORAGE_KEY}-uploadTriggered`)
            }
          }
        })
        .catch((error) => {
          console.error(`Error processing ${nextFile.name}:`, error)
          toast.error(`Failed to process ${nextFile.name}`)
          setProcessingQueue(current => current.slice(1))
          setIsProcessingQueue(false)
          // Process next file
          setTimeout(() => processNextFileRef.current?.(), 500)
        })

      return prev
    })
  }, [isProcessingQueue, extractDocument])

  // Store processNextFile in ref
  useEffect(() => {
    processNextFileRef.current = processNextFile
  }, [processNextFile])

  // When extraction completes, automatically upload the document
  useEffect(() => {
    if (extractionProgress?.status === 'completed' && !uploadTriggeredRef.current && activeJobId) {
      // Mark as triggered to prevent multiple uploads
      uploadTriggeredRef.current = true
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`${STORAGE_KEY}-uploadTriggered`, 'true')
      }
      
      // Get the original file that was extracted (from global storage or blob)
      getFileForJob(activeJobId).then(fileToUpload => {
        if (fileToUpload) {
          // Set uploading status
          setIsUploading(true)
          
          // Automatically trigger uploadDocument mutation
          uploadDocument.mutate(fileToUpload, {
          onSuccess: () => {
            // Upload completed successfully
            setIsUploading(false)
            // Remove current file from queue
            setProcessingQueue(prev => {
              const newQueue = prev.slice(1)
              // Update queue in sessionStorage
              if (typeof window !== 'undefined') {
                if (newQueue.length > 0) {
                  const queueMetadata = newQueue.map(f => ({ id: f.id, name: f.name, size: f.size }))
                  sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
                } else {
                  sessionStorage.removeItem(STORAGE_QUEUE_KEY)
                }
              }
              
              // Clear job ID and file references after successful upload
              const completedJobId = activeJobId
              setActiveJobId(null)
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem(STORAGE_KEY)
                sessionStorage.removeItem(`${STORAGE_KEY}-filename`)
                sessionStorage.removeItem(`${STORAGE_KEY}-uploadTriggered`)
              }
              setFileName('')
              clearFileForJob(completedJobId)
              // Stop background polling for completed job
              if (completedJobId) {
                backgroundProcessingManager.stopPolling(completedJobId)
              }
              uploadTriggeredRef.current = false
              setIsProcessingQueue(false)

              // Process next file in queue after upload completes
              if (newQueue.length > 0) {
                setTimeout(() => {
                  // Reset processing state and process next file
                  setIsProcessingQueue(false)
                  processNextFileRef.current?.()
                }, 500)
              }
              
              return newQueue
            })
          },
          onError: () => {
            // Upload failed
            setIsUploading(false)
            
            // Remove failed file from queue
            setProcessingQueue(prev => {
              const newQueue = prev.slice(1)
              // Update queue in sessionStorage
              if (typeof window !== 'undefined') {
                if (newQueue.length > 0) {
                  const queueMetadata = newQueue.map(f => ({ id: f.id, name: f.name, size: f.size }))
                  sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
                } else {
                  sessionStorage.removeItem(STORAGE_QUEUE_KEY)
                }
              }
              return newQueue
            })
            
            // Clear after a delay
            setTimeout(() => {
              const failedJobId = activeJobId
              setActiveJobId(null)
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem(STORAGE_KEY)
                sessionStorage.removeItem(`${STORAGE_KEY}-filename`)
                sessionStorage.removeItem(`${STORAGE_KEY}-uploadTriggered`)
              }
              setFileName('')
              clearFileForJob(failedJobId)
              // Stop background polling for failed job
              if (failedJobId) {
                backgroundProcessingManager.stopPolling(failedJobId)
              }
              uploadTriggeredRef.current = false
              setIsProcessingQueue(false)

              // Process next file
              processNextFileRef.current?.()
            }, 3000)
          },
          })
        } else {
          // If no file found, just clear the job ID
          console.warn('No file found to upload after extraction completion')
          const noFileJobId = activeJobId
        setProcessingQueue(prev => {
          const newQueue = prev.slice(1)
          // Update queue in sessionStorage
          if (typeof window !== 'undefined') {
            if (newQueue.length > 0) {
              const queueMetadata = newQueue.map(f => ({ id: f.id, name: f.name, size: f.size }))
              sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
            } else {
              sessionStorage.removeItem(STORAGE_QUEUE_KEY)
            }
          }
          return newQueue
        })
        setActiveJobId(null)
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(`${STORAGE_KEY}-filename`)
          sessionStorage.removeItem(`${STORAGE_KEY}-uploadTriggered`)
        }
        setFileName('')
        clearFileForJob(noFileJobId)
        // Stop background polling
        if (noFileJobId) {
          backgroundProcessingManager.stopPolling(noFileJobId)
        }
        uploadTriggeredRef.current = false
        setIsProcessingQueue(false)

        // Process next file
        setTimeout(() => processNextFileRef.current?.(), 500)
        }
      })
    } else if (extractionProgress?.status === 'failed') {
      toast.error('Document extraction failed. Please try again.')
      const failedJobId = activeJobId
      
      // Remove failed file from queue
      setProcessingQueue(prev => {
        const newQueue = prev.slice(1)
        // Update queue in sessionStorage
        if (typeof window !== 'undefined') {
          if (newQueue.length > 0) {
            const queueMetadata = newQueue.map(f => ({ id: f.id, name: f.name, size: f.size }))
            sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
          } else {
            sessionStorage.removeItem(STORAGE_QUEUE_KEY)
          }
        }
        return newQueue
      })
      
      setActiveJobId(null)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(`${STORAGE_KEY}-filename`)
        sessionStorage.removeItem(`${STORAGE_KEY}-uploadTriggered`)
      }
      setFileName('')
      clearFileForJob(failedJobId)
      // Stop background polling for failed job
      if (failedJobId) {
        backgroundProcessingManager.stopPolling(failedJobId)
      }
      uploadTriggeredRef.current = false
      setIsProcessingQueue(false)

      // Process next file
      setTimeout(() => processNextFileRef.current?.(), 500)
    }
  }, [extractionProgress?.status, uploadDocument, activeJobId, getFileForJob, clearFileForJob, processingQueue, isProcessingQueue])

  // Show progress modal if extraction is in progress OR upload is in progress
  // Also show if we have activeJobId even if extractionProgress is not loaded yet (reload scenario)
  const isExtracting = !!activeJobId && (
    !extractionProgress || (
      extractionProgress?.status !== 'completed' && 
      extractionProgress?.status !== 'failed'
    )
  ) && !extractionError || isUploading

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

      const fileId = Date.now().toString() + '-' + i
      newItems.push({
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        isUploading: false,
      })
      
      // Store file by file ID for queue restoration
      storeFileByFileId(fileId, file)
    }

    setSelectedFiles(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeSelectedFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(item => item.id !== id))
    // Also remove from queue if present
    setProcessingQueue(prev => prev.filter(item => item.id !== id))
  }

  const handleSend = async () => {
    if (selectedFiles.length === 0) {
      toast.info('Please select at least one file to upload')
      return
    }

    try {
      // Add all files to processing queue
      const filesToQueue = [...selectedFiles]
      setProcessingQueue(prev => {
        const newQueue = [...prev, ...filesToQueue]
        // Save queue metadata to sessionStorage
        if (typeof window !== 'undefined') {
          const queueMetadata = newQueue.map(f => ({ id: f.id, name: f.name, size: f.size }))
          sessionStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queueMetadata))
        }
        return newQueue
      })
      
      // Save selected files metadata
      if (typeof window !== 'undefined') {
        const filesMetadata = selectedFiles.map(f => ({ id: f.id, name: f.name, size: f.size }))
        sessionStorage.setItem(STORAGE_SELECTED_FILES_KEY, JSON.stringify(filesMetadata))
      }
      
      // Start processing first file immediately if not already processing
      if (!isProcessingQueue && filesToQueue.length > 0) {
        const firstFile = filesToQueue[0]
        setIsProcessingQueue(true)
        
        try {
          uploadTriggeredRef.current = false
          const extractionJobId = await extractDocument.mutateAsync(firstFile.file)

          if (extractionJobId?.job_id) {
            setActiveJobId(extractionJobId.job_id)
            setFileName(firstFile.name)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(STORAGE_KEY, extractionJobId.job_id)
              sessionStorage.setItem(`${STORAGE_KEY}-filename`, firstFile.name)
              sessionStorage.removeItem(`${STORAGE_KEY}-uploadTriggered`)
            }
          }
        } catch (error) {
          console.error(`Error processing ${firstFile.name}:`, error)
          toast.error(`Failed to process ${firstFile.name}`)
          setProcessingQueue(prev => prev.slice(1))
          setIsProcessingQueue(false)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to queue files')
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


  // Combine selectedFiles and processingQueue to show all files (including those in queue)
  const allFilesToShow = [...selectedFiles]
  // Add files from queue that aren't in selectedFiles
  processingQueue.forEach(queueFile => {
    if (!allFilesToShow.find(f => f.id === queueFile.id)) {
      allFilesToShow.push(queueFile)
    }
  })
  
  // Generate grid slots - show filled slots + empty slots (minimum 6, extends as needed)
  const minSlots = 6
  const maxSlots = Math.max(minSlots, Math.ceil(allFilesToShow.length / 3) * 3)
  const slots = Array.from({ length: maxSlots }, (_, index) => {
    const file = allFilesToShow[index]
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
              <div className="relative mb-6">
                <div className="grid grid-cols-3 gap-3">
                {slots.map(({ index, file }) => {
                  // Check if this file is being extracted or uploading
                  const isThisFileExtracting = (isExtracting || isUploading) && file && file.name === fileName
                  const isInQueue = file && processingQueue.some(q => q.id === file.id)
                  const isCurrentProcessing = isInQueue && processingQueue[0]?.id === file.id && isThisFileExtracting
                  
                  if (file) {
                    // Render filled slot with file
                    return (
                      <div
                        key={file.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border-2 border-white/10"
                      >
                        {/* Progress Overlay - Only on currently processing file */}
                        {isCurrentProcessing && (
                          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
                            {/* Circular Progress Bar */}
                            <div className="flex flex-col items-center justify-center">
                              <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                                {/* Background Circle */}
                                <svg 
                                  className="transform -rotate-90 w-full h-full" 
                                  viewBox="0 0 100 100"
                                  style={{ width: '96px', height: '96px' }}
                                >
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="rgba(255, 255, 255, 0.1)"
                                    strokeWidth="8"
                                    fill="none"
                                  />
                                  {/* Progress Circle */}
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="#22c55e"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                    style={{
                                      strokeDasharray: '282.743',
                                      strokeDashoffset: `${282.743 * (1 - (isUploading ? 100 : progressPercentage) / 100)}`
                                    }}
                                  />
                                </svg>
                                {/* Percentage Text */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <span className="text-2xl font-bold text-green-500">
                                    {isUploading ? 100 : progressPercentage}%
                                  </span>
                                </div>
                              </div>
                              {/* Status Text */}
                              <p className="text-white/70 text-xs text-center px-2">
                                {isUploading
                                  ? 'Uploading...'
                                  : extractionProgress?.status === 'processing' 
                                  ? 'Processing...' 
                                  : extractionProgress?.status === 'extracting'
                                  ? 'Extracting...'
                                  : extractionProgress?.status === 'completed'
                                  ? 'Uploading...'
                                  : 'Please wait...'}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Waiting Overlay - For files in queue but not currently processing */}
                        {isInQueue && !isCurrentProcessing && (
                          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-2"></div>
                              <p className="text-white/70 text-xs text-center px-2">Waiting...</p>
                            </div>
                          </div>
                        )}
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
                            // Don't allow removal if currently processing
                            if (!isCurrentProcessing) {
                              removeSelectedFile(file.id)
                            }
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Remove file"
                          disabled={isCurrentProcessing}
                        >
                          <IconX className="h-4 w-4 text-white" />
                        </button>
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
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={selectedFiles.length === 0 || isProcessingQueue}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-colors shadow-lg mt-6"
              >
                {isProcessingQueue ? 'Processing...' : 'Send'}
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

