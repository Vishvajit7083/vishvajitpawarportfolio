import React, { useState } from 'react';
import { Mail, Phone, Linkedin, FileText, Send, CheckCircle2, Copy, Terminal, Radio, Sparkles, MessageSquare } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';

interface ContactProps {
  onOpenResume: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenResume }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [messageForm, setMessageForm] = useState({
    name: '',
    senderEmail: '',
    subject: 'Embedded Software Engineer Opportunity',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleCopy = (text: string, label: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playLaserScan();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      sound.playSuccessChime();

      // Formulate mailto link
      const mailtoUrl = `mailto:${PERSONAL_INFO.email}?subject=${encodeURIComponent(
        messageForm.subject
      )}&body=${encodeURIComponent(
        `From: ${messageForm.name} (${messageForm.senderEmail})\n\n${messageForm.message}`
      )}`;
      window.location.href = mailtoUrl;

      setTimeout(() => setSendSuccess(false), 4000);
    }, 900);
  };

  return (
    <section id="contact" className="relative w-full py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
            // TELECOMMUNICATION_LINK
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-wide">
            CONNECT WITH ME
          </h2>
        </div>
      </div>

      {/* Futuristic Holographic Terminal Card */}
      <div className="glass-panel-glow p-6 sm:p-10 rounded-2xl border border-cyan-500/40 relative shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Contact Credentials & Buttons */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>DIRECT RECRUITMENT & COLLABORATION CHANNEL</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Interested in building intelligent embedded systems?
              </h3>
              <p className="text-xl font-semibold font-display text-cyan-400 text-glow-cyan">
                Let's connect.
              </p>
            </div>

            {/* Direct Contact Items */}
            <div className="space-y-3 font-mono text-xs">
              {/* Email */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between group hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">EMAIL ADDRESS</span>
                    <a
                      href={`mailto:${PERSONAL_INFO.email}`}
                      className="text-white hover:text-cyan-300 font-semibold transition-colors"
                    >
                      {PERSONAL_INFO.email}
                    </a>
                  </div>
                </div>
                <button
                  id="copy-email-btn"
                  onClick={() => handleCopy(PERSONAL_INFO.email, 'email')}
                  title="Copy email"
                  className="p-2 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {copiedField === 'email' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Phone */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between group hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">TELEPHONE</span>
                    <a
                      href={`tel:${PERSONAL_INFO.phone}`}
                      className="text-white hover:text-cyan-300 font-semibold transition-colors"
                    >
                      {PERSONAL_INFO.phone}
                    </a>
                  </div>
                </div>
                <button
                  id="copy-phone-btn"
                  onClick={() => handleCopy(PERSONAL_INFO.phone, 'phone')}
                  title="Copy phone number"
                  className="p-2 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {copiedField === 'phone' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* LinkedIn */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between group hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">LINKEDIN PROFILE</span>
                    <a
                      href={PERSONAL_INFO.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-cyan-300 font-semibold transition-colors"
                    >
                      {PERSONAL_INFO.linkedinDisplay}
                    </a>
                  </div>
                </div>
                <a
                  id="external-linkedin-link"
                  href={PERSONAL_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <Copy className="w-4 h-4 opacity-0" />
                </a>
              </div>
            </div>

            {/* Prompt Requested Action Buttons: [Email Me] [LinkedIn] [Download Resume] */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <a
                id="contact-email-btn"
                href={`mailto:${PERSONAL_INFO.email}`}
                onClick={() => sound.playClick()}
                className="px-5 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>EMAIL ME</span>
              </a>

              <a
                id="contact-linkedin-btn"
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="px-5 py-3 rounded-lg glass-panel hover:bg-cyan-950/60 text-cyan-300 hover:text-white border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Linkedin className="w-4 h-4 text-cyan-400" />
                <span>LINKEDIN</span>
              </a>

              <button
                id="contact-resume-btn"
                onClick={() => {
                  sound.playClick();
                  onOpenResume();
                }}
                className="px-5 py-3 rounded-lg glass-panel hover:bg-purple-950/40 text-purple-300 hover:text-white border border-purple-500/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>DOWNLOAD RESUME</span>
              </button>
            </div>
          </div>

          {/* Right Column: Holographic Dispatch Terminal Form */}
          <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>HOLOGRAPHIC MESSAGE DISPATCH TERMINAL</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">READY</span>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">YOUR NAME / ORGANIZATION:</label>
                <input
                  id="contact-form-name"
                  type="text"
                  required
                  placeholder="e.g. Embedded Software Recruiter / Lead Architect"
                  value={messageForm.name}
                  onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">YOUR EMAIL ADDRESS:</label>
                <input
                  id="contact-form-email"
                  type="email"
                  required
                  placeholder="e.g. hiring@robotics-company.com"
                  value={messageForm.senderEmail}
                  onChange={(e) => setMessageForm({ ...messageForm, senderEmail: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">SUBJECT / ROLE:</label>
                <input
                  id="contact-form-subject"
                  type="text"
                  required
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">TRANSMISSION MESSAGE:</label>
                <textarea
                  id="contact-form-message"
                  required
                  rows={3}
                  placeholder="Hi Vishwajit, we are looking for an Embedded Software Engineer with your skills in C, Python, ESP32, and OpenCV..."
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 resize-none"
                />
              </div>

              <button
                id="contact-dispatch-btn"
                type="submit"
                disabled={isSending}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <span>DISPATCHING PACKET TO RELAY...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>DISPATCH MESSAGE VIA EMAIL CLIENT</span>
                  </>
                )}
              </button>

              {sendSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-center font-mono text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TRANSMISSION BUFFER PREPARED! OPENING EMAIL CLIENT...</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
