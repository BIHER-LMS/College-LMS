import React from 'react';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onOpenSignIn: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection, onOpenSignIn }) => {
  return (
    <footer className="w-full bg-white border-t border-[#c3c6d7]/40 shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-tight text-[#0b1c30]">
                Aura Academia
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#004ac6] text-[11px] font-semibold uppercase tracking-wider">
                LMS Enterprise
              </span>
            </div>

            <p className="text-sm text-[#434655] max-w-sm mb-6 leading-relaxed">
              Institutional learning management infrastructure engineered for mission-critical academic operations, verifiable grading protocols, and synchronized faculty workflows.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#565e74] text-xs font-medium border border-[#dce9ff]">
                <span className="material-symbols-outlined text-base text-[#004ac6]">verified_user</span>
                <span>ISO 27001</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#565e74] text-xs font-medium border border-[#dce9ff]">
                <span className="material-symbols-outlined text-base text-[#004ac6]">security</span>
                <span>FERPA Compliant</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#565e74] text-xs font-medium border border-[#dce9ff]">
                <span className="material-symbols-outlined text-base text-[#004ac6]">hub</span>
                <span>LTI 1.3 Certified</span>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
            {/* Product */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Product
              </span>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li>
                  <button
                    onClick={() => onScrollToSection('overview')}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors"
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onScrollToSection('modules-section')}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors"
                  >
                    Modules
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onScrollToSection('capabilities-section')}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors"
                  >
                    Capabilities
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onScrollToSection('ecosystem-section')}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors"
                  >
                    Ecosystem
                  </button>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Platform
              </span>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li>
                  <button
                    onClick={() => onScrollToSection('architecture-section')}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors"
                  >
                    Architecture
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onScrollToSection('technology-section')}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors"
                  >
                    Technology
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenSignIn}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors text-left"
                  >
                    Security &amp; Trust
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenSignIn}
                    className="text-[#434655] hover:text-[#004ac6] transition-colors text-left"
                  >
                    SIS Integrations
                  </button>
                </li>
              </ul>
            </div>

            {/* Project */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Project
              </span>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li>
                  <span className="text-[#434655]">Project Information</span>
                </li>
                <li>
                  <span className="text-[#434655]">Release Notes</span>
                </li>
                <li>
                  <span className="text-[#434655]">Academic Governance</span>
                </li>
                <li>
                  <span className="text-emerald-600 font-medium">Network: 100% Operational</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-[#eff4ff] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#565e74]">
            © 2025 Aura Academia Architecture. Enterprise Higher Education Learning Management Platform.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#565e74]">
            <span>v4.2-LTS Institutional Core</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
