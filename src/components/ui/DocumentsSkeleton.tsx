"use client";

export default function DocumentsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 bg-gradient-to-r from-[#232a33] to-[#1f2632] rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#2a3441]" />
            <div className="flex-1">
              <div className="h-4 bg-[#2a3441] rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-[#2a3441] rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
