'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';

// Play icon component
const PlayIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5v14l11-7z"/>
  </svg>
);

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AppInfoPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/chat")
  }
  const tutorials = [
    {
      id: 1,
      title: "How to Use Camera",
      description: "Point your camera at the machine and take a clear photo of the affected area.",
      thumbnail: "/images/camera-tutorial.jpg",
      tag: "Tutorial 1",
      slug: "how-to-use-camera"
    },
    {
      id: 2,
      title: "How to Use Voice Commands",
      description: "Activate voice input to report faults, describe conditions, or request help.",
      thumbnail: "/images/voice-tutorial.jpg",
      tag: "Tutorial 2",
      slug: "how-to-use-voice-commands"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1f2632] text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Go back"
          >
            <IconChevronLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex-1 text-center">App Info</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Mini Tutorials Section */}
        <div className="mb-6 sm:mb-8 pt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white/80 mb-4 sm:mb-6">Mini Tutorials</h2>
          
          <div className="space-y-4 sm:space-y-6">
            {tutorials.map((tutorial) => (
              <a
                key={tutorial.id}
                href={`/blogs/${tutorial.slug}`}
                className="block bg-white/10 backdrop-blur-sm rounded-xl p-3 py-4 sm:p-4 sm:py-6 lg:p-6 lg:py-8 shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[120px] sm:min-h-[140px] cursor-pointer"
              >
                <div className="flex items-start space-x-3 sm:space-x-4 lg:space-x-6">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-2/5 sm:w-40 lg:w-48">
                    <div className="w-full h-20 sm:h-28 lg:h-32 bg-gradient-to-br from-gray-500/30 to-gray-700/30 backdrop-blur-sm rounded-lg overflow-hidden relative border border-white/10">
                      {/* Blurred background effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-md"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                          <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-800 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Tutorial Tag */}
                    <div className="mb-1 sm:mb-2">
                      <span className="inline-block bg-[#007AFF] text-white text-xs font-medium px-2 py-1 rounded-lg">
                        {tutorial.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2">
                      {tutorial.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#A0A0A0] text-xs sm:text-sm leading-relaxed">
                      {tutorial.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* More Info Section */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white/80 mb-4 sm:mb-6">More Info</h2>
          
          <div className="space-y-3">
            {/* FAQ Card */}
            <a href="/faq" className="block bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/15 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm sm:text-base font-medium">Frequently Asked Questions</span>
                <svg className="w-4 h-4 text-[#00BFFF] drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>

            {/* Learn How It Works Card */}
            <a href="/how-it-works" className="block bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/15 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm sm:text-base font-medium">Learn How It Works</span>
                <svg className="w-4 h-4 text-[#00BFFF] drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}