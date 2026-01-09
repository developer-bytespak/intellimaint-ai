"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getFile,
  clearStoredFiles,
} from "@/hooks/useRepository";
import { useUser } from "./useUser";

// Types for batch upload state
export interface FileUploadState {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error" | "failed";
  error?: string;
  jobId?: string;
}

// File metadata for UI restoration after reload
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
}

export interface BatchUploadState {
  batchId: string | null;
  files: Record<string, FileUploadState>;
  fileMetadata: FileMetadata[]; // Store file metadata for UI restoration
  overallProgress: number;
  isConnected: boolean;
  isComplete: boolean;
  hasError: boolean;
}

// SSE Manager Singleton - persists across route changes
class BatchUploadManager {
  private static instance: BatchUploadManager | null = null;
  private eventSource: EventSource | null = null;
  private listeners: Set<(state: BatchUploadState) => void> = new Set();
  private uploadDocumentFn:
    | ((file: File) => Promise<void>)
    | null = null;
  private uploadingFiles: Set<string> = new Set();
  private completedUploads: Set<string> = new Set();
  private isCancelled: boolean = false; // Flag to stop uploads after cancel
  private simulatedProgress: Record<string, number> = {}; // Track simulated progress per file
  private progressInterval: NodeJS.Timeout | null = null; // Interval for simulating progress
  
  private state: BatchUploadState = {
    batchId: null,
    files: {},
    fileMetadata: [],
    overallProgress: 0,
    isConnected: false,
    isComplete: false,
    hasError: false,
  };

  private constructor() {
    // Restore state from localStorage on initialization
    this.restoreState();
  }

  static getInstance(): BatchUploadManager {
    if (!BatchUploadManager.instance) {
      BatchUploadManager.instance = new BatchUploadManager();
    }
    return BatchUploadManager.instance;
  }

  private restoreState() {
    if (typeof window === "undefined") return;

    try {
      const storedBatchId = localStorage.getItem("currentBatchId");
      const storedFilesProgress = localStorage.getItem("batch_files_progress");
      const storedUploadedFiles = localStorage.getItem("batch_uploaded_files");
      const storedFileMetadata = localStorage.getItem("batch_file_metadata");

      if (storedBatchId) {
        this.state.batchId = storedBatchId;

        if (storedFilesProgress) {
          this.state.files = JSON.parse(storedFilesProgress);
        }

        if (storedFileMetadata) {
          this.state.fileMetadata = JSON.parse(storedFileMetadata);
        }

        if (storedUploadedFiles) {
          const uploaded = JSON.parse(storedUploadedFiles);
          uploaded.forEach((name: string) => this.completedUploads.add(name));
        }

        // Calculate overall progress
        this.updateOverallProgress();

        // Initialize simulated progress from current progress
        for (const fileName of Object.keys(this.state.files)) {
          this.simulatedProgress[fileName] = this.state.files[fileName].progress || 0;
        }

        // Reconnect SSE if batch is in progress
        if (!this.state.isComplete) {
          this.connectSSE(storedBatchId);
          // Start progress simulation after reconnecting
          this.startProgressSimulation();
        }
      }
    } catch (e) {
      console.error("[BatchUploadManager] Failed to restore state:", e);
    }
  }

  private saveState() {
    if (typeof window === "undefined") return;

    try {
      if (this.state.batchId) {
        localStorage.setItem("currentBatchId", this.state.batchId);
        localStorage.setItem(
          "batch_files_progress",
          JSON.stringify(this.state.files)
        );
        localStorage.setItem(
          "batch_uploaded_files",
          JSON.stringify(Array.from(this.completedUploads))
        );
        localStorage.setItem(
          "batch_file_metadata",
          JSON.stringify(this.state.fileMetadata)
        );
      }
    } catch (e) {
      console.error("[BatchUploadManager] Failed to save state:", e);
    }
  }

  private updateOverallProgress() {
    const files = Object.values(this.state.files);
    if (files.length === 0) {
      this.state.overallProgress = 0;
      return;
    }

    const totalProgress = files.reduce((acc, f) => acc + f.progress, 0);
    this.state.overallProgress = Math.round(totalProgress / files.length);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  subscribe(listener: (state: BatchUploadState) => void) {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  setUploadDocumentFn(fn: (file: File) => Promise<void>) {
    this.uploadDocumentFn = fn;
  }

  async startBatch(batchId: string, fileNames: string[], fileMetadata: FileMetadata[], userId?: string) {
    // Reset cancelled flag for new batch
    this.isCancelled = false;
    
    // Stop any existing progress simulation
    this.stopProgressSimulation();
    
    // Initialize file states and simulated progress
    const files: Record<string, FileUploadState> = {};
    this.simulatedProgress = {};
    fileNames.forEach((fileName) => {
      files[fileName] = {
        fileName,
        progress: 0,
        status: "pending",
      };
      this.simulatedProgress[fileName] = 0;
    });

    this.state = {
      batchId,
      files,
      fileMetadata, // Store file metadata for UI restoration
      overallProgress: 0,
      isConnected: false,
      isComplete: false,
      hasError: false,
    };

    this.uploadingFiles.clear();
    this.completedUploads.clear();
    this.saveState();
    this.notifyListeners();

    // Start simulating progress
    this.startProgressSimulation();

    // Connect to SSE
    this.connectSSE(batchId, userId);
  }

  private startProgressSimulation() {
    // Stop any existing interval first
    this.stopProgressSimulation();
    
    console.log("[BatchUploadManager] Starting progress simulation");
    
    // Simulate progress every 500ms, increment by 1% until 95%
    this.progressInterval = setInterval(() => {
      if (this.isCancelled || this.state.isComplete) {
        this.stopProgressSimulation();
        return;
      }

      let hasChanges = false;
      
      for (const fileName of Object.keys(this.state.files)) {
        const fileState = this.state.files[fileName];
        
        // Don't simulate for completed or failed files
        if (fileState.status === "completed" || fileState.status === "failed" || fileState.status === "error") {
          continue;
        }
        
        // Initialize simulated progress if not set
        if (this.simulatedProgress[fileName] === undefined) {
          this.simulatedProgress[fileName] = fileState.progress || 0;
        }
        
        // Increment simulated progress up to 95% (leave room for real 100%)
        if (this.simulatedProgress[fileName] < 95) {
          this.simulatedProgress[fileName] += 1;
          
          // Use simulated progress if it's higher than current
          if (this.simulatedProgress[fileName] > fileState.progress) {
            this.state.files[fileName] = {
              ...fileState,
              progress: this.simulatedProgress[fileName],
              status: fileState.status === "pending" ? "processing" : fileState.status,
            };
            hasChanges = true;
          }
        }
      }
      
      if (hasChanges) {
        console.log("[BatchUploadManager] Simulated progress updated:", this.simulatedProgress);
        this.updateOverallProgress();
        this.saveState();
        this.notifyListeners();
      }
    }, 500);
  }

  private stopProgressSimulation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private connectSSE(batchId: string, userId?: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    console.log("[BatchUploadManager] Connecting to SSE for batch:", batchId);

    const userIdParam = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.eventSource = new EventSource(
      `${apiUrl}/api/v1/batches/events/${batchId}${userIdParam}`
    );

    this.eventSource.onopen = () => {
      console.log("[BatchUploadManager] SSE connected");
      this.state.isConnected = true;
      this.notifyListeners();
    };

    this.eventSource.onerror = (error) => {
      console.error("[BatchUploadManager] SSE error:", error);
      this.state.isConnected = false;
      this.notifyListeners();
    };

    this.eventSource.addEventListener("batch_update", (event) => {
      this.handleBatchUpdate(event);
    });
  }

  private async handleBatchUpdate(event: MessageEvent) {
    try {
      const parsed = JSON.parse(event.data);
      const jobsList = Array.isArray(parsed) ? parsed : [parsed];

      console.log("[BatchUploadManager] Batch update:", jobsList);

      let allInTerminalState = true;
      let hasError = false;

      for (const job of jobsList) {
        const fileName = job.fileName;
        if (!fileName) continue;

        const backendProgress = Number(job.progress) || 0;
        const status = job.status as FileUploadState["status"];

        // Initialize simulated progress if not set
        if (this.simulatedProgress[fileName] === undefined) {
          this.simulatedProgress[fileName] = backendProgress;
        }

        // Use max of simulated and backend progress (unless completed/failed)
        let finalProgress = backendProgress;
        if (status === "completed") {
          finalProgress = 100;
          // Update simulated progress to 100 so it stops
          this.simulatedProgress[fileName] = 100;
        } else if (status !== "failed" && status !== "error") {
          // Use the higher of simulated or backend progress
          const simulated = this.simulatedProgress[fileName] || 0;
          finalProgress = Math.max(simulated, backendProgress);
          console.log(`[BatchUploadManager] ${fileName}: backend=${backendProgress}, simulated=${simulated}, final=${finalProgress}`);
          // Update simulated to backend if backend is higher
          if (backendProgress > simulated) {
            this.simulatedProgress[fileName] = backendProgress;
          }
        }

        // Update file state
        this.state.files[fileName] = {
          fileName,
          progress: finalProgress,
          status,
          error: job.error,
          jobId: job.jobId,
        };

        if (status !== "completed" && status !== "failed") {
          allInTerminalState = false;
        }

        if (status === "failed") {
          hasError = true;
        }

        // Handle completed files - upload to repository
        if (
          status === "completed" &&
          !this.uploadingFiles.has(fileName) &&
          !this.completedUploads.has(fileName)
        ) {
          this.uploadingFiles.add(fileName);
          this.uploadFileToRepository(fileName);
        }
      }

      this.state.hasError = hasError;
      this.updateOverallProgress();
      this.saveState();
      this.notifyListeners();

      // If all files are in terminal state (completed/failed), disconnect SSE
      // This prevents the reconnect loop when backend closes the connection
      if (allInTerminalState) {
        console.log("[BatchUploadManager] All files in terminal state, closing SSE to prevent reconnect loop");
        this.stopProgressSimulation();
        this.disconnect();
      }

      if (hasError) {
        this.handleError();
      }
    } catch (err) {
      console.error("[BatchUploadManager] Parse error:", err);
    }
  }

  private async uploadFileToRepository(fileName: string) {
    if (!this.uploadDocumentFn) {
      console.error("[BatchUploadManager] No upload function set");
      return;
    }

    // Check if cancelled before starting
    if (this.isCancelled) {
      console.log(`[BatchUploadManager] Upload cancelled, skipping: ${fileName}`);
      return;
    }

    try {
      const file = await getFile(fileName);
      if (!file) {
        console.error("[BatchUploadManager] File not found in IndexedDB:", fileName);
        toast.error(`File ${fileName} not found. Please re-upload.`);
        this.uploadingFiles.delete(fileName);
        return;
      }

      // Check again if cancelled
      if (this.isCancelled) {
        console.log(`[BatchUploadManager] Upload cancelled, skipping: ${fileName}`);
        return;
      }

      console.log("[BatchUploadManager] Uploading to repository:", fileName);

      // Update status to uploading
      this.state.files[fileName] = {
        ...this.state.files[fileName],
        status: "uploading",
      };
      this.notifyListeners();

      await this.uploadDocumentFn(file);

      // Check if cancelled after upload completes
      if (this.isCancelled) {
        console.log(`[BatchUploadManager] Upload completed but cancelled, ignoring: ${fileName}`);
        return;
      }

      console.log("[BatchUploadManager] Upload complete:", fileName);
      this.completedUploads.add(fileName);
      this.uploadingFiles.delete(fileName);
      
      // Update status to completed (upload to repository done)
      this.state.files[fileName] = {
        ...this.state.files[fileName],
        status: "completed",
      };
      this.saveState();
      this.notifyListeners();

      // Check if all uploads are complete
      const totalFiles = Object.keys(this.state.files).length;
      this.checkAllUploadsComplete(totalFiles);
    } catch (error) {
      // If cancelled, don't treat as error
      if (this.isCancelled) {
        console.log(`[BatchUploadManager] Upload error ignored (cancelled): ${fileName}`);
        return;
      }
      console.error("[BatchUploadManager] Upload error for", fileName, error);
      // On any error, clean up everything and reload
      this.handleError();
    }
  }

  private checkAllUploadsComplete(totalFiles: number) {
    console.log(`[BatchUploadManager] Checking completion: ${this.completedUploads.size}/${totalFiles} uploads done`);
    if (this.completedUploads.size === totalFiles) {
      console.log("[BatchUploadManager] All files uploaded successfully!");
      this.handleComplete();
    }
  }

  private handleComplete() {
    this.state.isComplete = true;
    this.disconnect();
    this.cleanup();
    toast.success("All files processed and uploaded successfully!");
    this.notifyListeners();
  }

  private handleError() {
    console.error("[BatchUploadManager] Batch processing error - cleaning up and reloading");
    
    // Disconnect SSE first
    // this.disconnect();
    
    // Clear ALL localStorage
    // localStorage.clear();
    
    // Clear IndexedDB
    clearStoredFiles();
    
    // Show error toast
    toast.error("Processing failed. Page will reload.");
    
    // Reload page after a short delay to show the toast
    setTimeout(() => {
      // window.location.reload();
    }, 1500);
  }

  disconnect() {
    if (this.eventSource) {
      console.log("[BatchUploadManager] Disconnecting SSE");
      this.eventSource.close();
      this.eventSource = null;
    }
    this.state.isConnected = false;
    this.notifyListeners();
  }

  cleanup() {
    // Set cancelled flag to stop any ongoing uploads
    this.isCancelled = true;
    
    // Stop progress simulation
    this.stopProgressSimulation();
    
    // Clear all localStorage items related to batch
    localStorage.removeItem("currentBatchId");
    localStorage.removeItem("batch_files_progress");
    localStorage.removeItem("batch_uploaded_files");
    localStorage.removeItem("batch_file_metadata");

    // Clear IndexedDB
    clearStoredFiles();

    // Reset simulated progress
    this.simulatedProgress = {};

    // Reset state
    this.state = {
      batchId: null,
      files: {},
      fileMetadata: [],
      overallProgress: 0,
      isConnected: false,
      isComplete: true,
      hasError: false,
    };
    this.uploadingFiles.clear();
    this.completedUploads.clear();
    
    this.notifyListeners();
  }

  getState(): BatchUploadState {
    return { ...this.state };
  }

  isActive(): boolean {
    return !!this.state.batchId && !this.state.isComplete;
  }
}

// React hook to use the BatchUploadManager
export function useBatchUpload() {
  const [state, setState] = useState<BatchUploadState>({
    batchId: null,
    files: {},
    fileMetadata: [],
    overallProgress: 0,
    isConnected: false,
    isComplete: false,
    hasError: false,
  });

  const {user} = useUser();
  

  const managerRef = useRef<BatchUploadManager | null>(null);
  

  useEffect(() => {
    // Get singleton instance
    managerRef.current = BatchUploadManager.getInstance();

    // Subscribe to state changes
    const unsubscribe = managerRef.current.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const startBatch = useCallback(
    async (batchId: string, fileNames: string[], fileMetadata: FileMetadata[]) => {
      managerRef.current?.startBatch(batchId, fileNames, fileMetadata, user?.id);
    },
    [user?.id]
  );

  const setUploadDocumentFn = useCallback(
    (fn: (file: File) => Promise<void>) => {
      managerRef.current?.setUploadDocumentFn(fn);
    },
    []
  );

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  const cleanup = useCallback(() => {
    managerRef.current?.cleanup();
  }, []);

  const isActive = useCallback(() => {
    return managerRef.current?.isActive() ?? false;
  }, []);

  const getFileProgress = useCallback(
    (fileName: string): FileUploadState | undefined => {
      return state.files[fileName];
    },
    [state.files]
  );

  return {
    state,
    startBatch,
    setUploadDocumentFn,
    disconnect,
    cleanup,
    isActive,
    getFileProgress,
  };
}

export default useBatchUpload;
