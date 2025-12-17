"use client";

import React from "react";

type Props = { children?: React.ReactNode };

export function HomepageLayout({ children }: Props) {
  return (
    <div className="relative min-h-screen bg-black" style={{ perspective: "2000px" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
        <div
          className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#1d4ed8]/6 blur-3xl animate-pulse"
          style={{ transform: "translateZ(-100px)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#1d4ed8]/6 blur-3xl animate-pulse"
          style={{ animationDelay: "1s", transform: "translateZ(-150px)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1d4ed8]/6 blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s", transform: "translateZ(-50px)" }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
