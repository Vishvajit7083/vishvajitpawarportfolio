export interface SkillNode {
  id: string;
  name: string;
  category: 'Programming' | 'Embedded Systems' | 'AI & Robotics' | 'Hardware' | 'Tools' | 'Operating Systems';
  level: number; // 1 - 100
  description: string;
  relevance: string;
  color: string;
  icon: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface ProjectComponentHotspot {
  id: string;
  name: string;
  category: string;
  title: string;
  description: string;
  specs: string[];
  position: [number, number, number];
  icon: string;
}

export interface SensorTelemetry {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  altitude: number;
  wifiRssi: number;
  powerDraw: number;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  type: string;
  highlights: string[];
  badgeColor: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  skills: string[];
  credentialUrl?: string;
  icon: string;
}

export interface LanguageItem {
  name: string;
  proficiency: string;
  scoreLabel: string;
  percentage: number;
  nativeScript: string;
}
