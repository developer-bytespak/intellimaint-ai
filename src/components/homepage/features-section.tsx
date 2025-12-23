"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CORE_CAPABILITIES } from "@/content/homepageContent";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
  index: number;
}

function FeatureCard({ icon, title, description, gradient, delay, index }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { ref: cardRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

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

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className="group relative"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[--color-surface-alt]/90 via-[--color-surface-alt]/70 to-[--color-surface-alt]/90 p-8 sm:p-10 backdrop-blur-xl transition-all duration-300 ${
          isHovered ? "shadow-2xl shadow-[#1d4ed8]/20" : "shadow-xl shadow-black/20"
        } ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{
          transform: isVisible
            ? isHovered
              ? `perspective(1200px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) translateZ(40px) scale(1.03)`
              : `perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)`
            : "perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)",
          transformStyle: "preserve-3d",
          transition: isVisible
            ? `transform 0.3s cubic-bezier(0.23, 1, 0.32, 1) ${delay * 0.1}s, opacity 0.6s ease-out ${delay * 0.1}s, border-color 0.3s ease 0s, box-shadow 0.3s ease 0s`
            : `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, opacity 0.6s ease-out 0s`,
        }}
      >
        {/* Animated gradient border glow */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 ${
            isHovered ? "opacity-20" : ""
          }`}
          style={{ transform: "translateZ(-5px)" }}
        />

        {/* subtle border stroke (use inset shadow to avoid global white border) */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: isHovered ? "inset 0 0 0 1px rgba(59,130,246,0.08)" : "inset 0 0 0 1px rgba(255,255,255,0.04)",
            transition: "box-shadow 0.25s ease",
            transform: "translateZ(5px)",
          }}
        />

        {/* subtle blue tint / lightening overlay for cards */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: isHovered
              ? "linear-gradient(135deg, rgba(29,78,216,0.12), rgba(59,130,246,0.06))"
              : "linear-gradient(135deg, rgba(8,18,34,0.06), rgba(8,18,34,0.01))",
            transition: "background 0.25s ease",
            transform: "translateZ(2px)",
          }}
        />

        {/* 3D Depth layers */}
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-black/40 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ transform: "translateZ(-15px)" }}
        />

        {/* Animated corner accents (blue theme) */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#1d4ed8]/20 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#3b82f6]/20 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content with 3D depth */}
        <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
          {/* Icon container with enhanced 3D effect */}
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d4ed8]/30 via-[#3b82f6]/20 to-[#1d4ed8]/30 backdrop-blur-sm border border-[#1d4ed8]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:shadow-[#1d4ed8]/30"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="relative" style={{ transform: "translateZ(10px)" }}>
              {icon}
            </div>
            {/* Icon glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1d4ed8]/40 to-[#3b82f6]/40 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
          </div>

          {/* Title with 3D text effect */}
          <h3
            className={`mb-4 text-2xl font-bold text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1d4ed8] group-hover:to-[#3b82f6] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              textShadow: isHovered ? "0 5px 20px rgba(59,130,246,0.32)" : "none",
              transform: "translateZ(25px)",
              transitionDelay: isVisible ? `${delay * 0.1}s` : "0s",
            }}
          >
            {title}
          </h3>

          {/* Description */}
          <p
            className="text-sm leading-relaxed text-slate-300 group-hover:text-slate-200 transition-colors duration-300"
            style={{ transform: "translateZ(20px)" }}
          >
            {description}
          </p>
        </div>

        {/* Animated shine effect */}
        <div
          className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ${
            isHovered ? "translate-x-full" : ""
          }`}
          style={{ transform: "translateZ(10px)" }}
        />

        {/* floating particles removed */}
      </div>
    </div>
  );
}

function ScrollAnimatedHeader({ title, titleHighlight, description }: { title: string; titleHighlight: string; description: string }) {
  const { ref: headerRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div
      ref={headerRef}
      className="text-center mb-16 sm:mb-20"
    >
      <h2
        className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{
          transform: "translateZ(50px)",
        }}
      >
        {title}
        <br />
        <span className="bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#1d4ed8] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
          {titleHighlight}
        </span>
      </h2>
      <p
        className="mx-auto max-w-2xl text-xl text-slate-300"
        style={{ transform: "translateZ(30px)" }}
      >
        {description}
      </p>
    </div>
  );
}

export function FeaturesSection() {
  const features = CORE_CAPABILITIES.map((c, idx) => {
    let icon = (
      <svg className="h-10 w-10 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l4-4m-4 4l-4-4" /></svg>
    );

    if (c.id === "manual-library") {
      icon = (<svg className="h-10 w-10 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>);
    } else if (c.id === "visual-diagnostics") {
      icon = (<svg className="h-10 w-10 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.236V6a2 2 0 00-2-2H6a2 2 0 00-2 2v.236c0 .393.213.76.553.988L9 10m6 0v6a2 2 0 01-2 2H11a2 2 0 01-2-2v-6" /></svg>);
    } else if (c.id === "voice-assist") {
      icon = (<svg className="h-10 w-10 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v11M8 21h8M6 11a6 6 0 0012 0" /></svg>);
    }

    return {
      icon,
      title: c.title,
      description: c.description,
      gradient: "from-[#1d4ed8] to-[#3b82f6]",
    };
  });

  return (
    <section id="features" className="relative pt-20 sm:pt-24 lg:pt-32 pb-20 sm:pb-24 lg:pb-32 overflow-hidden" style={{ perspective: "2000px" }}>
      {/* Realistic 3D trading background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
        {/* Soft centered panel behind cards to match card theme */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: "preserve-3d", zIndex: 5 }}>
          <div style={{
            width: 'min(1200px, 92%)',
            height: '72%',
            borderRadius: '36px',
            transform: 'translateZ(-40px)',
            background: 'radial-gradient(60% 60% at 20% 30%, rgba(29,78,216,0.06), rgba(59,130,246,0.03) 25%, transparent 45%), radial-gradient(60% 60% at 80% 70%, rgba(59,130,246,0.03), transparent 40%)',
            filter: 'blur(28px)',
            mixBlendMode: 'overlay',
            opacity: 0.95,
          }} />
        </div>
        {/* Subtle gradient orbs for depth */}
        <div
          className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-[#1d4ed8]/8 to-[#3b82f6]/6 blur-3xl"
          style={{ transform: "translateZ(-200px)" }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-[#1d4ed8]/8 to-[#3b82f6]/4 blur-3xl"
          style={{ transform: "translateZ(-150px)" }}
        />

        {/* Centered background image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateZ(-100px)" }}>
          <div className="w-[520px] sm:w-[680px] md:w-[760px] lg:w-[900px] pointer-events-none opacity-[0.95]">
            <Image src="/images/feature3.png" alt="Features background" width={900} height={400} className="w-full h-auto object-contain" />
          </div>
        </div>

        {/* Other decorative SVGs removed — using only the image background for this section */}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        {/* Section Header */}
        <ScrollAnimatedHeader
          title="Core Capabilities"
          titleHighlight="for IntelliMaint AI"
          description="Document upload, a huge collection of manuals, LLM fallback, an AI virtual mechanic, and voice agents to assist users"
        />

        {/* Features Grid with enhanced spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pb-4" style={{ transformStyle: "preserve-3d" }}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={0}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
