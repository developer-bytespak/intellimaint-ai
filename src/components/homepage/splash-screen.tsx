"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    let completeTimer: NodeJS.Timeout | null = null;

    const timer = setTimeout(() => {
      setIsVisible(false);
      completeTimer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
        // Do not perform router redirects here — let caller decide
      }, 300);
    }, 4800);

    return () => {
      clearTimeout(timer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[#1d4ed8]/6 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[#1d4ed8]/6 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1d4ed8]/6 blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="animate-logo-enter" style={{ animationDelay: "1s" }}>
            <div className="h-32 w-32 md:h-40 md:w-40 relative animate-logo-rotate-splash">
              <Image src="/Intelliment LOgo.png" alt="IntelliMaint AI" fill sizes="160px" className="object-contain" />
            </div>
          </div>
        </div>

        <div className="animate-text-enter" style={{ animationDelay: "0.3s" }}>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            <span className="text-white">IntelliMaint</span>
            <span className="text-white ml-2">AI</span>
          </h1>
        </div>

        <div className="animate-text-enter" style={{ animationDelay: "0.6s" }}>
          <p className="text-lg md:text-xl text-slate-400 text-center font-light tracking-wide">
            Virtual mechanic assistance and knowledge-first maintenance.
          </p>
        </div>

        <div className="animate-text-enter mt-8" style={{ animationDelay: "0.9s" }}>
          <div className="flex space-x-2">
            <div className="h-2 w-2 rounded-full bg-[#3b82f6] animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="h-2 w-2 rounded-full bg-[#3b82f6] animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="h-2 w-2 rounded-full bg-[#3b82f6] animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
