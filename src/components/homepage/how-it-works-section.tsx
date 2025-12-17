"use client";

import React from 'react';

const STEPS = [
  { title: 'Upload Documents', desc: 'Upload manuals, schematics and service PDFs to build context.' },
  { title: 'Search Manuals DB', desc: 'Query a 60,000+ manuals database to find exact procedures and specs.' },
  { title: 'Chat with Virtual Mechanic', desc: 'Ask the AI mechanic for diagnostics, repair steps, and troubleshooting.' },
  { title: 'Voice & Field Assistance', desc: 'Use speech-to-text voice agents for hands-free guidance on-site.' },
];

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: string;
}

function StepCard({ number, title, description, icon }: StepProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div ref={cardRef} className="relative group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {number < 4 && (
        <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#1d4ed8]/30 to-transparent z-0 pointer-events-none" style={{ width: "calc(100% - 4rem)" }}>
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#3b82f6] transition-transform duration-300 ${isHovered ? "scale-150" : "scale-100"}`} style={{ willChange: "transform" }} />
        </div>
      )}

      <div className={`relative rounded-3xl border-2 border-[--color-border] bg-gradient-to-br from-[--color-surface-alt]/90 via-[--color-surface-alt]/70 to-[--color-surface-alt]/90 p-6 sm:p-8 backdrop-blur-xl transition-all duration-700 hover:border-[#1d4ed8]/60 hover:shadow-2xl hover:shadow-[#1d4ed8]/20 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} h-64 sm:h-72 lg:h-80 flex flex-col justify-between`} style={{ willChange: "transform", transitionDelay: isVisible ? `${number * 100}ms` : "0ms" }}>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1d4ed8]/10 via-[#3b82f6]/5 to-[#1d4ed8]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#1d4ed8]/15 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#3b82f6]/15 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute -top-5 -left-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#3b82f6] text-xl font-bold text-white shadow-xl shadow-[#1d4ed8]/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#1d4ed8]/30 z-20">
          {number}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#3b82f6] blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
        </div>

        <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d4ed8]/30 via-[#3b82f6]/20 to-[#1d4ed8]/30 backdrop-blur-sm border border-[#1d4ed8]/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#1d4ed8]/40">
          <div className="relative">{icon}</div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1d4ed8]/40 to-[#3b82f6]/40 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
        </div>
        <div className="mt-2">
          <h3 className={`mb-3 text-xl font-bold text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1d4ed8] group-hover:to-[#3b82f6] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: isVisible ? `${(number * 100) + 100}ms` : "0ms" }}>{title}</h3>
          <p className="text-sm leading-relaxed text-slate-300 group-hover:text-slate-200 transition-colors duration-300 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ScrollAnimatedHeader({ title, titleHighlight, description }: { title: string; titleHighlight: string; description: string }) {
  const { ref: headerRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div ref={headerRef} className="text-center mb-16 sm:mb-20">
      <h2 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>{title}<span className="bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] bg-clip-text text-transparent"> {titleHighlight}</span></h2>
      <p className="mx-auto max-w-2xl text-xl text-slate-300">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    { number: 1, title: "Upload Documents", description: "Add manuals, schematics and service PDFs to the platform.", icon: (<svg className="h-10 w-10 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V3m0 0l-3 3m3-3l3 3" /></svg>), delay: "animate-fade-in" },
    { number: 2, title: "Search Manuals DB", description: "Query our 60,000+ manuals database for exact procedures and specs.", icon: (<svg className="h-8 w-8 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>), delay: "animate-fade-in" },
    { number: 3, title: "Chat with Virtual Mechanic", description: "Ask the AI mechanic for diagnostics, step-by-step repairs and guidance.", icon: (<svg className="h-8 w-8 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12v4a2 2 0 01-2 2H5l-4 3V5a2 2 0 012-2h14a2 2 0 012 2v7z" /></svg>), delay: "animate-fade-in" },
    { number: 4, title: "Voice & Field Assistance", description: "Hands-free speech-to-text agents guide technicians on-site.", icon: (<svg className="h-8 w-8 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v11m0 0C9.79 12 8 13.79 8 16v1h8v-1c0-2.21-1.79-4-4-4z" /></svg>), delay: "animate-fade-in" },
  ];

  return (
    <section id="how-it-works" className="relative pt-8 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimatedHeader title="How It" titleHighlight="Works" description="Get started in minutes and start trading smarter today" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative -mt-6 lg:-mt-8">
          {steps.map((step, index) => (
            <StepCard key={index} number={step.number} title={step.title} description={step.description} icon={step.icon} delay={step.delay} />
          ))}
        </div>
      </div>
    </section>
  );
}
