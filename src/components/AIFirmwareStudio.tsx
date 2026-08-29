import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Sparkles,
  Terminal,
  Code2,
  Copy,
  Check,
  Play,
  RotateCcw,
  Zap,
  Layers,
  Radio,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { generateLocalFirmware } from '../utils/copilotEngine';

interface FirmwareResult {
  title: string;
  description: string;
  pinMapping: { pin: string; function: string; wireColor: string }[];
  code: string;
  explanation: string;
  simulatedSerialOutput: string[];
}

const FIRMWARE_PRESETS = [
  {
    id: 'freertos-dualcore',
    label: 'FreeRTOS Dual-Core Telemetry',
    prompt: 'ESP32 Dual-Core FreeRTOS firmware with DHT11 and BMP180 sensor acquisition on Core 1, pushing to queue for telemetry dispatch on Core 0.',
  },
  {
    id: 'deep-sleep',
    label: 'Ultra-Low Power Deep Sleep',
    prompt: 'ESP32 deep sleep battery power management cycling every 15 minutes with RTC timer wakeup and flash memory RTC_DATA_ATTR boot counter.',
  },
  {
    id: 'ble-gatt',
    label: 'BLE 4.2 GATT Telemetry Server',
    prompt: 'ESP32 Bluetooth Low Energy (BLE) GATT server broadcasting environmental temperature and humidity characteristics with UUIDs.',
  },
  {
    id: 'pid-servo',
    label: '6-DOF Servo PWM Controller',
    prompt: 'ESP32 16-channel LEDC hardware PWM generator for robotic arm servo control with smooth trapezoidal acceleration curves.',
  },
];

export const AIFirmwareStudio: React.FC = () => {
  const [customPrompt, setCustomPrompt] = useState(
    'ESP32 Dual-Core FreeRTOS firmware with DHT11 and BMP180 I2C sensor bus acquisition, queue synchronization, and serial telemetry.'
  );
  const [selectedPreset, setSelectedPreset] = useState('freertos-dualcore');
  const [isLoading, setIsLoading] = useState(false);
  const [firmware, setFirmware] = useState<FirmwareResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isStreamingSerial, setIsStreamingSerial] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const { isStealth } = useTheme();

  const handleGenerate = async (promptToUse?: string) => {
    const prompt = (promptToUse || customPrompt).trim();
    if (!prompt || isLoading) return;

    soundFx.playClick();
    setIsLoading(true);
    setIsStreamingSerial(false);
    setSerialLogs([]);

    try {
      const response = await fetch('/api/copilot/generate-firmware', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          boardType: 'ESP32-WROOM-32 (NodeMCU 38-Pin)',
          sensors: ['DHT11', 'BMP180'],
        }),
      });

      if (!response.ok) throw new Error('Firmware generation failed');
      const data: FirmwareResult = await response.json();
      setFirmware(data);
      setSerialLogs(data.simulatedSerialOutput || []);
    } catch (err) {
      console.warn('Firmware API fallback triggered:', err);
      const fallback = generateLocalFirmware(prompt);
      setFirmware(fallback);
      setSerialLogs(fallback.simulatedSerialOutput || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!firmware) return;
    soundFx.playClick();
    navigator.clipboard.writeText(firmware.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    if (!firmware) return;
    soundFx.playClick();
    const blob = new Blob([firmware.code], { type: 'text/x-c++src' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${firmware.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateFlash = () => {
    if (!firmware) return;
    soundFx.playClick();
    setIsStreamingSerial(true);
    setSerialLogs([]);

    const allLogs = [
      '[ESP32-ROM] Flash write initialized at 0x10000...',
      '[ESP32-ROM] Verified MD5 checksum (0x8F3A21). Resetting CPU...',
      'rst:0x1 (POWERON_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)',
      'configsip: 0, SPIWP:0xee',
      'clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00',
      'mode:DIO, clock div:2',
      'load:0x3fff0030,len:1184',
      'load:0x40078000,len:13104',
      'load:0x40080400,len:3032',
      'entry 0x400805e4',
      ...(firmware.simulatedSerialOutput || []),
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < allLogs.length) {
        const nextLog = allLogs[currentIdx];
        setSerialLogs((prev) => [...prev, nextLog]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsStreamingSerial(false);
      }
    }, 280);
  };

  return (
    <div className="rounded-2xl bg-[var(--bg-panel-solid)] border border-cyan-500/40 p-5 sm:p-7 space-y-6 font-mono shadow-[var(--shadow-panel)] relative overflow-hidden">
      {/* Decals */}
      <div className="cyber-corner-tl" />
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />
      <div className="cyber-corner-br" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-display tracking-wide">
                AI ESP32 FIRMWARE & CIRCUIT STUDIO
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-semibold hidden sm:inline-block">
                GEMINI 3.7 FLASH
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Generate production-grade C++ firmware, hardware pinout mappings, and simulated serial telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ARDUINO & ESP-IDF READY</span>
          </span>
        </div>
      </div>

      {/* Presets Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>FIRMWARE ARCHITECTURE PRESETS:</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {FIRMWARE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedPreset(p.id);
                setCustomPrompt(p.prompt);
                handleGenerate(p.prompt);
              }}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                selectedPreset === p.id
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-semibold'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white hover:border-cyan-500/40'
              }`}
            >
              <span className="block truncate font-bold text-[11px]">{p.label}</span>
              <span className="block truncate text-[10px] opacity-75 mt-0.5">Click to generate C++ code</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input & Generate Button */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe your custom ESP32 firmware requirement (e.g. FreeRTOS timer, MQTT publisher, OLED display)..."
            className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-[var(--border-subtle)] focus:border-cyan-400 text-xs text-[var(--text-primary)] focus:outline-none"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !customPrompt.trim()}
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">GENERATING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERATE FIRMWARE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Studio Container */}
      {firmware && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          {/* Overview & Pin Mapping Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Architecture Overview */}
            <div className="lg:col-span-2 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-cyan-300">{firmware.title}</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{firmware.description}</p>
              <div className="p-2.5 rounded-lg bg-black/40 border border-cyan-500/20 text-[11px] text-cyan-200">
                <strong>Architectural Note:</strong> {firmware.explanation}
              </div>
            </div>

            {/* Hardware Pin Mapping */}
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>CIRCUIT PIN CONNECTIONS</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {firmware.pinMapping.map((pin, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded bg-black/40 border border-[var(--border-subtle)] flex items-center justify-between text-[11px]"
                  >
                    <span className="font-bold text-cyan-300">{pin.pin}</span>
                    <span className="text-[var(--text-muted)] text-[10px] truncate max-w-[140px]">
                      {pin.function}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* C++ Code Editor Box */}
          <div className="rounded-xl bg-slate-950 border border-cyan-500/40 overflow-hidden shadow-xl">
            {/* Editor Header Bar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs text-slate-300 font-mono font-semibold ml-2">
                  esp32_firmware_telemetry.cpp
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateFlash}
                  disabled={isStreamingSerial}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>FLASH TO VIRTUAL ESP32</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'COPIED' : 'COPY CODE'}</span>
                </button>

                <button
                  onClick={handleDownloadCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
                  title="Download .ino source code"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 max-h-80 overflow-y-auto text-xs font-mono text-cyan-200 leading-relaxed bg-slate-950 select-text">
              <pre className="whitespace-pre">{firmware.code}</pre>
            </div>
          </div>

          {/* Virtual Simulated Serial Terminal */}
          <div className="rounded-xl bg-black border border-emerald-500/40 p-4 space-y-2 font-mono text-xs shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-900/50">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Terminal className="w-4 h-4" />
                <span>ESP32 SIMULATED SERIAL MONITOR (115200 BAUD)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">PORT: COM3 / /dev/ttyUSB0</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1 text-[11px] text-emerald-300 font-mono pt-1">
              {serialLogs.length > 0 ? (
                serialLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span className="leading-tight">{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic py-2">
                  Click "Flash to Virtual ESP32" above to boot microcontroller and stream live telemetry logs.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
