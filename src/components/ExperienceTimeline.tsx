import React, { useState } from 'react';
import { Award, Calendar, CheckCircle2, ChevronRight, Briefcase, FileText, ArrowUpRight, Eye } from 'lucide-react';
import { EXPERIENCES_DATA } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';
import { CertificateModal } from './CertificateModal';

export const ExperienceTimeline: React.FC = () => {
  const [activeExpId, setActiveExpId] = useState<string>(EXPERIENCES_DATA[0].id);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [targetCertId, setTargetCertId] = useState<string>('cert-1');

  const activeExp = EXPERIENCES_DATA.find((e) => e.id === activeExpId) || EXPERIENCES_DATA[0];

  const handleOpenExpCertificate = () => {
    sound.playClick();
    // Map experience ID to certificate ID
    if (activeExpId === 'deloitte-job-sim') {
      setTargetCertId('cert-1');
    } else if (activeExpId === 'data-vis-forage') {
      setTargetCertId('cert-2');
    } else {
      setTargetCertId('cert-3');
    }
    setIsCertModalOpen(true);
  };

  return (
    <section id="experience" className="relative w-full py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
            // CAREER_TRAJECTORY_SIMULATION
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-wide">
            EXPERIENCE & JOB SIMULATIONS
          </h2>
        </div>
      </div>

      {/* Futuristic Horizontal/Interactive Timeline Structure */}
      <div className="space-y-8">
        {/* Horizontal Timeline Track */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 relative">
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Timeline Node Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPERIENCES_DATA.map((exp, index) => {
              const isActive = activeExpId === exp.id;
              return (
                <button
                  key={exp.id}
                  id={`experience-timeline-node-${exp.id}`}
                  onClick={() => {
                    sound.playClick();
                    setActiveExpId(exp.id);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`p-5 rounded-xl border text-left font-mono transition-all duration-300 relative overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Top Status & Date */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800/80 text-cyan-300 border border-slate-700">
                      PHASE 0{index + 1}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {exp.period}
                    </span>
                  </div>

                  {/* Title & Company */}
                  <h3 className="text-lg font-bold font-display text-white mb-1">
                    {exp.role}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400 font-medium">
                    {exp.company}
                  </p>

                  <div className="text-[11px] text-slate-400 mt-2 font-mono">
                    {exp.type}
                  </div>

                  {/* Active Indicator Pulse */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Phase Deep Dive Detail Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/40 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 tracking-wider">
                DETAILED SIMULATION PROFILE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
                {activeExp.role} — <span className="text-cyan-300">{activeExp.company}</span>
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded bg-slate-900 border border-slate-800 self-start sm:self-auto">
              {activeExp.period}
            </span>
          </div>

          <div>
            <span className="text-xs font-mono font-semibold text-slate-400 block mb-3 uppercase tracking-wider">
              Key Competencies & Engineering Deliverables:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeExp.highlights.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-400">
              Official simulation completion credential with verified Certificate ID.
            </div>
            <button
              onClick={handleOpenExpCertificate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)] self-end sm:self-auto"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>VIEW OFFICIAL CERTIFICATE & PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Certificate Viewer Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        initialCertId={targetCertId}
      />
    </section>
  );
};
