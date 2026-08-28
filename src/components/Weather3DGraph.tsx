import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface WeatherDataPoint {
  time: string;
  temp: number;
  pressure: number;
}

interface GraphSceneProps {
  data: WeatherDataPoint[];
  activeChannel: 'both' | 'temp' | 'pressure';
}

function OscilloscopeGraphMesh({ data, activeChannel }: GraphSceneProps) {
  const lineTempRef = useRef<THREE.Line>(null);
  const linePressRef = useRef<THREE.Line>(null);
  const scanBarRef = useRef<THREE.Mesh>(null);
  const gridHelperRef = useRef<THREE.GridHelper>(null);

  // Normalize data points into 3D coordinates (X: -2.8 to 2.8, Y: -1.2 to 1.2, Z: 0)
  const { tempPoints, pressPoints, minTemp, maxTemp, minPress, maxPress } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        tempPoints: [],
        pressPoints: [],
        minTemp: 20,
        maxTemp: 30,
        minPress: 1000,
        maxPress: 1030,
      };
    }

    const temps = data.map((d) => d.temp);
    const presses = data.map((d) => d.pressure);

    const minT = Math.min(...temps) - 0.5;
    const maxT = Math.max(...temps) + 0.5;
    const minP = Math.min(...presses) - 0.5;
    const maxP = Math.max(...presses) + 0.5;

    const tPts: THREE.Vector3[] = [];
    const pPts: THREE.Vector3[] = [];

    const xSpan = 5.4;
    const startX = -2.7;

    data.forEach((pt, i) => {
      const x = startX + (i / Math.max(1, data.length - 1)) * xSpan;

      // Normalize Temp Y: -1.0 to 1.0
      const normT = ((pt.temp - minT) / Math.max(0.1, maxT - minT)) * 2.0 - 1.0;
      tPts.push(new THREE.Vector3(x, normT * 0.9 + 0.1, 0.1));

      // Normalize Press Y: -1.0 to 1.0
      const normP = ((pt.pressure - minP) / Math.max(0.1, maxP - minP)) * 2.0 - 1.0;
      pPts.push(new THREE.Vector3(x, normP * 0.9 - 0.1, -0.1));
    });

    return {
      tempPoints: tPts,
      pressPoints: pPts,
      minTemp: minT,
      maxTemp: maxT,
      minPress: minP,
      maxPress: maxP,
    };
  }, [data]);

  // Create or update line geometries
  const tempGeometry = useMemo(() => {
    if (tempPoints.length === 0) return new THREE.BufferGeometry();
    return new THREE.BufferGeometry().setFromPoints(tempPoints);
  }, [tempPoints]);

  const pressGeometry = useMemo(() => {
    if (pressPoints.length === 0) return new THREE.BufferGeometry();
    return new THREE.BufferGeometry().setFromPoints(pressPoints);
  }, [pressPoints]);

  // Frame animation for oscilloscope scan sweep
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (scanBarRef.current) {
      // Sweep from -2.7 to 2.7
      const sweepX = -2.7 + ((t * 1.8) % 5.4);
      scanBarRef.current.position.x = sweepX;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Oscilloscope Backplate Grid */}
      <gridHelper
        ref={gridHelperRef}
        args={[5.6, 14, 0x00f0ff, 0x1e293b]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.3]}
      />

      {/* Outer Border Frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(5.6, 2.4, 0.2)]} />
        <lineBasicMaterial color={0x0284c7} transparent opacity={0.4} />
      </lineSegments>

      {/* Temperature 3D Glowing Waveform */}
      {(activeChannel === 'both' || activeChannel === 'temp') && (
        <group>
          <primitive object={new THREE.Line(tempGeometry, new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 }))} />
          {/* Glowing Vertex Dots for Temperature */}
          {tempPoints.map((pt, idx) => (
            <mesh key={`t-dot-${idx}`} position={pt}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color={0x00f0ff} />
            </mesh>
          ))}
        </group>
      )}

      {/* Barometric Pressure 3D Glowing Waveform */}
      {(activeChannel === 'both' || activeChannel === 'pressure') && (
        <group>
          <primitive object={new THREE.Line(pressGeometry, new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 2 }))} />
          {/* Glowing Vertex Dots for Pressure */}
          {pressPoints.map((pt, idx) => (
            <mesh key={`p-dot-${idx}`} position={pt}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color={0xa855f7} />
            </mesh>
          ))}
        </group>
      )}

      {/* Real-time Oscilloscope Sweep Cursor Bar */}
      <mesh ref={scanBarRef} position={[-2.7, 0, 0.15]}>
        <boxGeometry args={[0.03, 2.2, 0.05]} />
        <meshBasicMaterial color={0x38bdf8} transparent opacity={0.8} />
      </mesh>

      {/* Ambient Lighting & Accent Point Lights */}
      <ambientLight intensity={1.2} />
      <pointLight position={[2, 2, 3]} intensity={2.0} color={0x00f0ff} />
      <pointLight position={[-2, -1, 3]} intensity={2.0} color={0xa855f7} />
    </group>
  );
}

interface Weather3DGraphProps {
  data: WeatherDataPoint[];
  currentTemp: number;
  currentPressure: number;
}

export const Weather3DGraph: React.FC<Weather3DGraphProps> = ({ data, currentTemp, currentPressure }) => {
  const [activeChannel, setActiveChannel] = React.useState<'both' | 'temp' | 'pressure'>('both');

  return (
    <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 relative overflow-hidden flex flex-col">
      {/* Top Header with Channel Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-cyan-300 font-bold tracking-wider">
            R3F REAL-TIME 3D TELEMETRY OSCILLOSCOPE
          </span>
        </div>

        {/* Filter Channels */}
        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={() => setActiveChannel('both')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
              activeChannel === 'both'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CH1 & CH2 (DUAL)
          </button>
          <button
            onClick={() => setActiveChannel('temp')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
              activeChannel === 'temp'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CH1: TEMP (°C)
          </button>
          <button
            onClick={() => setActiveChannel('pressure')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
              activeChannel === 'pressure'
                ? 'bg-purple-950 text-purple-300 border border-purple-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CH2: BARO (hPa)
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-44 sm:h-48 bg-slate-950/80 rounded-lg overflow-hidden border border-slate-800">
        {/* React Three Fiber Canvas */}
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          <OscilloscopeGraphMesh data={data} activeChannel={activeChannel} />
        </Canvas>

        {/* Live Channel Legend Overlays */}
        <div className="absolute top-2 left-2 pointer-events-none font-mono text-[10px] space-y-1 bg-black/70 p-1.5 rounded border border-slate-800 backdrop-blur-xs">
          {(activeChannel === 'both' || activeChannel === 'temp') && (
            <div className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
              <span>CH1: DHT11 TEMP: {currentTemp.toFixed(2)} °C</span>
            </div>
          )}
          {(activeChannel === 'both' || activeChannel === 'pressure') && (
            <div className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-0.5 bg-purple-400 inline-block" />
              <span>CH2: BMP180 PRESS: {currentPressure.toFixed(2)} hPa</span>
            </div>
          )}
        </div>

        {/* Oscilloscope Trigger & Rate Badges */}
        <div className="absolute bottom-2 right-2 pointer-events-none font-mono text-[9px] text-slate-400 bg-black/70 px-2 py-1 rounded border border-slate-800 flex items-center gap-2">
          <span className="text-emerald-400">● 1.8s SAMPLING</span>
          <span>TIMEBASE: 500ms/DIV</span>
          <span>BUFFER: {data.length}/30 PTS</span>
        </div>
      </div>
    </div>
  );
};
