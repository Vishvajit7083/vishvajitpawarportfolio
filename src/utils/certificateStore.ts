// Certificate Data & Local Storage Persistence Store for Vishwajit Laxman Pawar

export interface StoredCertificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  certificateId: string;
  skills: string[];
  verificationUrl?: string;
  icon: string;
  badgeType: 'deloitte' | 'forage' | 'embedded' | 'iot';
  description: string;
  // Uploaded custom document data (Base64 PDF or Image data URL, or external URL)
  customDocumentUrl?: string | null;
  customDocumentType?: 'pdf' | 'image' | null;
  customDocumentName?: string | null;
  uploadedAt?: string | null;
}

export const INITIAL_CERTIFICATES: StoredCertificate[] = [
  {
    id: 'cert-1',
    title: 'Technology Job Simulation',
    issuer: 'Deloitte — Forage',
    date: 'July 2024',
    certificateId: 'DEL-FORAGE-2024-VLP882',
    skills: ['Analytical Problem Solving', 'Technical Documentation', 'Solution Design', 'Enterprise Architecture'],
    verificationUrl: 'https://www.theforage.com/simulations/deloitte/technology',
    icon: 'ShieldCheck',
    badgeType: 'deloitte',
    description:
      'Completed practical tasks in enterprise technology evaluation, analytical problem solving, authoring structured technical specifications, and end-to-end architectural feasibility assessments.',
  },
  {
    id: 'cert-2',
    title: 'Data Visualisation: Empowering Business with Effective Insights',
    issuer: 'Tata / Forage Virtual Experience',
    date: 'July 2024',
    certificateId: 'TATA-FORAGE-2024-DVIS914',
    skills: ['Data Visualisation', 'Dashboard Design', 'Business Insights', 'Telemetry Analysis'],
    verificationUrl: 'https://www.theforage.com/simulations/tata/data-visualisation',
    icon: 'LineChart',
    badgeType: 'forage',
    description:
      'Engineered multi-dimensional data visualisations, derived operational business insights, designed telemetry dashboards, and communicated data narratives to key executive stakeholders.',
  },
  {
    id: 'cert-3',
    title: 'Embedded Systems & Microcontroller Firmware Internship',
    issuer: 'Industry Recognized Credential & Laboratory',
    date: '2024',
    certificateId: 'EMB-IND-2024-VLP730',
    skills: ['Embedded C', 'Microcontroller Interfacing', 'Sensor Drivers', 'Firmware Architecture', 'I2C / SPI / UART'],
    verificationUrl: '',
    icon: 'Cpu',
    badgeType: 'embedded',
    description:
      'Hands-on engineering in firmware design, bare-metal C programming, RTOS concepts, hardware timers, interrupts, and multi-sensor interfacing (DHT11, BMP180, Ultrasonic) on STM32 and 8-bit MCU platforms.',
  },
  {
    id: 'edu-cert',
    title: 'Bachelor of Technology (B.Tech) Degree Certificate',
    issuer: 'Bharati Vidyapeeth College of Engineering Kolhapur',
    date: '2022 - 2026',
    certificateId: 'BVC-BTECH-ENTC-2026-650',
    skills: ['Electronics & Telecommunication', 'Embedded Systems Architecture', 'Microcontroller Interfacing', 'Signal Processing & IoT'],
    verificationUrl: '',
    icon: 'GraduationCap',
    badgeType: 'embedded',
    description:
      'Official Academic B.Tech Degree Certificate & Transcripts for Vishwajit Laxman Pawar (CGPA: 6.5 / 10).',
  },
];

const STORAGE_KEY = 'vishwajit_portfolio_certificates_v1';

export class CertificateManager {
  private static instance: CertificateManager;
  private certificates: StoredCertificate[] = [];
  private listeners: Set<(certs: StoredCertificate[]) => void> = new Set();

  private constructor() {
    this.loadCertificates();
  }

  public static getInstance(): CertificateManager {
    if (!CertificateManager.instance) {
      CertificateManager.instance = new CertificateManager();
    }
    return CertificateManager.instance;
  }

  private loadCertificates() {
    if (typeof window === 'undefined') {
      this.certificates = [...INITIAL_CERTIFICATES];
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initial certificates to ensure all IDs exist
          this.certificates = INITIAL_CERTIFICATES.map((initial) => {
            const found = parsed.find((p: StoredCertificate) => p.id === initial.id);
            return found ? { ...initial, ...found } : initial;
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored certificates:', e);
    }

    this.certificates = [...INITIAL_CERTIFICATES];
  }

  public getCertificates(): StoredCertificate[] {
    return [...this.certificates];
  }

  public getCertificateById(id: string): StoredCertificate | undefined {
    return this.certificates.find((c) => c.id === id);
  }

  public subscribe(listener: (certs: StoredCertificate[]) => void) {
    this.listeners.add(listener);
    listener([...this.certificates]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.certificates));
      }
    } catch (e) {
      console.warn('Failed to save certificates to localStorage:', e);
    }
    this.listeners.forEach((cb) => cb([...this.certificates]));
  }

  public updateCertificate(
    id: string,
    updates: Partial<Omit<StoredCertificate, 'id'>>
  ): StoredCertificate | null {
    const index = this.certificates.findIndex((c) => c.id === id);
    if (index === -1) return null;

    this.certificates[index] = {
      ...this.certificates[index],
      ...updates,
    };
    this.notify();
    return this.certificates[index];
  }

  public uploadCertificateFile(
    id: string,
    fileDataUrl: string,
    fileType: 'pdf' | 'image',
    fileName: string,
    updatedCertificateId?: string
  ): StoredCertificate | null {
    const updates: Partial<StoredCertificate> = {
      customDocumentUrl: fileDataUrl,
      customDocumentType: fileType,
      customDocumentName: fileName,
      uploadedAt: new Date().toISOString(),
    };

    if (updatedCertificateId && updatedCertificateId.trim()) {
      updates.certificateId = updatedCertificateId.trim();
    }

    return this.updateCertificate(id, updates);
  }

  public removeCustomDocument(id: string): StoredCertificate | null {
    return this.updateCertificate(id, {
      customDocumentUrl: null,
      customDocumentType: null,
      customDocumentName: null,
      uploadedAt: null,
    });
  }

  public resetAllToDefault() {
    this.certificates = [...INITIAL_CERTIFICATES];
    this.notify();
  }
}

export const certificateManager = CertificateManager.getInstance();
