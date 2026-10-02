import React, { useState, useRef } from 'react';
import type { RoleType } from '../types';

interface HeroSectionProps {
  onExplore: (role: RoleType) => void;
  onViewModules: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onViewModules }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({
    transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)',
    transition: 'transform 0.3s ease-out'
  });
  const [activeHoverLayer, setActiveHoverLayer] = useState<RoleType | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltStyle({
      transform: `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateZ(0)`,
      transition: 'transform 0.08s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)',
      transition: 'transform 0.4s ease-out'
    });
    setActiveHoverLayer(null);
  };

  return (
    <section id="overview" className="relative w-full overflow-hidden bg-[#f8f9ff] py-16 sm:py-24">
      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#004ac6]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-[#7bd0ff]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Intro copy */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eff4ff] border border-[#d3e4fe] text-[#004ac6] text-xs font-semibold tracking-wide shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
            <span>CONNECTED ACADEMIC PLATFORM • ENTERPRISE READY</span>
          </div>

          {/* Headline */}
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0b1c30] tracking-tight leading-[1.12] mb-5">
            Everything Your College Needs.{' '}
            <span className="text-[#004ac6]">Connected.</span>
          </h1>

          {/* Supporting Text */}
          <p className="font-['Inter'] text-lg sm:text-xl text-[#434655] max-w-2xl leading-relaxed mb-8">
            A unified learning management platform connecting academic administration, faculty workflows, and student experiences.
          </p>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onExplore('hod')}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-[#2563eb] text-white text-sm font-semibold shadow-md hover:bg-[#004ac6] transition-all group cursor-pointer"
            >
              <span>Explore the Platform</span>
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 h-12 px-6 rounded-lg bg-white text-[#004ac6] border border-[#d3e4fe] text-sm font-semibold shadow-xs hover:bg-[#eff4ff] transition-all cursor-pointer"
            >
              <span>Portal Login</span>
              <span className="material-symbols-outlined text-base">login</span>
            </a>
            <button
              onClick={onViewModules}
              className="inline-flex items-center h-12 px-6 rounded-lg bg-white text-[#434655] border border-[#c3c6d7] text-sm font-medium shadow-xs hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-all cursor-pointer"
            >
              View Modules
            </button>
          </div>
        </div>

        {/* Interactive 3D Layered Interface Visualization */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-4xl mx-auto pt-4 pb-8"
        >
          {/* Floating Badges */}
          <div className="absolute -top-3 left-4 sm:left-12 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-md border border-[#c3c6d7]/50 text-[#0b1c30] text-xs font-medium">
            <span className="material-symbols-outlined text-[#004ac6] text-base">sync</span>
            <span>Real-time Synchronization</span>
          </div>

          <div className="absolute top-24 -right-2 sm:right-6 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-md border border-[#c3c6d7]/50 text-[#0b1c30] text-xs font-medium">
            <span className="material-symbols-outlined text-[#004ac6] text-base">database</span>
            <span>Zero Data Redundancy</span>
          </div>

          <div className="absolute bottom-8 left-2 sm:left-10 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-md border border-[#c3c6d7]/50 text-[#0b1c30] text-xs font-medium">
            <span className="material-symbols-outlined text-[#004ac6] text-base">layers</span>
            <span>Multi-Role Context</span>
          </div>

          {/* Layer Container with 3D tilt */}
          <div style={tiltStyle} className="relative flex flex-col gap-4">
            {/* Layer 1: HOD Module (Top) */}
            <div
              onClick={() => onExplore('hod')}
              onMouseEnter={() => setActiveHoverLayer('hod')}
              onMouseLeave={() => setActiveHoverLayer(null)}
              className={`relative w-full rounded-xl bg-white shadow-md p-5 sm:p-6 transition-all duration-300 border cursor-pointer ${
                activeHoverLayer === 'hod'
                  ? 'border-[#004ac6] ring-2 ring-[#004ac6]/10 shadow-lg scale-[1.01]'
                  : 'border-[#c3c6d7]/50 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#eff4ff]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
                    <span className="material-symbols-outlined text-lg">corporate_fare</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Layer 01 • Governance
                    </span>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-semibold text-[#0b1c30]">
                      HOD Module • Academic Administration &amp; Oversight
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2.5 py-1 rounded bg-[#eff4ff] text-[#004ac6] text-xs font-medium border border-[#d3e4fe]">
                    Executive Root
                  </span>
                  <span className="hidden sm:inline-flex items-center text-xs text-[#004ac6] font-medium group">
                    Launch <span className="material-symbols-outlined text-sm ml-0.5">open_in_new</span>
                  </span>
                </div>
              </div>

              {/* Structural Wireframe Card Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-[#eff4ff] flex flex-col gap-2 border border-[#dce9ff]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0b1c30]">Curriculum Flow</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-[#004ac6]">
                      98% Synced
                    </span>
                  </div>
                  <div className="w-full h-8 rounded bg-[#e5eeff] flex items-center px-2.5 justify-between">
                    <div className="w-24 h-2 rounded bg-[#004ac6]/30" />
                    <div className="w-8 h-2 rounded bg-[#004ac6]" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#565e74]">14 Active Modules</span>
                    <span className="text-[11px] text-[#004ac6] font-medium">Verified</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#eff4ff] flex flex-col gap-2 border border-[#dce9ff]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0b1c30]">Faculty Allocation</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-[#004ac6]">
                      24 Members
                    </span>
                  </div>
                  <div className="w-full h-8 rounded bg-[#e5eeff] flex items-center px-2.5 gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#004ac6]/40" />
                    <div className="w-20 h-2 rounded bg-[#737686]/40" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#565e74]">Load Balancer</span>
                    <span className="text-[11px] text-emerald-600 font-medium">Optimal</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#eff4ff] flex flex-col gap-2 border border-[#dce9ff]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0b1c30]">Accreditation Audits</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-[#004ac6]">
                      Immutable
                    </span>
                  </div>
                  <div className="w-full h-8 rounded bg-[#e5eeff] flex items-center justify-between px-2.5">
                    <span className="font-mono text-[10px] text-[#565e74]">0x8f...2b9</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#565e74]">Regulatory Log</span>
                    <span className="text-[11px] text-[#004ac6] font-medium">Certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pulsing Inter-layer Connection SVG */}
            <div className="relative w-full h-6 flex items-center justify-center -my-2 z-20 pointer-events-none">
              <svg className="w-full h-8" fill="none" preserveAspectRatio="none" viewBox="0 0 800 32">
                <path
                  d="M 200,0 C 200,16 350,16 350,32"
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                  strokeWidth="2"
                />
                <path d="M 400,0 L 400,32" stroke="#2563eb" strokeOpacity="0.6" strokeWidth="2" />
                <circle cx="400" cy="16" fill="#2563eb" r="3.5">
                  <animate attributeName="cy" dur="2.4s" repeatCount="indefinite" values="0;32;0" />
                </circle>
                <path
                  d="M 600,0 C 600,16 450,16 450,32"
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Layer 2: Faculty Module (Middle) */}
            <div
              onClick={() => onExplore('faculty')}
              onMouseEnter={() => setActiveHoverLayer('faculty')}
              onMouseLeave={() => setActiveHoverLayer(null)}
              className={`relative w-full rounded-xl bg-white shadow-md p-5 sm:p-6 transition-all duration-300 border cursor-pointer ${
                activeHoverLayer === 'faculty'
                  ? 'border-[#004ac6] ring-2 ring-[#004ac6]/10 shadow-lg scale-[1.01]'
                  : 'border-[#c3c6d7]/50 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#eff4ff]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
                    <span className="material-symbols-outlined text-lg">school</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Layer 02 • Pedagogy
                    </span>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-semibold text-[#0b1c30]">
                      Faculty Module • Academic Workflows &amp; Teaching
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2.5 py-1 rounded bg-[#eff4ff] text-[#004ac6] text-xs font-medium border border-[#d3e4fe]">
                    Instructional Core
                  </span>
                  <span className="hidden sm:inline-flex items-center text-xs text-[#004ac6] font-medium group">
                    Launch <span className="material-symbols-outlined text-sm ml-0.5">open_in_new</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dce9ff]/60">
                  <span className="text-xs font-semibold text-[#0b1c30]">Syllabus Delivery</span>
                  <div className="w-full h-2 rounded bg-[#e5eeff] overflow-hidden">
                    <div className="w-3/4 h-full bg-[#004ac6] rounded" />
                  </div>
                  <span className="text-[11px] text-[#565e74]">Module 04 Distributed DBs</span>
                </div>

                <div className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dce9ff]/60">
                  <span className="text-xs font-semibold text-[#0b1c30]">Submission Stream</span>
                  <div className="w-full h-2 rounded bg-[#e5eeff] overflow-hidden">
                    <div className="w-5/6 h-full bg-[#2563eb] rounded" />
                  </div>
                  <span className="text-[11px] text-[#565e74]">42/48 Labs Submitted</span>
                </div>

                <div className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dce9ff]/60">
                  <span className="text-xs font-semibold text-[#0b1c30]">Evaluation Rubric</span>
                  <div className="w-full h-2 rounded bg-[#e5eeff] overflow-hidden">
                    <div className="w-full h-full bg-emerald-500 rounded" />
                  </div>
                  <span className="text-[11px] text-[#565e74]">Deterministic Criteria</span>
                </div>

                <div className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dce9ff]/60">
                  <span className="text-xs font-semibold text-[#0b1c30]">Office Hours</span>
                  <div className="w-full h-2 rounded bg-[#e5eeff] overflow-hidden">
                    <div className="w-2/3 h-full bg-[#005b7c] rounded" />
                  </div>
                  <span className="text-[11px] text-[#565e74]">3 Slots Booked Today</span>
                </div>
              </div>
            </div>

            {/* Pulsing Inter-layer Connection SVG */}
            <div className="relative w-full h-6 flex items-center justify-center -my-2 z-20 pointer-events-none">
              <svg className="w-full h-8" fill="none" preserveAspectRatio="none" viewBox="0 0 800 32">
                <path
                  d="M 250,0 C 250,16 380,16 380,32"
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                  strokeWidth="2"
                />
                <path d="M 400,0 L 400,32" stroke="#2563eb" strokeOpacity="0.6" strokeWidth="2" />
                <circle cx="400" cy="32" fill="#2563eb" r="3.5">
                  <animate attributeName="cy" dur="2.1s" repeatCount="indefinite" values="32;0;32" />
                </circle>
                <path
                  d="M 550,0 C 550,16 420,16 420,32"
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Layer 3: Student Module (Bottom) */}
            <div
              onClick={() => onExplore('student')}
              onMouseEnter={() => setActiveHoverLayer('student')}
              onMouseLeave={() => setActiveHoverLayer(null)}
              className={`relative w-full rounded-xl bg-white shadow-md p-5 sm:p-6 transition-all duration-300 border cursor-pointer ${
                activeHoverLayer === 'student'
                  ? 'border-[#004ac6] ring-2 ring-[#004ac6]/10 shadow-lg scale-[1.01]'
                  : 'border-[#c3c6d7]/50 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#eff4ff]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
                    <span className="material-symbols-outlined text-lg">local_library</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                      Layer 03 • Student
                    </span>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-semibold text-[#0b1c30]">
                      Student Module • Unified Learning Experience
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2.5 py-1 rounded bg-[#eff4ff] text-[#004ac6] text-xs font-medium border border-[#d3e4fe]">
                    Active Terminal
                  </span>
                  <span className="hidden sm:inline-flex items-center text-xs text-[#004ac6] font-medium group">
                    Launch <span className="material-symbols-outlined text-sm ml-0.5">open_in_new</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0b1c30]">CS-301 Distributed Systems</span>
                    <span className="text-[11px] text-[#004ac6] font-semibold">94.2% A</span>
                  </div>
                  <div className="w-full bg-[#d3e4fe] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#004ac6] h-2 rounded-full w-2/3" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#565e74]">
                    <span>Mon/Wed 10:00 AM</span>
                    <span className="text-[#004ac6]">Hall 201</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0b1c30]">CS-204 Data Structures II</span>
                    <span className="text-[11px] text-[#004ac6] font-semibold">91.0% A-</span>
                  </div>
                  <div className="w-full bg-[#d3e4fe] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#2563eb] h-2 rounded-full w-4/5" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#565e74]">
                    <span>Tue/Thu 1:00 PM</span>
                    <span className="text-[#004ac6]">Hall 104</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0b1c30]">AI-101 Machine Intelligence</span>
                    <span className="text-[11px] text-[#004ac6] font-semibold">95.5% A</span>
                  </div>
                  <div className="w-full bg-[#d3e4fe] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#005b7c] h-2 rounded-full w-1/2" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#565e74]">
                    <span>Fri 9:00 AM</span>
                    <span className="text-[#004ac6]">Lab 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
