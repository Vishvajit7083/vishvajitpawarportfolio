import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Thermometer,
  Droplets,
  Gauge,
  Wifi,
  Bluetooth,
  Zap,
  Activity,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Server,
  MonitorCheck,
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import { EnvironmentalTelemetryChart, TelemetrySample } from './EnvironmentalTelemetryChart';
import { AIFirmwareStudio } from './AIFirmwareStudio';
import { AnimatedNumber } from './AnimatedNumber';
import { TiltCard } from './TiltCard';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

// Real Images of Sensors & Microcontroller
import esp32Img from '../assets/images/esp32_microcontroller_1787839988973.jpg';
import dht11Img from '../assets/images/dht11_sensor_1787840007743.jpg';
import bmp180Img from '../assets/images/bmp180_sensor_1787840024408.jpg';

type ModuleId = 'esp32' | 'dht11' | 'bmp180';

interface HardwareComponent {
  id: ModuleId;
  name: string;
  category: string;
  image: string;
  pins: string[];
  specs: string[];
  description: string;
  keyRole: string;
}

const HARDWARE_MODULES: HardwareComponent[] = [
  {
    id: 'esp32',
    name: 'ESP32 NodeMCU Dev Board',
    category: '32-Bit Dual-Core Microcontroller',
    image: esp32Img,
    pins: ['GPIO21 (I2C SDA)', 'GPIO22 (I2C SCL)', 'GPIO4 (DHT11 One-Wire)', '3V3 VCC', 'GND'],
    specs: [
      'Dual-Core Tensilica Xtensa 32-bit LX6 @ 240MHz',
      'Integrated 802.11 b/g/n Wi-Fi & Dual-Mode Bluetooth/BLE',
      '520 KB SRAM, 4 MB Flash Storage',
      'Ultra-low power deep-sleep modes down to ~10 µA',
    ],
    description:
      'Acts as the primary edge controller, managing synchronous sensor polling across I2C and GPIO buses, executing FreeRTOS dual-core queues, and packaging telemetry payloads for wireless transmission over Wi-Fi and Bluetooth.',
    keyRole: 'Master Controller & Wireless Gateway',
  },
  {
    id: 'dht11',
    name: 'DHT11 Temperature & Humidity Sensor',
    category: 'Digital Relative Humidity & Thermal Transducer',
    image: dht11Img,
    pins: ['Pin 1: VCC (3.3V)', 'Pin 2: DATA (GPIO4 with 10kΩ Pull-up)', 'Pin 4: GND'],
    specs: [
      'Temperature Range: 0°C to 50°C (±2°C Precision)',
      'Humidity Range: 20% to 90% RH (±5% RH Precision)',
      'Single-bus time-critical digital handshake protocol',
      '1 Hz maximum sampling frequency',
    ],
    description:
      'Combines a resistive-type humidity measurement component with an NTC temperature sensor, outputting calibrated 40-bit data packets over a single-wire interface.',
    keyRole: 'Ambient Temperature & Relative Humidity',
  },
  {
    id: 'bmp180',
    name: 'BMP180 Barometric Pressure Sensor',
    category: 'High-Precision Piezo-Resistive Barometer',
    image: bmp180Img,
    pins: ['VCC (3.3V)', 'GND', 'SCL (GPIO22 Clock)', 'SDA (GPIO21 Data)'],
    specs: [
      'Pressure Range: 300 to 1100 hPa (+9000m to -500m sea level)',
      'Ultra-High Resolution: 0.02 hPa (0.17 m altitude change)',
      'I2C 2-Wire Synchronous Protocol (Device Address: 0x77)',
      'Internal 176-bit EEPROM with 11 factory calibration coefficients',
    ],
    description:
      'Piezoresistive pressure transducer with factory calibration coefficients stored in EEPROM, delivering ultra-precise atmospheric pressure readings for real-time altitude calculation and weather forecasting.',
    keyRole: 'Atmospheric Pressure & Altitude Estimation',
  },
];

const TECH_BADGES = [
  { name: 'ESP32', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60' },
  { name: 'IoT', bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60' },
  { name: 'Wi-Fi', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' },
  { name: 'Bluetooth', bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' },
  { name: 'DHT11', bg: 'bg-teal-950/80 text-teal-300 border-teal-700/60' },
  { name: 'BMP180', bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60' },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'DHT11 / BMP180 Sensors',
    subtitle: 'Physical Transduction',
    desc: 'Capture ambient temperature, relative humidity, and barometric air pressure using capacitive and piezoresistive sensing elements.',
    protocol: 'One-Wire & I2C Bus (0x77)',
  },
  {
    step: '02',
    title: 'ESP32 Microcontroller',
    subtitle: 'Dual-Core Processing',
    desc: 'Core 1 executes deterministic sensor sampling while Core 0 applies 11 EEPROM calibration polynomials and calculates barometric altitude.',
    protocol: '240 MHz FreeRTOS Queue',
  },
  {
    step: '03',
    title: 'Wi-Fi & Bluetooth',
    subtitle: 'Wireless Transmission',
    desc: 'Broadcasts serialized telemetry packets via dual-mode Wi-Fi (HTTP/MQTT) to remote endpoints and BLE for local diagnostic pairing.',
    protocol: '802.11 b/g/n & BLE 4.2',
  },
  {
    step: '04',
    title: 'Data Processing',
    subtitle: 'Payload Validation',
    desc: 'Parses JSON payloads, validates sensor CRC checksums, evaluates trend differentials, and prepares historical buffers.',
    protocol: 'JSON Schema & Timestamping',
  },
  {
    step: '05',
    title: 'Monitoring Dashboard',
    subtitle: 'Real-Time Visualization',
    desc: 'Renders dynamic time-series charts, environmental metrics, and connection diagnostics with sub-second visual refresh.',
    protocol: 'Live Web Interface',
  },
];

const TECHNICAL_PILLARS = [
  {
    title: 'Embedded C & Register Interfacing',
    subtitle: 'Low-Level Peripheral Control',
    icon: <Cpu className="w-4 h-4 text-cyan-400" />,
    desc: 'Low-level GPIO configuration, bitmasking, and microsecond-accurate timing loops for single-wire sensor handshakes without OS-level timing jitter.',
  },
  {
    title: 'I2C & One-Wire Communication',
    subtitle: 'Hardware Bus Protocols',
    icon: <Activity className="w-4 h-4 text-emerald-400" />,
    desc: 'Synchronous two-wire master-slave I2C communication (SDA/SCL) addressing BMP180 at 0x77, paired with pull-up timed single-wire reading for DHT11.',
  },
  {
    title: 'FreeRTOS Dual-Core Architecture',
    subtitle: 'Deterministic Multitasking',
    icon: <Server className="w-4 h-4 text-sky-400" />,
    desc: 'Dedicated Core 1 task for synchronous sensor polling decoupled from Core 0 network transmission tasks using thread-safe FreeRTOS queues.',
  },
  {
    title: 'Sensor Acquisition & Calibration',
    subtitle: 'Polynomial Mathematics',
    icon: <Gauge className="w-4 h-4 text-purple-400" />,
    desc: 'Evaluation of factory EEPROM calibration coefficients (AC1-AC6, B1, B2, MB, MC, MD) to derive true atmospheric pressure and hypsometric altitude.',
  },
  {
    title: 'Wireless Communication & Power Modes',
    subtitle: 'Wi-Fi, Bluetooth & Deep Sleep',
    icon: <Wifi className="w-4 h-4 text-amber-400" />,
    desc: 'Simultaneous Wi-Fi station mode streaming and Bluetooth telemetry with optimized light-sleep and deep-sleep duty cycling for battery efficiency.',
  },
];

export const WeatherProject: React.FC = () => {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [selectedModule, setSelectedModule] = useState<ModuleId>('esp32');
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  // Live fluctuating telemetry state (Simulated interactive demonstration)
  const [telemetry, setTelemetry] = useState({
    temperature: 24.8,
    humidity: 58.4,
    pressure: 1013.25,
    altitude: 54.2,
    wifiRssi: -58,
    bleStatus: 'CONNECTED (BLE 4.2)',
    powerDraw: 62.4, // mA
    lastUpdate: 'Just now',
  });

  // Time-series buffer for dynamic live telemetry chart (last 20 samples)
  const [historyData, setHistoryData] = useState<TelemetrySample[]>(() => {
    const init: TelemetrySample[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 2000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      init.push({
        time: t,
        temp: +(24.6 + Math.sin(i * 0.35) * 0.35).toFixed(2),
        pressure: +(1013.1 + Math.cos(i * 0.3) * 0.55).toFixed(2),
        humidity: Math.round(58 + Math.sin(i * 0.2) * 2),
      });
    }
    return init;
  });

  // Active Pipeline animation loop (0 -> 1 -> 2 -> 3 -> 4)
  useEffect(() => {
    const pipeInterval = setInterval(() => {
      setActivePipelineStep((prev) => (prev + 1) % HOW_IT_WORKS_STEPS.length);
    }, 2200);
    return () => clearInterval(pipeInterval);
  }, []);

  // Live Telemetry stream update loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const tempDelta = (Math.random() - 0.5) * 0.14;
        const humDelta = (Math.random() - 0.5) * 0.3;
        const pressDelta = (Math.random() - 0.5) * 0.18;
        const powerDelta = (Math.random() - 0.5) * 1.2;

        const newTemp = +(prev.temperature + tempDelta).toFixed(2);
        const newPress = +(prev.pressure + pressDelta).toFixed(2);
        const newHum = Math.max(20, Math.min(90, +(prev.humidity + humDelta).toFixed(1)));

        // Update history chart buffer
        setHistoryData((oldHistory) => {
          const newPoint: TelemetrySample = {
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            temp: newTemp,
            pressure: newPress,
            humidity: Math.round(newHum),
          };
          return [...oldHistory.slice(1), newPoint];
        });

        return {
          ...prev,
          temperature: newTemp,
          humidity: newHum,
          pressure: newPress,
          altitude: +(54.2 + (Math.random() - 0.5) * 0.2).toFixed(1),
          wifiRssi: Math.min(-50, Math.max(-75, Math.round(prev.wifiRssi + (Math.random() - 0.5) * 1.5))),
          powerDraw: Math.max(48, Math.min(78, +(prev.powerDraw + powerDelta).toFixed(1))),
          lastUpdate: 'Active (<2s)',
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentModule = HARDWARE_MODULES.find((m) => m.id === selectedModule) || HARDWARE_MODULES[0];

  const currentTempDisplay =
    unit === 'C' ? telemetry.temperature : telemetry.temperature * 1.8 + 32;

  return (
    <section id="weather-project" className="relative w-full py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 pb-6 border-b border-slate-800/80">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>// FEATURED PROJECT // EMBEDDED & IoT ENGINEERING</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-wide">
              IoT-BASED WEATHER MONITORING SYSTEM
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed font-sans">
              Real-time low-power environmental sensing station built on dual-core ESP32 with wireless telemetry over Wi-Fi and Bluetooth.
            </p>

            {/* Technology Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              {TECH_BADGES.map((badge) => (
                <span
                  key={badge.name}
                  className={`px-3 py-1 rounded-md border font-semibold tracking-wide ${badge.bg}`}
                >
                  {badge.name}
                </span>
              ))}
            </div>
          </div>

          {/* Temperature Unit Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md shrink-0">
            <button
              id="unit-celsius-btn"
              data-magnetic="true"
              onClick={() => {
                sound.playClick();
                setUnit('C');
              }}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-lg font-bold transition-all cursor-pointer ${
                unit === 'C'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C CELSIUS
            </button>
            <button
              id="unit-fahrenheit-btn"
              data-magnetic="true"
              onClick={() => {
                sound.playClick();
                setUnit('F');
              }}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-lg font-bold transition-all cursor-pointer ${
                unit === 'F'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F FAHRENHEIT
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Two-Column Case-Study Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
        {/* Left Column: Project Case Study, Hardware Breakdown & Engineering Decisions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Authentic Hardware Visualizer Card with 3D Tilt */}
          <ScrollReveal direction="up" delay={0.1}>
            <TiltCard maxTilt={5} className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-md space-y-5">
              {/* Header with Selector Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                    HARDWARE ARCHITECTURE
                  </span>
                  <h3 className="text-base font-bold text-white font-mono">
                    Physical Hardware Inspection
                  </h3>
                </div>

                {/* Hardware Selection Pills */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 font-mono text-xs">
                  {HARDWARE_MODULES.map((mod) => (
                    <button
                      key={mod.id}
                      id={`hw-select-${mod.id}`}
                      data-magnetic="true"
                      onClick={() => {
                        sound.playClick();
                        setSelectedModule(mod.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                        selectedModule === mod.id
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.25)] font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mod.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hardware Photo & Specular Sheen */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black group scanline-beam">
                <img
                  src={currentModule.image}
                  alt={currentModule.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40" />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{currentModule.name}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 backdrop-blur-sm">
                    Role: {currentModule.keyRole}
                  </span>
                  <span className="text-slate-400 px-2 py-0.5 rounded bg-black/60 border border-slate-800">
                    {currentModule.category}
                  </span>
                </div>
              </div>

              {/* Description and Hardware Specs */}
              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
                  {currentModule.description}
                </p>

                {/* Pin Connections */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider block">
                    Pinout & Bus Connections:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentModule.pins.map((pin, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
                      >
                        {pin}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Specifications */}
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Hardware Specifications:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {currentModule.specs.map((spec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>

          {/* Key Engineering & Architectural Decisions */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-md space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  ENGINEERING DECISION LOG
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  Architectural Rationale & Trade-offs
                </h3>
              </div>

              <div className="space-y-3 font-sans text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-cyan-300 font-mono text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    FreeRTOS Dual-Core Multitasking
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Separated real-time sensor polling onto Core 1 while assigning Wi-Fi/Bluetooth wireless transmission to Core 0. This prevents network latency spikes from causing timing jitter during sensor sampling.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-purple-300 font-mono text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    I2C Bus Addressing & Calibration
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    The BMP180 communicates over synchronous I2C at address 0x77. Internal factory calibration coefficients stored in EEPROM are retrieved during initialization to perform polynomial atmospheric compensation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-amber-300 font-mono text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Power Optimization & Deep Sleep
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Leveraged ESP32 RTC timer wake-ups to duty cycle sensor polling. Putting the radio and core into deep sleep during idle intervals reduces nominal current from ~60mA down to ~15µA.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Real-Time Environmental Visualization & Live Dashboard */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Environmental Gauges Grid with Animated Numbers */}
          <ScrollReveal direction="up" delay={0.15}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              {/* Temperature Metric */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md flex flex-col justify-between hover:border-cyan-400/60 transition-colors shadow-lg">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                    <Thermometer className="w-3.5 h-3.5" /> TEMPERATURE
                  </span>
                  <span className="text-[10px] text-slate-500">DHT11</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                  <AnimatedNumber value={currentTempDisplay} decimals={1} suffix={unit === 'C' ? ' °C' : ' °F'} />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Nominal Range: 22–28°C</div>
              </div>

              {/* Humidity Metric */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 backdrop-blur-md flex flex-col justify-between hover:border-sky-400/60 transition-colors shadow-lg">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-sky-400 font-semibold">
                    <Droplets className="w-3.5 h-3.5" /> HUMIDITY
                  </span>
                  <span className="text-[10px] text-slate-500">DHT11</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-display text-sky-300 mt-1">
                  <AnimatedNumber value={telemetry.humidity} decimals={1} suffix="% RH" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Relative Humidity</div>
              </div>

              {/* Barometric Pressure Metric */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-md flex flex-col justify-between hover:border-purple-400/60 transition-colors shadow-lg">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-purple-400 font-semibold">
                    <Gauge className="w-3.5 h-3.5" /> PRESSURE
                  </span>
                  <span className="text-[10px] text-slate-500">BMP180</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-display text-purple-300 mt-1">
                  <AnimatedNumber value={telemetry.pressure} decimals={1} suffix=" hPa" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Alt: ~<AnimatedNumber value={telemetry.altitude} decimals={1} suffix="m ASL" />
                </div>
              </div>

              {/* Wi-Fi RSSI */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-emerald-400/50 transition-colors shadow-lg">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Wifi className="w-3.5 h-3.5" /> WI-FI LINK
                  </span>
                  <span className="text-[10px] text-emerald-400">STA MODE</span>
                </div>
                <div className="text-xl font-bold font-display text-emerald-300 mt-1">
                  <AnimatedNumber value={telemetry.wifiRssi} decimals={0} suffix=" dBm" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Signal Strength: Strong</div>
              </div>

              {/* Bluetooth Telemetry */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-indigo-400/50 transition-colors shadow-lg">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                    <Bluetooth className="w-3.5 h-3.5" /> BLUETOOTH
                  </span>
                  <span className="text-[10px] text-indigo-400">GATT</span>
                </div>
                <div className="text-xs font-bold font-mono text-slate-200 mt-1 truncate">
                  {telemetry.bleStatus}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Local Diagnostic Beacon</div>
              </div>

              {/* Power Consumption */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-amber-400/50 transition-colors shadow-lg">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Zap className="w-3.5 h-3.5" /> POWER DRAW
                  </span>
                  <span className="text-[10px] text-amber-400">ACTIVE</span>
                </div>
                <div className="text-xl font-bold font-display text-amber-300 mt-1">
                  <AnimatedNumber value={telemetry.powerDraw} decimals={1} suffix=" mA" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">3.3V Regulated Rail</div>
              </div>
            </div>
          </ScrollReveal>

          {/* Smooth, High-Fidelity Time-Series Graph */}
          <ScrollReveal direction="up" delay={0.25}>
            <EnvironmentalTelemetryChart
              data={historyData}
              currentTemp={telemetry.temperature}
              currentPressure={telemetry.pressure}
              currentHumidity={telemetry.humidity}
              unit={unit}
            />
          </ScrollReveal>

          {/* Sensor Activity & Live Telemetry Verification Banner */}
          <ScrollReveal direction="up" delay={0.3}>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <div>
                  <span className="text-white font-semibold block">Sensor Acquisition Active</span>
                  <span className="text-[10px] text-slate-400">
                    Interactive Live Telemetry Demo (Simulated Sensor Stream)
                  </span>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400">
                <span>Last Polled: {telemetry.lastUpdate}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Dynamic Animated "How It Works" Pipeline */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                SYSTEM DATA PIPELINE
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                HOW IT WORKS: SENSOR-TO-DASHBOARD FLOW
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>ACTIVE DATA PACKET: STEP 0{activePipelineStep + 1}</span>
            </div>
          </div>

          {/* 5-Step Connected Node Flow with Sequential Flow Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const isCurrentStep = activePipelineStep === idx;
              return (
                <div
                  key={step.step}
                  className={`p-4 rounded-xl relative flex flex-col justify-between transition-all duration-500 ${
                    isCurrentStep
                      ? 'bg-slate-900 border border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.25)] scale-[1.02]'
                      : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                          isCurrentStep
                            ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                            : 'bg-cyan-950/80 border border-cyan-800 text-cyan-300'
                        }`}
                      >
                        STEP {step.step}
                      </span>
                      {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                        <ArrowRight
                          className={`w-4 h-4 transition-colors hidden md:block ${
                            isCurrentStep ? 'text-cyan-400 animate-pulse' : 'text-slate-600'
                          }`}
                        />
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white font-mono mt-2">
                      {step.title}
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-400 block mb-2">
                      {step.subtitle}
                    </span>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    {step.protocol}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Concise "Technical Implementation" Grid */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              CORE CAPABILITIES
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white font-display">
              TECHNICAL PILLARS & FIRMWARE HIGHLIGHTS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECHNICAL_PILLARS.map((pillar, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {pillar.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono leading-tight">
                      {pillar.title}
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {pillar.subtitle}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Embedded AI Firmware Studio Drawer & Code Inspect */}
      <ScrollReveal direction="up" delay={0.2}>
        <AIFirmwareStudio />
      </ScrollReveal>
    </section>
  );
};
