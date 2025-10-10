'use client';

import { notFound } from 'next/navigation';

// Types
interface BlogSection {
  heading: string;
  paragraphs: string[];
}

interface BlogContent {
  intro: string;
  sections: BlogSection[];
  conclusion: string;
}

interface BlogPost {
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  gradient: string;
  iconColor: string;
  content: BlogContent;
}

// Blog data
const blogPosts: Record<string, BlogPost> = {
  "how-to-use-camera": {
    title: "How to Use Camera",
    category: "Tutorial",
    categoryColor: "bg-[#007AFF]",
    date: "October 10, 2025",
    readTime: "3 min read",
    author: "IntelliMaint Team",
    authorRole: "Product Guide",
    gradient: "from-blue-500/20 to-purple-500/20",
    iconColor: "text-blue-400",
    content: {
      intro: "The camera feature in IntelliMaint AI is your most powerful diagnostic tool. By simply pointing your device's camera at a machine, you can quickly capture visual information about equipment issues and get instant AI-powered analysis.",
      sections: [
        {
          heading: "Getting Started with Camera",
          paragraphs: [
            "To access the camera feature, navigate to the chat interface and tap the camera icon located at the bottom of the screen. Your device will request camera permission if this is your first time using the feature.",
            "Once the camera is activated, you'll see a live preview of what the camera sees. Position your device so that the affected machine component is clearly visible in the frame."
          ]
        },
        {
          heading: "Taking the Perfect Photo",
          paragraphs: [
            "For best results, ensure adequate lighting. Natural light or well-lit environments produce the clearest images for AI analysis. Avoid shadows falling directly on the area you're capturing.",
            "Get close enough to capture detail, but not so close that the image becomes blurry. The affected area should fill most of the frame while still showing some context of the surrounding components.",
            "Hold your device steady and tap the capture button. The AI will automatically begin analyzing the image as soon as it's captured."
          ]
        },
        {
          heading: "What the AI Analyzes",
          paragraphs: [
            "Our advanced computer vision AI examines multiple aspects of your image: visible damage or wear, corrosion or discoloration, leaks or fluid presence, unusual positioning or alignment, and component identification.",
            "The AI compares what it sees against a vast database of equipment conditions and known issues. Within seconds, you'll receive insights about potential problems, severity assessments, and recommended next steps."
          ]
        },
        {
          heading: "Tips for Better Results",
          paragraphs: [
            "Take multiple photos from different angles. This provides the AI with more information and context. Capture wide shots for overall context and close-ups for detailed views of specific issues.",
            "If possible, take comparison photos of similar equipment that's working normally. This helps the AI better understand what's abnormal in your problematic equipment.",
            "Add text descriptions along with your photos. While the AI is powerful, combining visual and text information provides the most comprehensive analysis."
          ]
        },
        {
          heading: "Common Use Cases",
          paragraphs: [
            "The camera feature excels at identifying visible wear patterns on belts, chains, and rotating components, detecting leaks from pipes, hoses, and seals, spotting corrosion or rust on metal surfaces, identifying misalignment in mechanical assemblies, and documenting damage for maintenance records.",
            "Remember that the camera feature is designed to assist, not replace, professional inspection. Always follow safety protocols and consult with qualified technicians for critical maintenance decisions."
          ]
        }
      ],
      conclusion: "The camera feature makes documenting and diagnosing equipment issues faster and more accurate than ever before. Practice using it on your equipment to become familiar with its capabilities. The more you use it, the better you'll become at capturing the right images for optimal AI analysis."
    }
  },
  "how-to-use-voice-commands": {
    title: "How to Use Voice Commands",
    category: "Tutorial",
    categoryColor: "bg-[#007AFF]",
    date: "October 10, 2025",
    readTime: "4 min read",
    author: "IntelliMaint Team",
    authorRole: "Product Guide",
    gradient: "from-green-500/20 to-teal-500/20",
    iconColor: "text-green-400",
    content: {
      intro: "Voice commands in IntelliMaint AI enable hands-free operation, allowing you to report issues, describe conditions, and get assistance while keeping your hands free for other tasks. This feature is especially valuable when working on equipment or in situations where typing is impractical.",
      sections: [
        {
          heading: "Activating Voice Input",
          paragraphs: [
            "To use voice commands, open the chat interface and locate the microphone icon at the bottom of the screen. Tap the microphone icon to begin voice input - you'll see a visual indicator that the system is listening.",
            "Your device will request microphone permission on first use. Make sure you're in a relatively quiet environment for best recognition accuracy."
          ]
        },
        {
          heading: "Speaking Effectively",
          paragraphs: [
            "Speak clearly and at a normal pace. You don't need to shout or speak unnaturally slowly - just speak as you would in a normal conversation. Position your device's microphone about 6-12 inches from your mouth for optimal pickup.",
            "Avoid extremely noisy environments when possible. While our AI can filter background noise, excessive noise from running machinery can affect recognition accuracy. If needed, move to a quieter area to give your report."
          ]
        },
        {
          heading: "What to Say",
          paragraphs: [
            "Be specific about what you're observing. Instead of saying 'machine broken,' try 'hydraulic pump making unusual grinding noise and vibrating.' Include relevant details like when the problem started, what you were doing when you noticed it, and any changes in operation.",
            "You can describe symptoms: 'Motor running hot, temperature gauge showing 20 degrees above normal.' Mention error codes: 'Display showing error code E-247.' Report sensory observations: 'Strong burning smell coming from control panel.' Or ask questions: 'What could cause excessive vibration in a conveyor belt?'"
          ]
        },
        {
          heading: "Voice Command Features",
          paragraphs: [
            "The system understands natural language, so you don't need to memorize specific commands. Just speak naturally. You can interrupt yourself to add more information - the AI understands context and can piece together your full message.",
            "The voice recognition automatically detects when you've finished speaking and will process your input. You can also manually stop recording by tapping the microphone icon again."
          ]
        },
        {
          heading: "Best Practices",
          paragraphs: [
            "Before speaking, take a moment to gather your thoughts about what you want to report. This helps you provide clear, comprehensive information in fewer attempts.",
            "Use technical terminology when you know it, but don't worry if you don't know the exact term. The AI can understand descriptions like 'the spinning part at the top' or 'the belt that connects the two wheels.'",
            "If the system doesn't understand you correctly, you'll see the transcribed text on screen. You can easily edit it by typing, or simply try speaking again with different words."
          ]
        },
        {
          heading: "Combining Voice with Other Features",
          paragraphs: [
            "Voice commands work great in combination with camera input. Take a photo of the issue, then use voice to provide additional context that isn't visible in the image.",
            "You can switch between voice, text, and camera inputs seamlessly within the same conversation. Use whatever input method is most convenient for your current situation."
          ]
        }
      ],
      conclusion: "Voice commands make IntelliMaint AI even more accessible and efficient, especially in industrial environments where hands-free operation is valuable. Practice using voice input to become comfortable with the feature, and don't hesitate to combine it with camera and text input for the most comprehensive equipment diagnostics."
    }
  }
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = blogPosts[params.slug];

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1f2632] text-white">
      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${blog.gradient} border-b border-white/10`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Back Button */}
          <a 
            href="/app-info" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 sm:mb-8 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to App Info
          </a>

          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-block ${blog.categoryColor} text-white text-sm font-medium px-4 py-2 rounded-lg`}>
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/80">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">{blog.author}</p>
                <p className="text-sm text-white/60">{blog.authorRole}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {blog.date}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {blog.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Introduction */}
        <div className="prose prose-invert max-w-none mb-8 sm:mb-12">
          <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
            {blog.content.intro}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 sm:space-y-12">
          {blog.content.sections.map((section: BlogSection, index: number) => (
            <section key={index} className="scroll-mt-20">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((paragraph: string, pIndex: number) => (
                  <p key={pIndex} className="text-base sm:text-lg text-white/80 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Conclusion */}
        <div className="mt-8 sm:mt-12 pt-8 border-t border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
            Conclusion
          </h2>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed">
            {blog.content.conclusion}
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-white/10">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Ready to Transform Your Maintenance Operations?
          </h3>
          <p className="text-white/80 mb-6">
            Discover how IntelliMaint AI can help you implement these cutting-edge technologies and strategies.
          </p>
          <a 
            href="/signup" 
            className="inline-flex items-center bg-[#007AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0066CC] transition-colors duration-200"
          >
            Get Started Today
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Related Articles */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Continue Reading
          </h3>
          <div className="text-center">
            <a 
              href="/app-info" 
              className="inline-flex items-center text-[#00BFFF] hover:text-[#00A3E0] font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to App Info
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
