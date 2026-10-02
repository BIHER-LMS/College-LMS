import { useState } from 'react';
import type { RoleType, ActiveView, CapabilityItem } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ThreeExperiencesSection } from './components/ThreeExperiencesSection';
import { ConnectedEcosystemSection } from './components/ConnectedEcosystemSection';
import { RoleShowcaseSection } from './components/RoleShowcaseSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { DeterministicAISection } from './components/DeterministicAISection';
import { TechStackSection } from './components/TechStackSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { HodWorkspace } from './components/workspaces/HodWorkspace';
import { FacultyWorkspace } from './components/workspaces/FacultyWorkspace';
import { StudentWorkspace } from './components/workspaces/StudentWorkspace';
import { CapabilityModal } from './components/CapabilityModal';
import { SignInModal } from './components/SignInModal';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [currentRole, setCurrentRole] = useState<RoleType>('hod');
  const [inspectingCapability, setInspectingCapability] = useState<CapabilityItem | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);

  // Scroll to section on landing page
  const handleScrollToSection = (sectionId: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open full role workspace
  const handleOpenWorkspace = (role: RoleType) => {
    setCurrentRole(role);
    setActiveView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to landing page
  const handleNavigateHome = () => {
    setActiveView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Universal Fixed Header */}
      <Header
        activeView={activeView}
        currentRole={currentRole}
        onNavigateHome={handleNavigateHome}
        onOpenWorkspace={handleOpenWorkspace}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20">
        {activeView === 'landing' ? (
          <div className="flex flex-col w-full">
            {/* 1. Hero Section with 3D Layered Visualization */}
            <HeroSection
              onExplore={handleOpenWorkspace}
              onViewModules={() => handleScrollToSection('modules-section')}
            />

            {/* 2. One Platform. Three Experiences. */}
            <ThreeExperiencesSection onSelectRole={handleOpenWorkspace} />

            {/* 3. The Connected Ecosystem (Bus Engine) */}
            <ConnectedEcosystemSection onSelectRole={handleOpenWorkspace} />

            {/* 4. Role-Specific Architectural Experience */}
            <RoleShowcaseSection onOpenWorkspace={handleOpenWorkspace} />

            {/* 5. Exhaustive Architecture / Platform Capabilities */}
            <CapabilitiesSection onInspectCapability={setInspectingCapability} />

            {/* 6. Deterministic AI Framework (5-Stage Pipeline) */}
            <DeterministicAISection />

            {/* 7. Production Grade Stack */}
            <TechStackSection />

            {/* 8. Final Call to Action */}
            <CTASection
              onExplore={handleOpenWorkspace}
              onReviewArchitecture={() => handleScrollToSection('architecture-section')}
            />
          </div>
        ) : (
          /* Live Operating System Role Workspaces */
          <div className="w-full min-h-[calc(100vh-80px)] bg-[#f8f9ff]">
            {currentRole === 'hod' && <HodWorkspace />}
            {currentRole === 'faculty' && <FacultyWorkspace />}
            {currentRole === 'student' && <StudentWorkspace />}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onScrollToSection={handleScrollToSection}
        onOpenSignIn={() => setIsSignInOpen(true)}
      />

      {/* Capability Technical Drawer Modal */}
      <CapabilityModal
        capability={inspectingCapability}
        onClose={() => setInspectingCapability(null)}
      />

      {/* Institutional Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignInRole={(role) => {
          handleOpenWorkspace(role);
        }}
      />
    </div>
  );
}
