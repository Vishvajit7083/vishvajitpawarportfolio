import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  LineChart,
  Eye,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import {
  certificateManager,
  StoredCertificate,
  INITIAL_CERTIFICATES,
} from '../utils/certificateStore';
import { CertificateModal } from './CertificateModal';

export const Certifications: React.FC = () => {
  const [certificates, setCertificates] = useState<StoredCertificate[]>(INITIAL_CERTIFICATES);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = certificateManager.subscribe((certs) => {
      setCertificates(certs);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenCertificate = (id: string) => {
    sound.playClick();
    setSelectedCertId(id);
    setIsModalOpen(true);
  };

  return (
    <section id="certifications" className="relative w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              // ACCREDITED_ACHIEVEMENTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-wide">
              CERTIFICATIONS & ACHIEVEMENTS
            </h2>
          </div>
        </div>

        {/* Modal Trigger */}
        <button
          id="open-cert-modal-header-btn"
          onClick={() => handleOpenCertificate(certificates[0]?.id || 'cert-1')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-semibold transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] self-start sm:self-auto"
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>VIEW OFFICIAL CREDENTIALS & ACHIEVEMENTS</span>
        </button>
      </div>

      {/* Floating Certification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certificates.filter((c) => c.id !== 'edu-cert').map((cert) => {
          return (
            <div
              key={cert.id}
              id={`cert-card-${cert.id}`}
              onClick={() => handleOpenCertificate(cert.id)}
              onMouseEnter={() => sound.playHover()}
              className="glass-panel p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between relative group cursor-pointer"
            >
              <div className="cyber-corner-tl" />
              <div className="cyber-corner-tr" />
              <div className="cyber-corner-bl" />
              <div className="cyber-corner-br" />

              <div>
                {/* Top Meta */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                    {cert.id === 'cert-1' ? (
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    ) : cert.id === 'cert-2' ? (
                      <LineChart className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Cpu className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> PERMANENT RECORD
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {cert.date}
                    </span>
                  </div>
                </div>

                {/* Title & Issuer */}
                <h3 className="text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors mb-1">
                  {cert.title}
                </h3>
                <p className="text-xs font-mono text-cyan-400 font-medium mb-4">
                  {cert.issuer}
                </p>

                {/* Skills Tags */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    VERIFIED COMPETENCIES:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/90 text-slate-300 border border-slate-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action & Verified Badge */}
              <div className="mt-6 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                  <span className="text-slate-400 truncate max-w-[150px]" title={cert.certificateId}>
                    ID: {cert.certificateId}
                  </span>
                </div>

                {/* Click to open button */}
                <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-950/40 group-hover:bg-cyan-500 group-hover:text-slate-950 border border-cyan-500/30 group-hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all duration-200">
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW CREDENTIAL DOCUMENT</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Certificate Modal */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCertId={selectedCertId}
      />
    </section>
  );
};
