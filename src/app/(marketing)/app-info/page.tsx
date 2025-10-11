'use client';

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

export default function AppInfoPage() {
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
    <div className="min-h-screen bg-[#1f2632] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">App Info</h1>
        </div>

        {/* Mini Tutorials Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-white/80 mb-6 sm:mb-8">Mini Tutorials</h2>
          
          <div className="space-y-6 sm:space-y-8">
            {tutorials.map((tutorial) => (
              <a
                key={tutorial.id}
                href={`/blogs/${tutorial.slug}`}
                className="block bg-white/10 backdrop-blur-sm rounded-xl p-4 py-6 sm:p-6 sm:py-10 lg:p-8 lg:py-12 shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[150px] sm:min-h-[200px] cursor-pointer"
              >
                <div className="flex items-start space-x-4 sm:space-x-6 lg:space-x-8">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-2/5 sm:w-48 lg:w-64">
                    <div className="w-full h-24 sm:h-36 lg:h-40 bg-gradient-to-br from-gray-500/30 to-gray-700/30 backdrop-blur-sm rounded-lg overflow-hidden relative border border-white/10">
                      {/* Blurred background effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-md"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                          <PlayIcon className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-800 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Tutorial Tag */}
                    <div className="mb-2 sm:mb-3">
                      <span className="inline-block bg-[#007AFF] text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg">
                        {tutorial.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3">
                      {tutorial.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#A0A0A0] text-xs sm:text-sm lg:text-base leading-relaxed">
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
          <h2 className="text-xl sm:text-2xl font-semibold text-white/80 mb-6 sm:mb-8">More Info</h2>
          
          <div className="space-y-4">
            {/* FAQ Card */}
            <a href="/faq" className="block bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-white text-base sm:text-lg font-medium">Frequently Asked Questions</span>
                <svg className="w-5 h-5 text-[#00BFFF] drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>

            {/* Learn How It Works Card */}
            <a href="/how-it-works" className="block bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-white text-base sm:text-lg font-medium">Learn How It Works</span>
                <svg className="w-5 h-5 text-[#00BFFF] drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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