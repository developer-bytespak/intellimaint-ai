"use client";

export default function ChatSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-gradient-to-r from-[#232a33] to-[#1f2632] animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-[#2a3441] rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-[#2a3441] rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#2a3441] ml-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
