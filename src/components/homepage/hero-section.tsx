"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [candlestickData, setCandlestickData] = useState<Array<any> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const generateCandlestickData = () => {
      const data = [];
      for (let i = 0; i < 10; i++) {
        const x = 15 + i * 18;
        const isGreen = Math.random() > 0.4;
        const open = 40 + Math.random() * 20;
        const close = open + (isGreen ? Math.random() * 8 : -Math.random() * 8);
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        data.push({ x, isGreen, open, close, high, low });
      }
      return data;
    };

    setCandlestickData(generateCandlestickData());
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-20" style={{ perspective: "1000px" }}>
        <div className="space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white animate-fade-in" style={{ textShadow: "0 10px 40px rgba(252, 79, 2, 0.3), 0 5px 20px rgba(252, 79, 2, 0.2)", transform: "translateZ(50px)" }}>
            Unlock Your Trading Potential
            <br />
            <span className="bg-gradient-to-r from-[#fc4f02] to-[#fda300] bg-clip-text text-transparent">with AI-Powered Insights</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg sm:text-xl md:text-2xl text-slate-300 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Automate your crypto and stock trading with powerful AI strategies. Real-time sentiment analysis, portfolio optimization, and seamless multi-exchange connectivity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link href="/signup" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#fc4f02] to-[#fda300] px-8 py-4 text-base sm:text-lg font-semibold text-white shadow-xl shadow-[#fc4f02]/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#fc4f02]/40">
              <span className="relative z-10 flex items-center gap-2">Get Started</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <button onClick={scrollToFeatures} className="group rounded-xl border-2 border-slate-600 bg-slate-900/40 backdrop-blur px-8 py-4 text-base sm:text-lg font-semibold text-white transition-all duration-300 hover:border-[#fc4f02]/50 hover:bg-slate-800/60">
              <span className="flex items-center gap-2">Learn More</span>
            </button>
          </div>

          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s", transform: "translateZ(30px)" }}>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#fc4f02] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(252, 79, 2, 0.4)", transform: "translateZ(20px)" }}>10K+</div>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Active Traders</div>
            </div>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#fc4f02] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(252, 79, 2, 0.4)", transform: "translateZ(20px)" }}>$500M+</div>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Trading Volume</div>
            </div>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#fc4f02] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(252, 79, 2, 0.4)", transform: "translateZ(20px)" }}>99.9%</div>
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#10b981] rounded-full animate-pulse" style={{ transform: "translateZ(25px)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.8)" }} />
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Uptime</div>
            </div>
            <div className="text-center group relative">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#fc4f02] mb-2 transition-all duration-300 group-hover:scale-110" style={{ textShadow: "0 5px 20px rgba(252, 79, 2, 0.4)", transform: "translateZ(20px)" }}>24/7</div>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">AI Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
