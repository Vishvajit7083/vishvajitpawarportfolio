import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Award,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  QrCode,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  FileCheck,
} from 'lucide-react';
import {
  certificateManager,
  StoredCertificate,
  INITIAL_CERTIFICATES,
} from '../utils/certificateStore';
import { sound } from '../utils/audioEffects';
import { dataUrlToBlobUrl } from '../utils/pdfHelper';
import { PDFViewerCanvas } from './PDFViewerCanvas';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCertId?: string | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  initialCertId,
}) => {
  const [certificates, setCertificates] = useState<StoredCertificate[]>(INITIAL_CERTIFICATES);
  const [currentCertId, setCurrentCertId] = useState<string>(
    initialCertId || INITIAL_CERTIFICATES[0].id
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Subscribe to certificate changes
  useEffect(() => {
    const unsubscribe = certificateManager.subscribe((certs) => {
      setCertificates(certs);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Update current certificate when initialCertId changes
  useEffect(() => {
    if (initialCertId) {
      setCurrentCertId(initialCertId);
    }
  }, [initialCertId]);

  const activeCert =
    certificates.find((c) => c.id === currentCertId) ||
    certificates[0] ||
    INITIAL_CERTIFICATES[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, certificates, currentCertId]);

  // Convert base64 data URL to safe blob: URL
  const safeDocumentUrl = useMemo(() => {
    if (!activeCert?.customDocumentUrl) return null;
    return dataUrlToBlobUrl(activeCert.customDocumentUrl);
  }, [activeCert?.customDocumentUrl]);

  const currentIndex = certificates.findIndex((c) => c.id === currentCertId);

  const handlePrev = () => {
    sound.playClick();
    const prevIdx = (currentIndex - 1 + certificates.length) % certificates.length;
    setCurrentCertId(certificates[prevIdx].id);
    setZoomLevel(100);
  };

  const handleNext = () => {
    sound.playClick();
    const nextIdx = (currentIndex + 1) % certificates.length;
    setCurrentCertId(certificates[nextIdx].id);
    setZoomLevel(100);
  };

  const handleSelectCert = (id: string) => {
    sound.playClick();
    setCurrentCertId(id);
    setZoomLevel(100);
  };

  // Trigger browser print
  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  // Download PDF or document
  const handleDownload = () => {
    sound.playClick();
    if (activeCert.customDocumentUrl) {
      const a = document.createElement('a');
      a.href = activeCert.customDocumentUrl;
      a.download = activeCert.customDocumentName || `${activeCert.certificateId}-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.print();
    }
  };

  if (!isOpen || !activeCert) return null;

  const hasUploadedCustomDoc = !!activeCert.customDocumentUrl;

  return (
    <div
      id="certificate-modal-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="certificate-modal-container"
        className={`bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.3)] flex flex-col overflow-hidden transition-all duration-300 relative ${
          isFullscreen
            ? 'w-full h-full rounded-none border-none'
            : 'w-full max-w-5xl h-[92vh] max-h-[950px]'
        }`}
      >
        {/* Cyber Corners */}
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-cyan-900/60 bg-slate-900/90 text-white select-none shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  OFFICIAL ACCREDITED CREDENTIAL
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> PERMANENT RECORD
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hidden sm:inline-block">
                  CERT {currentIndex + 1} OF {certificates.length}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold font-display text-white truncate">
                {activeCert.title}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono text-slate-300">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                title="Zoom Out"
                className="p-1 hover:text-cyan-400 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-bold text-cyan-300 min-w-[40px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                title="Zoom In"
                className="p-1 hover:text-cyan-400 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Certificate */}
            <button
              onClick={handlePrint}
              title="Print official certificate document"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              title="Download Certificate Document"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setIsFullscreen(!isFullscreen);
              }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden md:flex"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              title="Close Viewer"
              className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step-Through Tab Bar across all 4 permanent certificates */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-slate-950 border-b border-slate-800/80 font-mono text-xs overflow-x-auto shrink-0 select-none">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePrev}
              title="Previous Certificate (Left Arrow)"
              className="p-1.5 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {certificates.map((cert, index) => {
                const isActive = cert.id === currentCertId;
                return (
                  <button
                    key={cert.id}
                    onClick={() => handleSelectCert(cert.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer shrink-0 text-[11px] ${
                      isActive
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>0{index + 1}.</span>
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">
                      {cert.title.split(':')[0]}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Permanent Verified Record" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              title="Next Certificate (Right Arrow)"
              className="p-1.5 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Credential ID badge */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" /> OFFICIAL VERIFIED CREDENTIAL // ID: {activeCert.certificateId}
            </span>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex items-center justify-center bg-slate-950/80 relative">
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {hasUploadedCustomDoc && activeCert.customDocumentType === 'pdf' && activeCert.customDocumentUrl ? (
              /* Vector PDF Canvas Viewer */
              <div className="w-full h-full min-h-[480px] rounded-xl overflow-hidden shadow-2xl border border-cyan-500/30">
                <PDFViewerCanvas
                  pdfDataUrl={activeCert.customDocumentUrl}
                  fileName={activeCert.customDocumentName || `${activeCert.certificateId}.pdf`}
                  certificateId={activeCert.certificateId}
                  className="w-full h-full min-h-[480px]"
                />
              </div>
            ) : hasUploadedCustomDoc && activeCert.customDocumentType === 'image' && safeDocumentUrl ? (
              /* Attached Image Certificate */
              <div className="w-full h-full max-h-[750px] flex items-center justify-center p-4 bg-slate-900/90 rounded-xl border border-cyan-500/40 shadow-2xl overflow-hidden">
                <img
                  src={safeDocumentUrl}
                  alt={activeCert.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              /* High-Fidelity Accredited Digital Certificate Layout */
              <div
                id="printable-certificate-document"
                className="w-full max-w-4xl bg-slate-950 rounded-2xl border-2 border-cyan-400/60 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,240,255,0.2)] relative text-center flex flex-col justify-between overflow-hidden my-auto"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 50% 30%, rgba(10, 25, 47, 0.98) 0%, rgba(2, 6, 23, 1) 100%)',
                }}
              >
                {/* Guilloche / Intricate Security Border */}
                <div className="absolute inset-2 sm:inset-3 border border-cyan-500/30 rounded-xl pointer-events-none" />
                <div className="absolute inset-3 sm:inset-4 border border-dashed border-cyan-900/60 rounded-lg pointer-events-none" />

                {/* Subtle Watermark Seal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-96 h-96 text-cyan-400" />
                </div>

                {/* Document Top Authority */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-[11px] sm:text-xs tracking-widest uppercase font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    CERTIFICATE OF ACHIEVEMENT & RECOGNITION
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold font-mono text-cyan-300 tracking-wide uppercase">
                    {activeCert.issuer}
                  </h4>
                  <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-2" />
                </div>

                {/* Recipient Presentation */}
                <div className="relative z-10 space-y-3 sm:space-y-4 my-6">
                  <p className="text-xs sm:text-sm font-mono text-slate-400 uppercase tracking-widest">
                    THIS OFFICIAL CREDENTIAL IS PROUDLY CONFERRED UPON
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white tracking-wide text-shadow-glow">
                    Vishwajit Laxman Pawar
                  </h1>
                  <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    For demonstrated mastery and verified completion of{' '}
                    <strong className="text-cyan-300 font-semibold">{activeCert.title}</strong>
                    {activeCert.description && (
                      <span className="block text-slate-400 text-xs mt-1">
                        {activeCert.description}
                      </span>
                    )}
                  </p>
                </div>

                {/* Verified Competencies */}
                <div className="relative z-10 my-4 py-3 border-y border-cyan-900/40 max-w-2xl mx-auto w-full">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                    VERIFIED DOMAIN SKILLS & COMPETENCIES:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {activeCert.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-900/90 border border-cyan-800/80 text-cyan-300 font-mono text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Signatures, Seals, and QR Verification Footer */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 pt-4 border-t border-slate-800/80 font-mono text-xs text-slate-400">
                  {/* Left: Authority & Date */}
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-cyan-300 font-bold">{activeCert.issuer}</div>
                    <div className="text-[11px] text-slate-400">Issued: {activeCert.date}</div>
                    <div className="text-[10px] text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED CREDENTIAL
                    </div>
                  </div>

                  {/* Middle: Gold Embossed Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
                        <Award className="w-7 h-7" />
                      </div>
                    </div>
                    <span className="text-[9px] text-amber-400 font-bold tracking-wider mt-1 uppercase">
                      OFFICIAL SEAL
                    </span>
                  </div>

                  {/* Right: Credential ID & QR Badge */}
                  <div className="text-center sm:text-right space-y-1">
                    <div className="text-slate-400 text-[10px]">CREDENTIAL ID:</div>
                    <div className="text-cyan-400 font-bold tracking-wider text-xs sm:text-sm">
                      {activeCert.certificateId}
                    </div>
                    {activeCert.verificationUrl ? (
                      <a
                        href={activeCert.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200 underline"
                      >
                        Verify Online <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-emerald-400">DIGITALLY VALIDATED</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
