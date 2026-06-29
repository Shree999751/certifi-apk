import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    
    // Simulate submission
    setIsSubmitted(true);
    
    // Reset form fields
    setName('');
    setEmail('');
    setMessage('');
  };

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
            <span className="text-sm font-semibold tracking-tight text-ink mt-[-2px]">Local Hero</span>
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
            <div className="inline-flex items-center gap-1.5 bg-[#7928ca]/10 border border-[#7928ca]/20 px-3 py-1 rounded-full text-[#7928ca] shadow-level1">
              <span className="inline-block w-1.5 h-1.5 bg-[#7928ca] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Get In Touch</span>
            </div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight leading-[1.1] font-sans">
              Contact Us
            </h1>
            <p className="text-base text-body max-w-xl mx-auto leading-relaxed">
              Have questions, feedback, or municipal cooperation suggestions? Drop us a note below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact details */}
            <div className="md:col-span-5 bg-canvas border border-hairline p-6 rounded-2xl shadow-level3 space-y-6 text-xs leading-relaxed">
              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-mute uppercase tracking-wider">Support Hours</span>
                <p className="text-body font-semibold">Monday — Friday: 9 AM to 6 PM IST</p>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-mute uppercase tracking-wider">Email Address</span>
                <a href="mailto:support@localhero.org" className="text-link font-semibold hover:underline">support@localhero.org</a>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-mute uppercase tracking-wider">Municipal Coordination</span>
                <p className="text-body">
                  For municipal crew integrations, API credentials configuration, or verified ward manager requests, please state your division department in the topic selector.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="md:col-span-7 bg-canvas border border-hairline rounded-2xl shadow-level3 p-6 sm:p-8">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="text-4xl">✉️</div>
                  <h2 className="text-base font-bold text-primary">Message Sent Successfully!</h2>
                  <p className="text-xs text-body leading-relaxed max-w-xs mx-auto">
                    Thank you for reaching out. A Local Hero representative will review your message and reply via email within 3 business days.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="h-8 border border-hairline rounded-full bg-canvas hover:bg-canvas-soft-2 px-4 text-xs font-semibold transition cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong" 
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-mono" 
                        placeholder="you@domain.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Topic</label>
                    <select 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-mono cursor-pointer"
                    >
                      <option value="General Feedback">General Feedback</option>
                      <option value="Report Verification">Report Verification Inquiry</option>
                      <option value="Municipal Collaboration">Municipal Officer Registration</option>
                      <option value="Developer API integration">Developer API Keys</option>
                      <option value="Other Concerns">Other Issues</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Your Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full border border-hairline bg-canvas rounded p-3 text-xs focus:outline-none focus:border-hairline-strong text-body leading-relaxed" 
                      placeholder="Type details about your inquiry..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-10 bg-primary text-on-primary hover:bg-primary/95 rounded-full font-semibold transition mt-2 shadow-level3 cursor-pointer flex items-center justify-center text-xs"
                  >
                    Send Message
                  </button>
                </form>
              )}
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
        <p className="leading-relaxed">© 2026 Local Hero Hyperlocal Solver. All rights reserved.</p>
      </footer>
    </div>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<ContactPage />);
}
