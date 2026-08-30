import React, { useState, useMemo } from 'react';
import { Thermometer, Gauge, Activity, Radio, Sparkles } from 'lucide-react';

export interface TelemetrySample {
  time: string;
  temp: number;
  pressure: number;
  humidity: number;
}

interface EnvironmentalTelemetryChartProps {
  data: TelemetrySample[];
  currentTemp: number;
  currentPressure: number;
  currentHumidity: number;
  unit: 'C' | 'F';
}

export const EnvironmentalTelemetryChart: React.FC<EnvironmentalTelemetryChartProps> = ({
  data,
  currentTemp,
  currentPressure,
  currentHumidity,
  unit,
}) => {
  const [activeChannel, setActiveChannel] = useState<'both' | 'temp' | 'pressure'>('both');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayTemp = (t: number) => (unit === 'C' ? `${t.toFixed(1)}°C` : `${(t * 1.8 + 32).toFixed(1)}°F`);

  // Chart dimensions & calculations
  const width = 640;
  const height = 220;
  const padding = { top: 25, right: 25, bottom: 35, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const {
    minTemp,
    maxTemp,
    minPress,
    maxPress,
    tempPoints,
    pressPoints,
    tempPath,
    pressPath,
    tempAreaPath,
    pressAreaPath,
  } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        minTemp: 20,
        maxTemp: 30,
        minPress: 1000,
        maxPress: 1025,
        tempPoints: [],
        pressPoints: [],
        tempPath: '',
        pressPath: '',
        tempAreaPath: '',
        pressAreaPath: '',
      };
    }

    const temps = data.map((d) => d.temp);
    const presses = data.map((d) => d.pressure);

    const minT = Math.floor(Math.min(...temps) - 0.5);
    const maxT = Math.ceil(Math.max(...temps) + 0.5);
    const minP = Math.floor(Math.min(...presses) - 1.0);
    const maxP = Math.ceil(Math.max(...presses) + 1.0);

    const tRange = Math.max(0.8, maxT - minT);
    const pRange = Math.max(2.0, maxP - minP);

    const tPts = data.map((d, i) => {
      const x = padding.left + (i / Math.max(1, data.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((d.temp - minT) / tRange) * innerHeight;
      return { x, y, data: d };
    });

    const pPts = data.map((d, i) => {
      const x = padding.left + (i / Math.max(1, data.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((d.pressure - minP) / pRange) * innerHeight;
      return { x, y, data: d };
    });

    // Helper for smooth cubic bezier curve
    const createSmoothPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return '';
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? 0 : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    };

    const tLine = createSmoothPath(tPts);
    const pLine = createSmoothPath(pPts);

    const groundY = (padding.top + innerHeight).toFixed(1);
    const tArea = tPts.length > 0
      ? `${tLine} L ${tPts[tPts.length - 1].x.toFixed(1)} ${groundY} L ${tPts[0].x.toFixed(1)} ${groundY} Z`
      : '';
    const pArea = pPts.length > 0
      ? `${pLine} L ${pPts[pPts.length - 1].x.toFixed(1)} ${groundY} L ${pPts[0].x.toFixed(1)} ${groundY} Z`
      : '';

    return {
      minTemp: minT,
      maxTemp: maxT,
      minPress: minP,
      maxPress: maxP,
      tempPoints: tPts,
      pressPoints: pPts,
      tempPath: tLine,
      pressPath: pLine,
      tempAreaPath: tArea,
      pressAreaPath: pArea,
    };
  }, [data, innerWidth, innerHeight, padding.left, padding.top]);

  const activeHoverSample = hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null;

  return (
    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-5 backdrop-blur-md shadow-xl relative overflow-hidden flex flex-col space-y-3">
      {/* Top Header & Channel Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>REAL-TIME ENVIRONMENTAL TIME-SERIES</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              Live Sensor Ingestion • Rolling 24-Sample Buffer
            </span>
          </div>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 font-mono text-[11px]">
          <button
            onClick={() => setActiveChannel('both')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeChannel === 'both'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual View
          </button>
          <button
            onClick={() => setActiveChannel('temp')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
              activeChannel === 'temp'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Temp</span>
          </button>
          <button
            onClick={() => setActiveChannel('pressure')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
              activeChannel === 'pressure'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Pressure</span>
          </button>
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-52 select-none overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Temperature Gradient */}
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
            </linearGradient>

            {/* Pressure Gradient */}
            <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#c084fc" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + innerHeight * ratio;
            return (
              <g key={`grid-h-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Vertical Time Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const x = padding.left + innerWidth * ratio;
            return (
              <line
                key={`grid-v-${i}`}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke="#1e293b"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Y-Axis Value Labels (Left = Temp, Right = Pressure) */}
          <text
            x={padding.left - 8}
            y={padding.top + 4}
            textAnchor="end"
            fill="#00f0ff"
            fontSize="9"
            fontFamily="monospace"
          >
            {unit === 'C' ? `${maxTemp}°C` : `${(maxTemp * 1.8 + 32).toFixed(0)}°`}
          </text>
          <text
            x={padding.left - 8}
            y={padding.top + innerHeight + 3}
            textAnchor="end"
            fill="#00f0ff"
            fontSize="9"
            fontFamily="monospace"
          >
            {unit === 'C' ? `${minTemp}°C` : `${(minTemp * 1.8 + 32).toFixed(0)}°`}
          </text>

          <text
            x={width - padding.right + 6}
            y={padding.top + 4}
            textAnchor="start"
            fill="#c084fc"
            fontSize="9"
            fontFamily="monospace"
          >
            {maxPress} hPa
          </text>
          <text
            x={width - padding.right + 6}
            y={padding.top + innerHeight + 3}
            textAnchor="start"
            fill="#c084fc"
            fontSize="9"
            fontFamily="monospace"
          >
            {minPress} hPa
          </text>

          {/* Pressure Area & Line */}
          {(activeChannel === 'both' || activeChannel === 'pressure') && (
            <>
              <path d={pressAreaPath} fill="url(#pressureGradient)" />
              <path
                d={pressPath}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Temperature Area & Line */}
          {(activeChannel === 'both' || activeChannel === 'temp') && (
            <>
              <path d={tempAreaPath} fill="url(#tempGradient)" />
              <path
                d={tempPath}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Latest Live Point Pulse Ring */}
          {tempPoints.length > 0 && (activeChannel === 'both' || activeChannel === 'temp') && (
            <g>
              <circle
                cx={tempPoints[tempPoints.length - 1].x}
                cy={tempPoints[tempPoints.length - 1].y}
                r="7"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="1.5"
                className="animate-ping origin-center"
              />
              <circle
                cx={tempPoints[tempPoints.length - 1].x}
                cy={tempPoints[tempPoints.length - 1].y}
                r="3.5"
                fill="#00f0ff"
                stroke="#030712"
                strokeWidth="1.5"
              />
            </g>
          )}

          {pressPoints.length > 0 && (activeChannel === 'both' || activeChannel === 'pressure') && (
            <circle
              cx={pressPoints[pressPoints.length - 1].x}
              cy={pressPoints[pressPoints.length - 1].y}
              r="3.5"
              fill="#c084fc"
              stroke="#030712"
              strokeWidth="1.5"
            />
          )}

          {/* Hover Crosshair & Detection Zones */}
          {tempPoints.map((pt, idx) => (
            <rect
              key={`zone-${idx}`}
              x={pt.x - innerWidth / (data.length * 2)}
              y={padding.top}
              width={innerWidth / Math.max(1, data.length)}
              height={innerHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          ))}

          {/* Active Hover Crosshair Line */}
          {hoveredIndex !== null && tempPoints[hoveredIndex] && (
            <g>
              <line
                x1={tempPoints[hoveredIndex].x}
                y1={padding.top}
                x2={tempPoints[hoveredIndex].x}
                y2={height - padding.bottom}
                stroke="#94a3b8"
                strokeDasharray="2 2"
                strokeWidth="1.2"
              />
              {(activeChannel === 'both' || activeChannel === 'temp') && (
                <circle
                  cx={tempPoints[hoveredIndex].x}
                  cy={tempPoints[hoveredIndex].y}
                  r="5"
                  fill="#00f0ff"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
              {(activeChannel === 'both' || activeChannel === 'pressure') && (
                <circle
                  cx={pressPoints[hoveredIndex].x}
                  cy={pressPoints[hoveredIndex].y}
                  r="5"
                  fill="#c084fc"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Time-Axis Labels */}
          <text
            x={padding.left}
            y={height - 10}
            textAnchor="start"
            fill="#64748b"
            fontSize="9"
            fontFamily="monospace"
          >
            -2.0 min
          </text>
          <text
            x={padding.left + innerWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fill="#64748b"
            fontSize="9"
            fontFamily="monospace"
          >
            -1.0 min
          </text>
          <text
            x={width - padding.right}
            y={height - 10}
            textAnchor="end"
            fill="#00f0ff"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            NOW (LIVE)
          </text>
        </svg>

        {/* Floating Tooltip during Hover */}
        {activeHoverSample && hoveredIndex !== null && tempPoints[hoveredIndex] && (
          <div
            className="absolute top-2 z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md text-[11px] font-mono flex items-center gap-3 transition-all"
            style={{
              left: Math.min(
                width - 170,
                Math.max(20, (tempPoints[hoveredIndex].x / width) * 100)
              ) + '%',
            }}
          >
            <span className="text-slate-400">{activeHoverSample.time}</span>
            <span className="text-cyan-300 font-bold">
              {displayTemp(activeHoverSample.temp)}
            </span>
            <span className="text-purple-300 font-bold">
              {activeHoverSample.pressure.toFixed(1)} hPa
            </span>
          </div>
        )}
      </div>

      {/* Footer Legend & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 font-mono text-[10px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-1 rounded-full bg-cyan-400" />
            <span>DHT11 Thermal Transducer</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-300">
            <span className="w-2.5 h-1 rounded-full bg-purple-400" />
            <span>BMP180 Piezoresistive Barometer</span>
          </div>
        </div>

        <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Polling Rate: 1.8s
        </span>
      </div>
    </div>
  );
};
