import React from 'react';

interface UniversalFooterProps {
  onNavigate: (screen: string) => void;
  activeScreen?: string;
  className?: string;
}

export const UniversalFooter: React.FC<UniversalFooterProps> = ({ 
  onNavigate, 
  activeScreen = '', 
  className = '' 
}) => {
  return (
    <footer className={`bg-slate-900 text-slate-400 border-t border-slate-800 text-left py-12 px-6 sm:px-10 rounded-t-[36px] w-full mt-16 ${className}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        {/* Column 1: Brand & Bio */}
        <div className="space-y-3">
          <div className="flex items-center gap-0 text-white font-serif font-black text-base">
            <img 
              src="/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png" 
              alt="Ama Baby Logo" 
              className="w-20 h-auto object-contain shrink-0 bg-transparent shadow-none"
            />
            <span>Ama Baby</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Easy all-in-one baby care tracking, feeding timers, growth charts, and diaper health notes. Built for family privacy and resourceful childcare worldwide.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Quick Links</h4>
          <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
            <li>
              <a 
                href="#home" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('landing'); 
                }} 
                className={`${activeScreen === 'landing' || activeScreen === 'home' ? 'text-teal-400 font-bold' : 'text-slate-400'} hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block`}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#blog" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('blog'); 
                }} 
                className={`${activeScreen === 'blog' || activeScreen === 'blog-article' ? 'text-teal-400 font-bold' : 'text-slate-400'} hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block`}
              >
                Blog
              </a>
            </li>
            <li>
              <a 
                href="#user-guide" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('user-guide'); 
                }} 
                className={`${activeScreen === 'user-guide' ? 'text-teal-400 font-bold' : 'text-slate-400'} hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block`}
              >
                User Manual
              </a>
            </li>
            <li>
              <a 
                href="#safety-guide" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('safety-guide'); 
                }} 
                className={`${activeScreen === 'safety-guide' ? 'text-teal-400 font-bold' : 'text-slate-400'} hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block`}
              >
                Food & Safety Guide
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('about'); 
                }} 
                className={`${activeScreen === 'about' ? 'text-teal-400 font-bold' : 'text-slate-400'} hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block`}
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('contact'); 
                }} 
                className={`${activeScreen === 'contact' ? 'text-teal-400 font-bold' : 'text-slate-400'} hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block`}
              >
                Contact Us & Help Desk
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Privacy & Terms */}
        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Privacy & Terms</h4>
          <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
            <li>
              <a 
                href="#privacy" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('legal-terms'); 
                }} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a 
                href="#terms" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onNavigate('legal-terms'); 
                }} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Health Notice */}
        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Health Notice</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Ama Baby app content is for educational, tracking and record-keeping purposes only and does not replace doctor or substitute professional healthcare advice, diagnosis, or treatment. Always follow regional child health guidelines.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto border-t border-slate-800 mt-8 pt-6 text-center text-[11px] text-slate-500">
        <p>© 2026 Ama Baby. All rights reserved. All-in-one baby care app built for family privacy.</p>
      </div>
    </footer>
  );
};
