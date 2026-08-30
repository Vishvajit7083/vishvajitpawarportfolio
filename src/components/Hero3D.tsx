import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDown,
  FileText,
  Sparkles,
  Terminal,
  Activity,
  Eye,
  ShieldAlert,
  Cpu,
  Crosshair,
  Bot,
  Radio,
  Sliders,
  Zap,
  Info,
  CheckCircle2,
  Layers,
  X
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';
import { createRealisticRobot, RealisticRobotInstance } from '../utils/realisticRobotModel';

interface Hero3DProps {
  onExploreClick?: () => void;
  onOpenResume: () => void;
  onOpenCopilot?: () => void;
  onOpenRecruiterBrief?: () => void;
}

interface RobotHotspot {
  id: string;
  label: string;
  subsystem: string;
  icon: React.ReactNode;
  description: string;
  specs: string[];
  screenPos: { x: number; y: number }; // percentage from top-left (desktop)
  accentColor: string;
}

const HERO_HOTSPOTS: RobotHotspot[] = [
  {
    id: 'vision',
    label: 'VISION OPTIC POD',
    subsystem: 'Stereo Vision & OpenCV AI',
    icon: <Eye className="w-4 h-4 text-cyan-400" />,
    description: 'Dual IMX stereoscopic optical sensor pod delivering 30 FPS OpenCV object detection, HSV blob tracking, and 6D pose triangulation.',
    specs: ['30 FPS Real-Time Perception', 'Haar Cascade & MobileNet SSD', '532nm Precision Optical Laser'],
    screenPos: { x: 74, y: 28 },
    accentColor: '#00f0ff',
  },
  {
    id: 'esp32',
    label: 'ESP32 MASTER MCU',
    subsystem: 'Dual-Core FreeRTOS Kernel',
    icon: <Cpu className="w-4 h-4 text-emerald-400" />,
    description: 'Tensilica Xtensa dual-core architecture running deterministic 10ms FreeRTOS queues for kinematic coordination and low-latency ISR interrupts.',
    specs: ['Dual 240MHz Xtensa Cores', 'Deterministic Task Preemption', 'Thread-Safe CAN & UART Queues'],
    screenPos: { x: 58, y: 52 },
    accentColor: '#10b981',
  },
  {
    id: 'servos',
    label: '6-DOF KINEMATICS',
    subsystem: 'Harmonic Drive Actuators',
    icon: <Sliders className="w-4 h-4 text-amber-400" />,
    description: 'Harmonic zero-backlash drive actuators with 14-bit magnetic position feedback and analytical Denavit-Hartenberg kinematic solvers.',
    specs: ['Zero-Backlash 100:1 Gearbox', '14-Bit Magnetic Encoders', 'Analytical DH Matrix Solvers'],
    screenPos: { x: 82, y: 64 },
    accentColor: '#f59e0b',
  },
  {
    id: 'wireless',
    label: 'WIRELESS GATEWAY',
    subsystem: 'Dual-Band Wi-Fi & BLE',
    icon: <Radio className="w-4 h-4 text-purple-400" />,
    description: 'Integrated 802.11 b/g/n Wi-Fi and BLE 4.2 telemetry module for real-time sensor ingestion, MQTT pub/sub, and over-the-air firmware updates.',
    specs: ['802.11 b/g/n Station / AP', 'BLE 4.2 GATT Telemetry Server', 'MQTT & WebSocket Live Stream'],
    screenPos: { x: 62, y: 38 },
    accentColor: '#a855f7',
  },
];

export const Hero3D: React.FC<Hero3DProps> = ({
  onExploreClick,
  onOpenResume,
  onOpenCopilot,
  onOpenRecruiterBrief,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering3D, setIsHovering3D] = useState(false);
  const [robotAction, setRobotAction] = useState<string>('AUTONOMOUS PATROL');
  const [activeHotspot, setActiveHotspot] = useState<RobotHotspot | null>(null);
  const [powerOnComplete, setPowerOnComplete] = useState(false);

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Initial power-on progressive sequence
    const timer = setTimeout(() => {
      setPowerOnComplete(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. High-Performance Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040812, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.2, 5.4);

    // 2. High-Fidelity WebGL PBR Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Multi-point Studio Rim & Cyber Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x181028, 2.2);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 3.4);
    keyLight.position.set(3.5, 4.5, 4.0);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Deep Purple / Violet Studio Rim Spotlight
    const purpleRimLight = new THREE.SpotLight(0xa855f7, 5.8, 16, Math.PI / 3, 0.5, 1.2);
    purpleRimLight.position.set(-3.5, 3.0, -2.5);
    scene.add(purpleRimLight);

    // Magenta / Violet Ground Floor Glow Pool
    const floorGlowLight = new THREE.PointLight(0x7c3aed, 4.2, 10);
    floorGlowLight.position.set(1.5, -0.8, 0.5);
    scene.add(floorGlowLight);

    // Cyan Rim Backlight
    const cyanBackLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    cyanBackLight.position.set(0, 4, -4);
    scene.add(cyanBackLight);

    // 4. Laboratory Environment: Cyber Hex / Grid Floor
    const gridHelper = new THREE.GridHelper(26, 26, 0xa855f7, 0x1e1b4b);
    gridHelper.position.y = -1.6;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 5. HYPER-REALISTIC ROBOTO ROBOT INSTANCE
    const robotInstance: RealisticRobotInstance = createRealisticRobot(1.22);
    const robotGroup = robotInstance.rootGroup;
    robotGroup.position.set(1.5, 0.1, 0);
    scene.add(robotGroup);

    // 6. Floating ESP32 Dev Board Object
    const esp32Group = new THREE.Group();
    esp32Group.position.set(-1.8, 0.5, -0.6);
    scene.add(esp32Group);

    const circuitPcbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      metalness: 0.4,
      roughness: 0.6,
    });
    const chromeAccentMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.1,
    });
    const glowingPurpleMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.6,
    });
    const glowingCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.0,
    });

    const pcbGeo = new THREE.BoxGeometry(0.8, 0.04, 1.2);
    const pcbMesh = new THREE.Mesh(pcbGeo, circuitPcbMat);
    esp32Group.add(pcbMesh);

    // ESP32 Metal Shield (SoC)
    const socGeo = new THREE.BoxGeometry(0.5, 0.05, 0.6);
    const socMesh = new THREE.Mesh(socGeo, chromeAccentMat);
    socMesh.position.set(0, 0.04, -0.15);
    esp32Group.add(socMesh);

    // Wi-Fi Antenna Trace on PCB
    const antTraceGeo = new THREE.BoxGeometry(0.4, 0.02, 0.18);
    const antTrace = new THREE.Mesh(antTraceGeo, glowingPurpleMat);
    antTrace.position.set(0, 0.035, 0.45);
    esp32Group.add(antTrace);

    // Status LEDs on Board
    const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), glowingCyanMat);
    led1.position.set(0.3, 0.04, -0.45);
    esp32Group.add(led1);

    // 7. Floating Circuit Components & Sensor Nodes
    const floatingChips: THREE.Group[] = [];
    const chipColors = [0x00f0ff, 0xa855f7, 0x10b981, 0x38bdf8];

    for (let i = 0; i < 5; i++) {
      const chipGrp = new THREE.Group();
      const cGeo = new THREE.BoxGeometry(0.28, 0.04, 0.28);
      const cMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2,
      });
      const chip = new THREE.Mesh(cGeo, cMat);
      chipGrp.add(chip);

      const glowDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshStandardMaterial({
          color: chipColors[i % chipColors.length],
          emissive: chipColors[i % chipColors.length],
          emissiveIntensity: 2,
        })
      );
      glowDot.position.set(0, 0.03, 0);
      chipGrp.add(glowDot);

      const angle = (i / 5) * Math.PI * 2;
      const radius = 2.4 + (i % 2) * 0.5;
      chipGrp.position.set(
        Math.cos(angle) * radius + (i % 2 === 0 ? 0.5 : -0.5),
        -0.2 + (i % 3) * 0.4,
        Math.sin(angle) * 1.5 - 0.5
      );
      chipGrp.rotation.set(Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.4);
      scene.add(chipGrp);
      floatingChips.push(chipGrp);
    }

    // 8. Holographic HUD Telemetry Rings
    const hudRingGeo1 = new THREE.RingGeometry(1.0, 1.02, 48);
    const hudMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const hudRing1 = new THREE.Mesh(hudRingGeo1, hudMat1);
    hudRing1.rotation.x = Math.PI / 2.3;
    robotGroup.add(hudRing1);

    const hudRingGeo2 = new THREE.RingGeometry(1.35, 1.37, 32);
    const hudMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const hudRing2 = new THREE.Mesh(hudRingGeo2, hudMat2);
    hudRing2.rotation.x = -Math.PI / 2.8;
    hudRing2.rotation.y = 0.2;
    robotGroup.add(hudRing2);

    // 9. Floating Lab Particle Field
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0x38bdf8);
    const color3 = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15;
      positions[i + 1] = (Math.random() - 0.5) * 9;
      positions[i + 2] = (Math.random() - 0.5) * 9 - 1;

      const chosenColor = i % 8 === 0 ? color3 : i % 5 === 0 ? color2 : color1;
      colors[i] = chosenColor.r;
      colors[i + 1] = chosenColor.g;
      colors[i + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 10. Mouse & Interaction Handlers
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let prevMouseX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const delta = e.clientX - prevMouseX;
        robotGroup.rotation.y += delta * 0.008;
        prevMouseX = e.clientX;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      setRobotAction('PRECISION TELE-INSPECTION');
    };

    const handleMouseUp = () => {
      isDragging = false;
      setTimeout(() => setRobotAction('AUTONOMOUS PATROL'), 1200);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Handle Responsive Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      if (window.innerWidth < 768) {
        robotGroup.position.set(0, -0.15, 0);
        esp32Group.position.set(0, 1.4, -1.2);
        camera.position.set(0, 0.8, 5.8);
      } else {
        robotGroup.position.set(1.4, 0.1, 0);
        esp32Group.position.set(-1.8, 0.5, -0.6);
        camera.position.set(0, 1.2, 5.2);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 11. Real-Time Kinematic Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera Parallax
      targetX += (mouseX * 0.4 - targetX) * 0.05;
      targetY += (mouseY * 0.3 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = 1.2 + targetY;
      camera.lookAt(0, 0.3, 0);

      // Call Master Realistic Robot Kinematics
      robotInstance.animate(elapsedTime, 'vision', true);

      // Robot Float Hover & Body Rotation
      if (!isDragging) {
        robotGroup.position.y = (window.innerWidth < 768 ? -0.15 : 0.1) + Math.sin(elapsedTime * 1.8) * 0.04;
        robotGroup.rotation.y = Math.sin(elapsedTime * 0.6) * 0.18 - 0.15;
      }

      // Robot Inquisitive Gaze Tracking
      const targetHeadY = mouseX * 0.45;
      const targetHeadX = -mouseY * 0.25 + 0.05;
      const targetHeadZ = -0.22 + (mouseX * 0.12);
      robotInstance.headGroup.rotation.y += (targetHeadY - robotInstance.headGroup.rotation.y) * 0.08;
      robotInstance.headGroup.rotation.x += (targetHeadX - robotInstance.headGroup.rotation.x) * 0.08;
      robotInstance.headGroup.rotation.z += (targetHeadZ - robotInstance.headGroup.rotation.z) * 0.08;

      // HUD rings rotation
      hudRing1.rotation.z = elapsedTime * 0.5;
      hudRing2.rotation.z = -elapsedTime * 0.35;

      // ESP32 floating rotation
      esp32Group.rotation.x = Math.sin(elapsedTime * 1.2) * 0.2 + 0.3;
      esp32Group.rotation.y = elapsedTime * 0.5;
      esp32Group.position.y = (window.innerWidth < 768 ? 1.4 : 0.5) + Math.sin(elapsedTime * 1.5) * 0.06;

      // Floating chips movement
      floatingChips.forEach((chip, idx) => {
        chip.rotation.x += 0.01 * (idx % 2 === 0 ? 1 : -1);
        chip.rotation.y += 0.015;
        chip.position.y += Math.sin(elapsedTime * 2 + idx) * 0.002;
      });

      // Ambient particle drift
      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchmove', handleTouchMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12"
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        id="hero-3d-canvas-container"
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsHovering3D(true)}
        onMouseLeave={() => setIsHovering3D(false)}
        title="Click and drag to rotate the realistic 3D robot and engineering elements"
      />

      {/* Cyber Grid & Ambient Lighting Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#040812] via-transparent to-[#040812]/70 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#040812]/90 via-[#040812]/40 to-transparent pointer-events-none z-10" />

      {/* Interactive 3D Component Inspection Hotspot Markers (Desktop) */}
      <div className="absolute inset-0 pointer-events-none z-20 hidden lg:block overflow-hidden">
        {HERO_HOTSPOTS.map((hotspot) => {
          const isActive = activeHotspot?.id === hotspot.id;
          return (
            <div
              key={hotspot.id}
              style={{
                top: `${hotspot.screenPos.y}%`,
                left: `${hotspot.screenPos.x}%`,
              }}
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
            >
              {/* Hotspot Target Button */}
              <button
                id={`hotspot-${hotspot.id}`}
                onClick={() => {
                  sound.playClick();
                  setActiveHotspot(isActive ? null : hotspot);
                }}
                onMouseEnter={() => sound.playHover()}
                className={`relative p-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer group ${
                  isActive
                    ? 'bg-cyan-950/90 border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.6)] scale-110'
                    : 'bg-slate-950/70 border border-slate-700/80 hover:border-cyan-400/80 hover:scale-105'
                }`}
                title={`Inspect ${hotspot.label}`}
              >
                {/* Ping wave */}
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-40 pointer-events-none"
                  style={{ backgroundColor: hotspot.accentColor }}
                />

                <div className="relative flex items-center justify-center">
                  {hotspot.icon}
                </div>

                {/* Subsystem Pill Label */}
                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hotspot.accentColor }} />
                  <span>{hotspot.label}</span>
                </div>
              </button>

              {/* Connected Holographic Inspection Card */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 p-4 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 text-left font-mono text-xs shadow-[0_0_30px_rgba(0,240,255,0.25)] z-40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                          {hotspot.label}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspot(null);
                        }}
                        className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {hotspot.description}
                    </p>

                    <div className="space-y-1 pt-1.5 border-t border-slate-800/80">
                      <span className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider block">
                        KEY ARCHITECTURAL HIGHLIGHTS:
                      </span>
                      {hotspot.specs.map((sp, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{sp}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Hero Content HUD Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Text & Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 space-y-5 text-left"
        >
          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 font-mono text-xs shadow-[0_0_20px_rgba(0,240,255,0.25)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="tracking-wide font-semibold">{PERSONAL_INFO.status}</span>
          </motion.div>

          {/* Main Hero Typography */}
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-sm font-mono tracking-widest text-slate-400 flex items-center gap-2 uppercase"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>ROBOTICS & EMBEDDED ENGINEERING LABORATORY</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-[var(--text-primary)] font-display leading-tight sm:leading-none"
            >
              Hi, I'm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 text-glow-cyan">
                {PERSONAL_INFO.name}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl sm:text-2xl font-semibold text-[var(--text-secondary)] font-display tracking-wide"
            >
              {PERSONAL_INFO.title}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs sm:text-sm text-cyan-400"
            >
              <span className="px-2.5 py-1 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--chip-text)]">
                Embedded Systems
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="px-2.5 py-1 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--chip-text)]">
                IoT
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="px-2.5 py-1 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--chip-text)]">
                AI
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="px-2.5 py-1 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--chip-text)]">
                Robotics
              </span>
            </motion.div>
          </div>

          {/* Brief hook */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl font-mono pt-1"
          >
            Welcome to my 3D Robotics and Embedded Engineering Laboratory. Explore real-time ESP32 hardware telemetry, interactive autonomous robotics, and intelligent edge firmware architectures.
          </motion.p>

          {/* Action Buttons with Magnetic Pull */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              id="hero-explore-btn"
              data-magnetic="true"
              onClick={() => {
                sound.playClick();
                handleExplore();
              }}
              onMouseEnter={() => sound.playHover()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs sm:text-sm font-mono tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>EXPLORE LAB</span>
            </button>

            {onOpenRecruiterBrief && (
              <button
                id="hero-recruiter-brief-btn"
                data-magnetic="true"
                onClick={() => {
                  sound.playClick();
                  onOpenRecruiterBrief();
                }}
                onMouseEnter={() => sound.playHover()}
                className="px-5 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-mono text-xs sm:text-sm font-bold tracking-wider flex items-center gap-2 border border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>RECRUITER 60s BRIEF</span>
              </button>
            )}

            {onOpenCopilot && (
              <button
                id="hero-copilot-btn"
                data-magnetic="true"
                onClick={() => {
                  sound.playClick();
                  onOpenCopilot();
                }}
                onMouseEnter={() => sound.playHover()}
                className="px-5 py-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-mono text-xs sm:text-sm font-bold tracking-wider flex items-center gap-2 border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>AI COPILOT</span>
              </button>
            )}

            <button
              id="hero-resume-btn"
              data-magnetic="true"
              onClick={() => {
                sound.playClick();
                onOpenResume();
              }}
              onMouseEnter={() => sound.playHover()}
              className="px-5 py-3 rounded-xl glass-panel hover:bg-cyan-950/40 text-cyan-400 hover:text-[var(--text-primary)] font-mono text-xs sm:text-sm font-semibold tracking-wider flex items-center gap-2 border border-[var(--border-primary)] shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>RESUME</span>
            </button>
          </motion.div>

          {/* 3D Interaction Tooltip helper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] pt-2"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive 3D Lab: Drag to orbit in 360° • Click glowing hotspot markers on robot to inspect subsystems</span>
          </motion.div>
        </motion.div>

        {/* Right Column: Live Robot Telemetry Widget */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 pointer-events-none flex justify-end"
        >
          <div className="glass-panel p-4 rounded-xl border border-[var(--border-primary)] max-w-xs w-full space-y-3 shadow-[var(--shadow-panel)] backdrop-blur-md hidden sm:block">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[var(--border-subtle)] pb-2">
              <span className="text-purple-400 flex items-center gap-1.5 font-semibold">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ROBOTO ROBOT TELEMETRY
              </span>
              <span className="text-[10px] text-purple-300 font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                ONLINE
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>STATE:</span>
                <span className="text-purple-300 font-semibold">{robotAction}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>HEAD GIMBAL:</span>
                <span className="text-cyan-400 font-bold">6-DOF DUAL SWIVEL</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>VISION ARRAY:</span>
                <span className="text-purple-400 font-bold">STEREO OPTICAL DOME</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>AI INTEGRATION:</span>
                <span className="text-emerald-400 font-semibold">LLM &amp; EMBEDDED</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>CHASSIS FINISH:</span>
                <span className="text-[var(--text-primary)] font-semibold">Indigo Metallic PBR</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] flex justify-between">
              <span>KINEMATICS: GAZE TRACK</span>
              <span>STUDIO: PURPLE RIM</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-auto">
        <button
          id="hero-scroll-indicator"
          onClick={() => {
            sound.playClick();
            handleExplore();
          }}
          className="text-slate-400 hover:text-cyan-300 text-[11px] font-mono tracking-widest uppercase flex flex-col items-center transition-colors cursor-pointer"
        >
          <span>SCROLL TO LAB</span>
          <ArrowDown className="w-4 h-4 animate-bounce mt-1 text-cyan-400" />
        </button>
      </div>
    </section>
  );
};
