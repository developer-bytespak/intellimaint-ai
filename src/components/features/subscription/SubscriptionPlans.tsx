"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlanCard from './PlanCard';
import Animation from '@/components/ui/Animation'

interface Plan {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  buttonColor?: string;
}

const plans: Plan[] = [
  {
    id: 'military',
    name: 'Military Plan',
    category: 'Military Plan',
    price: 99,
    description: 'Special plan for military personnel',
    features: ['Unlimited scans', 'Advanced Troubleshooting', 'Secure Access'],
    isPopular: false,
    buttonText: 'Upgrade Plan',
    buttonColor: 'bg-green-600',
  },
  {
    id: 'facilities',
    name: 'Facilities Chief',
    category: 'Facilities Chief',
    price: 149,
    description: 'Designed for facility management',
    features: ['All Pro Features', 'Full Repository Access', 'Priority Support'],
    isPopular: true,
    buttonText: 'Upgrade Plan',
    buttonColor: 'bg-blue-600',
  },
  {
    id: 'engineering',
    name: 'Engineering',
    category: 'Engineering',
    price: 199,
    description: 'For engineering professionals',
    features: ['All Pro Features', 'Full Repository Access', 'Priority Support'],
    isPopular: false,
    buttonText: 'Upgrade Plan',
    buttonColor: 'bg-blue-600',
  },
];

export default function SubscriptionPlans() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id || '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cardWidth, setCardWidth] = useState<number>(360);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const visibleCards = 3;
  const gap = 24; // px gap between cards

  // Calculate max index so we don't scroll past the end
  const maxIndex = Math.max(0, plans.length - visibleCards);

  useEffect(() => {
    const compute = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const cw = Math.floor((w - gap * (visibleCards - 1)) / visibleCards);
      setCardWidth(cw);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1D26] py-12 px-4 sm:px-6 lg:px-8">
      {/* Floating back button (navigates to chat) - fixed position */}
      <button
        onClick={() => router.push('/chat')}
        aria-label="Back to chat"
        className="w-10 h-10 rounded-full bg-transparent hover:bg-white/6 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all"
        style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 9999, pointerEvents: 'auto' }}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="w-5 h-5">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <Animation animation="fade" delay={80} duration={600}>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Subscription Plans</h1>
          </div>
        </Animation>

        {/* Promotional Banner */}
        <Animation animation="slideUp" delay={140} duration={700}>
          <div
            className="mb-12 p-6 rounded-2xl shadow-lg flex items-center justify-between gap-6"
            style={{ background: 'linear-gradient(90deg,#006EE6 0%,#00A0FF 100%)' }}
          >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Inline SVG pill (icon + Premium text) per spec */}
              <svg width="100" height="30" viewBox="0 0 90 28" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Premium badge">
                {/* Pill background (now white) */}
                <rect x="0" y="0" width="90" height="28" rx="14" fill="#FFFFFF" />

                {/* Icon background (blue rounded square) */}
                <rect x="4" y="4" width="20" height="20" rx="6" fill="#1E88FF" />

                {/* Crown inside icon (white) */}
                <path d="M8.5 11.5L11 14L13.5 11L16 14L18.5 11.5V16.5C18.5 17.05 18.05 17.5 17.5 17.5H9.5C8.95 17.5 8.5 17.05 8.5 16.5V11.5Z" fill="#FFFFFF" />

                {/* Premium text (blue) */}
                <text x="32" y="18" fontSize="13" fontFamily="Inter, Arial, sans-serif" fontWeight="500" fill="#0B84FF">
                  Premium
                </text>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Get Started with Your Subscription
            </h2>
            <p className="text-blue-50 max-w-xl">
              All plans include a 7-day trial. Easy upgrades, secure billing, and priority support for paid tiers.
            </p>
                  </div>
          <div className="hidden sm:flex items-center justify-center w-40 h-28 relative">
            {/* Crown SVG with light blue gradient as specified */}
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="crownGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#5CB6FF" />
                  <stop offset="100%" stopColor="#8FD0FF" />
                </linearGradient>
              </defs>
              <rect x="0" y="10" width="120" height="60" rx="12" fill="rgba(255,255,255,0.06)" />
              <path d="M12 54 L28 22 L44 54 L60 18 L76 54 L92 22 L108 54 L108 60 L12 60 Z" fill="url(#crownGrad)" />
            </svg>
          </div>
          </div>
        </Animation>

        {/* Toggle for Billing Period - Optional */}
        {/* <div className="flex justify-center mb-8">
          <div className="bg-[#2C303A] rounded-full p-1 flex gap-2">
            <button className="px-6 py-2 rounded-full bg-[#2196F3] text-white font-medium text-sm">
              Monthly
            </button>
            <button className="px-6 py-2 rounded-full text-[#A0A0A0] font-medium text-sm hover:text-white">
              Yearly (Save 20%)
            </button>
          </div>
        </div> */}

        {/* Plans - mobile shows stacked cards; desktop uses carousel */}
        <div className="relative mb-8">
          {/* Mobile: stacked cards (no scrolling) */}
          <div className="block sm:hidden space-y-6 px-2">
            {plans.map((plan, idx) => (
              <Animation key={plan.id} animation="slideUp" delay={120 + idx * 80} duration={600}>
                <div className="w-full max-w-xl mx-auto">
                  <PlanCard plan={plan} isSelected={selectedPlan === plan.id} onSelect={() => setSelectedPlan(plan.id)} isRound={idx === 1} />
                </div>
              </Animation>
            ))}
          </div>

          {/* Desktop / Tablet: carousel layout (unchanged) */}
          <div className="hidden sm:block">
            <div
              ref={containerRef}
              className="overflow-hidden relative"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div
                className="flex"
                style={{
                  gap: `${gap}px`,
                  transform: `translateX(-${currentIndex * (cardWidth + gap)}px)`,
                  transition: 'transform 400ms ease-in-out',
                }}
              >
                {plans.map((plan, idx) => {
                  return (
                    <Animation key={plan.id} animation="slideUp" delay={120 + idx * 80} duration={600}>
                      <div
                        style={{ minWidth: `${cardWidth}px`, transition: 'transform 300ms ease' }}
                      >
                        <PlanCard plan={plan} isSelected={selectedPlan === plan.id} onSelect={() => setSelectedPlan(plan.id)} isRound={idx === 1} />
                      </div>
                    </Animation>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-12 border-t border-[#4A4E57]">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-[#2C303A] rounded-xl">
              <h4 className="text-white font-semibold mbFacilities Chief-2">Can I change my plan?</h4>
              <p className="text-[#A0A0A0]">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="p-6 bg-[#2C303A] rounded-xl">
              <h4 className="text-white font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-[#A0A0A0]">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
            {/* <div className="p-6 bg-[#2C303A] rounded-xl">
              <h4 className="text-white font-semibold mb-2">Is there a refund policy?</h4>
              <p className="text-[#A0A0A0]">
                We offer a 30-day money-back guarantee if you're not satisfied with your plan.
              </p>
            </div> */}
            <div className="p-6 bg-[#2C303A] rounded-xl">
              <h4 className="text-white font-semibold mb-2">Do you offer team discounts?</h4>
              <p className="text-[#A0A0A0]">
                Yes! Contact our sales team for enterprise and team pricing options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
