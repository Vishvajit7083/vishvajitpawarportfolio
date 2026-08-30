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
  Eye,
  Layers,
  ChevronRight,
  School,
  Check
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';
import { certificateManager, StoredCertificate } from '../utils/certificateStore';
import { dataUrlToBlobUrl } from '../utils/pdfHelper';
import { PDFViewerCanvas } from './PDFViewerCanvas';
import { CertificateModal } from './CertificateModal';
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

const CORE_SUBJECTS = [
  'Microprocessors & MCUs (8051, ARM, ESP32)',
  'Embedded C & Real-Time Operating Systems (FreeRTOS)',
  'Digital Signal Processing & Filter Design',
  'Wireless Sensor Networks & IoT Protocols (MQTT, BLE)',
  'Control Systems & Feedback Stabilization',
  'Digital Electronics & VLSI Circuit Design',
  'Computer Networks & TCP/IP Architecture',
  'Analog Communication & RF Systems'
];

export const Education: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [eduCert, setEduCert] = useState<StoredCertificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'certificate' | 'syllabus' | 'verification'>('certificate');

  useEffect(() => {
    const unsubscribe = certificateManager.subscribe((certs) => {
      const found = certs.find((c) => c.id === 'edu-cert');
      if (found) {
        setEduCert(found);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3D Graduation Hologram Element with robust ResizeObserver
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 3.4);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 4, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3, 10);
    purpleLight.position.set(-2, 1, -1);
    scene.add(purpleLight);

    // Hologram Group
    const eduGroup = new THREE.Group();
    scene.add(eduGroup);

    // Materials
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x071526,
      metalness: 0.9,
      roughness: 0.2,
    });
    const glowingCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.6,
    });
    const glowingPurpleMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.4,
    });

    // 1. Graduation Cap Diamond Top
    const capTopGeo = new THREE.BoxGeometry(1.15, 0.035, 1.15);
    const capTop = new THREE.Mesh(capTopGeo, darkChassisMat);
    capTop.rotation.y = Math.PI / 4;
    capTop.position.y = 0.45;
    eduGroup.add(capTop);

    // Cap Skull Dome Base
    const skullGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.28, 16);
    const skull = new THREE.Mesh(skullGeo, darkChassisMat);
    skull.position.y = 0.3;
    eduGroup.add(skull);

    // Tassel button & hanging string
    const buttonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowingCyanMat);
    buttonMesh.position.set(0, 0.48, 0);
    eduGroup.add(buttonMesh);

    const tasselMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.025, 0.32, 8), glowingPurpleMat);
    tasselMesh.position.set(0.42, 0.3, 0.18);
    tasselMesh.rotation.z = -0.3;
    eduGroup.add(tasselMesh);

    // 2. Holographic Floating Pedestal
    const basePillarGeo = new THREE.CylinderGeometry(0.55, 0.75, 0.16, 24);
    const basePillar = new THREE.Mesh(basePillarGeo, darkChassisMat);
    basePillar.position.y = -0.3;
    eduGroup.add(basePillar);

    const pillarRings = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.025, 16, 32), glowingCyanMat);
    pillarRings.position.y = -0.3;
    pillarRings.rotation.x = Math.PI / 2;
    eduGroup.add(pillarRings);

    // 3. Orbiting Data Gyro Rings
    const haloRingGeo = new THREE.RingGeometry(1.05, 1.08, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
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
      eduGroup.position.y = Math.sin(t * 1.5) * 0.06;
      haloRing.rotation.z = -t * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
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
    <section id="education" className="relative w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                // ACADEMIC_CREDENTIALS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-wide">
                EDUCATION & DEGREE
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-semibold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Degree Document</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Degree Card */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="glass-panel-glow p-5 sm:p-8 rounded-2xl border border-cyan-500/40 relative shadow-[0_0_35px_rgba(0,240,255,0.12)] overflow-hidden">
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Core Education Information */}
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>BACHELOR OF TECHNOLOGY (B.TECH)</span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-white leading-tight">
                  {PERSONAL_INFO.education.degree}
                </h3>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-cyan-300">
                  <School className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{PERSONAL_INFO.education.institution}</span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Academic Period
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    {PERSONAL_INFO.education.period}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Cumulative CGPA
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    {PERSONAL_INFO.education.cgpa}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Graduation Status
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    GRADUATE READY
                  </span>
                </div>
              </div>

              {/* Core Syllabus Coursework */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5 font-mono text-xs">
                <div className="text-cyan-300 font-semibold flex items-center gap-2 text-xs">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>CORE ENGINEERING CURRICULUM & LAB CAPSTONES</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {PERSONAL_INFO.education.details}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CORE_SUBJECTS.slice(0, 4).map((subj, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-cyan-950/70 border border-cyan-800/80 text-cyan-300"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: 3D Holographic Degree Seal */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center relative p-3 rounded-xl bg-slate-950/40 border border-cyan-900/40">
              <div
                ref={canvasRef}
                id="education-3d-canvas"
                className="w-full h-[220px] sm:h-[250px] cursor-grab"
                title="Interactive 3D Graduation Hologram"
              />
              <div className="text-[11px] font-mono text-cyan-400/90 text-center tracking-wider pt-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>HOLOGRAPHIC DEGREE SEAL // ENTC 2026</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Degree Certificate & Transcript Panel */}
      <ScrollReveal direction="up" delay={0.2}>
        <div
          id="education-certificate-card"
          className="glass-panel p-5 sm:p-7 rounded-2xl border border-cyan-500/30 relative shadow-[0_0_30px_rgba(0,240,255,0.1)] mt-8 space-y-5"
        >
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Panel Header with Navigation Tabs & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-cyan-400 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    OFFICIAL DEGREE CREDENTIAL
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> VERIFIED RECORD
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  ID: <span className="text-white font-semibold">{currentCertId}</span> • Recipient: <span className="text-white font-semibold">{PERSONAL_INFO.name}</span>
                </div>
              </div>
            </div>

            {/* Tabs & Actions */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('certificate');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeTab === 'certificate'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Credential View
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('syllabus');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeTab === 'syllabus'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full Syllabus
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('verification');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeTab === 'verification'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Verification
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsModalOpen(true)}
                  title="Expand Full Document Modal"
                  className="p-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 cursor-pointer transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrint}
                  title="Print Degree Document"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  title="Download Degree Document"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab 1: Accredited Certificate Document Viewer */}
          {activeTab === 'certificate' && (
            <div
              id="education-pdf-viewer-container"
              className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-inner min-h-[380px]"
            >
              {hasUploadedDoc && eduCert?.customDocumentType === 'pdf' && eduCert?.customDocumentUrl ? (
                <div className="w-full h-full min-h-[380px] overflow-hidden flex flex-col">
                  <PDFViewerCanvas
                    pdfDataUrl={eduCert.customDocumentUrl}
                    fileName={eduCert.customDocumentName || 'Degree-Certificate.pdf'}
                    certificateId={currentCertId}
                    className="w-full h-full min-h-[380px] overflow-hidden"
                  />
                </div>
              ) : hasUploadedDoc && eduCert?.customDocumentType === 'image' && safePdfUrl ? (
                <div className="w-full h-full min-h-[380px] overflow-hidden flex flex-col bg-slate-900">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono shrink-0">
                    <span className="text-cyan-300 flex items-center gap-2 font-bold truncate">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      {eduCert.customDocumentName || 'Degree-Certificate.png'}
                    </span>
                    <a
                      href={safePdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline text-xs flex items-center gap-1"
                    >
                      Full Image <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="w-full flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
                    <img
                      src={safePdfUrl}
                      alt="Degree Certificate"
                      className="max-w-full max-h-[340px] object-contain rounded-lg shadow-xl"
                    />
                  </div>
                </div>
              ) : (
                /* Crisp Cyber-Academic Certificate Template */
                <div className="w-full p-6 sm:p-8 flex flex-col justify-between text-center relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 space-y-6">
                  {/* Subtle Security Guilloche & Watermark */}
                  <div className="absolute inset-3 sm:inset-4 border border-cyan-500/30 rounded-xl pointer-events-none" />
                  <div className="absolute inset-4 sm:inset-5 border border-dashed border-cyan-900/50 rounded-lg pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <GraduationCap className="w-64 h-64 text-cyan-400" />
                  </div>

                  {/* Header */}
                  <div className="relative z-10 space-y-1 pt-2">
                    <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      ACCREDITED DEGREE CREDENTIAL DOCUMENT
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xs font-mono text-slate-300 font-semibold tracking-wide">
                      BHARATI VIDYAPEETH COLLEGE OF ENGINEERING KOLHAPUR
                    </div>
                    <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2" />
                  </div>

                  {/* Recipient Presentation */}
                  <div className="relative z-10 space-y-2.5 max-w-xl mx-auto py-1">
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                      THIS IS TO ACCREDIT AND CERTIFY THAT
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-wide">
                      {PERSONAL_INFO.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-mono text-slate-300 leading-relaxed">
                      Has successfully fulfilled all academic curriculum and practical requirements for the award of the degree of{' '}
                      <span className="text-cyan-300 font-bold">
                        Bachelor of Technology in Electronics and Telecommunication Engineering
                      </span>{' '}
                      with a Cumulative Grade Point Average of <span className="text-emerald-400 font-bold">{PERSONAL_INFO.education.cgpa}</span>.
                    </p>
                  </div>

                  {/* Document Footer: Seals, Hash & Authority */}
                  <div className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 items-center gap-4 relative z-10 font-mono text-xs pt-4 border-t border-slate-800">
                    <div className="text-center sm:text-left text-slate-400">
                      <div className="text-cyan-300 font-bold text-xs">BHARATI VIDYAPEETH</div>
                      <div className="text-[10px] text-slate-400">Accredited Academic Authority</div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                      <span className="text-[9px] text-amber-400 font-bold tracking-wider mt-1">OFFICIAL SEAL</span>
                    </div>

                    <div className="text-center sm:text-right text-slate-400">
                      <div className="text-cyan-400 font-bold text-xs">{currentCertId}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">DIGITALLY VALIDATED</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Full Coursework Syllabus Breakdown */}
          {activeTab === 'syllabus' && (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  E&TC B.TECH 4-YEAR CURRICULUM HIGHLIGHTS
                </span>
                <span className="text-slate-400 text-[11px]">2022 - 2026 Cohort</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CORE_SUBJECTS.map((subject, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="p-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{subject}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Theory & Hands-on Hardware Lab</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Verification & Security Records */}
          {activeTab === 'verification' && (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  DIGITAL CREDENTIAL VERIFICATION METADATA
                </span>
                <span className="text-cyan-400 text-[11px]">Permanent Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Registration / Certificate ID</span>
                  <span className="text-cyan-300 font-bold text-sm">{currentCertId}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Institutional Accreditation</span>
                  <span className="text-white font-bold text-xs">AICTE & Shivaji University / BVCOE</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Major Specialization</span>
                  <span className="text-white font-bold text-xs">Electronics & Telecommunication</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Verification Status</span>
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated & Digitally Verified
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Modal for full screen document view */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCertId="edu-cert"
      />
    </section>
  );
};
