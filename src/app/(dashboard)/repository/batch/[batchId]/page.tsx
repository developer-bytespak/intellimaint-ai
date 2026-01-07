

// Update: batch/[batchId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";

type JobStatus = "queued" | "processing" | "completed" | "failed";

interface BatchJob {
  jobId: string;
  fileName: string;
  status: JobStatus;
  progress?: any;
  content?: string;
  error?: string;
}

export default function BatchStatusPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const router = useRouter();

  const [jobs, setJobs] = useState<Record<string, BatchJob>>({});
  const [connected, setConnected] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // ----------------------------------
  // LOAD INITIAL STATE FROM LOCALSTORAGE
  // ----------------------------------
  useEffect(() => {
    // Get selected files from localStorage to show initial state
    const storedBatchId = localStorage.getItem("currentBatchId");
    if (storedBatchId === batchId) {
      // Initialize jobs with "processing" status
      const uploadedKey = `batch_files_${batchId}`;
      const storedFiles = localStorage.getItem(uploadedKey);
      
      if (storedFiles) {
        try {
          const fileNames: string[] = JSON.parse(storedFiles);
          const initialJobs: Record<string, BatchJob> = {};
          
          fileNames.forEach((fileName, index) => {
            initialJobs[`temp-${index}`] = {
              jobId: `temp-${index}`,
              fileName,
              status: "processing",
              progress: "start"
            };
          });
          
          setJobs(initialJobs);
          setInitializing(false);
        } catch (e) {
          console.error("Failed to parse stored files", e);
        }
      }
    }
  }, [batchId]);

  // ----------------------------------
  // SSE CONNECTION
  // ----------------------------------
useEffect(() => {
    if (!batchId) return;

    console.log("[SSE] connecting to batch", batchId);
    
    let isClosed = false;  // 🆕 Track if we intentionally closed

    const evtSource = new EventSource(
      `http://localhost:8000/api/v1/batches/events/${batchId}`
    );
    
    evtSource.onopen = () => {
      console.log("[SSE] connected");
      setConnected(true);
      setInitializing(false);
    };

    evtSource.addEventListener("batch_update", (event) => {
      console.log("[SSE] RAW EVENT DATA:", event.data);

      try {
        const parsed = JSON.parse(event.data);
        const jobsList: BatchJob[] = Array.isArray(parsed) ? parsed : [parsed];

        const next: Record<string, BatchJob> = {};
        jobsList.forEach((job) => {
          next[job.jobId] = job;
        });
        
        setJobs(next);
        
        // 🆕 Check if all done and close connection
        const allDone = jobsList.every(
          job => job.status === "completed" || job.status === "failed"
        );
        
        if (allDone && jobsList.length > 0) {
          console.log("[SSE] All jobs done, closing connection");
          isClosed = true;
          evtSource.close();
          setConnected(false);
        }
        
      } catch (err) {
        console.error("[SSE] JSON PARSE FAILED", err);
      }
    });

    evtSource.onerror = (err) => {
      console.warn("[SSE] error/disconnected", err);
      if (!isClosed) {  // 🆕 Only reconnect if not intentionally closed
        setConnected(false);
        // Don't auto-reconnect, let user refresh if needed
      }
      evtSource.close();
    };

    return () => {
      isClosed = true;
      evtSource.close();
    };
  }, [batchId]);

  const jobList = Object.values(jobs);

  return (
    <PageTransition>
      <main className="min-h-screen bg-[#1f2632] text-white p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">
            Batch Processing Status
          </h1>

          <button
            onClick={() => router.push("/repository")}
            className="text-sm text-blue-400 hover:underline"
          >
            ← Back to Repository
          </button>
        </div>

        {/* Connection Status */}
        <div className="mb-4 text-sm">
          SSE Status:{" "}
          <span
            className={
              connected ? "text-green-400" : initializing ? "text-yellow-400" : "text-blue-400"
            }
          >
            {connected ? "Connected" : initializing ? "Connecting..." : "Processing"}
          </span>
        </div>

        {/* Jobs Table */}
        <div className="bg-white/10 rounded-xl overflow-hidden">
          {/* Horizontal Scroll Wrapper for Mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-3 text-left whitespace-nowrap">File</th>
                  <th className="p-3 text-left whitespace-nowrap">Status</th>
                  <th className="p-3 text-left whitespace-nowrap">Progress</th>
                  <th className="p-3 text-left whitespace-nowrap">Error</th>
                </tr>
              </thead>
              <tbody>
                {jobList.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-white/50"
                    >
                      {initializing ? "Loading jobs..." : "No jobs found"}
                    </td>
                  </tr>
                )}

                {jobList.map((job) => (
                  <tr
                    key={job.jobId}
                    className="border-t border-white/10"
                  >
                    <td className="p-3 max-w-[200px] truncate" title={job.fileName}>
                      {job.fileName}
                    </td>
                    <td className="p-3 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          job.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : job.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : job.status === "queued"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {job.progress !== undefined && job.progress !== "start"
                        ? `${job.progress}%`
                        : job.progress === "start"
                        ? "0%"
                        : "-"}
                    </td>
                    <td className="p-3 text-red-400 max-w-[200px] truncate" title={job.error || "-"}>
                      {job.error || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}