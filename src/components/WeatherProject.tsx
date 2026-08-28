import React, { useEffect, useState } from 'react';
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
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import { Weather3DGraph, WeatherDataPoint } from './Weather3DGraph';
import { ESP32InteractiveBoard } from './ESP32InteractiveBoard';
import { AIFirmwareStudio } from './AIFirmwareStudio';

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
}

const HARDWARE_MODULES: HardwareComponent[] = [
  {
    id: 'esp32',
    name: 'ESP32 NodeMCU Dev Board',
    category: '32-Bit Dual-Core Microcontroller',
    image: esp32Img,
    pins: ['GPIO21 (SDA)', 'GPIO22 (SCL)', 'GPIO4 (DHT Data)', '3V3 Power', 'GND'],
    specs: [
      'Dual-Core Tensilica Xtensa 32-bit LX6 @ 240MHz',
      'Integrated 802.11 b/g/n Wi-Fi & Bluetooth v4.2 BR/EDR and BLE',
      '520 KB SRAM, 4 MB Flash Memory',
      'Deep-Sleep power consumption down to ~10 µA',
    ],
    description:
      'Central processing hub handling real-time sensor polling via I2C and GPIO one-wire protocols, FreeRTOS task scheduling, and transmitting MQTT/HTTP payloads over WiFi and BLE.',
  },
  {
    id: 'dht11',
    name: 'DHT11 Temperature & Humidity Sensor',
    category: 'Digital Relative Humidity & Thermal Transducer',
    image: dht11Img,
    pins: ['Pin 1: VCC (3.3V - 5V)', 'Pin 2: DATA (GPIO4 with 10k Pull-up)', 'Pin 4: GND'],
    specs: [
      'Temperature Range: 0°C to 50°C (±2°C Accuracy)',
      'Humidity Range: 20% to 90% RH (±5% RH Accuracy)',
      'Single-bus digital signal transmission format',
      '1 Hz maximum sampling rate',
    ],
    description:
      'Capacitive humidity sensing element paired with an internal NTC thermistor and 8-bit microcontroller to output calibrated 40-bit serial data packets.',
  },
  {
    id: 'bmp180',
    name: 'BMP180 Barometric Pressure Sensor',
    category: 'High-Precision Piezo-Resistive Barometer',
    image: bmp180Img,
    pins: ['VCC (3.3V)', 'GND', 'SCL (I2C Clock - GPIO22)', 'SDA (I2C Data - GPIO21)'],
    specs: [
      'Pressure Range: 300 to 1100 hPa (+9000m to -500m ASL)',
      'High Resolution: 0.02 hPa in Ultra-High Resolution mode',
      'I2C digital two-wire interface (Address: 0x77)',
      'RMS Noise down to 0.06 hPa (0.5 m altitude)',
    ],
    description:
      'Solid-state piezoresistive pressure transducer with factory-calibrated internal EEPROM coefficients enabling precise altitude and weather forecasting algorithms.',
  },
];

export const WeatherProject: React.FC = () => {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [selectedModule, setSelectedModule] = useState<'esp32' | 'dht11' | 'bmp180'>('esp32');
  const [activeTab, setActiveTab] = useState<'real_hardware' | '3d_interactive'>('real_hardware');

  // Live fluctuating telemetry state
  const [telemetry, setTelemetry] = useState({
    temperature: 24.85,
    humidity: 58.2,
    pressure: 1013.25,
    altitude: 54.2,
    wifiRssi: -58,
    bleSignal: 'CONNECTED [BLE 5.0]',
    powerDraw: 62.4, // mA
    packetCount: 1420,
    voltage: 3.29,
  });

  // Time-series buffer for dynamic 3D React-Three-Fiber graph (last 24 data points)
  const [historyData, setHistoryData] = useState<WeatherDataPoint[]>(() => {
    const init: WeatherDataPoint[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const t = new Date(now - i * 1800).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      init.push({
        time: t,
        temp: +(24.8 + Math.sin(i * 0.4) * 0.4).toFixed(2),
        pressure: +(1013.2 + Math.cos(i * 0.3) * 0.6).toFixed(2),
      });
    }
    return init;
  });

  // Live Telemetry fluctuation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const tempDelta = (Math.random() - 0.5) * 0.16;
        const humDelta = (Math.random() - 0.5) * 0.35;
        const pressDelta = (Math.random() - 0.5) * 0.22;
        const powerDelta = (Math.random() - 0.5) * 1.5;

        const newTemp = +(prev.temperature + tempDelta).toFixed(2);
        const newPress = +(prev.pressure + pressDelta).toFixed(2);

        // Update history for 3D R3F graph
        setHistoryData((oldHistory) => {
          const newPoint: WeatherDataPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temp: newTemp,
            pressure: newPress,
          };
          const updated = [...oldHistory.slice(1), newPoint];
          return updated;
        });

        return {
          ...prev,
          temperature: newTemp,
          humidity: Math.max(20, Math.min(95, +(prev.humidity + humDelta).toFixed(1))),
          pressure: newPress,
          altitude: +(54.2 + (Math.random() - 0.5) * 0.3).toFixed(1),
          wifiRssi: Math.min(-45, Math.max(-85, Math.round(prev.wifiRssi + (Math.random() - 0.5) * 2))),
          powerDraw: Math.max(45, Math.min(85, +(prev.powerDraw + powerDelta).toFixed(1))),
          packetCount: prev.packetCount + 1,
        };
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const currentModuleData = HARDWARE_MODULES.find((m) => m.id === selectedModule) || HARDWARE_MODULES[0];

  const displayTemp =
    unit === 'C'
      ? `${telemetry.temperature} °C`
      : `${(telemetry.temperature * 1.8 + 32).toFixed(1)} °F`;

  return (
    <section id="weather-project" className="relative w-full py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>// FEATURED PROJECT 02 // EMBEDDED & IoT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-wide mt-1">
            IoT-BASED WEATHER MONITORING SYSTEM
          </h2>
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs text-slate-300">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              YEAR: 2025
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              TECH: ESP32 • IoT • WiFi • Bluetooth
            </span>
            <span className="text-slate-400">DHT11 & BMP180 Real Hardware Breakdown</span>
          </div>
        </div>

        {/* Temperature Unit Switcher */}
        <div className="flex items-center gap-1.5 glass-panel p-1 rounded-xl border border-cyan-500/30">
          <button
            id="unit-celsius-btn"
            onClick={() => {
              sound.playClick();
              setUnit('C');
            }}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              unit === 'C'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            °C CELSIUS
          </button>
          <button
            id="unit-fahrenheit-btn"
            onClick={() => {
              sound.playClick();
              setUnit('F');
            }}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              unit === 'F'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            °F FAHRENHEIT
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Real Hardware Inspection Studio & 3D Model Switcher */}
        <div className="lg:col-span-6 glass-panel-glow p-4 sm:p-6 rounded-2xl border border-cyan-500/30 flex flex-col relative space-y-4">
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Tab Switcher: Real Hardware Photos vs 3D Schematic */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('real_hardware');
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'real_hardware'
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>REAL HARDWARE MODULES</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('3d_interactive');
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === '3d_interactive'
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>3D BOARD SCHEMATIC</span>
              </button>
            </div>

            <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline-block">
              ● SENSORS ONLINE
            </span>
          </div>

          {/* VIEW A: Real Macro Photography & Hardware Pinouts */}
          {activeTab === 'real_hardware' ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Hardware Selection Pills */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {HARDWARE_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    id={`hw-tab-${mod.id}`}
                    onClick={() => {
                      sound.playClick();
                      setSelectedModule(mod.id);
                    }}
                    onMouseEnter={() => sound.playHover()}
                    className={`p-2 rounded-lg text-center transition-all cursor-pointer ${
                      selectedModule === mod.id
                        ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] block truncate">{mod.name.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-500 block truncate">{mod.id.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              {/* Real Image Display with Studio Cyber Frame */}
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 group">
                <img
                  src={currentModuleData.image}
                  alt={currentModuleData.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Cyber HUD Badge Overlay on Image */}
                <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-black/80 border border-cyan-500/50 backdrop-blur-md text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>AUTHENTIC HARDWARE: {currentModuleData.name}</span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-[10px] font-mono text-slate-400">
                  {currentModuleData.category}
                </div>
              </div>

              {/* Pinout and Hardware Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-xs">
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {currentModuleData.description}
                </p>

                <div className="pt-1 border-t border-slate-800 flex flex-wrap gap-2 text-[10px]">
                  <span className="text-cyan-400 font-semibold">PIN CONNECTIONS:</span>
                  {currentModuleData.pins.map((pin, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {pin}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* VIEW B: 3D Interactive WebGL Board Canvas */
            <ESP32InteractiveBoard />
          )}
        </div>

        {/* Right Column: Live R3F Real-Time Oscilloscope Graph + Live Telemetry Dashboard */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* REAL-TIME DYNAMIC 3D GRAPH (React-Three-Fiber Live Oscilloscope) */}
          <Weather3DGraph
            data={historyData}
            currentTemp={telemetry.temperature}
            currentPressure={telemetry.pressure}
          />

          {/* Live Telemetry Gauges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            {/* Temperature Meter */}
            <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> TEMP
                </span>
                <span className="text-emerald-400 text-[10px]">DHT11</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-display text-white">
                {displayTemp}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">±0.5°C Precision</div>
            </div>

            {/* Humidity Meter */}
            <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" /> HUMIDITY
                </span>
                <span className="text-sky-400 text-[10px]">DHT11</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-display text-sky-300">
                {telemetry.humidity}% RH
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Capacitive Sensor</div>
            </div>

            {/* Pressure Meter */}
            <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-purple-400" /> PRESSURE
                </span>
                <span className="text-purple-400 text-[10px]">BMP180</span>
              </div>
              <div className="text-lg sm:text-xl font-bold font-display text-purple-300">
                {telemetry.pressure} hPa
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Alt: {telemetry.altitude}m</div>
            </div>

            {/* WiFi Stream */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" /> WIFI RSSI
                </span>
                <span className="text-emerald-400 text-[10px]">STA MODE</span>
              </div>
              <div className="text-lg font-bold font-display text-cyan-300">
                {telemetry.wifiRssi} dBm
              </div>
              <div className="text-[10px] text-emerald-400">Excellent Link</div>
            </div>

            {/* Bluetooth Link */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Bluetooth className="w-3.5 h-3.5 text-blue-400" /> BLE STATUS
                </span>
                <span className="text-blue-400 text-[10px]">GATT</span>
              </div>
              <div className="text-xs font-bold font-mono text-slate-200 mt-1">
                {telemetry.bleSignal}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">SPP Protocol Active</div>
            </div>

            {/* Power Optimization */}
            <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> POWER DRAW
                </span>
                <span className="text-amber-400 text-[10px]">3.3V REG</span>
              </div>
              <div className="text-lg font-bold font-display text-amber-300">
                {telemetry.powerDraw} mA
              </div>
              <div className="text-[10px] text-emerald-400">Deep-Sleep Ready</div>
            </div>
          </div>

          {/* Verbatim Architecture & Resume Accomplishments */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-cyan-300 font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                SYSTEM ARCHITECTURE & ACCOMPLISHMENTS
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" /> PACKET #{telemetry.packetCount}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-200 pt-1">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>"Built an ESP32 weather monitoring system using DHT11 and BMP180 sensors."</span>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>"Enabled wireless monitoring through WiFi/Bluetooth communication."</span>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>"Displayed real-time environmental data."</span>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>"Optimized power usage for improved efficiency."</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI ESP32 Firmware & Serial Studio Integration */}
      <div id="esp32-ai-studio" className="mt-10">
        <AIFirmwareStudio />
      </div>
    </section>
  );
};
