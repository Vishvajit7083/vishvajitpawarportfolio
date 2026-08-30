import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Activity,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Terminal,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

type WorkbenchTab = 'freertos' | 'kinematics' | 'oscilloscope';

export const HardwareWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('freertos');
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // -------------------------------------------------------------
  // 1. FreeRTOS SMP Simulator State
  // -------------------------------------------------------------
  const [acqRateHz, setAcqRateHz] = useState<number>(10);
  const [dispatchRateHz, setDispatchRateHz] = useState<number>(5);
  const [queueCapacity] = useState<number>(10);
  const [queueItems, setQueueItems] = useState<number>(3);
  const [core0Load, setCore0Load] = useState<number>(42);
  const [core1Load, setCore1Load] = useState<number>(68);
  const [framesProcessed, setFramesProcessed] = useState<number>(1420);
  const [droppedFrames, setDroppedFrames] = useState<number>(0);

  // -------------------------------------------------------------
  // 2. 6-DOF Inverse Kinematics State
  // -------------------------------------------------------------
  const [targetX, setTargetX] = useState<number>(140);
  const [targetY, setTargetY] = useState<number>(80);
  const [targetZ, setTargetZ] = useState<number>(120);

  // Computed joint angles (degrees)
  const [theta1, setTheta1] = useState<number>(30);
  const [theta2, setTheta2] = useState<number>(45);
  const [theta3, setTheta3] = useState<number>(-35);
  const [theta4, setTheta4] = useState<number>(15);
  const [theta5, setTheta5] = useState<number>(60);
  const [theta6, setTheta6] = useState<number>(0);
  const [isSingular, setIsSingular] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 3. Oscilloscope State
  // -------------------------------------------------------------
  const [selectedSignal, setSelectedSignal] = useState<'i2c' | 'onewire' | 'pwm'>('i2c');
  const [oscTimebase, setOscTimebase] = useState<number>(1);
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);

  // FreeRTOS simulation ticker
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setQueueItems((prev) => {
        const generated = Math.round(acqRateHz / 4);
        const consumed = Math.round(dispatchRateHz / 4);
        const next = Math.max(0, prev + generated - consumed);

        if (next > queueCapacity) {
          setDroppedFrames((d) => d + (next - queueCapacity));
          return queueCapacity;
        }
        return next;
      });

      setCore1Load(Math.min(99, Math.round(25 + acqRateHz * 4.2 + (Math.random() * 4 - 2))));
      setCore0Load(Math.min(99, Math.round(18 + dispatchRateHz * 3.8 + (Math.random() * 4 - 2))));
      setFramesProcessed((f) => f + Math.round(dispatchRateHz / 2));
    }, 400);

    return () => clearInterval(interval);
  }, [isRunning, acqRateHz, dispatchRateHz, queueCapacity]);

  // Recalculate 6-DOF IK when targets change
  useEffect(() => {
    // Analytical Inverse Kinematics solver
    const r = Math.sqrt(targetX * targetX + targetY * targetY);
    const reach = Math.sqrt(r * r + targetZ * targetZ);

    // Max reach = 280mm
    if (reach > 280 || reach < 40) {
      setIsSingular(true);
    } else {
      setIsSingular(false);
    }

    // Joint 1: Base Yaw
    const t1 = (Math.atan2(targetY, targetX) * 180) / Math.PI;

    // Link lengths: L1=80, L2=120, L3=110
    const l2 = 120;
    const l3 = 110;
    const zOffset = targetZ - 80;
    const d = Math.sqrt(r * r + zOffset * zOffset);

    // Law of cosines for Theta 3 (Elbow)
    const cosT3 = (d * d - l2 * l2 - l3 * l3) / (2 * l2 * l3);
    const clampedCos = Math.max(-1, Math.min(1, cosT3));
    const t3 = (Math.acos(clampedCos) * 180) / Math.PI - 90;

    // Theta 2 (Shoulder)
    const alpha = Math.atan2(zOffset, r);
    const beta = Math.acos(Math.max(-1, Math.min(1, (l2 * l2 + d * d - l3 * l3) / (2 * l2 * d))));
    const t2 = ((alpha + beta) * 180) / Math.PI;

    setTheta1(Math.round(t1));
    setTheta2(Math.round(t2));
    setTheta3(Math.round(t3));
    setTheta4(Math.round((t2 + t3) * 0.4));
    setTheta5(Math.round(Math.sin(targetX * 0.05) * 45));
    setTheta6(Math.round((targetY * 0.5) % 90));
  }, [targetX, targetY, targetZ]);

  // Oscilloscope live canvas renderer
  useEffect(() => {
    if (activeTab !== 'oscilloscope') return;
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      offset += 1.5 * oscTimebase;

      const w = canvas.width;
      const h = canvas.height;

      // Dark oscilloscope background with grid lines
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Signal 1: Channel A (Cyan)
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;

      if (selectedSignal === 'i2c') {
        // I2C Clock (SCL)
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const t = (x + offset) * 0.08;
          const isHigh = Math.sin(t) > 0;
          const y = isHigh ? 50 : 100;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // I2C Data (SDA)
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const t = Math.floor((x + offset) * 0.04);
          // pseudo random byte stream based on bit
          const bit = (Math.sin(t * 12.34) > 0.1);
          const y = bit ? 140 : 190;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (selectedSignal === 'onewire') {
        // DHT11 One-Wire Microsecond Pulse Train
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const t = ((x + offset) % 180);
          const y = t < 50 ? 60 : t < 120 ? 140 : 60;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // 50Hz PWM Servo Waveform
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        const period = 120;
        const duty = 35; // 1.5ms pulse in 20ms frame
        for (let x = 0; x < w; x++) {
          const phase = (x + offset) % period;
          const isHigh = phase < duty;
          const y = isHigh ? 60 : 160;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, selectedSignal, oscTimebase]);

  return (
    <section id="hardware-workbench" className="relative w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                // INTERACTIVE_ENGINEERING_LAB
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] tracking-wide">
                HARDWARE & ARCHITECTURE WORKBENCH
              </h2>
            </div>
          </div>

          {/* Global Controls */}
          <div className="flex items-center gap-2">
            <button
              data-magnetic="true"
              onClick={() => {
                soundFx.playClick();
                setIsRunning(!isRunning);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                isRunning
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-amber-950/80 border-amber-500/60 text-amber-300'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'SIMULATION LIVE' : 'PAUSED'}</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Glass Workbench Container */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-primary)] shadow-[var(--shadow-panel)] relative overflow-hidden">
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Workbench Module Selector Tabs */}
        <div className="flex items-center gap-2 pb-6 border-b border-[var(--border-subtle)] overflow-x-auto select-none">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('freertos');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shrink-0 ${
              activeTab === 'freertos'
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-[var(--chip-bg)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>1. FreeRTOS Dual-Core Scheduler</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('kinematics');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shrink-0 ${
              activeTab === 'kinematics'
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-[var(--chip-bg)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400'
            }`}
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>2. 6-DOF Inverse Kinematics Solver</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('oscilloscope');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shrink-0 ${
              activeTab === 'oscilloscope'
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-[var(--chip-bg)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-cyan-400'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>3. Real-Time Protocol Logic Analyzer</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FreeRTOS SMP Dual-Core Scheduler */}
        {/* ========================================================================= */}
        {activeTab === 'freertos' && (
          <div className="pt-6 space-y-6 animate-in fade-in duration-200">
            {/* Top Overview Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">CORE 1 (ACQUISITION)</span>
                <div className="text-2xl font-bold font-mono text-white flex items-center justify-between">
                  <span>{core1Load}%</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    REAL-TIME
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${core1Load}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase">CORE 0 (DISPATCH / RF)</span>
                <div className="text-2xl font-bold font-mono text-white flex items-center justify-between">
                  <span>{core0Load}%</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    WI-FI / MQTT
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full transition-all duration-300"
                    style={{ width: `${core0Load}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase">QUEUE BUFFER DEPTH</span>
                <div className="text-2xl font-bold font-mono text-emerald-300 flex items-center justify-between">
                  <span>
                    {queueItems} / {queueCapacity}
                  </span>
                  <span className="text-xs text-slate-400">SLOTS</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      queueItems > 8 ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${(queueItems / queueCapacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">PROCESSED TELEMETRY</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {framesProcessed.toLocaleString()} <span className="text-xs text-slate-400">FRAMES</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  0 Buffer Overrun Locks
                </div>
              </div>
            </div>

            {/* Interactive Task Sliders & Live Queue Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Task Controls */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    DYNAMIC TASK PARAMETERS
                  </span>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setAcqRateHz(10);
                      setDispatchRateHz(5);
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> RESET
                  </button>
                </div>

                {/* Slider 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Sensor Sampling (Core 1):</span>
                    <span className="font-bold text-cyan-400">{acqRateHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={acqRateHz}
                    onChange={(e) => setAcqRateHz(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>1 Hz (Low Power)</span>
                    <span>25 Hz (High Burst)</span>
                  </div>
                </div>

                {/* Slider 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Network Dispatch (Core 0):</span>
                    <span className="font-bold text-purple-400">{dispatchRateHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={dispatchRateHz}
                    onChange={(e) => setDispatchRateHz(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>1 Hz (Minimal Tx)</span>
                    <span>20 Hz (Real-time Stream)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> RTOS ARCHITECTURAL PRINCIPLE:
                  </div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    By binding high-frequency I2C reads to Core 1 and offloading asynchronous network payloads to Core 0 with an atomic <code className="text-cyan-300">xQueueHandle</code>, we eliminate ISR priority inversions and Wi-Fi latency blocking.
                  </p>
                </div>
              </div>

              {/* Real-Time Queue Visualization Box */}
              <div className="lg:col-span-7 p-5 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-300 font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    LIVE THREAD-SAFE QUEUE (RING BUFFER)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Size: 10 x sizeof(TelemetryFrame)
                  </span>
                </div>

                {/* Queue Slots Visual */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 py-4">
                  {Array.from({ length: queueCapacity }).map((_, i) => {
                    const isOccupied = i < queueItems;
                    return (
                      <div
                        key={i}
                        className={`h-16 rounded-lg border flex flex-col items-center justify-center p-1 text-center transition-all duration-200 ${
                          isOccupied
                            ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-600'
                        }`}
                      >
                        <span className="text-[9px] font-mono block">#{i}</span>
                        <span className="text-[10px] font-bold font-mono">
                          {isOccupied ? 'DAT' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Deterministic Non-Blocking Mutex
                  </span>
                  <span>Timeout: <strong className="text-white">pdMS_TO_TICKS(50)</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 6-DOF Inverse Kinematics Solver */}
        {/* ========================================================================= */}
        {activeTab === 'kinematics' && (
          <div className="pt-6 space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sliders & Coordinate Controls */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-400" />
                    CARTESIAN END-EFFECTOR TARGET
                  </span>
                  {isSingular ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> SINGULARITY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500">
                      REACHABLE
                    </span>
                  )}
                </div>

                {/* Target X Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Target X Position:</span>
                    <span className="font-bold text-cyan-400">{targetX} mm</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={targetX}
                    onChange={(e) => setTargetX(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Target Y Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Target Y Position:</span>
                    <span className="font-bold text-purple-400">{targetY} mm</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={targetY}
                    onChange={(e) => setTargetY(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* Target Z Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Target Z Height:</span>
                    <span className="font-bold text-emerald-400">{targetZ} mm</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="240"
                    value={targetZ}
                    onChange={(e) => setTargetZ(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Kinematics Formula Preview */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5">
                  <span className="text-purple-300 font-bold block text-[10px]">
                    DENAVIT-HARTENBERG MATRIX SOLVER:
                  </span>
                  <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                    θ₁ = atan2(Y, X) = {theta1}°
                    <br />
                    θ₂ (Shoulder) = {theta2}° | θ₃ (Elbow) = {theta3}°
                  </div>
                </div>
              </div>

              {/* Joint Angles Gauges & Graphical Preview */}
              <div className="lg:col-span-7 p-5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold uppercase">
                    COMPUTED SERVO ANGLES (PCA9685 12-BIT PWM)
                  </span>
                  <span className="text-[10px] text-slate-400">PWM Update: 50Hz</span>
                </div>

                {/* 6 Joint Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'JOINT 1 (BASE YAW)', val: theta1, icon: 'θ₁', col: 'text-cyan-400' },
                    { label: 'JOINT 2 (SHOULDER)', val: theta2, icon: 'θ₂', col: 'text-purple-400' },
                    { label: 'JOINT 3 (ELBOW PITCH)', val: theta3, icon: 'θ₃', col: 'text-emerald-400' },
                    { label: 'JOINT 4 (WRIST PITCH)', val: theta4, icon: 'θ₄', col: 'text-amber-400' },
                    { label: 'JOINT 5 (WRIST ROLL)', val: theta5, icon: 'θ₅', col: 'text-sky-400' },
                    { label: 'JOINT 6 (GRIPPER)', val: theta6, icon: 'θ₆', col: 'text-rose-400' },
                  ].map((j, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-1"
                    >
                      <span className="text-[9px] font-mono text-slate-400 block truncate">
                        {j.label}
                      </span>
                      <div className={`text-xl font-bold font-mono ${j.col}`}>
                        {j.val}°
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {Math.round(1500 + (j.val / 90) * 500)} µs PWM
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visual Trajectory Vector */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Cartesian Vector:</span>
                  <span className="text-cyan-300 font-bold">
                    P = [{targetX}, {targetY}, {targetZ}]ᵀ
                  </span>
                  <span>Spatial Reach: <strong className="text-white">{Math.round(Math.sqrt(targetX*targetX + targetY*targetY + targetZ*targetZ))} mm</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Digital Protocol Logic Analyzer / Oscilloscope */}
        {/* ========================================================================= */}
        {activeTab === 'oscilloscope' && (
          <div className="pt-6 space-y-6 animate-in fade-in duration-200">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">SELECT PROTOCOL:</span>
                {[
                  { id: 'i2c', label: 'I2C (400kHz Fast Mode - BMP180)' },
                  { id: 'onewire', label: 'One-Wire (DHT11 Pulse Train)' },
                  { id: 'pwm', label: 'PWM 50Hz (PCA9685 Servo)' },
                ].map((sig) => (
                  <button
                    key={sig.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedSignal(sig.id as any);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      selectedSignal === sig.id
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sig.label}
                  </button>
                ))}
              </div>

              {/* Timebase Speed */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>TIMEBASE:</span>
                <button
                  onClick={() => setOscTimebase(0.5)}
                  className={`px-2 py-0.5 rounded ${oscTimebase === 0.5 ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => setOscTimebase(1)}
                  className={`px-2 py-0.5 rounded ${oscTimebase === 1 ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}
                >
                  1.0x
                </button>
                <button
                  onClick={() => setOscTimebase(2)}
                  className={`px-2 py-0.5 rounded ${oscTimebase === 2 ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}
                >
                  2.0x
                </button>
              </div>
            </div>

            {/* Live Canvas Screen */}
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.15)] bg-slate-950">
              <canvas
                ref={oscCanvasRef}
                width={850}
                height={220}
                className="w-full h-[220px] block"
              />

              {/* Overlay Channel Legends */}
              <div className="absolute top-3 left-4 flex items-center gap-3 text-[10px] font-mono">
                {selectedSignal === 'i2c' ? (
                  <>
                    <span className="flex items-center gap-1 text-cyan-400 font-bold bg-black/70 px-2 py-0.5 rounded border border-cyan-500/30">
                      CH1: SCL (400kHz)
                    </span>
                    <span className="flex items-center gap-1 text-purple-400 font-bold bg-black/70 px-2 py-0.5 rounded border border-purple-500/30">
                      CH2: SDA (ADDR 0x77 + ACK)
                    </span>
                  </>
                ) : selectedSignal === 'onewire' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30">
                    CH1: DHT11 DATA (80µs Handshake + 40-Bit Stream)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/70 px-2 py-0.5 rounded border border-amber-500/30">
                    CH1: 50Hz PWM PULSE WIDTH (1.5ms Center Position)
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded">
                SAMPLE RATE: 24MS/s // LOGIC ANALYZER ACTIVE
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
  </section>
  );
};
