import React from 'react';
import type { RoleType } from '../types';

interface CTASectionProps {
  onExplore: (role: RoleType) => void;
  onReviewArchitecture: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onExplore, onReviewArchitecture }) => {
  return (
    <section className="w-full py-20 sm:py-28 bg-[#f8f9ff] relative">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-white p-8 sm:p-16 shadow-xl border border-[#c3c6d7]/50 text-center flex flex-col items-center">
          {/* Radial Royal Blue Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#004ac6]/5 via-transparent to-[#2563eb]/10 pointer-events-none" />

          <div className="relative z-10 max-w-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-[#e5eeff] flex items-center justify-center text-[#004ac6] mb-5">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>

            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mb-4">
              Experience a Connected College LMS
            </h2>

            <p className="font-['Inter'] text-base sm:text-lg text-[#434655] mb-8 leading-relaxed">
              Bring academic administration, faculty workflows, and student experiences into one platform.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-[#2563eb] text-white text-sm font-semibold shadow-md hover:bg-[#004ac6] transition-all group cursor-pointer"
              >
                <span>Access LMS Portal</span>
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </a>

              <button
                onClick={() => onExplore('hod')}
                className="inline-flex items-center h-12 px-6 rounded-lg bg-[#e5eeff] text-[#004ac6] text-sm font-semibold hover:bg-[#dce9ff] transition-colors cursor-pointer"
              >
                Explore Live Demo
              </button>

              <button
                onClick={onReviewArchitecture}
                className="inline-flex items-center h-12 px-6 rounded-lg bg-white border border-[#c3c6d7] text-[#0b1c30] text-sm font-semibold hover:bg-[#eff4ff] transition-colors cursor-pointer"
              >
                Review Architecture
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
