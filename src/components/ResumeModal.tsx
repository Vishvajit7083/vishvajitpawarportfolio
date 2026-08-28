import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Mail, 
  Phone, 
  Linkedin, 
  Award, 
  Cpu, 
  Briefcase, 
  GraduationCap, 
  CheckCircle,
  FileText,
  ExternalLink,
  Info,
  Globe,
  FileType
} from 'lucide-react';
import { PERSONAL_INFO, EXPERIENCES_DATA, CERTIFICATIONS_DATA, LANGUAGES_DATA } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';
import { 
  printResumeDocument, 
  openPrintableTab, 
  downloadPrintableHTML 
} from '../utils/resumePrint';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    setPrintStatus('Opening Print Dialog... (Select "Destination: Save as PDF")');
    printResumeDocument();
    setTimeout(() => {
      setPrintStatus(null);
    }, 4500);
  };

  const handleOpenPrintTab = () => {
    sound.playClick();
    openPrintableTab();
  };

  const handleDownloadHTML = () => {
    sound.playClick();
    downloadPrintableHTML();
  };

  const handleDownloadText = () => {
    sound.playClick();
    const resumeText = `=====================================================
VISHVAJIT LAXMAN PAWAR
Electronics and Telecommunication Engineering Graduate
Email: ${PERSONAL_INFO.email}
Phone: ${PERSONAL_INFO.phone}
LinkedIn: ${PERSONAL_INFO.linkedin}
Location: Kolhapur, Maharashtra, India
=====================================================

CAREER OBJECTIVE:
${PERSONAL_INFO.bio}

EDUCATION:
- ${PERSONAL_INFO.education.degree}
  ${PERSONAL_INFO.education.institution} (${PERSONAL_INFO.education.period}) | CGPA: ${PERSONAL_INFO.education.cgpa}

TECHNICAL SKILLS:
- Programming: C, Python, Java, SQL
- Embedded Systems: Embedded C, ESP32, Microcontrollers, FreeRTOS, IoT
- AI & Robotics: OpenCV, Computer Vision, AI Integration, Kinematics
- Hardware & Sensors: DHT11, BMP180, Ultrasonic Sensors, WiFi, Bluetooth, I2C, SPI, PWM
- Tools & IDEs: Git, Arduino IDE, VS Code, MS Office, Linux
- Operating Systems: Linux (Ubuntu/Debian), Windows

KEY PROJECTS:
1. AI-Assisted Robot for Personal Assistance (2025)
   Technologies: Python, OpenCV, IoT, Embedded C
   - AI-powered voice interaction and autonomous assistance.
   - Object detection and basic face recognition using OpenCV.
   - Ultrasonic sensors for obstacle detection and navigation.
   - Embedded software for intelligent human-robot interaction.

2. IoT-Based Weather Monitoring System (2025)
   Technologies: ESP32, DHT11, BMP180, IoT
   - Built an ESP32 weather monitoring system using DHT11 and BMP180 sensors.
   - Enabled wireless monitoring through WiFi/Bluetooth communication.
   - Displayed real-time environmental data.
   - Optimized power usage for improved efficiency.

VIRTUAL EXPERIENCE & SIMULATIONS:
1. Deloitte Technology Job Simulation - Forage (Jun 2024 - Jul 2024)
   - Analytical problem solving, business scenarios, technical documentation, communication, solution design.
2. Data Visualisation Virtual Experience - Forage (Jul 2024)
   - Data visualisation, business insights, dashboard design, data storytelling.

CERTIFICATIONS:
- Deloitte Technology Job Simulation (Forage)
- Data Visualisation Virtual Experience (Forage)
- Embedded Systems Online Internship

LANGUAGES:
- Marathi (Native Proficiency)
- Hindi (Full Professional Proficiency)
- English (Professional Working Proficiency)
=====================================================`;

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Vishwajit_Pawar_Resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Modal Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:px-6 bg-slate-900 border-b border-cyan-500/20 gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-300 font-semibold">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">RESUME // VISHVAJIT LAXMAN PAWAR</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Primary Print to PDF button */}
            <button
              id="btn-print-resume-pdf"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 text-xs font-mono transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
              title="Print to PDF / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>Print to PDF</span>
            </button>

            {/* Open in Clean Tab */}
            <button
              id="btn-open-printable-tab"
              onClick={handleOpenPrintTab}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
              title="Open standalone printable sheet in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Open Print Tab</span>
            </button>

            {/* Download Text */}
            <button
              id="btn-download-resume-txt"
              onClick={handleDownloadText}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all cursor-pointer"
              title="Download Plaintext Resume"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">.TXT</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-close-resume-modal"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Prompt Banner / Tip */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/15 px-4 sm:px-6 py-2 text-[11px] font-mono text-cyan-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              {printStatus || 'PDF Tip: In the browser print popup, select "Destination: Save as PDF" with Margins: Default or Minimum.'}
            </span>
          </div>
          <button 
            onClick={handleDownloadHTML}
            className="text-cyan-400 underline hover:text-cyan-200 shrink-0 text-[10px] cursor-pointer"
            title="Download formatted HTML document"
          >
            Download HTML
          </button>
        </div>

        {/* Scrollable Printable Resume Sheet */}
        <div 
          id="printable-resume" 
          ref={resumeRef} 
          className="resume-print-portal p-6 sm:p-10 overflow-y-auto text-slate-200 font-sans space-y-7 bg-slate-950"
        >
          {/* Header Block */}
          <div className="border-b border-slate-800 pb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-display print-header-name">
              {PERSONAL_INFO.name}
            </h1>
            <p className="text-cyan-400 font-medium text-sm sm:text-base mt-1 print-accent">
              {PERSONAL_INFO.title}
            </p>

            <div className="mt-3.5 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400 no-print" />
                <a href={`mailto:${PERSONAL_INFO.email}`} className="hover:text-white transition-colors">
                  {PERSONAL_INFO.email}
                </a>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400 no-print" />
                <a href={`tel:${PERSONAL_INFO.phone}`} className="hover:text-white transition-colors">
                  {PERSONAL_INFO.phone}
                </a>
              </span>
              <span className="flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-cyan-400 no-print" />
                <a href={PERSONAL_INFO.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  {PERSONAL_INFO.linkedinDisplay}
                </a>
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400 no-print" />
                <span>{PERSONAL_INFO.location}</span>
              </span>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="print-avoid-break">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">
              PROFESSIONAL PROFILE
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {PERSONAL_INFO.bio}
            </p>
          </div>

          {/* Education */}
          <div className="print-avoid-break">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">
              EDUCATION
            </h2>
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between items-baseline font-bold text-white">
                <span>{PERSONAL_INFO.education.degree}</span>
                <span className="font-mono text-cyan-400 text-xs">{PERSONAL_INFO.education.period}</span>
              </div>
              <div className="text-slate-400">{PERSONAL_INFO.education.institution}</div>
              <div className="text-emerald-400 font-mono text-xs font-semibold">
                CGPA: {PERSONAL_INFO.education.cgpa}
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="print-avoid-break">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">
              TECHNICAL SKILLS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <strong className="text-white font-mono">Programming:</strong>{' '}
                <span className="text-slate-300">C, Python, Java, SQL</span>
              </div>
              <div>
                <strong className="text-white font-mono">Embedded Systems:</strong>{' '}
                <span className="text-slate-300">Embedded C, ESP32, Microcontrollers, FreeRTOS, IoT</span>
              </div>
              <div>
                <strong className="text-white font-mono">AI &amp; Robotics:</strong>{' '}
                <span className="text-slate-300">OpenCV, Computer Vision, AI Integration, Kinematics</span>
              </div>
              <div>
                <strong className="text-white font-mono">Hardware &amp; Sensors:</strong>{' '}
                <span className="text-slate-300">DHT11, BMP180, Ultrasonic Sensors, WiFi, Bluetooth, I2C, SPI</span>
              </div>
              <div>
                <strong className="text-white font-mono">Tools &amp; IDEs:</strong>{' '}
                <span className="text-slate-300">Git, Arduino IDE, VS Code, Linux, MS Office</span>
              </div>
              <div>
                <strong className="text-white font-mono">Operating Systems:</strong>{' '}
                <span className="text-slate-300">Linux (Ubuntu/Debian), Windows</span>
              </div>
            </div>
          </div>

          {/* Key Projects */}
          <div className="print-avoid-break">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-3">
              KEY ENGINEERING PROJECTS
            </h2>
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Project 1 */}
              <div className="space-y-1.5 print-avoid-break">
                <div className="flex justify-between items-baseline font-bold text-white">
                  <span>AI-Assisted Robot for Personal Assistance</span>
                  <span className="font-mono text-cyan-400 text-xs">2025</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Technologies: Python • OpenCV • IoT • Ultrasonic Sensors • Embedded C
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>AI-powered voice interaction and autonomous room navigation routines.</li>
                  <li>Object detection and basic face recognition using OpenCV computer vision.</li>
                  <li>Ultrasonic sensor array for low-latency obstacle detection and navigation.</li>
                  <li>Embedded software for intelligent human-robot interaction and actuator control.</li>
                </ul>
              </div>

              {/* Project 2 */}
              <div className="space-y-1.5 pt-2 print-avoid-break">
                <div className="flex justify-between items-baseline font-bold text-white">
                  <span>IoT-Based Weather Monitoring System</span>
                  <span className="font-mono text-cyan-400 text-xs">2025</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Technologies: ESP32 SoC • DHT11 • BMP180 • FreeRTOS • WiFi / Bluetooth BLE
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Built an ESP32 weather monitoring station using DHT11 and BMP180 sensors.</li>
                  <li>Enabled real-time wireless telemetry through WiFi and Bluetooth Low Energy.</li>
                  <li>Configured power-management sleep states for maximized battery efficiency.</li>
                  <li>Provided interactive telemetry stream with historical monitoring metrics.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Simulations & Experiences */}
          <div className="print-avoid-break">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-3">
              SIMULATIONS &amp; INDUSTRY EXPERIENCES
            </h2>
            <div className="space-y-3.5 text-xs sm:text-sm">
              {EXPERIENCES_DATA.map((exp) => (
                <div key={exp.id} className="space-y-1 print-avoid-break">
                  <div className="flex justify-between items-baseline font-bold text-white">
                    <span>{exp.role}</span>
                    <span className="font-mono text-cyan-400 text-xs">{exp.period}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">{exp.company} — {exp.type}</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-xs pt-0.5">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800 print-avoid-break">
            <div>
              <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-2">
                CERTIFICATIONS
              </h2>
              <ul className="space-y-1 text-xs text-slate-300">
                {CERTIFICATIONS_DATA.map((cert) => (
                  <li key={cert.id} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 no-print" />
                    <span>{cert.title} – {cert.issuer}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-2">
                LANGUAGES
              </h2>
              <ul className="space-y-1 text-xs text-slate-300">
                {LANGUAGES_DATA.map((lang) => (
                  <li key={lang.name} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 no-print" />
                    <span>{lang.name} ({lang.proficiency})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
