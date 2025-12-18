export const CORE_CAPABILITIES = [
  {
    id: "document-upload",
    title: "Intelligent Document Analysis",
    description:
      "Upload equipment manuals and documents. Our AI instantly processes and indexes them, making every detail searchable through natural conversation.",
  },
  {
    id: "manual-library",
    title: "Comprehensive Manual Library",
    description:
      "Access our extensive database of military and civilian equipment manuals. Advanced RAG technology finds relevant information from thousands of technical documents instantly.",
  },
  {
    id: "visual-diagnostics",
    title: "Visual Diagnostic Assistant",
    description:
      "Upload photos or videos of equipment issues. Our Vision Language Model analyzes images, identifies problems, and provides step-by-step repair guidance.",
  },
  {
    id: "voice-assist",
    title: "Hands-Free Support",
    description:
      "Speak your questions and get audio responses. Perfect for field work where typing isn't practical. Full voice agent capability for interactive troubleshooting.",
  },
];

export const HOW_IT_WORKS = [
  { number: 1, title: "Create Your Account", description: "Choose civilian, military (.mil), or student email. Quick verification process gets you started in minutes." },
  { number: 2, title: "Build Your Knowledge Base", description: "Upload equipment documents or access our 6,000+ manual database. AI automatically chunks, embeds, and indexes everything for instant retrieval." },
  { number: 3, title: "Chat with AI Mechanic", description: "Type, speak, or attach images. Our RAG-powered system finds relevant information from your documents and our database to provide accurate answers." },
  { number: 4, title: "Solve & Track Progress", description: "Receive step-by-step repair instructions. Context-aware responses remember your equipment history for faster future diagnostics." },
];

export const TESTIMONIALS = [
  {
    name: "Captain James Morrison",
    role: "Equipment Maintenance Officer",
    company: "US Army Aviation",
    quote: "The military manual repository feature is a game-changer. I can securely upload classified docs and get instant answers without compromising security.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Field Service Technician",
    company: "Industrial Solutions Inc",
    quote: "Vision analysis saved us hours. Uploaded a photo of a faulty component and got detailed diagnostic info in seconds. Incredible accuracy!",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Aviation Mechanic",
    company: "AeroTech Services",
    quote: "Voice mode is perfect for hands-on work. I can troubleshoot while working on equipment without stopping to type. The speech-to-text is remarkably accurate.",
    rating: 5,
  },
  {
    name: "Sarah Thompson",
    role: "Engineering Student",
    company: "MIT",
    quote: "As a student, the document upload feature helps me learn faster. Upload lab manuals and get instant explanations. It's like having a 24/7 instructor.",
    rating: 5,
  },
];

export const PRICING_TIERS = [
  {
    name: "Free - Civilian",
    price: "$0",
    period: "month",
    description: "Try core features",
    features: ["50 questions per month", "Access to public manual database", "Text chat only", "Basic image analysis (5/month)", "Email support", "Chat history (30 days)"],
  },
  {
    name: "Pro - Standard",
    price: "$49",
    period: "month",
    popular: true,
    description: "For power users",
    features: ["Unlimited questions", "Upload your own documents (up to 100 files)", "Voice input & audio responses", "Advanced image & video analysis (unlimited)", "Priority support", "Full chat history", "Context-aware conversations", "Export chat transcripts"],
  },
  {
    name: "Military - Specialized",
    price: "$149",
    period: "month",
    description: "Specialized plan for secure military use",
    features: ["Everything in Pro", "Secure military document repository", "Isolated knowledge base (your docs only)", ".mil email verification required", "Classified document support", "Advanced encryption", "Dedicated support channel", "Custom retention policies", "Audit logs"],
  },
  {
    name: "Enterprise - Custom",
    price: "Contact",
    period: "contact",
    description: "Custom enterprise solutions",
    features: ["Custom AI model training", "On-premise deployment option", "Unlimited team members", "API access for integration", "SSO & advanced security", "Custom SLA agreements", "Dedicated account manager", "White-label options", "Bulk document processing", "Custom voice agent training"],
  },
];

export const KEY_DIFFERENTIATORS = [
  "Multi-Modal Input: Text, voice, image, and document support",
  "Military-Grade Security: Isolated repositories for sensitive data",
  "Context Memory: System remembers equipment history across sessions",
  "RAG Technology: Not just keyword search—semantic understanding",
  "Voice Agent: Full conversational AI for hands-free operation",
];
