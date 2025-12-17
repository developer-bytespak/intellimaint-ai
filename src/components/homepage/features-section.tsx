"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient, delay, index }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref: cardRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = Math.max(-15, Math.min(15, (y - centerY) / 12));
    const rotateY = Math.max(-15, Math.min(15, (centerX - x) / 12));
    setMousePosition({ x: rotateY, y: rotateX });
  };

  return (
    <div ref={cardRef} className="group relative" style={{ perspective: "1200px" }} onMouseEnter={() => setIsHovered(true)} onMouseMove={handleMouseMove} onMouseLeave={() => { setIsHovered(false); setMousePosition({ x: 0, y: 0 }); }}>
      <div className={`relative overflow-hidden rounded-3xl border-2 border-[--color-border] bg-gradient-to-br from-[--color-surface-alt]/90 via-[--color-surface-alt]/70 to-[--color-surface-alt]/90 p-8 sm:p-10 backdrop-blur-xl transition-all duration-300 ${isHovered ? "border-[#fc4f02]/60 shadow-2xl shadow-[#fc4f02]/30" : "shadow-xl shadow-black/20"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transform: isVisible ? isHovered ? `perspective(1200px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) translateZ(40px) scale(1.03)` : `perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)` : "perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)", transformStyle: "preserve-3d", transition: isVisible ? `transform 0.3s cubic-bezier(0.23, 1, 0.32, 1) ${delay * 0.1}s, opacity 0.6s ease-out ${delay * 0.1}s, border-color 0.3s ease 0s, box-shadow 0.3s ease 0s` : `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, opacity 0.6s ease-out 0s` }}>
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 ${isHovered ? "opacity-20" : ""}`} style={{ transform: "translateZ(-5px)" }} />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-black/40 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: "translateZ(-15px)" }} />
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#fc4f02]/20 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#fda300]/20 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fc4f02]/30 via-[#fda300]/20 to-[#fc4f02]/30 backdrop-blur-sm border border-[#fc4f02]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:shadow-[#fc4f02]/40" style={{ transform: "translateZ(40px)" }}>
            <div className="relative" style={{ transform: "translateZ(10px)" }}>{icon}</div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#fc4f02]/40 to-[#fda300]/40 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
          </div>

          <h3 className={`mb-4 text-2xl font-bold text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#fc4f02] group-hover:to-[#fda300] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ textShadow: isHovered ? "0 5px 20px rgba(252, 79, 2, 0.4)" : "none", transform: "translateZ(25px)", transitionDelay: isVisible ? `${delay * 0.1}s` : "0s" }}>{title}</h3>

          <p className="text-sm leading-relaxed text-slate-300 group-hover:text-slate-200 transition-colors duration-300" style={{ transform: "translateZ(20px)" }}>{description}</p>
        </div>

        <div className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ${isHovered ? "translate-x-full" : ""}`} style={{ transform: "translateZ(10px)" }} />

        {isHovered && ([...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-[#fc4f02] opacity-60 animate-pulse" style={{ left: `${20 + i * 15}%`, top: `${10 + (i % 3) * 30}%`, transform: `translateZ(${20 + i * 5}px)`, animationDelay: `${i * 0.2}s`, animationDuration: "2s" }} />
        )))}
      </div>
    </div>
  );
}

function ScrollAnimatedHeader({ title, titleHighlight, description }: { title: string; titleHighlight: string; description: string }) {
  const { ref: headerRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div ref={headerRef} className="text-center mb-16 sm:mb-20">
      <h2 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transform: "translateZ(50px)" }}>
        {title}
        <br />
        <span className="bg-gradient-to-r from-[#fc4f02] via-[#fda300] to-[#fc4f02] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">{titleHighlight}</span>
      </h2>
      <p className="mx-auto max-w-2xl text-xl text-slate-300" style={{ transform: "translateZ(30px)" }}>{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const features: FeatureItem[] = [
    { icon: (<svg className="h-10 w-10 text-[#fc4f02]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>), title: "AI-Driven Trading Strategies", description: "Leverage advanced machine learning algorithms to optimize portfolios across crypto and stocks.", gradient: "from-[#fc4f02] to-[#fda300]" },
    { icon: (<svg className="h-10 w-10 text-[#1d4ed8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>), title: "Real-Time Sentiment Analysis", description: "Harness the power of sentiment intelligence from news, social media, and market data.", gradient: "from-[#1d4ed8] to-[#3b82f6]" },
    { icon: (<svg className="h-10 w-10 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>), title: "Portfolio Optimization", description: "Automatically optimize risk and return across your entire portfolio.", gradient: "from-[#10b981] to-[#34d399]" },
    { icon: (<svg className="h-10 w-10 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="3" strokeWidth="2" fill="currentColor" opacity="0.3" /><circle cx="12" cy="12" r="1.5" strokeWidth="2" fill="currentColor" /><circle cx="6" cy="8" r="2" strokeWidth="1.5" fill="currentColor" opacity="0.4" /><circle cx="18" cy="8" r="2" strokeWidth="1.5" fill="currentColor" opacity="0.4" /><circle cx="6" cy="16" r="2" strokeWidth="1.5" fill="currentColor" opacity="0.4" /><circle cx="18" cy="16" r="2" strokeWidth="1.5" fill="currentColor" opacity="0.4" /><line x1="8.5" y1="9" x2="10.5" y2="11" strokeWidth="1.5" opacity="0.6" /><line x1="15.5" y1="9" x2="13.5" y2="11" strokeWidth="1.5" opacity="0.6" /><line x1="8.5" y1="15" x2="10.5" y2="13" strokeWidth="1.5" opacity="0.6" /><line x1="15.5" y1="15" x2="13.5" y2="13" strokeWidth="1.5" opacity="0.6" /></svg>), title: "Multi-Exchange Connectivity", description: "Seamlessly connect and trade across exchanges from one unified platform.", gradient: "from-[#f59e0b] to-[#d97706]" },
  ];

  return (
    <section id="features" className="relative pt-20 sm:pt-24 lg:pt-32 pb-20 sm:pb-24 lg:pb-32 overflow-hidden" style={{ perspective: "2000px" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-[#fc4f02]/8 to-[#fda300]/4 blur-3xl" style={{ transform: "translateZ(-200px)" }} />
        <div className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-[#1d4ed8]/8 to-[#3b82f6]/4 blur-3xl" style={{ transform: "translateZ(-150px)" }} />
        <div className="absolute top-0 right-0 w-2/5 h-full opacity-[0.12]" style={{ transform: "translateZ(-100px)" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <ScrollAnimatedHeader title="Powerful Features for" titleHighlight="Modern Traders" description="Everything you need to trade smarter, faster, and more profitably" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pb-4" style={{ transformStyle: "preserve-3d" }}>
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} gradient={feature.gradient} delay={index} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
