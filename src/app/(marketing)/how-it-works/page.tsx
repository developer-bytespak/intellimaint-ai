'use client';

import Image from 'next/image';

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

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      title: "Scan & Identify",
      description: "Quickly scan your generator or machinery using your device's camera, or enter the model details manually. Our AI instantly detects the make and model, then matches it with the correct manuals, technical specifications, and reference documents from our secure repository. Our system streamlines your workflow, providing you with precise, up-to-date information right at your fingertips",
        image: "/images/img1.png"
    },
    {
      id: 2,
      title: "AI Analysis",
      description: "Our advanced AI analyzes the captured images, voice inputs, and system data to identify potential faults, maintenance needs, and performance issues. The system cross-references your equipment data with our comprehensive database of known problems and solutions.Whether it’s identifying wear and tear or suggesting preventative measures.",
      image: "/images/img2.png"
    },
    {
      id: 3,
      title: "Get Solutions",
      description: "Receive comprehensive diagnostic reports, step-by-step repair guides, and detailed maintenance schedules, all tailored to your equipment's specific needs. Our system also provides preventive recommendations to help you stay ahead of potential issues. you can keep your machinery running at peak performance.Whether you're performing routine maintenance or tackling complex repairs.",
      
      image: "/images/img3.png"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1f2632] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header with Back Button and Centered Title */}
        <div className="relative flex items-center mb-12 sm:mb-16">
          <a href="/app-info" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-200 flex-shrink-0">
            <BackArrow className="w-5 h-5 text-gray-300" />
          </a>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">How It Works</h1>
        </div>

        {/* Steps */}
        <div className="space-y-16 sm:space-y-20">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <div className={`flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-12 ${step.id === 2 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Image Section */}
                <div className="relative flex-shrink-0 w-full lg:w-1/2">
                  {/* Blurred Background Area */}
                  <div className="relative">
                    {/* Step Number Badge */}
                    <div className="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-14 h-14 bg-[#007AFF] rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-600/30">
                        <span className="text-white font-bold text-xl drop-shadow-[0_0_4px_rgba(135,206,250,0.8)]">{step.id}</span>
                      </div>
                    </div>
                    
                    {/* Image Container */}
                    <div className="w-full h-48 sm:h-64 lg:h-80 bg-white/10 backdrop-blur-md rounded-2xl relative overflow-hidden">
                      {/* Actual Image for All Cards */}
                      <Image 
                        src={step.image} 
                        alt={step.title}
                        fill
                        className="object-cover rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Section */}
                <div className="flex-1 w-full lg:w-1/2 pt-6 lg:pt-4">
                  <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/70 text-sm sm:text-base lg:text-xl leading-relaxed px-4 sm:px-0">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Subscription CTA Card */}
        <div className="mt-16 sm:mt-20">
          <div className="relative bg-[#007AFF] rounded-2xl p-6 sm:p-8 shadow-lg overflow-hidden">
            {/* Premium Tag */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white rounded-full px-3 py-1 flex items-center space-x-2 shadow-sm">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-gray-700 text-sm font-medium">Premium</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 pt-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Get Started with<br />
                Your Subscription
              </h2>
            </div>

            {/* Large Crown Icon */}
            <div className="absolute bottom-0 right-0 opacity-20">
              <svg className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
