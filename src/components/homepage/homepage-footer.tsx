"use client";

export function HomepageFooter() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToSection = (sectionId: string) => { const el = document.getElementById(sectionId); if (el) el.scrollIntoView({ behavior: "smooth" }); };

  return (
    <footer className="relative border-t border-[--color-border] bg-gradient-to-b from-[--color-surface-alt] to-[--color-surface-alt] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">IntelliMaint AI</h3>
              <p className="text-sm text-white font-semibold">Virtual mechanic assistance and knowledge-driven maintenance.</p>
            </div>
            <div className="flex gap-4">
              <button aria-label="Social" className="h-10 w-10 flex items-center justify-center rounded-lg border border-[--color-border] bg-[--color-surface] text-white transition-all">T</button>
              <button aria-label="Social" className="h-10 w-10 flex items-center justify-center rounded-lg border border-[--color-border] bg-[--color-surface] text-white transition-all">L</button>
              <button aria-label="Social" className="h-10 w-10 flex items-center justify-center rounded-lg border border-[--color-border] bg-[--color-surface] text-white transition-all">Y</button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('features')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Features</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">How It Works</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Pricing</button></li>
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">About Us</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Terms of Service</button></li>
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Privacy Policy</button></li>
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Cookie Policy</button></li>
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Risk Disclosure</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">FAQ</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Contact Us</button></li>
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Documentation</button></li>
              <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">API Docs</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[--color-border] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white font-semibold text-center sm:text-left">© {new Date().getFullYear()} IntelliMaint AI. All rights reserved.</p>
          <button onClick={scrollToTop} className="text-sm text-white font-semibold hover:text-[#3b82f6] transition-colors flex items-center gap-2">Back to top<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
        </div>
      </div>
    </footer>
  );
}
