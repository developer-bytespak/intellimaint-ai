"use client";

import React from "react";

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number; // diameter in px
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
  className?: string;
  status?: "pending" | "uploading" | "processing" | "completed" | "error" | "failed";
}

export function CircularProgress({
  progress,
  size = 48,
  strokeWidth = 4,
  trackColor = "rgba(255,255,255,0.2)",
  progressColor = "#3b82f6",
  showPercentage = true,
  className = "",
  status,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Determine color based on status
  const getProgressColor = () => {
    if (status === "completed") return "#22c55e"; // green
    if (status === "error" || status === "failed") return "#ef4444"; // red
    if (status === "processing") return "#3b82f6"; // blue
    if (status === "uploading") return "#f59e0b"; // amber
    return progressColor;
  };

  const getStatusIcon = () => {
    if (status === "completed") {
      return (
        <svg
          className="w-1/2 h-1/2 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }
    if (status === "error" || status === "failed") {
      return (
        <svg
          className="w-1/2 h-1/2 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }
    return null;
  };

  const statusIcon = getStatusIcon();

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {statusIcon ? (
          statusIcon
        ) : showPercentage ? (
          <span
            className="text-white font-semibold"
            style={{ fontSize: size * 0.22 }}
          >
            {Math.round(progress)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default CircularProgress;
