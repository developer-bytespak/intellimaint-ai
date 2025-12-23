"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

export function HomepageFooter() {
  const router = useRouter();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToSection = (sectionId: string) => { const el = document.getElementById(sectionId); if (el) el.scrollIntoView({ behavior: "smooth" }); };

  return (
    <footer className="relative border-t border-[--color-border] bg-gradient-to-b from-[--color-surface-alt] to-[--color-surface-alt] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 sm:h-9 sm:w-9">
                  <Image src="/Intelliment LOgo.png" alt="IntelliMaint AI" fill sizes="36px" className="object-contain" />
                </div>
                <h3 className="text-base font-bold text-white mb-0">IntelliMaint <span className="text-[var(--color-brand)]">AI</span></h3>
              </div>
              <p className="text-sm text-gray-400 mt-1">Virtual mechanic assistance and knowledge-driven maintenance.</p>
            </div>
            <div className="flex gap-3">
              <a
                
                className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700/50 cursor-pointer"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a
               
                className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700/50 cursor-pointer"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a
                
                className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700/50 cursor-pointer"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('features')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Features</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">How It Works</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Pricing</button></li>
              {/* <li><button onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">About Us</button></li> */}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('contact')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">FAQ</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Contact Us</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4">Account</h4>
            <ul className="space-y-2">
              <li><button onClick={() => router.push(ROUTES.LOGIN)} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Login</button></li>
              <li><button onClick={() => router.push(ROUTES.SIGNUP)} className="text-sm text-slate-400 font-bold hover:text-[#3b82f6] transition-colors">Sign Up</button></li>
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
