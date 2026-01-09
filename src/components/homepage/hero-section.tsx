"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { renderCanvas } from "@/components/ui/canvas";
import { Lightning } from "@/components/ui/lightning";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    renderCanvas();
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = async () => {
    setIsCheckingAuth(true);
    // Static button - no external auth/redirect. Keep UI only.
    setTimeout(() => setIsCheckingAuth(false), 600);
  };

  return (
    <section className="relative  min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-black">
      {/* Lightning effect - bottom layer (z-0) */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <Lightning
          hue={220}
          xOffset={0}
          speed={1.6}
          intensity={0.6}
          size={2}
        />
      </div>

      {/* Canvas particle animation - middle layer (z-[5]) */}
      {/*
      <canvas
        className="pointer-events-none absolute inset-0 z-[5]"
        id="canvas"
        style={{ width: '100%', height: '100%' }}
      ></canvas>
      */}

      {/* Content - top layer (z-10) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-20" style={{ perspective: "1000px" }}>
        <div className="space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white animate-fade-in" style={{ textShadow: "0 10px 40px rgba(14,165,255,0.12), 0 5px 20px rgba(14,165,255,0.08)", transform: "translateZ(50px)" }}>
            Welcome to IntelliMaint AI
            <br />
            <span className="bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] bg-clip-text text-transparent">Your Troubleshooting Assistant</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg sm:text-xl md:text-2xl text-slate-300 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Upload documents, search a 60,000+ manual database, chat with a virtual mechanic backed by LLMs, and use speech-to-text voice agents for hands-free support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link href="/signup" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] px-8 py-4 text-base sm:text-lg font-semibold text-white shadow-xl shadow-[#1d4ed8]/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#1d4ed8]/30">
              <span className="relative z-10 flex items-center gap-2">Get Started</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <button onClick={scrollToFeatures} className="group rounded-xl border-2 border-slate-600 bg-slate-900/40 backdrop-blur px-8 py-4 text-base sm:text-lg font-semibold text-white transition-all duration-300 hover:border-[#3b82f6]/50 hover:bg-slate-800/60">
              <span className="flex items-center gap-2">Learn More</span>
            </button>
          </div>

          {/* <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s", transform: "translateZ(30px)" }}>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#3b82f6] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(59,130,246,0.18)", transform: "translateZ(20px)" }}>60K+</div>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Manuals in Database</div>
            </div>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#3b82f6] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(59,130,246,0.18)", transform: "translateZ(20px)" }}>Fallback</div>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">LLM Fallback in Chat</div>
            </div>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#3b82f6] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(59,130,246,0.18)", transform: "translateZ(20px)" }}>Virtual</div>
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#10b981] rounded-full animate-pulse" style={{ transform: "translateZ(25px)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.8)" }} />
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">AI Chatbot (Virtual Mechanic)</div>
            </div>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#3b82f6] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(59,130,246,0.18)", transform: "translateZ(20px)" }}>Voice</div>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Speech-to-Text Agent</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* hero scroll arrow removed */}
    </section>
  );
}

/* animation code moved to src/components/ui/canvas.ts - imported at top of file */
