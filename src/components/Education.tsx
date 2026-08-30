import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  MapPin,
  CheckCircle2,
  Cpu,
  FileText,
  ExternalLink,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';
import { certificateManager, StoredCertificate } from '../utils/certificateStore';
import { dataUrlToBlobUrl } from '../utils/pdfHelper';
import { PDFViewerCanvas } from './PDFViewerCanvas';
import { CertificateModal } from './CertificateModal';
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

export const Education: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [eduCert, setEduCert] = useState<StoredCertificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = certificateManager.subscribe((certs) => {
      const found = certs.find((c) => c.id === 'edu-cert');
      if (found) {
        setEduCert(found);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3D Graduation Hologram Element (Cap & Pedestal with rotating aura)
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3.5);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambLight = new THREE.AmbientLight(0x0a192f, 2);
    scene.add(ambLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 3.5, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.5, 10);
    purpleLight.position.set(-2, 1, -1);
    scene.add(purpleLight);

    // Hologram Group
    const eduGroup = new THREE.Group();
    scene.add(eduGroup);

    // Materials
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      metalness: 0.85,
      roughness: 0.2,
    });
    const glowingCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
    });
    const glowingPurpleMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.5,
    });

    // 1. Graduation Cap Diamond Top
    const capTopGeo = new THREE.BoxGeometry(1.2, 0.04, 1.2);
    const capTop = new THREE.Mesh(capTopGeo, darkChassisMat);
    capTop.rotation.y = Math.PI / 4;
    capTop.position.y = 0.5;
    eduGroup.add(capTop);

    // Cap Skull Dome Base
    const skullGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.3, 16);
    const skull = new THREE.Mesh(skullGeo, darkChassisMat);
    skull.position.y = 0.35;
    eduGroup.add(skull);

    // Tassel button & hanging string
    const buttonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowingCyanMat);
    buttonMesh.position.set(0, 0.54, 0);
    eduGroup.add(buttonMesh);

    const tasselMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.35, 8), glowingPurpleMat);
    tasselMesh.position.set(0.45, 0.35, 0.2);
    tasselMesh.rotation.z = -0.3;
    eduGroup.add(tasselMesh);

    // 2. Holographic Floating Pedestal / Pillar
    const basePillarGeo = new THREE.CylinderGeometry(0.6, 0.8, 0.2, 24);
    const basePillar = new THREE.Mesh(basePillarGeo, darkChassisMat);
    basePillar.position.y = -0.3;
    eduGroup.add(basePillar);

    const pillarRings = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.03, 16, 32), glowingCyanMat);
    pillarRings.position.y = -0.3;
    pillarRings.rotation.x = Math.PI / 2;
    eduGroup.add(pillarRings);

    // 3. Orbiting Data Particles
    const haloRingGeo = new THREE.RingGeometry(1.1, 1.12, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const haloRing = new THREE.Mesh(haloRingGeo, haloMat);
    haloRing.rotation.x = Math.PI / 2.5;
    eduGroup.add(haloRing);

    // Animation
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      eduGroup.rotation.y = t * 0.4;
      eduGroup.position.y = Math.sin(t * 1.5) * 0.08;
      haloRing.rotation.z = -t * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const currentCertId = eduCert?.certificateId || 'BVC-BTECH-ENTC-2026-878';
  const hasUploadedDoc = !!eduCert?.customDocumentUrl;
  const safePdfUrl = useMemo(() => {
    if (!eduCert?.customDocumentUrl) return null;
    return dataUrlToBlobUrl(eduCert.customDocumentUrl);
  }, [eduCert?.customDocumentUrl]);

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleDownload = () => {
    sound.playClick();
    if (eduCert?.customDocumentUrl) {
      const a = document.createElement('a');
      a.href = eduCert.customDocumentUrl;
      a.download = eduCert.customDocumentName || 'Vishwajit-Pawar-Degree-Certificate.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.print();
    }
  };

  return (
    <section id="education" className="relative w-full py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <ScrollReveal direction="up">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              // ACADEMIC_CREDENTIALS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-wide">
              EDUCATION & DEGREE
            </h2>
          </div>
        </div>
      </ScrollReveal>

      {/* 3D Education Hologram Card */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="glass-panel-glow p-6 sm:p-10 rounded-2xl border border-cyan-500/40 relative shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden">
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Education Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>BACHELOR OF TECHNOLOGY (B.TECH)</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  {PERSONAL_INFO.education.degree}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    {PERSONAL_INFO.education.institution}
                  </span>
                </div>
              </div>

              {/* Metrics Row (Period & CGPA) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">ACADEMIC PERIOD</span>
                  <span className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    {PERSONAL_INFO.education.period}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">CUMULATIVE CGPA</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    {PERSONAL_INFO.education.cgpa}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 block mb-1">STATUS</span>
                  <span className="text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    GRADUATE READY
                  </span>
                </div>
              </div>

              {/* Coursework & Engineering Foundations */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  FOUNDATIONAL COURSEWORK & SYLLABUS:
                </span>
                <p className="leading-relaxed text-slate-300">
                  {PERSONAL_INFO.education.details}
                </p>
              </div>
            </div>

            {/* Right Column: Floating 3D Graduation Element */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center relative min-h-[260px]">
              <div
                ref={canvasRef}
                id="education-3d-canvas"
                className="w-full h-[260px] cursor-grab"
                title="Interactive 3D Graduation Hologram"
              />
              <div className="text-[10px] font-mono text-slate-400 text-center">
                HOLOGRAPHIC DEGREE SEAL // ENTC 2026
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* Permanent Accredited Degree Certificate Card */}
      {/* ========================================================================= */}
      <ScrollReveal direction="up" delay={0.2}>
        <div
          id="education-certificate-card"
          className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/40 relative shadow-[0_0_35px_rgba(0,240,255,0.15)] overflow-hidden mt-8 space-y-6"
        >
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  OFFICIAL DEGREE CERTIFICATE & TRANSCRIPT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> PERMANENT RECORD
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white truncate mt-0.5">
                B.Tech in Electronics & Telecommunication Engineering
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Bharati Vidyapeeth College of Engineering Kolhapur (2022 - 2026) • Recipient:{' '}
                <strong className="text-white">Vishwajit Laxman Pawar</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Document View</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Degree Document"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              title="Download Degree Document"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Document Viewer */}
        <div
          id="education-pdf-viewer-container"
          className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950/90 shadow-inner flex flex-col min-h-[400px]"
          style={{
            height: 'min(580px, 60vh)',
          }}
        >
          {hasUploadedDoc && eduCert?.customDocumentType === 'pdf' && eduCert?.customDocumentUrl ? (
            <div className="w-full h-full min-h-[400px] overflow-hidden flex flex-col">
              <PDFViewerCanvas
                pdfDataUrl={eduCert.customDocumentUrl}
                fileName={eduCert.customDocumentName || 'Degree-Certificate.pdf'}
                certificateId={currentCertId}
                className="w-full h-full min-h-[400px] overflow-hidden"
              />
            </div>
          ) : hasUploadedDoc && eduCert?.customDocumentType === 'image' && safePdfUrl ? (
            <div className="w-full h-full min-h-[400px] overflow-hidden flex flex-col bg-slate-900">
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono shrink-0">
                <span className="text-cyan-300 flex items-center gap-2 font-bold truncate">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  {eduCert.customDocumentName || 'Degree-Certificate.png'}
                </span>
                <a
                  href={safePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1"
                >
                  Full Image <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full flex-1 flex items-center justify-center p-3 bg-slate-950 overflow-hidden">
                <img
                  src={safePdfUrl}
                  alt="Degree Certificate"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                />
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full min-h-[400px] p-4 sm:p-8 flex flex-col items-center justify-between text-center relative overflow-hidden"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 1) 100%)',
              }}
            >
              {/* Security Border */}
              <div className="absolute inset-2 sm:inset-4 border border-cyan-500/30 rounded-xl pointer-events-none" />
              <div className="absolute inset-3 sm:inset-5 border border-dashed border-cyan-900/60 rounded-lg pointer-events-none" />

              {/* Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <GraduationCap className="w-80 h-80 text-cyan-400" />
              </div>

              {/* Document Header */}
              <div className="relative z-10 space-y-1 my-auto">
                <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-[11px] tracking-widest uppercase font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ACCREDITED DEGREE CREDENTIAL DOCUMENT
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs font-mono text-slate-400">
                  BHARATI VIDYAPEETH COLLEGE OF ENGINEERING KOLHAPUR
                </div>
                <div className="h-0.5 w-28 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-1.5" />
              </div>

              {/* Recipient Presentation */}
              <div className="relative z-10 space-y-3 my-auto">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  THIS IS TO CERTIFY THAT
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-wide text-shadow-glow">
                  Vishwajit Laxman Pawar
                </h2>
                <p className="text-xs font-mono text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Has fulfilled all academic criteria for the degree of{' '}
                  <strong className="text-cyan-300">
                    Bachelor of Technology in Electronics & Telecommunication Engineering
                  </strong>{' '}
                  with a Cumulative CGPA of <strong className="text-emerald-400">6.5 / 10.0</strong>.
                </p>
              </div>

              {/* Bottom Signatures & Seal */}
              <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-3 items-end gap-4 relative z-10 font-mono text-[11px] pt-4 border-t border-slate-800/80 my-auto">
                <div className="text-center sm:text-left text-slate-400">
                  <div className="text-cyan-300 font-bold">BHARATI VIDYAPEETH</div>
                  <div className="text-[10px]">Academic Authority</div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-[8px] text-amber-400 font-bold mt-0.5">ACCREDITED SEAL</span>
                </div>

                <div className="text-center sm:text-right text-slate-400">
                  <div className="text-cyan-400 font-bold">{currentCertId}</div>
                  <div className="text-[10px] text-emerald-400">DIGITALLY VALIDATED</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>

    <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCertId="edu-cert"
      />
    </section>
  );
};
