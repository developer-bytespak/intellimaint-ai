"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import PageTransition from '@/components/ui/PageTransition'
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useDocuments, RepositoryDocument, useRepository, storeFiles, getFile, clearStoredFiles } from "@/hooks/useRepository"

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
      <path d="M3 18l4-4 4 2 4-3 4 5H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
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

interface UploadedItem {
  id: string
  file: File
  name: string
  size: number
}

interface BatchJob {
  jobId: string;
  fileName: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  error?: string;
}


export default function RepositoryPage() {
  const router = useRouter()
  const [view, setView] = useState<'upload' | 'repository'>('upload')
  const [selectedFiles, setSelectedFiles] = useState<UploadedItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { deleteDocument, uploadDocument,userData,userLoading,userError } = useRepository()
  
  // Batch Status State
  const [batchId, setBatchId] = useState<string | null>(null)
  const [batchStatus, setBatchStatus] = useState<'idle' | 'processing' | 'completed'>('idle')
  const [batchProgress, setBatchProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const uploadedFilesRef = useRef<Set<string>>(new Set())
  const finishedUploadsRef = useRef<Set<string>>(new Set())

   if(userError){
      toast.error('Failed to fetch user data for upload.');
      return;
    }
    // console.log('userData', userData);

  useEffect(() => {
   
    const storedBatchId = localStorage.getItem("currentBatchId");
    if (storedBatchId) {
      setBatchId(storedBatchId);
      setBatchStatus('processing');
    }
  }, []);

  useEffect(() => {
    if (!batchId) return;

    // Load processed files from localStorage to avoid duplicates
    const uploadedKey = `batch_uploaded_${batchId}`;
    try {
        const previouslyUploaded = JSON.parse(localStorage.getItem(uploadedKey) || '[]');
        previouslyUploaded.forEach((name: string) => uploadedFilesRef.current.add(name));
    } catch (e) {
        console.error("Error loading uploaded files from storage", e);
    }

    const evtSource = new EventSource(`http://localhost:8000/api/v1/batches/events/${batchId}`);

    evtSource.addEventListener("batch_update", (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const jobsList: BatchJob[] = Array.isArray(parsed) ? parsed : [parsed];
        
        if (jobsList.length > 0) {
            const totalProgress = jobsList.reduce((acc, job) => acc + (job.progress || 0), 0) / jobsList.length;
            setBatchProgress(Math.round(totalProgress));
            
            const allCompleted = jobsList.every(job => job.status === 'completed' || job.status === 'failed');
            if (allCompleted) {
                setBatchStatus('completed');
            } else {
                setBatchStatus('processing');
            }

            // Check for completed jobs and upload to repository
            jobsList.forEach(async (job) => {
              if (job.status === 'completed' && !uploadedFilesRef.current.has(job.fileName)) {
                // Try to get file from IndexedDB (persisted across page reloads)
                const fileToUpload = await getFile(job.fileName);

                if (fileToUpload) {
                  console.log(`[frontend] Uploading ${job.fileName} to repository...`);
                  
                  // Mark as uploaded immediately to prevent duplicates
                  uploadedFilesRef.current.add(job.fileName);
                  localStorage.setItem(uploadedKey, JSON.stringify(Array.from(uploadedFilesRef.current)));
                  
                  uploadDocument.mutate(fileToUpload, {
                    onSuccess: () => {
                        finishedUploadsRef.current.add(job.fileName);
                        
                        // Check if all files in the batch are finished uploading
                        if (finishedUploadsRef.current.size === jobsList.length) {
                            console.log("[frontend] All files uploaded successfully. Clearing batch.");
                            
                            // Clear IndexedDB and local storage
                            clearStoredFiles();
                            localStorage.removeItem("currentBatchId");
                            localStorage.removeItem(uploadedKey);
                            
                            // Reset state
                            setBatchId(null);
                            setBatchStatus('idle');
                            setSelectedFiles([]);
                            uploadedFilesRef.current.clear();
                            finishedUploadsRef.current.clear();
                            setIsSubmitting(false);
                            
                            toast.success('All files processed and uploaded successfully!');
                        }
                    },
                    onError: (error) => {
                        console.error(`[frontend] Upload failed for ${job.fileName}:`, error);
                        // Remove from uploaded set on error so it can be retried
                        uploadedFilesRef.current.delete(job.fileName);
                        localStorage.setItem(uploadedKey, JSON.stringify(Array.from(uploadedFilesRef.current)));
                    }
                  });
                } else {
                  console.error(`[frontend] File not found in IndexedDB: ${job.fileName}`);
                  toast.error(`File ${job.fileName} not found. Please re-upload.`);
                }
              }
            });
        }
      } catch (err) {
        console.error("SSE Parse Error", err);
      }
    });

    return () => {
      evtSource.close();
    };
  }, [batchId, uploadDocument]);

  const { data: documentsData, isLoading: isLoadingDocuments } = useDocuments(currentPage, 10)
  const uploadedItems: RepositoryDocument[] = documentsData?.documents || []
  const pagination = documentsData?.pagination
  const totalPages = pagination?.totalPages || 1

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
      })
    }

    setSelectedFiles(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeSelectedFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(item => item.id !== id))
  }

  const handleDownload = async (item: RepositoryDocument) => {
    try {
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const minSlots = 6
  const maxSlots = Math.max(minSlots, Math.ceil(selectedFiles.length / 3) * 3)
  const slots = Array.from({ length: maxSlots }, (_, index) => {
    const file = selectedFiles[index]
    return { index, file }
  })

  const handleBack = () => {
    router.back()
  }

//   const handleSend = async () => {
//   if (selectedFiles.length === 0) {
//     toast.error("Please select at least one PDF");
//     return;
//   }

//   setIsSubmitting(true);

//   try {
//     const formData = new FormData();
//     selectedFiles.forEach(item => {
//       formData.append("files", item.file);
//     });

//     console.log("[frontend] uploading batch...", selectedFiles.length);

//     // Store files globally so they persist if user navigates away
//     storeFiles(selectedFiles.map(item => item.file));

//     const res = await fetch(
//       "http://localhost:8000/api/v1/batches/upload-pdfs",
//       {
//         method: "POST",
//         body: formData,
//         mode: "cors",
//       }
//     );

//     if (!res.ok) {
//       localStorage.removeItem("currentBatchId");
//       throw new Error("Batch upload failed");
//     }

//     const data = await res.json();

//     console.log("[frontend] batch created", data);

//     toast.success("PDFs queued for processing");

//     // Store batchId in localStorage
//     localStorage.setItem("currentBatchId", data.batchId);
//     setBatchId(data.batchId);
//     setBatchStatus('processing');
//     uploadedFilesRef.current.clear(); // Clear uploaded files for new batch
//     finishedUploadsRef.current.clear();
//     setIsSubmitting(false); // Batch created, now we wait for SSE

//     // ✅ VERY IMPORTANT
//     // router.push(`/repository/batch/${data.batchId}`);

//   } catch (err: any) {
//     console.error("[frontend] upload error", err);
//     toast.error(err.message || "Upload failed");
//     setIsSubmitting(false);
//   }
// };

// Update in handleSend function - Add this after storing files
// Around line 315 in page.tsx

const handleSend = async () => {
  if (selectedFiles.length === 0) {
    toast.error("Please select at least one PDF");
    return;
  }

  setIsSubmitting(true);

  try {
    if(userError){
      toast.error('Failed to fetch user data for upload.');
    }
    const formData = new FormData();
    selectedFiles.forEach(item => {
      formData.append("files", item.file);
      formData.append("userId", userData.id);
    });


    console.log("[frontend] uploading batch...", selectedFiles.length);

    // Store files globally so they persist if user navigates away
    await storeFiles(selectedFiles.map(item => item.file));

    const res = await fetch(
      "http://localhost:8000/api/v1/batches/upload-pdfs",
      {
        method: "POST",
        body: formData,
        mode: "cors",

      },

    );

    if (!res.ok) {
      localStorage.removeItem("currentBatchId");
      throw new Error("Batch upload failed");
    }

    const data = await res.json();

    console.log("[frontend] batch created", data);

    toast.success("PDFs queued for processing");

    // Store batchId in localStorage
    localStorage.setItem("currentBatchId", data.batchId);
    
    // 🆕 Store file names for initial display on batch status page
    const fileNames = selectedFiles.map(item => item.file.name);
    localStorage.setItem(`batch_files_${data.batchId}`, JSON.stringify(fileNames));
    
    setBatchId(data.batchId);
    setBatchStatus('processing');
    uploadedFilesRef.current.clear();
    finishedUploadsRef.current.clear();
    setIsSubmitting(false);

    // Navigate to batch status page to show real-time progress
    router.push(`/repository/batch/${data.batchId}`);

  } catch (err: any) {
    console.error("[frontend] upload error", err);
    toast.error(err.message || "Upload failed");
    setIsSubmitting(false);
  }
};

  return (
    <PageTransition>
      <main className="min-h-screen bg-[#1f2632] text-white">

        {/* Header */}
        <header className=" text-white rounded-b-[28px] shadow-sm"
          style={{ background: 'linear-gradient(90deg,#006EE6 0%,#00A0FF 100%)' }}>
          <div className="flex items-center gap-2 pt-6 pb-6">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-blue-500 dark:hover:bg-blue-700 rounded-full transition-colors ml-4"
              aria-label="Go back"
            >
              <IconChevronLeft className="h-6 w-6 text-white" />
            </button>
            <h1 className="text-center text-pretty text-xl md:text-2xl font-semibold flex-1">
              {view === 'upload' ? 'Upload PDF Documents' : 'Repository'}
            </h1>

            {batchId && (
              <button
                onClick={() => router.push(`/repository/batch/${batchId}`)}
                className="mr-4 px-3 py-1.5 bg-white/20 border-2 border-yellow-100 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {batchStatus === 'processing' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/50 border-t-white border-yellow-200  rounded-full animate-spin" />
                    <span>Uploading</span>
                  </>
                ) : (
                  <span >Batch Status</span>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Toggle Button */}
        <div className="flex justify-center mt-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex gap-2">
            <button
              onClick={() => setView('upload')}
              className={`px-6 py-2 rounded-full transition-all text-sm font-medium ${view === 'upload'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
                }`}
            >
              Upload
            </button>
            <button
              onClick={() => setView('repository')}
              className={`px-6 py-2 rounded-full transition-all text-sm font-medium ${view === 'repository'
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
                <div className="relative mb-6">
                  <div className="grid grid-cols-3 gap-3">
                    {slots.map(({ index, file }) => {
                      if (file) {
                        return (
                          <div
                            key={file.id}
                            className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border-2 border-white/10"
                          >
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
                              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-50"
                              aria-label="Remove file"
                            >
                              <IconX className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        )
                      } else {
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

                <button
                  onClick={handleSend}
                  disabled={isSubmitting || batchStatus === 'processing'}
                  className={`w-full font-medium py-4 rounded-xl transition-colors shadow-lg mt-6 ${
                    isSubmitting || batchStatus === 'processing'
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : batchStatus === 'processing' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    <>
                    {uploadDocument?.isPending ? 'Uploading...' : 'Send to Repository'}
                    </>
                  )}
                </button>

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
                <div className="mb-4">
                  <p className="text-white/70 text-sm">For Military Equipment</p>
                </div>

                {isLoadingDocuments ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg p-4 animate-pulse">
                        <div className="w-full h-40 bg-white/6 rounded-md mb-4" />
                        <div className="h-4 bg-white/20 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-white/20 rounded w-1/2" />
                      </div>
                    ))}
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
                            <div className="relative aspect-video bg-white/5">
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
                                <svg className="w-20 h-20 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="text-white text-sm font-medium text-center truncate w-full px-4" title={item.fileName}>
                                  {item.fileName}
                                </p>
                              </div>
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

                            <div className="p-4">
                              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                                {item.fileName}
                              </h3>
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

                    {totalPages > 1 && (
                      <div className="flex flex-col items-center gap-4 mt-6">
                        <p className="text-white/60 text-sm">
                          Page {currentPage} of {totalPages} • {pagination?.total || 0} total documents
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg transition-colors ${currentPage === 1
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            aria-label="Previous page"
                          >
                            <IconChevronLeft className="h-5 w-5" />
                          </button>

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
                                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })}
                          </div>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
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
    </PageTransition>
  )
}

