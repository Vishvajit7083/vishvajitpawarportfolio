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
  Upload,
  ExternalLink,
  Download,
  Trash2,
  Edit3,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';
import { certificateManager, StoredCertificate } from '../utils/certificateStore';
import { dataUrlToBlobUrl } from '../utils/pdfHelper';
import { PDFViewerCanvas } from './PDFViewerCanvas';

export const Education: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Education Certificate state synced with certificate store
  const [eduCert, setEduCert] = useState<StoredCertificate | null>(null);
  const [isEditingId, setIsEditingId] = useState(false);
  const [certIdInput, setCertIdInput] = useState('SPPU-BTECH-ENTC-2026-878');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const unsubscribe = certificateManager.subscribe((certs) => {
      const found = certs.find((c) => c.id === 'edu-cert');
      if (found) {
        setEduCert(found);
        setCertIdInput(found.certificateId || 'SPPU-BTECH-ENTC-2026-878');
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

  // Handle PDF/Image File Upload
  const processCertificateFile = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setStatusMsg({
        text: 'Unsupported file format. Please upload a PDF document (.pdf) or image (.png, .jpg, .webp).',
        type: 'error',
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setStatusMsg({
        text: 'File size exceeds 20MB limit. Please upload an optimized file.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      sound.playSuccessChime();
      certificateManager.uploadCertificateFile(
        'edu-cert',
        dataUrl,
        isPdf ? 'pdf' : 'image',
        file.name,
        certIdInput
      );
      setStatusMsg({
        text: `Certificate document "${file.name}" uploaded and saved successfully!`,
        type: 'success',
      });
    };
    reader.onerror = () => {
      setStatusMsg({
        text: 'Failed to read file. Please try again.',
        type: 'error',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCertificateFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCertificateFile(file);
    }
  };

  const handleSaveCertId = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccessChime();
    certificateManager.updateCertificate('edu-cert', {
      certificateId: certIdInput.trim() || 'SPPU-BTECH-ENTC-2026-878',
    });
    setIsEditingId(false);
    setStatusMsg({
      text: 'Certificate ID updated successfully!',
      type: 'success',
    });
  };

  const handleRemoveDocument = () => {
    sound.playClick();
    if (confirm('Are you sure you want to remove the uploaded degree certificate document?')) {
      certificateManager.removeCustomDocument('edu-cert');
      setStatusMsg({
        text: 'Document removed. Restored standard verified digital certificate.',
        type: 'success',
      });
    }
  };

  const hasUploadedDoc = !!eduCert?.customDocumentUrl;
  const currentCertId = eduCert?.certificateId || 'SPPU-BTECH-ENTC-2026-878';
  const safePdfUrl = useMemo(() => {
    if (!eduCert?.customDocumentUrl) return null;
    return dataUrlToBlobUrl(eduCert.customDocumentUrl);
  }, [eduCert?.customDocumentUrl]);

  return (
    <section id="education" className="relative w-full py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
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

      {/* 3D Education Hologram Card */}
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

      {/* ========================================================================= */}
      {/* Education Certificate Card: Header → Responsive PDF Viewer → Upload Controls */}
      {/* ========================================================================= */}
      <div
        id="education-certificate-card"
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/40 relative shadow-[0_0_35px_rgba(0,240,255,0.15)] overflow-hidden mt-8 space-y-6"
      >
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* 1. Certificate Header */}
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
                {hasUploadedDoc ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-semibold flex items-center gap-1">
                    <FileCheck className="w-3 h-3" /> REAL PDF ATTACHED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    DIGITALLY VALIDATED
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white truncate mt-0.5">
                B.Tech in Electronics & Telecommunication Engineering
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Bharti vidyapeeth college of engineering Kolhapur (2022 - 2026) • Recipient:{' '}
                <strong className="text-white">Vishwajit Laxman Pawar</strong>
              </p>
            </div>
          </div>

          {/* Credential ID Badge */}
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <span className="text-slate-400">ID:</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-800 text-cyan-300 font-bold">
              {currentCertId}
            </span>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. Responsive PDF / Document Viewer Container */}
        <div
          id="education-pdf-viewer-container"
          className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950/90 shadow-inner flex flex-col min-h-[400px]"
          style={{
            height: 'min(580px, 60vh)',
          }}
        >
          {hasUploadedDoc && eduCert?.customDocumentType === 'pdf' && eduCert?.customDocumentUrl ? (
            /* Attached Real Vector Canvas PDF Viewer with Zoom & Navigation (Never blocked by Chrome) */
            <div className="w-full h-full min-h-[400px] overflow-hidden flex flex-col">
              <PDFViewerCanvas
                pdfDataUrl={eduCert.customDocumentUrl}
                fileName={eduCert.customDocumentName || 'Degree-Certificate.pdf'}
                certificateId={currentCertId}
                className="w-full h-full min-h-[400px] overflow-hidden"
                onReplaceClick={() => {
                  sound.playClick();
                  fileInputRef.current?.click();
                }}
              />
            </div>
          ) : hasUploadedDoc && eduCert?.customDocumentType === 'image' && safePdfUrl ? (
            /* Attached Image Certificate Preview */
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
            /* Default High-Fidelity Accredited Digital Degree Document */
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
                  with a Cumulative CGPA of <strong className="text-emerald-400">8.78 / 10.0</strong>.
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

        {/* ========================================================================= */}
        {/* 3. Upload & Edit Controls: ALWAYS RENDERED BELOW PDF IN NORMAL FLOW */}
        {/* ========================================================================= */}
        <div
          id="education-upload-controls"
          className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 font-mono text-xs space-y-4 shadow-lg"
        >
          {/* Top Info Banner & Replace Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {hasUploadedDoc ? (
                  <>
                    Real PDF attached: <strong className="text-white">{eduCert?.customDocumentName}</strong>. You can replace the document or edit Certificate ID below.
                  </>
                ) : (
                  <>
                    Want to attach your real PDF certificate file or edit this certificate ID?
                  </>
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileInputChange}
              />

              {/* Main Upload / Replace Button */}
              <button
                id="education-upload-pdf-btn"
                type="button"
                onClick={() => {
                  sound.playClick();
                  fileInputRef.current?.click();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  hasUploadedDoc
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{hasUploadedDoc ? 'REPLACE PDF / EDIT ID' : 'UPLOAD REAL DEGREE PDF'}</span>
              </button>

              {/* Edit ID Inline Toggle */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsEditingId(!isEditingId);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingId ? 'Close ID Editor' : 'Edit ID'}</span>
              </button>

              {/* Remove Uploaded PDF if active */}
              {hasUploadedDoc && (
                <button
                  type="button"
                  onClick={handleRemoveDocument}
                  title="Remove uploaded PDF and revert to standard template"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Expandable Certificate ID & Metadata Editor Form */}
          {isEditingId && (
            <form
              onSubmit={handleSaveCertId}
              className="p-3 sm:p-4 rounded-lg bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-semibold text-cyan-300 mb-1">
                    OFFICIAL DEGREE CERTIFICATE / CREDENTIAL ID:
                  </label>
                  <input
                    type="text"
                    value={certIdInput}
                    onChange={(e) => setCertIdInput(e.target.value)}
                    placeholder="e.g. SPPU-BTECH-ENTC-2026-878"
                    className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  >
                    Save ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingId(false)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Drag & Drop Quick Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-slate-950 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="text-[11px]">
              Drag & drop a new PDF / image certificate here, or click to browse (up to 20MB).
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

