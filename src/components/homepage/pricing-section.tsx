"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  gradient: string;
}

function ScrollAnimatedHeader({ title, titleHighlight, description }: { title: string; titleHighlight: string; description: string }) {
  const { ref: headerRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div ref={headerRef} className="text-center mb-12 sm:mb-16">
      <h2 className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {title}
        <span className="bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] bg-clip-text text-transparent"> {titleHighlight}</span>
      </h2>
      <p className="mx-auto max-w-2xl text-xl text-slate-300">{description}</p>
    </div>
  );
}

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  const { ref: cardRef, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const handleGetStarted = async () => {
    setIsCheckingAuth(true);
    // Static UI-only button; no auth flow or redirects.
    setTimeout(() => setIsCheckingAuth(false), 600);
  };

  return (
    <div ref={cardRef} className="relative h-full">
      {tier.popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10"><span className="inline-block bg-[#1d4ed8] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wide">Popular</span></div>
      )}

      <div className={`relative rounded-lg border-2 bg-gradient-to-br from-[--color-surface-alt]/90 via-[--color-surface-alt]/70 to-[--color-surface-alt]/90 backdrop-blur-xl p-5 h-full flex flex-col transition-all duration-200 ${tier.popular ? "border-[#1d4ed8]/60" : "border-[--color-border]"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} hover:border-[#1d4ed8]/60`} style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}>
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h3 className={`text-lg font-semibold text-white mb-1 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: isVisible ? `${(index * 100) + 150}ms` : "0ms" }}>{tier.name}</h3>
            <p className="text-xs text-slate-500">{tier.description}</p>
          </div>

          <div className="mb-5 pb-4 border-b border-[--color-border]"><div className="flex items-baseline gap-1.5"><span className="text-3xl font-bold text-white">{tier.price}</span>{tier.price !== "Custom" && (<span className="text-sm text-slate-500 font-normal">/{tier.period}</span>)}</div>{tier.price === "Custom" && (<p className="text-xs text-slate-500 mt-1">Contact for pricing</p>)}</div>

          <ul className="space-y-2.5 mb-5 flex-grow">{tier.features.map((feature, featureIndex) => (<li key={featureIndex} className="flex items-start gap-2"><svg className="h-3.5 w-3.5 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-xs text-slate-400 leading-snug">{feature}</span></li>))}</ul>

          <button onClick={handleGetStarted} disabled={isCheckingAuth} className={`w-full rounded-md px-4 py-2.5 text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${tier.popular ? "bg-[#1d4ed8] text-white hover:bg-[#1661d6]" : "border border-[--color-border] bg-[--color-surface] text-white hover:border-[#1d4ed8]/50 hover:bg-[--color-surface-alt]"}`}>{isCheckingAuth ? "Checking..." : tier.price === "Custom" ? "Contact Sales" : "Get Started"}</button>
        </div>
      </div>
    </div>
  );
}

export function PricingSection() {
  const tiers: PricingTier[] = [
    { name: "Free", price: "$0", period: "month", description: "Try core features", features: ["Document upload trial", "Search manuals database (limited)", "Basic chatbot access", "Voice agent trial"], gradient: "from-slate-600 to-slate-700" },
    { name: "Pro", price: "$99", period: "month", description: "For power users", popular: true, features: ["Full manuals DB access", "LLM fallback responses", "Virtual mechanic chatbot", "Speech-to-text agent", "Priority support"], gradient: "from-[#1d4ed8] to-[#3b82f6]" },
    { name: "Elite", price: "$299", period: "month", description: "For professional traders", features: ["All Pro features", "Custom AI strategies", "Dedicated account manager", "API access", "White-label options", "24/7 premium support"], gradient: "from-[#1d4ed8] to-[#3b82f6]" },
    { name: "Institutional", price: "Custom", period: "contact", description: "Enterprise solutions", features: ["All Elite features", "Custom integrations", "Dedicated infrastructure", "SLA guarantees", "On-premise deployment", "Custom training & support"], gradient: "from-[#10b981] to-[#34d399]" },
  ];

  return (
    <section id="pricing" className="relative pb-20 sm:pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollAnimatedHeader title="Choose Your" titleHighlight="Plan" description="Flexible pricing options for traders of all levels" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (<PricingCard key={index} tier={tier} index={index} />))}
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-400 mb-4 text-sm">Need help choosing a plan?</p>
          <button onClick={() => { const element = document.getElementById("contact"); if (element) element.scrollIntoView({ behavior: "smooth" }); }} className="text-[#3b82f6] hover:text-[#60a5fa] font-semibold transition-colors cursor-pointer text-sm">Contact Sales →</button>
        </div>
      </div>
    </section>
  );
}
