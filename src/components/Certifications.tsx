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
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

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
      <ScrollReveal direction="up">
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
            data-magnetic="true"
            onClick={() => handleOpenCertificate(certificates[0]?.id || 'cert-1')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-semibold transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] self-start sm:self-auto"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>VIEW OFFICIAL CREDENTIALS & ACHIEVEMENTS</span>
          </button>
        </div>
      </ScrollReveal>

      {/* Floating Certification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certificates.filter((c) => c.id !== 'edu-cert').map((cert, index) => {
          return (
            <ScrollReveal key={cert.id} direction="up" delay={0.1 * (index + 1)}>
              <TiltCard
                maxTilt={6}
                id={`cert-card-${cert.id}`}
                onClick={() => handleOpenCertificate(cert.id)}
                onMouseEnter={() => sound.playHover()}
                className="glass-panel p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all duration-300 flex flex-col justify-between relative group cursor-pointer h-full"
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
                  <h3 className="text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                    {cert.title}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400 mt-1 mb-3">
                    {cert.issuer}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-3 mb-4">
                    {cert.description}
                  </p>
                </div>

                {/* Skills Learned & Card Footer */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800 text-cyan-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs font-mono">
                    <span className="text-slate-400 text-[10px] truncate max-w-[150px]">
                      ID: {cert.certificateId}
                    </span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Inspect & View <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Global Certificate Modal */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCertId={selectedCertId || undefined}
      />
    </section>
  );
};
