import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

const PrivacyPage: React.FC = () => {
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
            <div className="inline-flex items-center gap-1.5 bg-cyan/10 border border-cyan/20 px-3 py-1 rounded-full text-cyan-deep shadow-level1">
              <span className="inline-block w-1.5 h-1.5 bg-[#50e3c2] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Privacy & Trust</span>
            </div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight leading-[1.1] font-sans">
              Privacy Policy
            </h1>
            <p className="text-xs text-mute font-mono">
              Last Updated: June 26, 2026
            </p>
          </div>

          {/* Privacy Text */}
          <div className="bg-canvas border border-hairline rounded-2xl shadow-level3 p-6 sm:p-8 space-y-8 text-xs text-body leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">1. Information We Collect</h2>
              <p>
                Community Hero aggregates minimal information necessary to deliver civic solver services. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Geographical Location:</strong> GPS coordinates and parsed address strings associated with reported hazards.</li>
                <li><strong>Media Submissions:</strong> Uploaded images and video complaint records showing details of the civic concerns.</li>
                <li><strong>Profile Details:</strong> Account usernames, points tallies, gamification level stats, and badge collections.</li>
                <li><strong>System Configs:</strong> Optional Firebase credentials and Gemini API keys entered to run the application components.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">2. How We Use Information</h2>
              <p>
                Collected records are strictly utilized to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Display issue hazard pins on the interactive Leaflet Map.</li>
                <li>Submit reports logs to verified municipal officers in charge of target city divisions.</li>
                <li>Provide Gemini AI with visual files to generate automated repair blueprints and fix recommendation action plans.</li>
                <li>Provide search engines with structured local SEO data via schema markers to raise civic issue awareness.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">3. API Keys & Local Storage Security</h2>
              <p>
                To secure user API key tokens (such as Google Gemini credentials):
              </p>
              <p>
                All personal API keys entered into the System Settings panels are stored directly inside the browser's local cache (<code>localStorage</code>). These keys are never transmitted to our servers or external databases and are loaded client-side to coordinate requests directly to Google AI Studio endpoints.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">4. Data Deletion and Control</h2>
              <p>
                Users maintain complete control over their civic report submissions:
              </p>
              <p>
                If you are running the app in Local Cache Mode, clearing your browser caches will purge all issues, comments, profiles, and keys. If you are connected to the Live Database, authorized Municipal Officers have permission flags to purge and delete reports from Firestore.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-primary">5. Contact Info</h2>
              <p>
                For questions regarding data logs or requests to delete specific geographic entries, please visit our <a href="contact.html" className="text-link hover:underline">Contact Us</a> page.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-hairline bg-canvas py-8 text-center text-xs text-mute font-mono space-y-3">
        <div className="flex justify-center gap-6">
          <a href="about.html" className="hover:text-primary transition">About Us</a>
          <a href="privacy.html" className="hover:text-primary transition">Privacy Policy</a>
          <a href="terms.html" className="hover:text-primary transition">Terms of Service</a>
          <a href="contact.html" className="hover:text-primary transition">Contact Us</a>
        </div>
        <p>© 2026 Community Hero Hyperlocal Solver. All rights reserved.</p>
      </footer>
    </div>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<PrivacyPage />);
}
