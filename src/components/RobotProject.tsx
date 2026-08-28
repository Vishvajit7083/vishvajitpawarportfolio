import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Bot,
  Eye,
  Mic,
  Waves,
  Cpu,
  Sparkles,
  CheckCircle2,
  Play,
  Crosshair,
  Radio,
  Zap,
  Activity,
  Sliders,
  Upload,
  Download,
  Layers,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Compass,
  Maximize2,
  Gauge,
  SlidersHorizontal,
  Target,
  Sparkle
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import { voiceAssistant, VoiceCommandEventDetail } from '../utils/voiceAssistant';
import {
  createIndustrialRobot,
  IndustrialRobotInstance,
  RobotFinish,
  loadGLTFRobotModel,
  InteractiveZoneData
} from '../utils/industrialRobotModel';
import { RobotHUDOverlay } from './RobotHUDOverlay';
import { createLaboratoryEnvironment } from '../utils/labEnvironment';
import { useTheme } from '../context/ThemeContext';

interface HotspotInfo {
  id: string;
  name: string;
  category: 'SENSOR' | 'SERVO' | 'ACTUATOR' | 'CORE';
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  specs: string[];
  cameraTarget: { x: number; y: number; z: number; lookAtY: number };
  color: string;
  telemetry: { label: string; value: string }[];
  jointRef?: string;
  voltage?: string;
}

const HOTSPOTS: HotspotInfo[] = [
  {
    id: 'vision',
    name: 'OpenCV Vision Lenses',
    category: 'SENSOR',
    title: 'OPENCV STEREOSCOPIC VISION SENSORS',
    subtitle: 'Dual Sony IMX High-Speed Image Sensors @ 30 FPS',
    description:
      'Industrial dual-camera stereoscopic optical sensor pod with multi-coated glass lenses and real-time OpenCV matrix acceleration. Delivers 6D pose estimation, Haar Cascade face detection, and geometric edge contour classification for autonomous object interaction.',
    icon: <Eye className="w-5 h-5 text-rose-400" />,
    specs: [
      'Dual stereoscopic Sony IMX optical lenses with anti-reflective coating',
      'Real-time Haar Cascade & MobileNet SSD object detection at 30 FPS',
      'Integrated 532nm precision targeting optical laser rangefinder',
      'Dynamic lighting compensation & automated exposure normalization',
    ],
    cameraTarget: { x: 0, y: 0.6, z: 2.8, lookAtY: 0.5 },
    color: '#ef4444',
    voltage: '3.3V / 5.0V I2C/CSI',
    telemetry: [
      { label: 'FRAME RATE', value: '30.4 FPS' },
      { label: 'CLASSIFIER CONF', value: '98.8%' },
      { label: 'FOCAL LENGTH', value: '3.6mm f/1.8' },
    ],
  },
  {
    id: 'lidar',
    name: '360° LiDAR Scanner',
    category: 'SENSOR',
    title: '360° TIME-OF-FLIGHT LIDAR TURRET',
    subtitle: 'High-Speed Point-Cloud Spatial Profiling @ 360 RPM',
    description:
      'Continuous rotary Time-of-Flight LiDAR scanner spinning at 360 RPM with pulsed laser diodes. Constructs real-time 360° point-cloud depth maps up to 12 meters to detect dynamic obstacles and compute SLAM navigation trajectories.',
    icon: <Radio className="w-5 h-5 text-rose-500" />,
    specs: [
      'Continuous high-speed 360° rotary LiDAR scanner @ 360 RPM',
      'ToF pulsed laser diode with 12m detection radius (1mm resolution)',
      'Real-time 2D/3D SLAM spatial map reconstruction pipeline',
      'Direct DMA UART interface with FreeRTOS kernel scheduler',
    ],
    cameraTarget: { x: 0, y: 0.8, z: 2.9, lookAtY: 0.7 },
    color: '#f43f5e',
    voltage: '5.0V DC / UART',
    telemetry: [
      { label: 'LIDAR SPEED', value: '360 RPM' },
      { label: 'SAMPLE RATE', value: '4,000 pts/s' },
      { label: 'RANGE RADIUS', value: '12.0 METERS' },
    ],
  },
  {
    id: 'ultrasonic',
    name: 'HC-SR04 Ultrasonic Radar',
    category: 'SENSOR',
    title: 'BROW DUAL HC-SR04 ULTRASONIC ARRAY',
    subtitle: '40kHz Acoustic Pulse Proximity Profiler',
    description:
      'Dual ultrasonic transducer pair mounted in the sensor head brow emitting 40kHz sonic waves. Provides deterministic obstacle proximity readings from 2cm to 400cm to trigger emergency deceleration safety loops.',
    icon: <Waves className="w-5 h-5 text-cyan-400" />,
    specs: [
      'Dual HC-SR04 ultrasonic transducer pair in brow unit',
      'Deterministic 2cm – 400cm range profiling with 3mm precision',
      'Real-time echo time-to-distance conversion on FreeRTOS hardware timer',
      'Dynamic deceleration & emergency hardware stop safety loop',
    ],
    cameraTarget: { x: 0, y: 0.5, z: 2.9, lookAtY: 0.4 },
    color: '#00f0ff',
    voltage: '5.0V DC / GPIO',
    telemetry: [
      { label: 'PULSE FREQ', value: '40.0 kHz' },
      { label: 'PRECISION', value: '± 3.0 mm' },
      { label: 'SAFETY ZONE', value: '30 cm BUFFER' },
    ],
  },
  {
    id: 'servo_shoulder',
    name: 'Shoulder Servo (J2)',
    category: 'SERVO',
    title: 'HARMONIC DRIVE SHOULDER SERVO ACTUATOR',
    subtitle: 'Joint 2 • Zero-Backlash High-Torque Brushless Motor',
    description:
      'High-torque industrial brushless DC servo motor paired with a 100:1 zero-backlash harmonic drive reduction gearbox and magnetic quadrature optical encoder for sub-millimeter positional repeatability.',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    specs: [
      'Zero-backlash strain-wave harmonic reduction gearbox (100:1 ratio)',
      'Integrated 14-bit magnetic absolute position encoder',
      'Dynamic PID current loop with regenerative braking resistor',
      'Machined aluminum-alloy heat dissipation fins & copper bushings',
    ],
    cameraTarget: { x: 0.4, y: -0.1, z: 2.7, lookAtY: -0.2 },
    color: '#f59e0b',
    jointRef: 'Joint 2 (Shoulder Pitch)',
    voltage: '24V DC / 8.5A Peak',
    telemetry: [
      { label: 'PEAK TORQUE', value: '42.0 Nm' },
      { label: 'POSITION ENC', value: '14-BIT ABS' },
      { label: 'MOTOR TEMP', value: '38.4 °C' },
    ],
  },
  {
    id: 'servo_elbow',
    name: 'Elbow Servo (J3)',
    category: 'SERVO',
    title: 'HIGH-SPEED BRUSHLESS ELBOW SERVO ACTUATOR',
    subtitle: 'Joint 3 • Direct Rotary Servo with Thermal Sink',
    description:
      'Precision brushless servo motor controlling the forearm articulation. Features high-speed velocity profiles, integrated thermistor feedback, and dual angular contact ball bearings.',
    icon: <Cpu className="w-5 h-5 text-amber-300" />,
    specs: [
      'High-speed BLDC rotary servo motor with planetary gearing',
      'Internal NTC thermistor thermal protection monitoring',
      'Digital CAN-Bus velocity/position servo feedback loop',
      'Hardened steel output shaft with sealed needle bearings',
    ],
    cameraTarget: { x: 0.3, y: 0.5, z: 2.8, lookAtY: 0.4 },
    color: '#fbbf24',
    jointRef: 'Joint 3 (Elbow Flex)',
    voltage: '24V DC / 6.0A Peak',
    telemetry: [
      { label: 'OUTPUT TORQUE', value: '28.5 Nm' },
      { label: 'SERVO LOOP', value: '1,000 Hz' },
      { label: 'BACKLASH', value: '< 1.2 arcmin' },
    ],
  },
  {
    id: 'hydraulic',
    name: 'Hydraulic Balance Piston',
    category: 'ACTUATOR',
    title: 'DUAL-ACTING HYDRAULIC COUNTERBALANCE PISTON',
    subtitle: 'Chrome-Plated Fluid Damper & Gravity Compensation',
    description:
      'High-pressure fluid-damped hydraulic counterbalance piston engineered to offset payload gravitational torque on the bicep boom arm, reducing motor current draw by up to 65% during heavy manipulation.',
    icon: <Activity className="w-5 h-5 text-cyan-300" />,
    specs: [
      'Mirror-finish hard chrome plated high-tensile cylinder rod',
      'CNC-machined anodized aluminum fluid reservoir casing',
      'Dual polyurethane high-pressure seals rated to 150 bar',
      'Passive mechanical gravity compensation geometry',
    ],
    cameraTarget: { x: 0.3, y: 0.2, z: 2.6, lookAtY: 0.1 },
    color: '#38bdf8',
    voltage: 'Hydraulic Passive / Pressure Monitored',
    telemetry: [
      { label: 'PRESSURE', value: '120 BAR' },
      { label: 'STROKE LENGTH', value: '140 mm' },
      { label: 'LOAD OFFSET', value: '65% DAMPING' },
    ],
  },
  {
    id: 'gripper',
    name: 'Bionic Gripper & Laser',
    category: 'ACTUATOR',
    title: 'END-EFFECTOR BIONIC PARALLEL GRIPPER',
    subtitle: 'Carbon-Reinforced Jaws with Laser Diode Guide',
    description:
      'Dual-finger parallel servo gripper with carbon-fiber textured contact pads and integrated 532nm targeting laser beam. Equipped with tactile force feedback strain gauges to securely grasp fragile items without slippage.',
    icon: <Crosshair className="w-5 h-5 text-emerald-400" />,
    specs: [
      'Dual parallel moving jaw fingers with carbon fiber friction pads',
      'Miniature coreless servo actuator with lead screw drive mechanism',
      '532nm cyan laser targeting pointer for visual coordinate calibration',
      'Integrated tactile strain gauge force sensor (0.1N – 25N)',
    ],
    cameraTarget: { x: 0, y: 1.1, z: 2.8, lookAtY: 1.0 },
    color: '#10b981',
    voltage: '12V DC / PWM',
    telemetry: [
      { label: 'CLAMP FORCE', value: '18.5 N' },
      { label: 'JAW STROKE', value: '0 – 80 mm' },
      { label: 'LASER STATUS', value: 'ACTIVE (532nm)' },
    ],
  },
  {
    id: 'freertos_core',
    name: 'FreeRTOS Master ECU',
    category: 'CORE',
    title: 'EMBEDDED FREERTOS INDUSTRIAL MASTER ECU',
    subtitle: '32-Bit Dual-Core Controller & CAN-Bus Hub',
    description:
      'Central industrial microcontroller running deterministic FreeRTOS kernels. Handles multi-threaded sensor acquisition, Forward/Inverse Kinematics (FK/IK) calculations, hardware watchdog timers, and CAN-Bus actuator communication.',
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    specs: [
      'FreeRTOS v10.4 deterministic pre-emptive multi-tasking kernel',
      'High-speed ISO 11898 CAN-Bus transceiver network (1 Mbps)',
      'Deterministic 10ms cycle safety watchdog timer interrupts',
      '6-DOF Forward & Inverse Kinematics matrix algebraic solver',
    ],
    cameraTarget: { x: 0, y: -0.4, z: 2.9, lookAtY: -0.5 },
    color: '#c084fc',
    voltage: '24V Input / 5V & 3.3V Regulated',
    telemetry: [
      { label: 'RTOS KERNEL', value: 'FreeRTOS v10.4' },
      { label: 'CYCLE LOAD', value: '22% CPU' },
      { label: 'CAN-BUS BAUD', value: '1.0 Mbps' },
    ],
  },
];

export const RobotProject: React.FC = () => {
  const { theme, themeConfig } = useTheme();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeHotspotId, setActiveHotspotId] = useState<string>('vision');
  const [selectedFinish, setSelectedFinish] = useState<RobotFinish>('industrial_orange');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'SENSOR' | 'SERVO' | 'ACTUATOR' | 'CORE'>('ALL');
  const [controlMode, setControlMode] = useState<'autonomous' | 'manual'>('autonomous');
  const [laserActive, setLaserActive] = useState<boolean>(true);
  const [isSimulatingVision, setIsSimulatingVision] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState<string>(
    'ROS2 / FreeRTOS Industrial Robotic Cell online. PBR shaders compiled. Click any 3D part to inspect.'
  );
  const [obstacleDistance, setObstacleDistance] = useState(48);
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);
  const [isEngaged, setIsEngaged] = useState<boolean>(true);
  const [robotRotation, setRobotRotation] = useState({ x: 0, y: 0 });
  const engagementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEngagement = () => {
    setIsEngaged(true);
    if (engagementTimerRef.current) {
      clearTimeout(engagementTimerRef.current);
    }
    engagementTimerRef.current = setTimeout(() => {
      setIsEngaged(false);
    }, 4000);
  };

  // Manual Kinematics Joint Angles (radians / normalized)
  const [manualJoints, setManualJoints] = useState({
    waist: 0,
    shoulder: -0.2,
    elbow: 0.4,
    wristPitch: 0,
    gripperOpen: 0.3,
  });

  // Voice Command & 3D Feature States ('Rotate', 'Exploded View', 'Reset')
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isExplodedView, setIsExplodedView] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const isAutoRotatingRef = useRef(false);
  const isExplodedViewRef = useRef(false);
  const explodeProgressRef = useRef(0);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const activeHotspot = HOTSPOTS.find((h) => h.id === activeHotspotId) || HOTSPOTS[0];

  // Ref to hold the active robot instance
  const robotInstanceRef = useRef<IndustrialRobotInstance | null>(null);

  // Sync refs with states
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    isExplodedViewRef.current = isExplodedView;
  }, [isExplodedView]);

  const handleToggleVoice = () => {
    sound.playClick();
    if (!voiceAssistant.isSupported()) {
      alert('Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    voiceAssistant.toggleListening();
  };

  const handleToggleRotate = (explicitState?: boolean) => {
    sound.playClick();
    const nextState = explicitState !== undefined ? explicitState : !isAutoRotatingRef.current;
    setIsAutoRotating(nextState);
    isAutoRotatingRef.current = nextState;
    const msg = nextState ? '3D model auto-rotation activated.' : '3D model auto-rotation stopped.';
    setSimulatedLog(`VOICE/MANUAL: [AUTO-ROTATE ${nextState ? 'ON' : 'OFF'}]`);
    voiceAssistant.speak(msg);
  };

  const handleToggleExplodedView = (explicitState?: boolean) => {
    sound.playClick();
    const nextState = explicitState !== undefined ? explicitState : !isExplodedViewRef.current;
    setIsExplodedView(nextState);
    isExplodedViewRef.current = nextState;
    const msg = nextState
      ? 'Exploded view subsystem disassembly engaged. Internal actuators and sensors separated.'
      : 'Reassembling robot mechanical components.';
    setSimulatedLog(`VOICE/MANUAL: [EXPLODED VIEW ${nextState ? 'ENGAGED' : 'COLLAPSED'}]`);
    voiceAssistant.speak(msg);
  };

  const handleResetModel = () => {
    sound.playClick();
    setIsAutoRotating(false);
    isAutoRotatingRef.current = false;
    setIsExplodedView(false);
    isExplodedViewRef.current = false;
    setActiveHotspotId('vision');
    setManualJoints({
      waist: 0,
      shoulder: -0.2,
      elbow: 0.4,
      wristPitch: 0,
      gripperOpen: 0.3,
    });
    if (robotGroupRef.current) {
      robotGroupRef.current.rotation.set(0, 0, 0);
      setRobotRotation({ x: 0, y: 0 });
    }
    setSimulatedLog('SYSTEM RESET: Joints zeroed, camera returned to nominal coordinates.');
    voiceAssistant.speak('Robot kinematic joints and viewport reset to default home position.');
  };

  const handleVoiceTrigger = (cmd: string) => {
    sound.playClick();
    setVoiceTranscript(cmd);
    voiceAssistant.handleFinalTranscript(cmd, 'robot');
  };

  // Voice Assistant and Custom Event Listener
  useEffect(() => {
    const unsubscribe = voiceAssistant.subscribe((state) => {
      setIsVoiceListening(state.isListening);
      if (state.transcript) setVoiceTranscript(state.transcript);
    });

    const handleVoiceCommandEvent = (e: Event) => {
      const customEvent = e as CustomEvent<VoiceCommandEventDetail>;
      const action = customEvent.detail?.action;
      const transcript = (customEvent.detail?.transcript || '').toLowerCase();

      if (action === 'robot_rotate' || transcript.includes('rotate') || transcript.includes('spin')) {
        handleToggleRotate();
      } else if (
        action === 'robot_explode' ||
        transcript.includes('explode') ||
        transcript.includes('exploded') ||
        transcript.includes('disassemble')
      ) {
        handleToggleExplodedView();
      } else if (
        action === 'robot_reset' ||
        transcript.includes('reset') ||
        transcript.includes('home position') ||
        transcript.includes('zero')
      ) {
        handleResetModel();
      } else if (action === 'robot_laser' || transcript.includes('laser')) {
        setLaserActive((prev) => !prev);
        setSimulatedLog('VOICE COMMAND: [LASER BEAM TOGGLED]');
      }
    };

    window.addEventListener('portfolio:voice-command', handleVoiceCommandEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('portfolio:voice-command', handleVoiceCommandEvent);
    };
  }, []);

  // Initialize High-Fidelity 3D Scene with Laboratory Lighting, PBR Materials & Raycasting
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;

    // 1. Scene & Atmosphere Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.6, 4.0);
    cameraRef.current = camera;

    // 3. High-Performance WebGL Renderer with ACESFilmic Tone Mapping & Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = selectedFinish === 'defense_carbon' ? 1.55 : selectedFinish === 'titanium_stealth' ? 1.5 : 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Generate High-Dynamic Range Laboratory Environment Map
    const labEnvTexture = createLaboratoryEnvironment(renderer, {
      theme: 'cyber_lab',
      rimColor:
        selectedFinish === 'cyber_lab_white'
          ? 0x38bdf8
          : selectedFinish === 'defense_carbon'
          ? 0x00f0ff
          : selectedFinish === 'titanium_stealth'
          ? 0x60a5fa
          : 0x00f0ff,
    });
    scene.environment = labEnvTexture;

    // 5. Multi-Point Engineer's Laboratory Studio Lighting Rig with Dynamic Intensities
    // Dynamic Lighting Calibration per Finish Theme
    const isStealth = selectedFinish === 'titanium_stealth';
    const isCarbon = selectedFinish === 'defense_carbon';
    const isLabWhite = selectedFinish === 'cyber_lab_white';

    const ambientLight = new THREE.AmbientLight(
      0x0e1b2e,
      isLabWhite ? 2.2 : isStealth ? 1.4 : isCarbon ? 1.2 : 1.7
    );
    scene.add(ambientLight);

    // Key Lab Overhead Spotlight
    const keySpotlight = new THREE.SpotLight(
      0xffffff,
      isCarbon ? 5.8 : isStealth ? 5.4 : isLabWhite ? 4.4 : 5.0,
      16,
      Math.PI / 3.8,
      0.35,
      1.1
    );
    keySpotlight.position.set(2.8, 5.5, 3.2);
    keySpotlight.castShadow = true;
    keySpotlight.shadow.mapSize.width = 1024;
    keySpotlight.shadow.mapSize.height = 1024;
    keySpotlight.shadow.bias = -0.0001;
    scene.add(keySpotlight);

    // Cyan Engineering Grazing Rim Light
    const cyanRimLight = new THREE.DirectionalLight(
      0x00f0ff,
      isCarbon ? 4.2 : isStealth ? 3.6 : isLabWhite ? 2.2 : 3.0
    );
    cyanRimLight.position.set(-3.5, 2.5, -2.5);
    scene.add(cyanRimLight);

    // Purple Telemetry Fill Light
    const purpleFillLight = new THREE.PointLight(
      0xa855f7,
      isCarbon ? 3.5 : isStealth ? 3.0 : 2.5,
      12
    );
    purpleFillLight.position.set(-2.5, 1.5, 2.0);
    scene.add(purpleFillLight);

    // Warm Accent Diagnostic Spotlight
    const amberAccentLight = new THREE.PointLight(
      0xf59e0b,
      isLabWhite ? 2.8 : 2.2,
      8
    );
    amberAccentLight.position.set(3.0, -0.5, 2.0);
    scene.add(amberAccentLight);

    // 5. High-Precision Laboratory Floor Grid with Shadows
    const gridHelper = new THREE.GridHelper(20, 20, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -1.5;
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const floorShadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.ShadowMaterial({ opacity: 0.5 })
    );
    floorShadowPlane.rotation.x = -Math.PI / 2;
    floorShadowPlane.position.y = -1.505;
    floorShadowPlane.receiveShadow = true;
    scene.add(floorShadowPlane);

    // 6. Create CAD-Grade Industrial Autonomous Robot Instance
    const robotInstance = createIndustrialRobot(1.05, selectedFinish);
    robotInstanceRef.current = robotInstance;
    const robotGroup = robotInstance.rootGroup;
    robotGroupRef.current = robotGroup;
    scene.add(robotGroup);

    // Enable shadows across all robot parts
    robotGroup.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    // 7. Raycasting for Interactive Clickable Zones on 3D Meshes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse Orbit Drag Controls & Raycast Selection
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let hasMovedMuch = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      hasMovedMuch = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      prevX = e.clientX;
      prevY = e.clientY;
      triggerEngagement();
    };

    const onMouseMove = (e: MouseEvent) => {
      triggerEngagement();
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Hover Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(robotInstance.clickableObjects, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const compId = hit.userData.componentId;
        const compName = hit.userData.componentName || compId;
        setHoveredPartName(compName);
        container.style.cursor = 'pointer';
      } else {
        setHoveredPartName(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }

      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      if (Math.abs(e.clientX - dragStartX) > 4 || Math.abs(e.clientY - dragStartY) > 4) {
        hasMovedMuch = true;
      }

      robotGroup.rotation.y += dx * 0.008;
      robotGroup.rotation.x = Math.max(-0.4, Math.min(0.4, robotGroup.rotation.x + dy * 0.004));
      setRobotRotation({ x: robotGroup.rotation.x, y: robotGroup.rotation.y });
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!hasMovedMuch && container.contains(e.target as Node)) {
        // Treat as direct 3D Component Click
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(robotInstance.clickableObjects, true);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const compId = hit.userData.componentId;
          if (compId) {
            sound.playClick();
            setActiveHotspotId(compId);
            triggerEngagement();
            setSimulatedLog(`CLICKED 3D ZONE: [${compId.toUpperCase()}] - Focused camera & telemetry.`);
          }
        }
      }
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
        triggerEngagement();
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      triggerEngagement();
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - prevX;
      const dy = e.touches[0].clientY - prevY;
      robotGroup.rotation.y += dx * 0.008;
      robotGroup.rotation.x = Math.max(-0.4, Math.min(0.4, robotGroup.rotation.x + dy * 0.004));
      setRobotRotation({ x: robotGroup.rotation.x, y: robotGroup.rotation.y });
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. Master Animation Loop with Smooth Subsystem Camera Zoom
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera Smooth Interpolation towards Active Clicked Subsystem
      const targetPos = activeHotspot.cameraTarget;
      camera.position.x += (targetPos.x - camera.position.x) * 0.04;
      camera.position.y += (targetPos.y - camera.position.y) * 0.04;
      camera.position.z += (targetPos.z - camera.position.z) * 0.04;
      camera.lookAt(0, targetPos.lookAtY, 0);

      // Auto-Rotation when triggered via voice or toggle
      if (isAutoRotatingRef.current && !isDragging) {
        robotGroup.rotation.y += 0.012;
        setRobotRotation({ x: robotGroup.rotation.x, y: robotGroup.rotation.y });
      }

      // Exploded View Subsystem Mechanical Separation Animation
      const targetExplode = isExplodedViewRef.current ? 1.0 : 0.0;
      explodeProgressRef.current += (targetExplode - explodeProgressRef.current) * 0.07;
      const ep = explodeProgressRef.current;

      if (robotInstance) {
        // Displace Base Turntable downwards
        robotInstance.baseTurntable.position.y = -ep * 0.22;
        // Shoulder Joint lifts upward
        robotInstance.shoulderJoint.position.y = ep * 0.35;
        // Elbow Joint elevates further
        robotInstance.elbowJoint.position.y = ep * 0.48;
        // Forearm & Actuators extend outward
        robotInstance.forearm.position.z = ep * 0.42;
        // Head Sensor Pod rises above chassis
        robotInstance.headSensorPod.position.y = ep * 0.52;
        // Gripper Claws displace symmetrically
        robotInstance.gripperLeft.position.x = -ep * 0.32;
        robotInstance.gripperRight.position.x = ep * 0.32;
      }

      // Run Kinematic Simulation if in autonomous mode
      if (controlMode === 'autonomous') {
        robotInstance.animate(elapsedTime, activeHotspotId, laserActive);
      } else {
        // Apply manual slider joint angles
        robotInstance.setJointAngles(manualJoints);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('touchstart', onTouchStart);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeHotspotId, controlMode, manualJoints, laserActive, selectedFinish]);

  // Update robot finish when user switches theme
  useEffect(() => {
    if (robotInstanceRef.current) {
      robotInstanceRef.current.setFinish(selectedFinish);
    }
  }, [selectedFinish]);

  // Highlight component on active change
  useEffect(() => {
    if (robotInstanceRef.current) {
      robotInstanceRef.current.highlightComponent(activeHotspotId);
    }
  }, [activeHotspotId]);

  // Handle GLTF Binary (.glb) Export / Download
  const handleExportGLTF = async () => {
    if (!robotInstanceRef.current) return;
    setIsExporting(true);
    sound.playLaserScan();
    try {
      const blob = await robotInstanceRef.current.exportGLTF('industrial_robot_pbr.glb');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `industrial_6dof_robot_${selectedFinish}.glb`;
      link.click();
      URL.revokeObjectURL(url);
      sound.playSuccessChime();
      setSimulatedLog('GLTF EXPORT COMPLETE: Binary .glb robot model downloaded with full PBR node hierarchy.');
    } catch (e) {
      sound.playErrorTone();
      setSimulatedLog('GLTF Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Custom GLTF / GLB File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    sound.playLaserScan();
    const url = URL.createObjectURL(file);

    loadGLTFRobotModel(
      url,
      (customScene) => {
        if (canvasContainerRef.current) {
          sound.playSuccessChime();
          setSimulatedLog(`CUSTOM GLTF MESH LOADED: "${file.name}" - PBR Shaders & ACESFilmic applied.`);
        }
      },
      () => {
        sound.playErrorTone();
        setSimulatedLog('GLTF Parse Error. Reverting to precision CAD industrial robot.');
      }
    );
  };

  // Voice / Vision Simulation trigger
  const runSimulation = () => {
    sound.playLaserScan();
    triggerEngagement();
    setIsSimulatingVision(true);
    setSimulatedLog('INITIALIZING OPENCV 6-DOF POSE ESTIMATION PIPELINE...');

    setTimeout(() => {
      setSimulatedLog('OBJECT DETECTED: [PAYLOAD_BOX_A, POSE_XYZ: (0.12, 0.45, 1.84), CONF: 98.8%]');
      sound.playBootBeep(880, 0.05);
    }, 600);

    setTimeout(() => {
      setSimulatedLog(
        `SERVO & KINEMATICS: Inverse Kinematics target reached. Ultrasonic path clear at ${obstacleDistance}cm.`
      );
      sound.playSuccessChime();
      setIsSimulatingVision(false);
    }, 1600);
  };

  // Filtered hotspots
  const filteredHotspots =
    filterCategory === 'ALL'
      ? HOTSPOTS
      : HOTSPOTS.filter((h) => h.category === filterCategory);

  return (
    <section id="projects" className="relative w-full py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>// FEATURED PROJECT 01 // INDUSTRIAL 6-DOF ROBOT & EMBEDDED RTOS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-wide mt-1">
            AI-ASSISTED ROBOT FOR PERSONAL ASSISTANCE
          </h2>
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs text-slate-300">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              YEAR: 2025
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              TECH: Python • OpenCV • IoT • C • FreeRTOS
            </span>
            <span className="text-slate-400">PBR GLTF 6-DOF Industrial Cell with Clickable Zones</span>
          </div>
        </div>

        {/* Industrial Finish Selector */}
        <div className="flex flex-wrap items-center gap-1.5 glass-panel p-1.5 rounded-xl border border-cyan-500/30 font-mono text-xs">
          <span className="text-[10px] text-slate-400 px-1">PBR FINISH:</span>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedFinish('industrial_orange');
            }}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedFinish === 'industrial_orange'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            KUKA ORANGE
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedFinish('titanium_stealth');
            }}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedFinish === 'titanium_stealth'
                ? 'bg-slate-700 text-cyan-300 font-bold border border-cyan-400/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TITANIUM
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedFinish('cyber_lab_white');
            }}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedFinish === 'cyber_lab_white'
                ? 'bg-slate-200 text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LAB WHITE
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedFinish('defense_carbon');
            }}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedFinish === 'defense_carbon'
                ? 'bg-slate-950 text-purple-400 font-bold border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CARBON
          </button>
        </div>
      </div>

      {/* Futuristic Laboratory Scanline Wrapper Container */}
      <div
        id="robot-project-container"
        className="scanline-effect scanline-beam relative p-3 sm:p-6 rounded-3xl glass-panel border border-[var(--border-primary)] shadow-[var(--shadow-panel)] overflow-hidden"
      >
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Laboratory Scanline HUD Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-3 mb-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[var(--text-accent)] font-semibold tracking-wider uppercase">
              // LABORATORY SCANLINE HUD // {themeConfig.name.toUpperCase()}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--chip-text)] text-[10px]">
              60Hz CRT RASTER ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              6-DOF PBR KINEMATICS ENGINE
            </span>
            <span className="text-[var(--text-secondary)] font-bold">[OPERATIONAL]</span>
          </div>
        </div>

        {/* Main 3D Robot Interactive Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: 3D Robot Canvas & Interactive Clickable 3D Hotspots */}
          <div className="lg:col-span-7 glass-panel-glow p-4 sm:p-6 rounded-2xl border border-[var(--border-primary)] flex flex-col relative min-h-[560px]">
            <div className="cyber-corner-tl" />
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <div className="cyber-corner-br" />

            {/* Top Bar with Mode Controls, GLTF Importer & GLTF Exporter */}
            <div className="flex flex-wrap justify-between items-center text-xs font-mono border-b border-slate-800 pb-3 mb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 flex items-center gap-1.5 font-semibold">
                  <Target className="w-4 h-4 text-cyan-400 animate-spin" />
                  INTERACTIVE 3D GLTF ROBOT
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                  CLICKABLE ZONES ACTIVE
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Voice Command Microphone Trigger */}
                <button
                  id="robot-voice-mic-btn"
                  onClick={handleToggleVoice}
                  title={isVoiceListening ? 'Stop Voice Listening' : 'Speak "Rotate", "Exploded View", "Reset" to control robot'}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-all ${
                    isVoiceListening
                      ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse font-bold'
                      : 'bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-cyan-700/70 hover:border-cyan-400'
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isVoiceListening ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
                  <span>{isVoiceListening ? 'VOICE [LISTENING]' : 'VOICE [MIC]'}</span>
                </button>

                {/* Auto-Rotation Toggle */}
                <button
                  id="robot-rotate-btn"
                  onClick={() => handleToggleRotate()}
                  title="Say 'Rotate' or click to toggle continuous 360° 3D auto-rotation"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-all ${
                    isAutoRotating
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
                  <span>ROTATE: {isAutoRotating ? 'ON' : 'OFF'}</span>
                </button>

                {/* Exploded View Mode Toggle */}
                <button
                  id="robot-exploded-btn"
                  onClick={() => handleToggleExplodedView()}
                  title="Say 'Exploded View' or click to disassemble internal engineering components"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-all ${
                    isExplodedView
                      ? 'bg-purple-600 text-white font-bold shadow-[0_0_14px_rgba(168,85,247,0.5)] border border-purple-400'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-purple-800 hover:text-purple-300'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>EXPLODED VIEW: {isExplodedView ? 'ENGAGED' : 'OFF'}</span>
                </button>

                {/* Reset Joint Positions and Viewport */}
                <button
                  id="robot-reset-btn"
                  onClick={handleResetModel}
                  title="Say 'Reset' or click to restore zero kinematics and camera coordinates"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-[11px] cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>

                {/* Toggle Autonomous vs Manual Jigs */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setControlMode(controlMode === 'autonomous' ? 'manual' : 'autonomous');
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-all ${
                    controlMode === 'manual'
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {controlMode === 'manual' ? 'MANUAL JIGS' : 'AUTONOMOUS'}
                </button>

                {/* Laser Beam Toggle */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setLaserActive(!laserActive);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-all ${
                    laserActive
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  LASER: {laserActive ? 'ON' : 'OFF'}
                </button>

                {/* Export GLTF .glb model */}
                <button
                  onClick={handleExportGLTF}
                  disabled={isExporting}
                  title="Download this industrial robot model as standard GLTF (.glb)"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-cyan-800/80 hover:border-cyan-400 text-cyan-300 text-[11px] cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'EXPORTING...' : 'GLTF (.glb)'}</span>
                </button>

                {/* Upload GLTF button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Import custom .gltf / .glb robot mesh"
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".gltf,.glb"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* 3D Canvas Container with Clickable Zones Overlay & Scanline Effect */}
            <div className="relative w-full flex-1 min-h-[380px] rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800 scanline-effect scanline-beam">
            <div
              ref={canvasContainerRef}
              id="robot-3d-canvas"
              className="w-full h-full cursor-grab active:cursor-grabbing"
              title="Click directly on any 3D sensor or servo to inspect, or drag to orbit in 360°"
            />

            {/* Hovered Part Floating Tooltip Badge */}
            {hoveredPartName && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-400/50 font-mono text-xs text-cyan-300 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] pointer-events-none animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>3D ZONE: {hoveredPartName.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400">(CLICK TO INSPECT)</span>
              </div>
            )}

            {/* Interactive Clickable 3D Overlay Hotspot Pins on Robot */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
              <div className="bg-black/80 px-2 py-1 rounded border border-slate-800 font-mono text-[10px] text-slate-400 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-cyan-400" />
                <span>CLICK ANY 3D COMPONENT OR BEACON BELOW:</span>
              </div>
            </div>

            {/* Neural Vision Target Overlay Reticle on top of Canvas */}
            {activeHotspotId === 'vision' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-44 border border-rose-500/60 rounded-lg relative animate-pulse">
                  <div className="absolute top-1 left-1 text-[9px] font-mono text-rose-400 bg-black/70 px-1.5 py-0.5 rounded border border-rose-500/30">
                    OPENCV: TARGET_LOCKED
                  </div>
                  <div className="absolute bottom-1 right-1 text-[9px] font-mono text-emerald-400 bg-black/70 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    POSE: [0.12, 0.45, 1.84]
                  </div>
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-rose-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-rose-400" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-rose-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-rose-400" />
                </div>
              </div>
            )}

            {/* Heads-Up Display (HUD) Cyber Telemetry & Sensor Packets Overlay */}
            <RobotHUDOverlay
              isEngaged={isEngaged}
              activeHotspotId={activeHotspotId}
              activeHotspotName={activeHotspot.name}
              hoveredPartName={hoveredPartName}
              controlMode={controlMode}
              laserActive={laserActive}
              obstacleDistance={obstacleDistance}
              jointAngles={manualJoints}
              robotRotation={robotRotation}
            />

            {/* Manual Kinematics Floating Sliders overlay if in manual mode */}
            {controlMode === 'manual' && (
              <div className="absolute bottom-3 left-3 bg-black/90 p-3 rounded-xl border border-cyan-500/50 backdrop-blur-md font-mono text-[10px] space-y-2 max-w-[210px] pointer-events-auto z-20 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                <div className="flex justify-between text-cyan-300 font-bold border-b border-slate-800 pb-1">
                  <span>6-DOF SERVO JIGS</span>
                  <Sliders className="w-3 h-3 text-cyan-400" />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>WAIST (J1):</span>
                    <span>{manualJoints.waist.toFixed(2)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="-1.5"
                    max="1.5"
                    step="0.05"
                    value={manualJoints.waist}
                    onChange={(e) => {
                      triggerEngagement();
                      setManualJoints({ ...manualJoints, waist: Number(e.target.value) });
                    }}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>SHOULDER (J2):</span>
                    <span>{manualJoints.shoulder.toFixed(2)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="-0.8"
                    max="0.4"
                    step="0.05"
                    value={manualJoints.shoulder}
                    onChange={(e) => {
                      triggerEngagement();
                      setManualJoints({ ...manualJoints, shoulder: Number(e.target.value) });
                    }}
                    className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>ELBOW (J3):</span>
                    <span>{manualJoints.elbow.toFixed(2)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.2"
                    step="0.05"
                    value={manualJoints.elbow}
                    onChange={(e) => {
                      triggerEngagement();
                      setManualJoints({ ...manualJoints, elbow: Number(e.target.value) });
                    }}
                    className="w-full accent-purple-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>GRIPPER CLAMP:</span>
                    <span>{(manualJoints.gripperOpen * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={manualJoints.gripperOpen}
                    onChange={(e) => {
                      triggerEngagement();
                      setManualJoints({ ...manualJoints, gripperOpen: Number(e.target.value) });
                    }}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* In-Scene Voice Command Floating HUD Banner */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-auto flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 font-mono text-xs shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isVoiceListening
                      ? 'bg-rose-500 animate-ping'
                      : isAutoRotating || isExplodedView
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="text-cyan-300 font-bold flex items-center gap-1 text-[11px] shrink-0">
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  VOICE:
                </span>
                <span className="text-slate-300 font-normal truncate text-[11px]">
                  {voiceTranscript ? (
                    <span className="text-white font-semibold">"{voiceTranscript}"</span>
                  ) : isVoiceListening ? (
                    <span className="text-rose-300 font-semibold animate-pulse">
                      Listening... Speak "Rotate", "Exploded View", "Reset"
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Mic standby. Click <strong className="text-cyan-300">VOICE [MIC]</strong> or click triggers below:
                    </span>
                  )}
                </span>
              </div>

              {/* Instant Voice Trigger Quick Action Chips */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleVoiceTrigger('Rotate')}
                  className="px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-800/70 hover:border-cyan-400 text-cyan-300 text-[10px] cursor-pointer transition-all hover:bg-cyan-950"
                  title="Test voice command 'Rotate'"
                >
                  Say "Rotate"
                </button>
                <button
                  onClick={() => handleVoiceTrigger('Exploded View')}
                  className="px-2 py-0.5 rounded bg-slate-900/90 border border-purple-800/70 hover:border-purple-400 text-purple-300 text-[10px] cursor-pointer transition-all hover:bg-purple-950"
                  title="Test voice command 'Exploded View'"
                >
                  Say "Exploded View"
                </button>
                <button
                  onClick={() => handleVoiceTrigger('Reset')}
                  className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 hover:border-slate-400 text-slate-300 text-[10px] cursor-pointer transition-all hover:bg-slate-800"
                  title="Test voice command 'Reset'"
                >
                  Say "Reset"
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Subsystem Hotspots / Clickable Zone Selector */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">FILTER ZONES:</span>
                {(['ALL', 'SENSOR', 'SERVO', 'ACTUATOR', 'CORE'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setFilterCategory(cat);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all ${
                      filterCategory === cat
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <span className="text-cyan-400 text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                8 INTERACTIVE ZONES
              </span>
            </div>

            {/* Clickable Zone Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredHotspots.map((hotspot) => {
                const isActive = activeHotspotId === hotspot.id;
                return (
                  <button
                    key={hotspot.id}
                    id={`robot-hotspot-${hotspot.id}`}
                    onClick={() => {
                      sound.playClick();
                      setActiveHotspotId(hotspot.id);
                      setSimulatedLog(`INSPECTING: [${hotspot.name.toUpperCase()}]`);
                    }}
                    onMouseEnter={() => sound.playHover()}
                    className={`p-2 rounded-lg text-left font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/90 border-cyan-400 border shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                        : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                        {hotspot.icon}
                        <span className="truncate">{hotspot.name}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          hotspot.category === 'SENSOR'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : hotspot.category === 'SERVO'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : hotspot.category === 'ACTUATOR'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                        }`}
                      >
                        {hotspot.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {hotspot.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Technical Explanatory UI Panels & Interactive Test Terminal */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Active Subsystem Detail Card */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 relative space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <div className="cyber-corner-tl" />
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <div className="cyber-corner-br" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {activeHotspot.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-white">
                      {activeHotspot.title}
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-cyan-400">
                    {activeHotspot.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {activeHotspot.category}
              </span>
            </div>

            {/* Core Description Verbatim */}
            <p className="text-sm font-mono text-slate-200 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              {activeHotspot.description}
            </p>

            {/* Subsystem Specifications */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 font-semibold">
                <span>ENGINEERING SPECIFICATIONS:</span>
                {activeHotspot.voltage && (
                  <span className="text-amber-400 text-[10px]">{activeHotspot.voltage}</span>
                )}
              </div>
              <div className="space-y-1.5">
                {activeHotspot.specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Telemetry Chips */}
            <div className="pt-2 grid grid-cols-3 gap-2 border-t border-slate-800/80">
              {activeHotspot.telemetry.map((t, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950/70 border border-slate-800 font-mono text-[10px]">
                  <span className="text-slate-500 block truncate">{t.label}</span>
                  <span className="text-cyan-300 font-bold truncate">{t.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation & Test Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                INTERACTIVE ROBOTIC TEST TERMINAL
              </span>
              <button
                id="test-robot-simulation-btn"
                onClick={runSimulation}
                disabled={isSimulatingVision}
                className="px-2.5 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {isSimulatingVision ? 'CALCULATING...' : 'TRIGGER DIAGNOSTIC'}
              </button>
            </div>

            {/* Live Terminal Log Output */}
            <div className="bg-black/70 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="text-[11px] text-slate-500">// ROBOT OS BUS TELEMETRY:</div>
              <div className="text-cyan-300 flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {simulatedLog}
              </div>
            </div>

            {/* Distance Slider Sensor */}
            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>ULTRASONIC PROXIMITY SENSOR (HC-SR04):</span>
                <span
                  className={`font-bold ${
                    obstacleDistance < 20 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {obstacleDistance} cm {obstacleDistance < 20 ? '[CRITICAL WARNING]' : '[CLEAR]'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                value={obstacleDistance}
                onChange={(e) => {
                  triggerEngagement();
                  const val = Number(e.target.value);
                  setObstacleDistance(val);
                  if (val < 20) {
                    sound.playErrorTone();
                  }
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                <span>5cm (CRITICAL COLLISION)</span>
                <span>200cm (OPEN PATH)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};
