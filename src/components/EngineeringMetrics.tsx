import React, { useState } from 'react';
import {
  Award,
  Cpu,
  Activity,
  Zap,
  Radio,
  Wifi,
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

interface CapabilityMetric {
  id: string;
  metric: string;
  metricLabel: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  accentColor: string;
  badgeBg: string;
  summary: string;
  bulletPoints: string[];
  techStack: string[];
}

const CAPABILITY_METRICS: CapabilityMetric[] = [
  {
    id: 'cgpa',
    metric: '6.5 / 10',
    metricLabel: 'CUMULATIVE CGPA',
    title: 'ACADEMIC CGPA & DEGREE FOUNDATION',
    category: 'Bharati Vidyapeeth College of Engineering Kolhapur',
    icon: <Award className="w-5 h-5 text-amber-400" />,
    accentColor: 'border-amber-500/40 text-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    summary:
      'Bachelor of Technology in Electronics & Telecommunication Engineering (2022–2026) with core coursework in embedded architectures, digital signal processing, and communication networks.',
    bulletPoints: [
      'Comprehensive study of Microcontrollers, Embedded Linux, and Real-Time Operating Systems.',
      'Rigorous foundation in Control Systems, Digital Signal Processing, and Wireless Communication Networks.',
      'Practical lab capstones spanning bare-metal C programming and peripheral interfacing.',
    ],
    techStack: ['B.Tech E&TC', 'Embedded Systems', 'DSP', 'Control Systems'],
  },
  {
    id: 'esp32_rtos',
    metric: '240 MHz',
    metricLabel: 'DUAL-CORE XTENSA',
    title: 'ESP32 DUAL-CORE & FreeRTOS ARCHITECTURE',
    category: 'Symmetric Multiprocessing (SMP)',
    icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    accentColor: 'border-cyan-500/40 text-cyan-400',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    summary:
      'Engineered multi-threaded embedded firmware decoupling real-time hardware sensor acquisition from wireless networking across two independent processing cores.',
    bulletPoints: [
      'Core 1 allocated to synchronous I2C and single-wire GPIO polling with deterministic timing.',
      'Core 0 dedicated to Wi-Fi TCP/IP networking, BLE GATT server broadcasting, and JSON serialization.',
      'Utilized thread-safe FreeRTOS queues (xQueueSend / xQueueReceive) to eliminate race conditions and priority inversions.',
    ],
    techStack: ['FreeRTOS', 'ESP32 LX6', 'Thread Safety', 'SMP Queues'],
  },
  {
    id: 'sensor_processing',
    metric: 'Multi-Sensor',
    metricLabel: 'REAL-TIME ACQUISITION',
    title: 'REAL-TIME SENSOR PROCESSING & CALIBRATION',
    category: 'Transducers & Digital Signal Acquisition',
    icon: <Activity className="w-5 h-5 text-emerald-400" />,
    accentColor: 'border-emerald-500/40 text-emerald-400',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    summary:
      'Integrated diverse physical transducers including capacitive humidity, piezoresistive barometric pressure, ultrasonic distance, and optical vision sensors.',
    bulletPoints: [
      'Evaluated 11 factory EEPROM calibration coefficients on BMP180 for true atmospheric pressure derivation.',
      'Implemented time-critical pulse width decoding for 40-bit DHT11 sensor telemetry packets.',
      'Engineered rolling average circular buffers for digital noise filtering and signal stabilization.',
    ],
    techStack: ['BMP180', 'DHT11', 'Ultrasonic', 'Signal Filtering'],
  },
  {
    id: 'bus_protocols',
    metric: 'I2C / GPIO',
    metricLabel: 'HARDWARE BUS PROTOCOLS',
    title: 'I2C & GPIO PERIPHERAL DRIVERS',
    category: 'Bare-Metal & Low-Level Register Control',
    icon: <Terminal className="w-5 h-5 text-purple-400" />,
    accentColor: 'border-purple-500/40 text-purple-400',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    summary:
      'Proficient in register-level peripheral configuration, master-slave synchronous buses, and interrupt service routines for high-speed sensor interfacing.',
    bulletPoints: [
      'Master-slave I2C communication interfacing 16-channel PCA9685 PWM driver and BMP180 sensor at 0x77.',
      'Microsecond-accurate GPIO bitmasking and timer interrupts for one-wire handshakes.',
      'Structured memory-efficient C structs to minimize payload size over constrained buses.',
    ],
    techStack: ['I2C (SDA/SCL)', 'One-Wire', 'PCA9685', 'Bitmasking'],
  },
  {
    id: 'wireless_iot',
    metric: 'Dual Wireless',
    metricLabel: 'Wi-Fi & BLUETOOTH',
    title: 'Wi-Fi + BLUETOOTH CONNECTIVITY',
    category: 'Wireless IoT Telemetry & Edge Streaming',
    icon: <Wifi className="w-5 h-5 text-sky-400" />,
    accentColor: 'border-sky-500/40 text-sky-400',
    badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-800/60',
    summary:
      'Dual-mode wireless transmission integrating 802.11 b/g/n station streaming with Bluetooth Classic and BLE for edge monitoring and field diagnostics.',
    bulletPoints: [
      'Streamed formatted JSON telemetry over HTTP REST and MQTT topics to cloud endpoints.',
      'Implemented BLE GATT service architecture for local wireless diagnostics and serial monitoring.',
      'Configured deep-sleep duty cycles to achieve ultra-low average power consumption during field deployment.',
    ],
    techStack: ['802.11 b/g/n', 'BLE GATT', 'MQTT / REST', 'Low Power'],
  },
  {
    id: 'capstone_projects',
    metric: '2 Capstones',
    metricLabel: 'PHYSICAL HARDWARE',
    title: 'EMBEDDED & ROBOTICS CAPSTONES',
    category: '6-DOF Robotic Arm & IoT Weather System',
    icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
    accentColor: 'border-teal-500/40 text-teal-400',
    badgeBg: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
    summary:
      'Delivered fully functional physical engineering capstones bridging kinematic mathematical modeling, computer vision, and distributed embedded telemetry.',
    bulletPoints: [
      '6-DOF Robotic Arm with Denavit-Hartenberg Inverse Kinematics, OpenCV color tracking, and 16-channel PWM servos.',
      'IoT Weather Monitoring Station with ESP32, DHT11, BMP180, and dual Wi-Fi/Bluetooth telemetry.',
      'Virtual technical simulations accredited by Deloitte (Technology) and Tata (Data Visualisation).',
    ],
    techStack: ['6-DOF Kinematics', 'OpenCV Vision', 'IoT Weather', 'Industry Simulations'],
  },
];

export const EngineeringMetrics: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    soundFx.playClick();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative w-full py-12 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      <ScrollReveal direction="up">
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">
                  // HARDWARE & ARCHITECTURAL FOUNDATIONS
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  KEY HARDWARE & ARCHITECTURAL METRICS
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AUTHENTIC RESUME COMPETENCIES // PORTFOLIO VERIFIED</span>
            </div>
          </div>

          {/* Horizontal Capability Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
            {CAPABILITY_METRICS.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <TiltCard
                  key={item.id}
                  maxTilt={4}
                  className={`rounded-xl border transition-all duration-300 p-5 flex flex-col justify-between cursor-pointer group ${
                    isExpanded
                      ? 'bg-slate-900/90 border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                  onClick={() => toggleExpand(item.id)}
                  onMouseEnter={() => soundFx.playHover()}
                >
                  <div id={`capability-${item.id}`}>
                    {/* Top Bar: Icon, Category & Metric */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${item.badgeBg}`}>
                        {item.metric}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h4 className="text-sm font-bold text-white font-mono leading-snug group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5 mb-2">
                      {item.category}
                    </span>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Expanded Technical Proof Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-200">
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                          Technical Execution & Implementation:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                          {item.bulletPoints.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Tech Stack Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {item.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Toggle Inspect */}
                  <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                    <span className="group-hover:text-cyan-300">
                      {isExpanded ? 'COLLAPSE DETAILS' : 'INSPECT TECHNICAL DETAILS'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                    )}
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
