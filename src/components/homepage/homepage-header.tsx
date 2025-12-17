"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export function HomepageHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-[--color-border] shadow-lg" : "bg-black/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12">
              <Image src="/Intelliment LOgo.png" alt="IntelliMaint AI" fill sizes="48px" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-lg font-bold uppercase tracking-[0.15em] text-white">IntelliMaint AI</span>
              <span className="text-[10px] sm:text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Virtual Mechanic Platform</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("features")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How It Works</button>
            <button onClick={() => scrollToSection("pricing")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</button>
            <button onClick={() => scrollToSection("contact")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="group rounded-xl border-2 border-transparent bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[#1d4ed8] hover:to-[#3b82f6] hover:border-none hover:scale-105">Login</Link>
            <Link href="/signup" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1d4ed8]/25 transition-all duration-300 hover:scale-105">Sign Up</Link>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[--color-surface] transition-colors" aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#1d4ed8]"></div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[--color-border] bg-black/95 backdrop-blur-md">
          <nav className="px-4 py-4 space-y-3">
            <button onClick={() => scrollToSection("features")} className="block w-full text-left text-sm font-medium text-slate-300 hover:text-white py-2">Features</button>
            <button onClick={() => scrollToSection("how-it-works")} className="block w-full text-left text-sm font-medium text-slate-300 hover:text-white py-2">How It Works</button>
            <button onClick={() => scrollToSection("pricing")} className="block w-full text-left text-sm font-medium text-slate-300 hover:text-white py-2">Pricing</button>
            <button onClick={() => scrollToSection("contact")} className="block w-full text-left text-sm font-medium text-slate-300 hover:text-white py-2">Contact</button>

            <div className="pt-4 border-t border-[--color-border] space-y-3">
              <Link href="/login" className="w-full rounded-xl inline-block text-center px-6 py-2.5 text-sm font-semibold text-white bg-transparent hover:bg-gradient-to-r hover:from-[#1d4ed8] hover:to-[#3b82f6]">Login</Link>
              <Link href="/signup" className="w-full rounded-xl inline-block text-center bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] px-6 py-2.5 text-sm font-semibold text-white">Sign Up</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
