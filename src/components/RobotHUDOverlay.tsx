import React, { useEffect, useState, useRef } from 'react';
import {
  Activity,
  Radio,
  Crosshair,
  Compass,
  Cpu,
  Layers,
  Terminal,
  Zap,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Pause,
  Play,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

export interface SensorPacket {
  id: number;
  timestamp: string;
  source: string;
  x: number;
  y: number;
  z: number;
  roll: number;
  pitch: number;
  yaw: number;
  accX: number;
  accY: number;
  accZ: number;
  canFrameHex: string;
  status: 'NOMINAL' | 'TRACKING' | 'LOCK' | 'ALERT';
}

interface RobotHUDOverlayProps {
  isEngaged: boolean;
  activeHotspotId: string;
  activeHotspotName: string;
  hoveredPartName: string | null;
  controlMode: 'autonomous' | 'manual';
  laserActive: boolean;
  obstacleDistance: number;
  jointAngles: {
    waist: number;
    shoulder: number;
    elbow: number;
    wristPitch: number;
    gripperOpen: number;
  };
  robotRotation: { x: number; y: number };
}

export const RobotHUDOverlay: React.FC<RobotHUDOverlayProps> = ({
  isEngaged,
  activeHotspotId,
  activeHotspotName,
  hoveredPartName,
  controlMode,
  laserActive,
  obstacleDistance,
  jointAngles,
  robotRotation,
}) => {
  const [hudMode, setHudMode] = useState<'STREAM' | 'MATRIX' | 'IMU'>('STREAM');
  const [isPaused, setIsPaused] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const [copiedBuffer, setCopiedBuffer] = useState(false);
  const [hudExpanded, setHudExpanded] = useState(true);
  const [packets, setPackets] = useState<SensorPacket[]>([]);
  const packetIdRef = useRef(1000);
  const streamContainerRef = useRef<HTMLDivElement>(null);

  // Real-time kinematic Coordinate Vector computation
  // Calculates live end-effector / Tool Center Point (TCP) & joint 3D spatial positions
  const baseRadius = 0.65;
  const bicepLength = 1.3;
  const forearmLength = 1.1;

  // Forward Kinematics calculation for live XYZ
  const theta1 = jointAngles.waist + robotRotation.y;
  const theta2 = jointAngles.shoulder + robotRotation.x;
  const theta3 = jointAngles.elbow;

  const currentX = Number(
    (
      Math.sin(theta1) *
      (bicepLength * Math.sin(theta2) + forearmLength * Math.sin(theta2 + theta3) + 0.35)
    ).toFixed(3)
  );

  const currentY = Number(
    (
      -1.05 +
      0.75 +
      bicepLength * Math.cos(theta2) +
      forearmLength * Math.cos(theta2 + theta3) +
      (laserActive ? 0.2 : 0)
    ).toFixed(3)
  );

  const currentZ = Number(
    (
      Math.cos(theta1) *
      (bicepLength * Math.sin(theta2) + forearmLength * Math.sin(theta2 + theta3) + 0.35)
    ).toFixed(3)
  );

  // Live roll, pitch, yaw
  const rollDeg = Number(((jointAngles.wristPitch * 180) / Math.PI).toFixed(1));
  const pitchDeg = Number(((theta2 * 180) / Math.PI).toFixed(1));
  const yawDeg = Number(((theta1 * 180) / Math.PI).toFixed(1));

  // Dynamic Packet Stream Generator based on user engagement & kinematic updates
  useEffect(() => {
    if (isPaused) return;

    // Fast interval for real-time sensor stream
    const interval = setInterval(() => {
      packetIdRef.current += 1;
      const pid = packetIdRef.current;

      const now = new Date();
      const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}.${(now.getMilliseconds() / 10).toFixed(0).padStart(2, '0')}`;

      // Source label
      let src = 'TCP_KINEMATICS';
      if (activeHotspotId === 'vision') src = 'OPENCV_STEREO';
      else if (activeHotspotId === 'lidar') src = 'TOF_LIDAR_360';
      else if (activeHotspotId === 'ultrasonic') src = 'HCSR04_RADAR';
      else if (activeHotspotId === 'servo_shoulder') src = 'SERVO_J2_ENC';
      else if (activeHotspotId === 'servo_elbow') src = 'SERVO_J3_ENC';
      else if (activeHotspotId === 'hydraulic') src = 'HYD_PRESSURE';
      else if (activeHotspotId === 'gripper') src = 'STRAIN_JAW_FORCE';
      else if (activeHotspotId === 'freertos_core') src = 'RTOS_CAN_BUS';

      // Slight noise variance for realistic sensor telemetry
      const noiseX = (Math.random() - 0.5) * 0.006;
      const noiseY = (Math.random() - 0.5) * 0.006;
      const noiseZ = (Math.random() - 0.5) * 0.006;

      const px = Number((currentX + noiseX).toFixed(3));
      const py = Number((currentY + noiseY).toFixed(3));
      const pz = Number((currentZ + noiseZ).toFixed(3));

      // 3-axis accelerometer simulation (m/s²)
      const ax = Number((Math.sin(pid * 0.2) * 1.8 + noiseX * 10).toFixed(2));
      const ay = Number((9.81 + Math.cos(pid * 0.2) * 0.4).toFixed(2));
      const az = Number((Math.cos(pid * 0.3) * 1.2 + noiseZ * 10).toFixed(2));

      // Synthetic CAN 2.0B Frame
      const b1 = (Math.abs(Math.floor(px * 100)) % 255).toString(16).padStart(2, '0').toUpperCase();
      const b2 = (Math.abs(Math.floor(py * 100)) % 255).toString(16).padStart(2, '0').toUpperCase();
      const b3 = (Math.abs(Math.floor(pz * 100)) % 255).toString(16).padStart(2, '0').toUpperCase();
      const b4 = Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase();
      const canFrameHex = `0x7E ${b1} ${b2} ${b3} ${b4}`;

      const status: 'NOMINAL' | 'TRACKING' | 'LOCK' | 'ALERT' =
        obstacleDistance < 20 ? 'ALERT' : activeHotspotId === 'vision' ? 'LOCK' : isEngaged ? 'TRACKING' : 'NOMINAL';

      const newPacket: SensorPacket = {
        id: pid,
        timestamp: timeStr,
        source: src,
        x: px,
        y: py,
        z: pz,
        roll: rollDeg,
        pitch: pitchDeg,
        yaw: yawDeg,
        accX: ax,
        accY: ay,
        accZ: az,
        canFrameHex,
        status,
      };

      setPackets((prev) => {
        const updated = [newPacket, ...prev];
        return updated.slice(0, 18); // keep last 18 packets in buffer
      });

      if (audioFeedback && pid % 4 === 0) {
        sound.playBootBeep(1200 + Math.random() * 400, 0.015);
      }
    }, isEngaged ? 90 : 180); // higher frequency when user actively engages

    return () => clearInterval(interval);
  }, [
    isPaused,
    isEngaged,
    currentX,
    currentY,
    currentZ,
    rollDeg,
    pitchDeg,
    yawDeg,
    activeHotspotId,
    obstacleDistance,
    audioFeedback,
  ]);

  // Copy packets buffer to clipboard
  const handleCopyBuffer = () => {
    const text = packets
      .map(
        (p) =>
          `[PKT #${p.id} ${p.timestamp}] SRC:${p.source} | COORDS: X=${p.x.toFixed(3)}m, Y=${p.y.toFixed(3)}m, Z=${p.z.toFixed(3)}m | RPY=(${p.roll}°, ${p.pitch}°, ${p.yaw}°) | CAN:${p.canFrameHex} | STATUS:${p.status}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBuffer(true);
    sound.playSuccessChime();
    setTimeout(() => setCopiedBuffer(false), 2000);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-10 select-none">
      {/* 1. TOP HUD HEADER BAR: Live Telemetry Status & Reticle Metrics */}
      <div className="flex flex-wrap items-start justify-between gap-2 pointer-events-auto">
        {/* Left Badge: Streaming State & Source */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/85 border border-cyan-500/50 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
            <div className="font-mono text-xs text-white font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>HUD SENSOR BUS</span>
              <span className="text-[10px] text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800">
                {isEngaged ? 'USER ACTIVE (100 Hz)' : 'IDLE STREAM (50 Hz)'}
              </span>
            </div>
          </div>

          {/* Subsystem Live Lock Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/75 border border-slate-800 text-[10px] font-mono text-slate-300 backdrop-blur-sm">
            <span className="text-slate-500">LOCK:</span>
            <span className="text-cyan-300 font-semibold">{hoveredPartName || activeHotspotName}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">DMA_OK</span>
          </div>
        </div>

        {/* Right Controls: HUD Mode Switcher & Stream Utility Buttons */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] bg-black/85 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => {
              sound.playClick();
              setHudMode('STREAM');
            }}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              hudMode === 'STREAM'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PACKET STREAM
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setHudMode('MATRIX');
            }}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              hudMode === 'MATRIX'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SPATIAL 3D
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setHudMode('IMU');
            }}
            className={`px-2 py-1 rounded transition-all cursor-pointer ${
              hudMode === 'IMU'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            IMU / CAN
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setAudioFeedback(!audioFeedback);
            }}
            title="Toggle telemetry audio ticks"
            className={`p-1 rounded cursor-pointer transition-all ${
              audioFeedback ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {audioFeedback ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Pause / Play stream */}
          <button
            onClick={() => {
              sound.playClick();
              setIsPaused(!isPaused);
            }}
            title={isPaused ? 'Resume packet stream' : 'Pause packet stream'}
            className="p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Expand */}
          <button
            onClick={() => {
              sound.playClick();
              setHudExpanded(!hudExpanded);
            }}
            title={hudExpanded ? 'Minimize HUD' : 'Expand HUD'}
            className="p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
          >
            {hudExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. CENTER RETICLE: Cybernetic Dynamic Crosshair & Spatial Coordinates */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none my-2">
        {/* Holographic Radar Ring & Aiming Crosshairs */}
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 border border-cyan-500/20 rounded-full flex items-center justify-center animate-spin-slow">
          {/* Subtle Radar sweep ring */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400/40 opacity-70" />
          <div className="w-36 h-36 border border-cyan-500/30 rounded-full border-dashed" />
          <div className="w-20 h-20 border border-cyan-400/50 rounded-full" />
        </div>

        {/* Center Static Precision Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400 -translate-x-1.5 -translate-y-1.5" />
          <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400 translate-x-1.5 translate-y-1.5" />
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
        </div>

        {/* Real-Time Floating Coordinates HUD Box (Pinned to Reticle) */}
        <div className="absolute top-2 right-2 sm:right-6 bg-black/85 border border-cyan-500/40 p-2.5 rounded-xl font-mono text-[11px] backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.2)] pointer-events-auto space-y-1 min-w-[170px]">
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-1 text-[10px]">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>TCP POSE (METERS)</span>
            </span>
            <span className="text-emerald-400 font-mono">LIVE</span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 text-center font-bold">
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <div className="text-[9px] text-slate-500">X-AXIS</div>
              <div className="text-cyan-300">{currentX >= 0 ? `+${currentX.toFixed(3)}` : currentX.toFixed(3)}</div>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <div className="text-[9px] text-slate-500">Y-AXIS</div>
              <div className="text-amber-300">{currentY >= 0 ? `+${currentY.toFixed(3)}` : currentY.toFixed(3)}</div>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <div className="text-[9px] text-slate-500">Z-AXIS</div>
              <div className="text-purple-300">{currentZ >= 0 ? `+${currentZ.toFixed(3)}` : currentZ.toFixed(3)}</div>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>ORIENTATION (RPY):</span>
            <span className="text-slate-200">
              {rollDeg}° / {pitchDeg}° / {yawDeg}°
            </span>
          </div>
        </div>

        {/* Active Laser & Proximity Alert in Reticle Space */}
        <div className="absolute bottom-2 left-2 sm:left-6 flex flex-col gap-1.5 pointer-events-auto">
          <div className="bg-black/85 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md font-mono text-[10px] flex items-center gap-2">
            <span className="text-slate-400">RADAR PROXIMITY:</span>
            <span
              className={`font-bold ${
                obstacleDistance < 20 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {obstacleDistance} cm
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">LASER:</span>
            <span className={laserActive ? 'text-rose-400 font-bold' : 'text-slate-500'}>
              {laserActive ? 'ACTIVE 532nm' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM STREAM DRAWER: Dynamic Live Stream of Sensor Packets */}
      {hudExpanded && (
        <div className="bg-black/90 rounded-xl border border-cyan-500/40 p-3 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.15)] pointer-events-auto font-mono transition-all">
          {/* Stream Header */}
          <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white font-bold text-[11px] tracking-wide">
                DYNAMIC SENSOR PACKET STREAM
              </span>
              <span className="text-[10px] text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                BUFFER: {packets.length} FRAMES
              </span>
              {isPaused && (
                <span className="text-[10px] text-amber-300 px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 animate-pulse">
                  PAUSED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <button
                onClick={handleCopyBuffer}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
              >
                {copiedBuffer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBuffer ? 'COPIED BUFFER' : 'COPY BUFFER'}</span>
              </button>
            </div>
          </div>

          {/* Packet Waterfall Table depending on HUD Mode */}
          {hudMode === 'STREAM' && (
            <div
              ref={streamContainerRef}
              className="max-h-24 sm:max-h-28 overflow-y-auto space-y-1 text-[10px] scrollbar-thin scrollbar-thumb-cyan-700/50 pr-1"
            >
              {packets.slice(0, 5).map((pkt, idx) => (
                <div
                  key={pkt.id}
                  className={`flex flex-wrap items-center justify-between gap-1 px-2 py-1 rounded border transition-all ${
                    idx === 0
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-950/50 border-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-cyan-400 font-bold">PKT#{pkt.id}</span>
                    <span className="text-slate-500">{pkt.timestamp}</span>
                    <span className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {pkt.source}
                    </span>
                  </div>

                  {/* High Precision Dynamic (X, Y, Z) Coordinates Stream */}
                  <div className="flex items-center gap-2 font-bold shrink-0">
                    <span className="text-slate-400">XYZ:</span>
                    <span className="text-cyan-300">[{pkt.x.toFixed(3)},</span>
                    <span className="text-amber-300">{pkt.y.toFixed(3)},</span>
                    <span className="text-purple-300">{pkt.z.toFixed(3)}]m</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 text-[9px]">CAN: {pkt.canFrameHex}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        pkt.status === 'ALERT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : pkt.status === 'LOCK'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : pkt.status === 'TRACKING'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {pkt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hudMode === 'MATRIX' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">SPATIAL VECTOR (X,Y,Z)</span>
                <span className="text-cyan-300 font-bold">
                  {currentX.toFixed(3)}, {currentY.toFixed(3)}, {currentZ.toFixed(3)} m
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">ROTATION EULER (RPY)</span>
                <span className="text-amber-300 font-bold">
                  {rollDeg}°, {pitchDeg}°, {yawDeg}°
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">ACCELEROMETER (IMU)</span>
                <span className="text-purple-300 font-bold">
                  [{packets[0]?.accX ?? 0.0}, {packets[0]?.accY ?? 9.81}, {packets[0]?.accZ ?? 0.0}] m/s²
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">DMA CYCLE FREQUENCY</span>
                <span className="text-emerald-400 font-bold">
                  {isEngaged ? '100.0 Hz • 1.2ms' : '50.0 Hz • 2.4ms'}
                </span>
              </div>
            </div>
          )}

          {hudMode === 'IMU' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">CAN-BUS ISO 11898 STREAM</span>
                <span className="text-cyan-300 font-bold">
                  ID: 0x7E • PAYLOAD: {packets[0]?.canFrameHex || '0x7E 00 00 00 00'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">KINEMATIC JACOBIAN MATRIX</span>
                <span className="text-amber-300 font-bold">DET(J) = 0.9842 • RANK = 6</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">FREERTOS WATCHDOG ISR</span>
                <span className="text-emerald-400 font-bold">0 MISSED FRAMES • TICK: 10ms</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
