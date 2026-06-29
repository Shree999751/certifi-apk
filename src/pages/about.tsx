import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-[1000] h-16 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-on-primary font-mono font-bold text-lg select-none">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-mono uppercase tracking-widest text-[11px] font-bold text-primary">HYPERLOCAL HUB</span>
            <span className="text-sm font-semibold tracking-tight text-ink mt-[-2px]">Community Hero</span>
          </div>
        </div>

        <a 
          href="index.html" 
          className="h-9 border border-hairline rounded-full bg-primary text-on-primary hover:bg-primary/95 px-5 flex items-center justify-center text-xs font-semibold shadow-level4 transition duration-150 cursor-pointer"
        >
          Back to Dashboard
        </a>
      </header>

      {/* Main Content */}
      <main className="relative overflow-hidden flex-grow pb-16">
        {/* Mesh gradient ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[350px] mesh-gradient-glow rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-[800px] mx-auto px-6 pt-16 space-y-12">
          {/* Hero section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-[#7928ca]/10 border border-[#7928ca]/20 px-3 py-1 rounded-full text-[#7928ca] shadow-level1">
              <span className="inline-block w-1.5 h-1.5 bg-[#7928ca] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">About Our Movement</span>
            </div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight leading-[1.1] font-sans">
              Connecting Citizens with Civic Action
            </h1>
            <p className="text-base text-body max-w-xl mx-auto leading-relaxed">
              Community Hero is a hyperlocal civic governance platform designed to make reporting local hazards fast, engaging, and transparent.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="bg-canvas border border-hairline p-6 rounded-2xl shadow-level2 space-y-3">
              <div className="text-xl">🎯</div>
              <h2 className="text-base font-bold text-primary">Our Mission</h2>
              <p className="text-xs text-body leading-relaxed">
                To democratize local governance by providing every citizen with the tools to catalog neighborhood concerns, verify resolutions, and support municipal services in real time. We believe in a collaborative model where civic pride drives clean local infrastructure.
              </p>
            </div>

            <div className="bg-canvas border border-hairline p-6 rounded-2xl shadow-level2 space-y-3">
              <div className="text-xl">✨</div>
              <h2 className="text-base font-bold text-primary">AI-Assisted Efficiency</h2>
              <p className="text-xs text-body leading-relaxed">
                Using Gemini automated multimodal interpretation, Community Hero analyzes reported photos and videos to suggest category categorizations, measure safety priorities, and formulate structured schedules to accelerate municipal response times.
              </p>
            </div>

            <div className="bg-canvas border border-hairline p-6 rounded-2xl shadow-level2 space-y-3">
              <div className="text-xl">🎮</div>
              <h2 className="text-base font-bold text-primary">Gamified Citizenship</h2>
              <p className="text-xs text-body leading-relaxed">
                We reward positive civic behaviors. Submitting details, verifying community reports, and participating in local governance trivia quizzes yields experience points, levels, and badges—making clean streets a engaging team victory.
              </p>
            </div>

            <div className="bg-canvas border border-hairline p-6 rounded-2xl shadow-level2 space-y-3">
              <div className="text-xl">🗳️</div>
              <h2 className="text-base font-bold text-primary">Consensus Verification</h2>
              <p className="text-xs text-body leading-relaxed">
                Platform checks ensure resolutions are legitimate. Utilizing crowdsourced verify vouches, citizen-reported resolutions require 3 independent validations or a verified officer sign-off before status completion, preventing points exploit and maintaining high report trust.
              </p>
            </div>
          </div>

          {/* Value Stat Banner */}
          <div className="bg-canvas border border-hairline p-8 rounded-2xl shadow-level3 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#50e3c2]/5 rounded-full blur-xl pointer-events-none"></div>
            <h3 className="text-sm font-bold text-primary font-mono uppercase tracking-wider">Solving Civic Issues Together</h3>
            <p className="text-xs text-body leading-relaxed max-w-lg mx-auto">
              From open potholes and malfunctioning streetlights to water pipe leaks and garbage disposal overflow, Community Hero aggregates real-time geographical complaints to give dispatch teams actionable task logs.
            </p>
            <div className="pt-2 flex justify-center gap-6 text-center select-none font-mono">
              <div>
                <span className="block text-2xl font-extrabold text-primary">100%</span>
                <span className="text-[10px] text-mute uppercase">Open Source Map</span>
              </div>
              <div className="border-l border-hairline h-10 my-auto"></div>
              <div>
                <span className="block text-2xl font-extrabold text-primary">Real-Time</span>
                <span className="text-[10px] text-mute uppercase">Firestore Sync</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-hairline bg-canvas py-8 text-center text-xs text-mute font-mono space-y-3 px-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <a href="about.html" className="hover:text-primary transition whitespace-nowrap">About Us</a>
          <a href="privacy.html" className="hover:text-primary transition whitespace-nowrap">Privacy Policy</a>
          <a href="terms.html" className="hover:text-primary transition whitespace-nowrap">Terms of Service</a>
          <a href="contact.html" className="hover:text-primary transition whitespace-nowrap">Contact Us</a>
        </div>
        <p className="leading-relaxed">© 2026 Community Hero Hyperlocal Solver. All rights reserved.</p>
      </footer>
    </div>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<AboutPage />);
}
