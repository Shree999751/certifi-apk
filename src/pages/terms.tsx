import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

const TermsPage: React.FC = () => {
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
          {/* Header section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-warning-soft text-warning-deep border border-warning/20 px-3 py-1 rounded-full shadow-level1">
              <span className="inline-block w-1.5 h-1.5 bg-[#f5a623] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Platform Governance</span>
            </div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight leading-[1.1] font-sans">
              Terms & Conditions
            </h1>
            <p className="text-xs text-mute font-mono">
              Last Updated: June 26, 2026
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-canvas border border-hairline rounded-2xl shadow-level3 p-6 sm:p-8 space-y-8 text-xs text-body leading-relaxed">
            <p>
              By accessing and using the <strong>Community Hero Civic Solver</strong> platform, you agree to comply with the terms and conditions outlined below. Please review them carefully.
            </p>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">1. Guidelines for Civic Reporting</h2>
              <p>
                When reporting a local issue, you guarantee that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All details, descriptions, addresses, and media represent actual physical hazards in your community.</li>
                <li>Image and video submissions are authentic and capture the reported issue directly. Uploading unrelated, inappropriate, or spam media is strictly prohibited.</li>
                <li>You will not intentionally manipulate GPS coordinates to submit fake or deceptive tickets.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">2. Vouch & Consensus Farming</h2>
              <p>
                Community Hero employs verification mechanics to incentivize true civic solvers.
              </p>
              <p>
                Users are prohibited from creating multiple account profiles or coordinating with others to farm experience points (XP) or levels by upvoting (vouching for) false resolutions. Any accounts detected gaming the verification system or abusing the crowdsourcing model will have their gamification tallies reset.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">3. AI-Generated Recommendation Disclaimer</h2>
              <p>
                The fixing guides, timelines, and material action plans are generated programmatically utilizing the Gemini AI model. These recommendations are intended for initial guidance and evaluation. Users and municipal crews must exercise professional engineering judgments on the ground. Community Hero is not liable for actions taken based on automated plans.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">4. Municipal Control Overrides</h2>
              <p>
                Authorized municipal administrators hold override flags to manage all geographic listings. This includes re-evaluating statuses, altering priority settings, editing schedules, or deleting tickets that represent spam or duplicate reports.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">5. Terms Revisions</h2>
              <p>
                We reserve the right to revise these guidelines as new features roll out. Continuing to use the platform after updates indicates acceptance of the updated rules.
              </p>
            </section>
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
  createRoot(rootEl).render(<TermsPage />);
}
