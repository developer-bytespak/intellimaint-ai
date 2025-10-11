'use client';

import { useState } from 'react';

// Back arrow icon component
const BackArrow = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

// Down arrow icon component
const DownArrow = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Up arrow icon component
const UpArrow = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

export default function FAQPage() {
  const [expandedItem, setExpandedItem] = useState(0);

  const faqItems = [
    {
      id: 0,
      question: "How does this application help diagnose generator or machinery problems?",
      answer: "The app uses AI to analyze images, voice input, and system data to identify possible faults in your generator or machinery."
    },
    {
      id: 1,
      question: "Who can use this app?",
      answer: "Anyone who owns or operates generators or machinery can use this app. It's designed for both professionals and individuals."
    },
    {
      id: 2,
      question: "How do I scan my machine?",
      answer: "Simply point your camera at the machine and take a clear photo of the affected area. The AI will analyze the image for potential issues."
    },
    {
      id: 3,
      question: "How do I use voice commands?",
      answer: "Activate voice input to report faults, describe conditions, or request help. The app will process your voice commands using AI."
    },
    {
      id: 4,
      question: "What problems can the app detect?",
      answer: "The app can detect various mechanical issues, electrical problems, wear patterns, and maintenance needs in generators and machinery."
    },
    {
      id: 5,
      question: "Do I need an Internet connection?",
      answer: "Yes, an Internet connection is required for AI processing and real-time analysis of your machine data."
    }
  ];

  const toggleExpanded = (id: number) => {
    setExpandedItem(expandedItem === id ? -1 : id);
  };

  return (
    <div className="min-h-screen bg-[#1f2632] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <div className="mb-8">
          <a href="/app-info" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-200">
            <BackArrow className="w-5 h-5 text-gray-300" />
          </a>
        </div>

        {/* Header */}
        <div className="mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Frequently Asked Questions</h1>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 sm:space-y-6">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full p-4 sm:p-6 lg:p-8 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <span className={`flex-1 pr-2 sm:pr-4 text-sm sm:text-base ${expandedItem === item.id ? 'font-bold' : 'font-normal'}`}>
                  {item.question}
                </span>
                {expandedItem === item.id ? (
                  <UpArrow className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] flex-shrink-0" />
                ) : (
                  <DownArrow className="w-5 h-5 text-[#00BFFF] drop-shadow-[0_0_8px_rgba(0,191,255,0.8)] flex-shrink-0" />
                )}
              </button>
              
              {expandedItem === item.id && (
                <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                  <p className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
