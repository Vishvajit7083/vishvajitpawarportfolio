import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Award,
  Download,
  Printer,
  Upload,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Trash2,
  Edit3,
  RefreshCw,
  QrCode,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  AlertCircle,
  FileCheck,
  ZoomIn,
  ZoomOut,
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
  const [certificates, setCertificates] = useState<StoredCertificate[]>([]);
  const [currentCertId, setCurrentCertId] = useState<string>(
    initialCertId || INITIAL_CERTIFICATES[0].id
  );
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Form State for editing Certificate ID and details
  const [editableCertId, setEditableCertId] = useState('');
  const [editableTitle, setEditableTitle] = useState('');
  const [editableIssuer, setEditableIssuer] = useState('');
  const [editableDate, setEditableDate] = useState('');
  const [editableVerificationUrl, setEditableVerificationUrl] = useState('');
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'image' | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

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

  // Sync form inputs with active certificate
  useEffect(() => {
    if (activeCert) {
      setEditableCertId(activeCert.certificateId || '');
      setEditableTitle(activeCert.title || '');
      setEditableIssuer(activeCert.issuer || '');
      setEditableDate(activeCert.date || '');
      setEditableVerificationUrl(activeCert.verificationUrl || '');
      setUploadedFilePreview(activeCert.customDocumentUrl || null);
      setUploadedFileName(activeCert.customDocumentName || null);
      setUploadedFileType(activeCert.customDocumentType || null);
      setUploadStatusMsg(null);
    }
  }, [activeCert?.id, activeCert?.certificateId, activeCert?.customDocumentUrl]);

  // Keyboard navigation (Escape to close, Left/Right arrows to step one by one)
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

  // Convert base64 data URL to safe blob: URL to prevent Chrome blocking
  const safeDocumentUrl = useMemo(() => {
    if (!activeCert?.customDocumentUrl) return null;
    return dataUrlToBlobUrl(activeCert.customDocumentUrl);
  }, [activeCert?.customDocumentUrl]);

  const currentIndex = certificates.findIndex((c) => c.id === currentCertId);

  const handlePrev = () => {
    sound.playClick();
    const prevIdx = (currentIndex - 1 + certificates.length) % certificates.length;
    setCurrentCertId(certificates[prevIdx].id);
  };

  const handleNext = () => {
    sound.playClick();
    const nextIdx = (currentIndex + 1) % certificates.length;
    setCurrentCertId(certificates[nextIdx].id);
  };

  const handleSelectCert = (id: string) => {
    sound.playClick();
    setCurrentCertId(id);
  };

  // Handle file selection (PDF or Image)
  const processUploadedFile = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setUploadStatusMsg({
        text: 'Unsupported file format. Please upload a PDF document (.pdf) or image (.png, .jpg, .webp).',
        type: 'error',
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadStatusMsg({
        text: 'File size exceeds 15MB limit. Please upload an optimized file.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedFilePreview(dataUrl);
      setUploadedFileName(file.name);
      setUploadedFileType(isPdf ? 'pdf' : 'image');
      setUploadStatusMsg({
        text: `File loaded: "${file.name}". Click "Save & Update Certificate" to apply.`,
        type: 'success',
      });
    };
    reader.onerror = () => {
      setUploadStatusMsg({
        text: 'Failed to read file. Please try again.',
        type: 'error',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Save updates to Certificate Manager (localStorage)
  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccessChime();

    if (uploadedFilePreview && uploadedFileType && uploadedFileName) {
      certificateManager.uploadCertificateFile(
        activeCert.id,
        uploadedFilePreview,
        uploadedFileType,
        uploadedFileName,
        editableCertId
      );
    }

    certificateManager.updateCertificate(activeCert.id, {
      certificateId: editableCertId.trim() || activeCert.certificateId,
      title: editableTitle.trim() || activeCert.title,
      issuer: editableIssuer.trim() || activeCert.issuer,
      date: editableDate.trim() || activeCert.date,
      verificationUrl: editableVerificationUrl.trim(),
    });

    setUploadStatusMsg({
      text: 'Certificate ID & document updated successfully!',
      type: 'success',
    });
    setIsUploadPanelOpen(false);
  };

  const handleRemoveCustomDocument = () => {
    sound.playClick();
    if (confirm('Are you sure you want to remove the uploaded document and restore the default verified credential template?')) {
      certificateManager.removeCustomDocument(activeCert.id);
      setUploadedFilePreview(null);
      setUploadedFileName(null);
      setUploadedFileType(null);
      setUploadStatusMsg({
        text: 'Uploaded document removed. Restored standard credential layout.',
        type: 'success',
      });
    }
  };

  // Trigger browser print for printable certificate
  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  // Download PDF or certificate image
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
      // Trigger print dialog as Save as PDF
      window.print();
    }
  };

  if (!isOpen || !activeCert) return null;

  const hasUploadedCustomDoc = !!activeCert.customDocumentUrl;

  const modalContent = (
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
                  VERIFIED CREDENTIAL // PDF VIEWER
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
            {/* Upload / Edit ID button */}
            <button
              id="upload-cert-pdf-btn"
              onClick={() => {
                sound.playClick();
                setIsUploadPanelOpen(!isUploadPanelOpen);
              }}
              title="Upload your real PDF Certificate & update Certificate ID"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                isUploadPanelOpen
                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : hasUploadedCustomDoc
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-slate-900 hover:bg-cyan-950 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {hasUploadedCustomDoc ? 'UPDATE PDF / ID' : 'UPLOAD REAL PDF & ID'}
              </span>
            </button>

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
              title="Download Certificate / PDF"
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

        {/* Certificate Step-Through Tab Bar (One by One Selector) */}
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
                const isCustom = !!cert.customDocumentUrl;
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
                    {isCustom ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Real PDF Uploaded" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-cyan-500/60" title="Verified Digital Template" />
                    )}
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

          {/* Quick Status Notice */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
            {hasUploadedCustomDoc ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <FileCheck className="w-3.5 h-3.5" /> REAL PDF ATTACHED ({activeCert.customDocumentName})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" /> OFFICIAL VERIFIED TEMPLATE // ID: {activeCert.certificateId}
              </span>
            )}
          </div>
        </div>

        {/* Upload & Certificate ID Editing Drawer Panel */}
        {isUploadPanelOpen && (
          <div className="bg-slate-900/95 border-b border-cyan-500/40 p-4 sm:p-6 font-mono animate-in slide-in-from-top duration-300 shrink-0 z-30 shadow-xl overflow-y-auto max-h-[45vh]">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    UPLOAD REAL CERTIFICATE PDF & UPDATE CREDENTIAL ID
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Attach your official PDF or image certificate for <strong className="text-white">"{activeCert.title}"</strong> and set your official verification certificate ID.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadPanelOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadStatusMsg && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    uploadStatusMsg.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500 text-rose-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadStatusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveCertificate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Drop Area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      CERTIFICATE FILE (.PDF, .PNG, .JPG)
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                          : uploadedFileName
                          ? 'border-emerald-500/70 bg-emerald-950/30'
                          : 'border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 hover:bg-slate-950'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                      {uploadedFileName ? (
                        <div className="space-y-1">
                          <FileCheck className="w-7 h-7 text-emerald-400 mx-auto" />
                          <div className="text-xs font-bold text-white truncate max-w-xs mx-auto">
                            {uploadedFileName}
                          </div>
                          <span className="text-[10px] text-emerald-400">
                            Ready to apply. Click to choose another file.
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <FileText className="w-7 h-7 text-cyan-400/80 mx-auto" />
                          <div className="text-xs font-semibold text-slate-300">
                            Drag & drop your Certificate PDF or Image here
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Supports PDF, PNG, JPG (up to 15MB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        OFFICIAL CERTIFICATE / CREDENTIAL ID *
                      </label>
                      <input
                        type="text"
                        value={editableCertId}
                        onChange={(e) => setEditableCertId(e.target.value)}
                        placeholder="e.g. FORAGE-DEL-2024-88392"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        This ID appears on the verified badge and official certificate footer.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          ISSUER / ACADEMY
                        </label>
                        <input
                          type="text"
                          value={editableIssuer}
                          onChange={(e) => setEditableIssuer(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          ISSUE DATE
                        </label>
                        <input
                          type="text"
                          value={editableDate}
                          onChange={(e) => setEditableDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  {hasUploadedCustomDoc ? (
                    <button
                      type="button"
                      onClick={handleRemoveCustomDocument}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Custom PDF & Reset
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Changes are securely saved to your local browser storage.
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadPanelOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save & Update Certificate
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Certificate Viewing Body */}
        <div className="flex-1 bg-slate-950/90 overflow-y-auto p-3 sm:p-6 flex flex-col items-center justify-start relative">
          {/* If the user uploaded a custom PDF */}
          {hasUploadedCustomDoc && activeCert.customDocumentType === 'pdf' && activeCert.customDocumentUrl ? (
            <div className="w-full h-full min-h-[400px] flex flex-col rounded-xl overflow-hidden shadow-2xl border border-cyan-500/30">
              <PDFViewerCanvas
                pdfDataUrl={activeCert.customDocumentUrl}
                fileName={activeCert.customDocumentName || `${activeCert.title}.pdf`}
                certificateId={activeCert.certificateId}
                className="w-full h-full min-h-[400px] overflow-hidden"
                onReplaceClick={() => {
                  sound.playClick();
                  setIsUploadPanelOpen(true);
                }}
              />
            </div>
          ) : hasUploadedCustomDoc && activeCert.customDocumentType === 'image' && safeDocumentUrl ? (
            /* If the user uploaded a custom Image Certificate */
            <div className="w-full flex flex-col items-center justify-center p-4">
              <div className="max-w-4xl w-full rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-900 shadow-2xl">
                <img
                  src={safeDocumentUrl}
                  alt={activeCert.title}
                  className="w-full h-auto object-contain max-h-[650px] mx-auto"
                />
              </div>
            </div>
          ) : (
            /* Standard Real High-Fidelity Printable Certificate Canvas Document */
            <div
              ref={certificateRef}
              id="printable-certificate-document"
              className="w-full max-w-3xl bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-10 border-2 border-cyan-500/60 shadow-[0_0_50px_rgba(0,240,255,0.2)] relative overflow-hidden my-auto"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 1) 100%)',
              }}
            >
              {/* Guilloche / High-Tech Formal Security Border */}
              <div className="absolute inset-2 sm:inset-3 border border-cyan-500/30 rounded-xl pointer-events-none" />
              <div className="absolute inset-3 sm:inset-4 border border-dashed border-cyan-900/60 rounded-lg pointer-events-none" />

              {/* Holographic Watermark Crest */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <Award className="w-96 h-96 text-cyan-400" />
              </div>

              {/* Top Certificate Header */}
              <div className="text-center relative z-10 space-y-1 mb-6">
                <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-[11px] tracking-widest uppercase font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  OFFICIAL CERTIFICATE OF COMPLETION
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="text-xs font-mono text-slate-400 tracking-wider">
                  ENGINEERING CREDENTIAL & ACCREDITATION PROGRAM
                </div>

                <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-2" />
              </div>

              {/* Certificate Body Presentation */}
              <div className="text-center relative z-10 space-y-4">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  THIS CREDENTIAL IS PROUDLY AWARDED TO
                </p>

                {/* Recipient Full Legal Name */}
                <h1 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-wide text-shadow-glow">
                  Vishwajit Laxman Pawar
                </h1>

                <p className="text-xs font-mono text-slate-300 max-w-xl mx-auto leading-relaxed">
                  For successfully demonstrating professional excellence, analytical rigor, and hands-on technical proficiency in:
                </p>

                {/* Program / Title */}
                <div className="py-2.5 px-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 max-w-xl mx-auto">
                  <h3 className="text-lg sm:text-xl font-bold font-display text-cyan-300">
                    {activeCert.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">
                    Issued by <strong className="text-white">{activeCert.issuer}</strong>
                  </p>
                </div>

                <p className="text-xs text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
                  {activeCert.description}
                </p>

                {/* Verified Competencies */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
                    VERIFIED TECHNICAL COMPETENCIES & LAB DELIVERABLES:
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto">
                    {activeCert.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-950 text-cyan-200 border border-cyan-800/80 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Signatures & Verification Stamp */}
              <div className="mt-8 pt-6 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 relative z-10 font-mono">
                {/* Issuer Authority */}
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-xs text-cyan-300 font-bold tracking-wider">
                    {activeCert.issuer}
                  </div>
                  <div className="text-[10px] text-slate-400">Accredited Program Evaluator</div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    DATE: {activeCert.date}
                  </div>
                </div>

                {/* Center Official Gold Seal Badge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center relative">
                    <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400">
                      <Award className="w-6 h-6" />
                      <span className="text-[7px] font-bold tracking-tighter">VERIFIED</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-amber-400 font-bold mt-1">OFFICIAL SEAL</span>
                </div>

                {/* Official Verification QR & ID Code */}
                <div className="text-center sm:text-right space-y-1">
                  <div className="text-[10px] text-slate-400">CREDENTIAL IDENTIFIER</div>
                  <div className="text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-cyan-900 inline-block">
                    {activeCert.certificateId}
                  </div>
                  <div className="text-[9px] text-emerald-400 flex items-center justify-center sm:justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> DIGITALLY VALIDATED
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Upload Prompt Banner: ALWAYS VISIBLE AND ACCESSIBLE */}
          <div className="w-full max-w-3xl mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-slate-300 text-center sm:text-left">
              <Upload className="w-4 h-4 text-cyan-400 shrink-0 hidden sm:inline-block" />
              <span>
                {hasUploadedCustomDoc ? (
                  <>
                    Attached: <strong className="text-white">{activeCert.customDocumentName || 'Real PDF Certificate'}</strong> (ID: {activeCert.certificateId})
                  </>
                ) : (
                  'Want to attach your real PDF certificate file or edit this certificate ID?'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsUploadPanelOpen(true);
                }}
                className={`px-3 py-1.5 rounded-lg border font-semibold text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                  hasUploadedCustomDoc
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-cyan-950 hover:bg-cyan-900 border-cyan-500/50 hover:border-cyan-400 text-cyan-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{hasUploadedCustomDoc ? 'Replace PDF / Edit ID' : 'Upload File / Edit ID'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
