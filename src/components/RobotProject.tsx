import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  RotateCcw,
  RotateCw,
  Layers,
  Terminal,
  Code2,
  SlidersHorizontal,
  Target,
  ShieldCheck,
  Compass,
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  Volume2,
  BatteryCharging,
  Gauge,
  HelpCircle,
  Camera,
  Info,
  Flame,
  AlertTriangle,
  Navigation,
  ShieldAlert,
  Disc,
  Radar
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import { voiceAssistant, VoiceCommandEventDetail } from '../utils/voiceAssistant';
import {
  createWheeledRobot,
  WheeledRobotInstance,
  WheeledRobotFinish,
  WHEELED_ROBOT_COMPONENTS,
  InteractiveComponentInfo
} from '../utils/wheeledRobotModel';
import { createRoboticsArena, ArenaEnvironment } from '../utils/robotArena';
import {
  DifferentialDriveSimulation,
  TelemetryData,
  DriveControlCommand,
  ObstacleState,
  AutoNavState
} from '../utils/differentialDrivePhysics';
import { createLaboratoryEnvironment } from '../utils/labEnvironment';
import { useTheme } from '../context/ThemeContext';
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

const TECH_CARDS = [
  {
    id: 'freertos',
    name: 'Dual-Core FreeRTOS SMP',
    category: 'EMBEDDED KERNEL',
    description:
      'Deterministic real-time multitasking kernel. Core 0 manages sensor acquisition & telemetry while Core 1 executes 1kHz motor PWM PID loops.',
    icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    tags: ['1 kHz Motor Loop', 'Dual-Core SMP', 'Deterministic'],
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/30 hover:border-cyan-400',
  },
  {
    id: 'opencv',
    name: 'OpenCV & Computer Vision',
    category: 'AI & PERCEPTION',
    description:
      'Raspberry Pi vision pipeline executing Haar Cascade facial tracking, color segmentation, and visual obstacle mapping at 30 FPS.',
    icon: <Eye className="w-5 h-5 text-emerald-400" />,
    tags: ['30 FPS Pipeline', 'Object Tracking', 'Haar Cascades'],
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30 hover:border-emerald-400',
  },
  {
    id: 'sonar',
    name: '40kHz Ultrasonic Sonar',
    category: 'SENSING & RADAR',
    description:
      'Microsecond time-of-flight acoustic ranging algorithm with SG90 servo 180° spatial radar sweep for collision prevention.',
    icon: <Radio className="w-5 h-5 text-purple-400" />,
    tags: ['40 kHz Ultrasound', '±3mm Accuracy', '180° Sweep'],
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30 hover:border-purple-400',
  },
  {
    id: 'hbridge',
    name: 'Dual H-Bridge Motor Control',
    category: 'POWER & ACTUATION',
    description:
      'L298N high-current driver with hardware PWM speed regulation, regenerative braking, and differential skid-steering kinematics.',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    tags: ['PWM Modulation', 'Skid Steering', '2A Peak Rail'],
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30 hover:border-amber-400',
  },
  {
    id: 'iot_telemetry',
    name: 'IoT & Telemetry Stack',
    category: 'CONNECTIVITY',
    description:
      'Bidirectional WebSocket & MQTT telemetry streams broadcasting real-time wheel RPM, sonar distance, and battery health to remote web dashboards.',
    icon: <Waves className="w-5 h-5 text-sky-400" />,
    tags: ['MQTT Pub/Sub', 'WebSockets', 'Low-Latency Bus'],
    color: 'from-sky-500/20 to-sky-500/5',
    border: 'border-sky-500/30 hover:border-sky-400',
  },
  {
    id: 'embedded_c',
    name: 'Bare-Metal C / C++ Firmware',
    category: 'LOW-LEVEL FIRMWARE',
    description:
      'Direct register-level timer interrupts, hardware input capture for echo pulse width calculation, and DMA memory access.',
    icon: <Terminal className="w-5 h-5 text-rose-400" />,
    tags: ['Hardware Timers', '<5µs ISR', 'HAL Drivers'],
    color: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-500/30 hover:border-rose-400',
  },
];

export type CameraMode = 'follow' | 'orbit' | 'tactical' | 'sonar_pov';

export const RobotProject: React.FC = () => {
  const { themeConfig } = useTheme();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Active Selected Component for Deep-Dive Inspection
  const [activeComponentId, setActiveComponentId] = useState<string>('ultrasonic_sensor');
  const [selectedFinish, setSelectedFinish] = useState<WheeledRobotFinish>('authentic_lab');
  const [cameraMode, setCameraMode] = useState<CameraMode>('follow');
  const [activeDriveCommand, setActiveDriveCommand] = useState<DriveControlCommand>('stop');
  const [throttleSpeed, setThrottleSpeed] = useState<number>(75); // 10 to 100%
  const [isAutonomous, setIsAutonomous] = useState<boolean>(false);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [selectedExpression, setSelectedExpression] = useState<'listening' | 'scanning' | 'excited' | 'alert' | 'idle'>('listening');
  const [isExplodedView, setIsExplodedView] = useState<boolean>(false);
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);
  const [isSimulatingDiagnostic, setIsSimulatingDiagnostic] = useState<boolean>(false);
  const [diagnosticLog, setDiagnosticLog] = useState<string>(
    '2-Wheel Differential Drive Online. Sonar Raycasting Active. Use WASD / Arrows or Autonomous Mode.'
  );

  // Live Dynamic Telemetry State (Updated continuously from physics engine)
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    leftWheelRpm: 0,
    rightWheelRpm: 0,
    leftWheelSpeedMs: 0,
    rightWheelSpeedMs: 0,
    linearSpeedMs: 0,
    linearSpeedCms: 0,
    angularVelocityRad: 0,
    headingDeg: 0,
    headingCompass: 'N',
    ultrasonicDistanceCm: 250,
    obstacleState: 'CLEAR',
    detectedObstacleName: null,
    batteryPercent: 98.4,
    batteryVoltage: 7.85,
    motorCurrentAmps: 0.25,
    panAngleDeg: 0,
    drivingMode: 'MANUAL TELEOPERATION',
    autoState: 'MANUAL',
    sonarStatus: 'CLEAR PATH',
  });

  // Voice Interaction
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  // 3D Engine & Animation Refs
  const physicsSimRef = useRef<DifferentialDriveSimulation>(new DifferentialDriveSimulation());
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotInstanceRef = useRef<WheeledRobotInstance | null>(null);
  const arenaRef = useRef<ArenaEnvironment | null>(null);
  const isExplodedViewRef = useRef(false);
  const explodeProgressRef = useRef(0);
  const cameraModeRef = useRef<CameraMode>('follow');
  const orbitAnglesRef = useRef({ theta: 0, phi: 0.35, distance: 3.8 });

  const activeComponent =
    WHEELED_ROBOT_COMPONENTS.find((c) => c.id === activeComponentId) || WHEELED_ROBOT_COMPONENTS[0];

  useEffect(() => {
    isExplodedViewRef.current = isExplodedView;
  }, [isExplodedView]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  // Handle Drive Commands directly affecting the differential physics simulation
  const handleDrive = useCallback(
    (cmd: DriveControlCommand) => {
      sound.playClick();
      setActiveDriveCommand(cmd);

      // Disable autonomous if user manually commands
      if (isAutonomous) {
        setIsAutonomous(false);
        physicsSimRef.current.setAutonomous(false);
      }

      physicsSimRef.current.setCommand(cmd, throttleSpeed / 100);

      if (cmd === 'forward') {
        sound.playBootBeep(520, 0.08);
        setDiagnosticLog(`MOTOR DRIVE: [FORWARD ${throttleSpeed}% PWM] • Dual Wheels Rotating Synchronized`);
      } else if (cmd === 'backward') {
        sound.playBootBeep(440, 0.08);
        setDiagnosticLog(`MOTOR DRIVE: [REVERSE ${throttleSpeed}% PWM] • Dual Wheels Rotating Reverse`);
      } else if (cmd === 'left') {
        sound.playBootBeep(660, 0.06);
        setDiagnosticLog('DIFFERENTIAL STEERING: [LEFT PIVOT] • Left Wheel Reversed / Right Wheel Forward');
      } else if (cmd === 'right') {
        sound.playBootBeep(660, 0.06);
        setDiagnosticLog('DIFFERENTIAL STEERING: [RIGHT PIVOT] • Right Wheel Reversed / Left Wheel Forward');
      } else if (cmd === 'spin') {
        sound.playLaserScan();
        setDiagnosticLog('DIFFERENTIAL MANEUVER: [360° ZERO-RADIUS PIVOT SPIN]');
      } else {
        setDiagnosticLog('BRAKING: [MOTOR HALT] • Regenerative Damping Engaged');
      }
    },
    [throttleSpeed, isAutonomous]
  );

  // Toggle Autonomous Mode
  const handleToggleAutonomous = () => {
    sound.playClick();
    const nextAuto = !isAutonomous;
    setIsAutonomous(nextAuto);
    physicsSimRef.current.setAutonomous(nextAuto);

    if (nextAuto) {
      sound.playLaserScan();
      setDiagnosticLog('AUTONOMOUS MODE: [ACTIVE] • Sonar Obstacle Avoidance FSM Engaged');
      voiceAssistant.speak('Autonomous obstacle avoidance mode activated. Navigating laboratory arena.');
    } else {
      setActiveDriveCommand('stop');
      physicsSimRef.current.setCommand('stop');
      setDiagnosticLog('AUTONOMOUS MODE: [DISENGAGED] • Returned to Manual Teleoperation');
      voiceAssistant.speak('Manual teleoperation mode active.');
    }
  };

  // Keyboard navigation for driving the robot directly in the 3D lab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleDrive('forward');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleDrive('backward');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleDrive('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleDrive('right');
      } else if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleDrive('stop');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToggleAutonomous();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetModel();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        if (!isAutonomous) {
          handleDrive('stop');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleDrive, isAutonomous]);

  // Voice command controls
  const handleToggleVoice = () => {
    sound.playClick();
    if (!voiceAssistant.isSupported()) {
      alert('Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    voiceAssistant.toggleListening();
  };

  const handleToggleExplodedView = (explicitState?: boolean) => {
    sound.playClick();
    const nextState = explicitState !== undefined ? explicitState : !isExplodedViewRef.current;
    setIsExplodedView(nextState);
    isExplodedViewRef.current = nextState;
    setDiagnosticLog(`Exploded View Disassembly: [${nextState ? 'ACTIVE' : 'REASSEMBLED'}]`);
    voiceAssistant.speak(
      nextState
        ? 'Exploded view engaged. Display, chassis, wheels, and sensors separated.'
        : 'Reassembling robot mechanical components.'
    );
  };

  const handleResetModel = () => {
    sound.playClick();
    setIsAutonomous(false);
    setIsExplodedView(false);
    isExplodedViewRef.current = false;
    setActiveDriveCommand('stop');
    physicsSimRef.current.reset(new THREE.Vector3(0, 0, 0), 0);

    if (robotInstanceRef.current) {
      robotInstanceRef.current.setDriveCommand('stop', throttleSpeed);
      robotInstanceRef.current.updateFaceCanvas('listening', 250);
      robotInstanceRef.current.setWheelAngles(0, 0);
      robotInstanceRef.current.setPanServoAngle(0);
    }
    if (robotGroupRef.current) {
      robotGroupRef.current.position.set(0, 0, 0);
      robotGroupRef.current.rotation.set(0, 0, 0);
    }

    setDiagnosticLog('SYSTEM RESET: Robot returned to arena center spawn. Sonar recalibrated.');
    voiceAssistant.speak('Robot chassis reset to home origin.');
  };

  // Camera preset viewpoints
  const handleSelectCameraMode = (mode: CameraMode) => {
    sound.playClick();
    setCameraMode(mode);
    cameraModeRef.current = mode;
    if (mode === 'orbit') {
      orbitAnglesRef.current = { theta: physicsSimRef.current.rotationY + 0.3, phi: 0.4, distance: 3.8 };
    }
  };

  // Voice event handler
  useEffect(() => {
    const unsubscribe = voiceAssistant.subscribe((state) => {
      setIsVoiceListening(state.isListening);
      if (state.transcript) setVoiceTranscript(state.transcript);
    });

    const handleVoiceCommandEvent = (e: Event) => {
      const customEvent = e as CustomEvent<VoiceCommandEventDetail>;
      const action = customEvent.detail?.action;
      const transcript = (customEvent.detail?.transcript || '').toLowerCase();

      if (transcript.includes('auto') || transcript.includes('explore')) {
        handleToggleAutonomous();
      } else if (transcript.includes('forward') || action === 'robot_forward') {
        handleDrive('forward');
      } else if (transcript.includes('back') || transcript.includes('reverse')) {
        handleDrive('backward');
      } else if (transcript.includes('left')) {
        handleDrive('left');
      } else if (transcript.includes('right')) {
        handleDrive('right');
      } else if (transcript.includes('stop') || transcript.includes('halt')) {
        handleDrive('stop');
      } else if (transcript.includes('explode') || transcript.includes('disassemble')) {
        handleToggleExplodedView();
      } else if (transcript.includes('reset') || transcript.includes('home')) {
        handleResetModel();
      }
    };

    window.addEventListener('portfolio:voice-command', handleVoiceCommandEvent);
    return () => {
      unsubscribe();
      window.removeEventListener('portfolio:voice-command', handleVoiceCommandEvent);
    };
  }, [handleDrive]);

  // Diagnostic Test Runner
  const runDiagnosticTest = () => {
    sound.playLaserScan();
    setIsSimulatingDiagnostic(true);
    setDiagnosticLog('INITIALIZING 2-WHEEL DIFFERENTIAL DRIVE & SONAR RADAR CALIBRATION...');

    setTimeout(() => {
      setDiagnosticLog(`HC-SR04 SONAR: 40kHz acoustic echo verified @ ${telemetry.ultrasonicDistanceCm}cm. Raycast verified.`);
      sound.playBootBeep(880, 0.05);
    }, 600);

    setTimeout(() => {
      setDiagnosticLog(
        `L298N H-BRIDGE: TT DC motors calibrated @ ${throttleSpeed}% PWM. Left RPM: ${telemetry.leftWheelRpm}, Right RPM: ${telemetry.rightWheelRpm}.`
      );
      sound.playSuccessChime();
      setIsSimulatingDiagnostic(false);
    }, 1500);
  };

  // 3D Scene Initialization
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.022);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 2.5, 4.8);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = selectedFinish === 'defense_carbon' ? 1.6 : 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lab Environment Map
    const labEnvTexture = createLaboratoryEnvironment(renderer, {
      theme: 'cyber_lab',
      rimColor: selectedFinish === 'defense_carbon' ? 0xa855f7 : 0x00f0ff,
    });
    scene.environment = labEnvTexture;

    // 5. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
    scene.add(ambientLight);

    const keySpotlight = new THREE.SpotLight(0xffffff, 5.5, 26, Math.PI / 3.2, 0.35, 1.0);
    keySpotlight.position.set(4.0, 8.0, 5.0);
    keySpotlight.castShadow = true;
    keySpotlight.shadow.mapSize.width = 1024;
    keySpotlight.shadow.mapSize.height = 1024;
    keySpotlight.shadow.bias = -0.0001;
    scene.add(keySpotlight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f0ff, 3.5);
    cyanRimLight.position.set(-6.0, 4.5, -4.5);
    scene.add(cyanRimLight);

    const amberFillLight = new THREE.PointLight(0xf59e0b, 2.8, 16);
    amberFillLight.position.set(4.5, 2.0, -3.5);
    scene.add(amberFillLight);

    // 6. Realistic Robotics Testing Arena (Perimeter Walls, Cargo Crates, Safety Barrels)
    const arena = createRoboticsArena();
    arenaRef.current = arena;
    scene.add(arena.sceneGroup);

    // 7. Wheeled Robotic Vehicle 3D Model Instance
    const robotInstance = createWheeledRobot(1.0, selectedFinish);
    robotInstanceRef.current = robotInstance;
    const robotGroup = robotInstance.rootGroup;
    robotGroupRef.current = robotGroup;
    scene.add(robotGroup);

    robotGroup.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    // 8. Raycasting for Clickable Hotspots & Mouse Orbit Controls
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

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
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

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

      // Orbit camera around robot in orbit mode or follow mode
      orbitAnglesRef.current.theta += dx * 0.008;
      orbitAnglesRef.current.phi = Math.max(0.1, Math.min(1.4, orbitAnglesRef.current.phi + dy * 0.006));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!hasMovedMuch && container.contains(e.target as Node)) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(robotInstance.clickableObjects, true);

        if (intersects.length > 0) {
          sound.playLaserScan();
          const hit = intersects[0].object;
          const compId = hit.userData.componentId || 'ultrasonic_sensor';
          setActiveComponentId(compId);
          const found = WHEELED_ROBOT_COMPONENTS.find((c) => c.id === compId);
          if (found) {
            setDiagnosticLog(`INSPECTION: [${found.title.toUpperCase()}] • Focused for Deep Dive.`);
            voiceAssistant.speak(`${found.name} selected.`);
          }
        }
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAnglesRef.current.distance = Math.max(1.8, Math.min(9.5, orbitAnglesRef.current.distance + e.deltaY * 0.005));
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch controls for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - prevX;
      const dy = e.touches[0].clientY - prevY;
      orbitAnglesRef.current.theta += dx * 0.008;
      orbitAnglesRef.current.phi = Math.max(0.1, Math.min(1.4, orbitAnglesRef.current.phi + dy * 0.006));
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

    // 9. Master Physics & Animation Loop (60 FPS)
    let clock = new THREE.Clock();
    let animId: number;
    let telemetryThrottleTimer = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      const sim = physicsSimRef.current;
      const currentArena = arenaRef.current;

      // 1. Step Differential-Drive Kinematics & Ultrasonic Raycasting
      if (currentArena) {
        sim.update(delta, currentArena.obstacleMeshes, currentArena.obstacles, currentArena.arenaBounds);
      }

      // 2. Sync 3D Model Root Group to Physics State
      robotGroup.position.set(sim.position.x, sim.position.y, sim.position.z);
      robotGroup.rotation.y = sim.rotationY;

      // 3. Sync Individual Wheel Physical Rotations & Pan Servo
      robotInstance.setWheelAngles(sim.leftWheelAngle, sim.rightWheelAngle);
      robotInstance.setPanServoAngle(sim.panServoAngle);

      // 4. Update Dynamic Sonar Ray/Cone Visualizer & Warning State
      robotInstance.updateSonarRay(sim.ultrasonicDistanceCm, sim.obstacleState, sim.isAutonomous);

      // 5. Update Dynamic Emotive Robot Eyes & Face Canvas
      let faceExpr: 'listening' | 'scanning' | 'excited' | 'alert' | 'idle' = selectedExpression;
      if (sim.obstacleState === 'CRITICAL_STOP') {
        faceExpr = 'alert';
      } else if (sim.isAutonomous || Math.abs(sim.panServoAngle) > 0.1) {
        faceExpr = 'scanning';
      } else if (Math.abs(sim.currentLeftVel) > 0.5 || Math.abs(sim.currentRightVel) > 0.5) {
        faceExpr = 'excited';
      }
      robotInstance.updateFaceCanvas(faceExpr, sim.ultrasonicDistanceCm);

      // 6. Camera Navigation Modes (Follow Chase, Free Orbit, Tactical, Sonar POV)
      const currentCamMode = cameraModeRef.current;
      const rPos = sim.position;
      const rHeading = sim.rotationY;

      if (currentCamMode === 'follow') {
        // Chase Cam: Follows behind robot heading
        const followDist = 3.6;
        const followHeight = 1.6;
        const targetCamX = rPos.x - Math.sin(rHeading) * followDist;
        const targetCamZ = rPos.z - Math.cos(rHeading) * followDist;
        const targetCamY = rPos.y + followHeight;

        camera.position.x += (targetCamX - camera.position.x) * 0.08;
        camera.position.y += (targetCamY - camera.position.y) * 0.08;
        camera.position.z += (targetCamZ - camera.position.z) * 0.08;
        camera.lookAt(rPos.x, rPos.y + 0.35, rPos.z);
      } else if (currentCamMode === 'orbit') {
        // Free Orbit / Inspector Cam around robot
        const { theta, phi, distance } = orbitAnglesRef.current;
        const camX = rPos.x + distance * Math.sin(phi) * Math.sin(theta);
        const camY = rPos.y + distance * Math.cos(phi);
        const camZ = rPos.z + distance * Math.sin(phi) * Math.cos(theta);

        camera.position.x += (camX - camera.position.x) * 0.1;
        camera.position.y += (camY - camera.position.y) * 0.1;
        camera.position.z += (camZ - camera.position.z) * 0.1;
        camera.lookAt(rPos.x, rPos.y + 0.25, rPos.z);
      } else if (currentCamMode === 'tactical') {
        // Top-Down Arena Overview
        camera.position.x += (0 - camera.position.x) * 0.06;
        camera.position.y += (14.0 - camera.position.y) * 0.06;
        camera.position.z += (0.1 - camera.position.z) * 0.06;
        camera.lookAt(0, 0, 0);
      } else if (currentCamMode === 'sonar_pov') {
        // First-Person Sonar Perspective
        const povOffset = new THREE.Vector3(0, 0.45, 0.6);
        povOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rHeading);
        const povPos = rPos.clone().add(povOffset);
        camera.position.copy(povPos);

        const lookTarget = povPos.clone().add(
          new THREE.Vector3(
            Math.sin(rHeading + sim.panServoAngle) * 5,
            -0.2,
            Math.cos(rHeading + sim.panServoAngle) * 5
          )
        );
        camera.lookAt(lookTarget);
      }

      // 7. Exploded View Disassembly Animation (if active)
      const targetExplode = isExplodedViewRef.current ? 1.0 : 0.0;
      explodeProgressRef.current += (targetExplode - explodeProgressRef.current) * 0.08;
      const ep = explodeProgressRef.current;

      if (robotInstance) {
        robotInstance.screenGroup.position.y = 0.65 + ep * 0.55;
        robotInstance.chassisTop.position.y = 0.22 + ep * 0.35;
        robotInstance.batteryPack.position.z = -0.52 - ep * 0.45;
        robotInstance.sensorPanGroup.position.z = 0.92 + ep * 0.45;

        robotInstance.wheelFrontLeft.position.x = -0.78 - ep * 0.35;
        robotInstance.wheelRearLeft.position.x = -0.78 - ep * 0.35;
        robotInstance.wheelFrontRight.position.x = 0.78 + ep * 0.35;
        robotInstance.wheelRearRight.position.x = 0.78 + ep * 0.35;
      }

      // 8. Throttled Telemetry State Update (~30 FPS) for UI HUD
      telemetryThrottleTimer += delta;
      if (telemetryThrottleTimer > 0.033) {
        telemetryThrottleTimer = 0;
        setTelemetry(sim.getTelemetry());
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
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      if (arenaRef.current) {
        arenaRef.current.dispose();
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedFinish, selectedExpression]);

  // Update robot finish
  useEffect(() => {
    if (robotInstanceRef.current) {
      robotInstanceRef.current.setFinish(selectedFinish);
    }
  }, [selectedFinish]);

  // Change Face Expression Handler
  const handleSetExpression = (expr: 'listening' | 'scanning' | 'excited' | 'alert' | 'idle') => {
    sound.playClick();
    setSelectedExpression(expr);
    if (robotInstanceRef.current) {
      robotInstanceRef.current.updateFaceCanvas(expr, telemetry.ultrasonicDistanceCm);
    }
  };

  return (
    <section id="projects" className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>// EMBEDDED ROBOTICS LAB • 2-WHEEL DIFFERENTIAL DRIVE VEHICLE //</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
              INTERACTIVE ROBOTICS LAB
            </h2>
            <p className="text-sm font-mono text-cyan-300/90 mt-1">
              Differential-Drive Physics • HC-SR04 Sonar Raycasting • Autonomous Avoidance FSM
            </p>
            <p className="text-xs font-mono text-slate-400 mt-2 max-w-2xl leading-relaxed">
              A physical 2-wheel differential-drive autonomous rover with front HC-SR04 ultrasonic sonar, top Raspberry
              Pi emotive face LCD, dual yellow TT gear motors, and real-time obstacle distance detection in a 3D
              engineering arena.
            </p>
          </div>

          {/* PBR Hardware Finish Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md font-mono text-xs shadow-lg">
            <span className="text-[10px] text-slate-400 px-2 font-semibold">FINISH:</span>
            {(
              [
                { id: 'authentic_lab', label: 'AUTHENTIC LAB', color: 'bg-amber-500 text-slate-950 font-bold' },
                { id: 'titanium_stealth', label: 'TITANIUM', color: 'bg-slate-700 text-cyan-300 font-bold border border-cyan-500/40' },
                { id: 'cyber_lab_white', label: 'LAB WHITE', color: 'bg-slate-200 text-slate-950 font-bold' },
                { id: 'defense_carbon', label: 'CARBON', color: 'bg-slate-950 text-purple-300 font-bold border border-purple-500/40' },
              ] as const
            ).map((finish) => (
              <button
                key={finish.id}
                data-magnetic="true"
                onClick={() => {
                  sound.playClick();
                  setSelectedFinish(finish.id);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  selectedFinish === finish.id
                    ? finish.color + ' shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {finish.label}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Main 3-Column Engineering Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Component Hotspot Directory */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              HOTSPOT DIRECTORY
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80">8 SUBSYSTEMS</span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-start max-h-[640px] overflow-y-auto pr-1">
            {WHEELED_ROBOT_COMPONENTS.map((comp) => {
              const isSelected = activeComponentId === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveComponentId(comp.id);
                    setDiagnosticLog(`FOCUSED: [${comp.title.toUpperCase()}]`);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md relative group ${
                    isSelected
                      ? 'bg-slate-900/90 border border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/30'
                      : 'bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSelected ? 'bg-cyan-950/80 border border-cyan-500/50' : 'bg-slate-900 border border-slate-800'
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono tracking-tight group-hover:text-cyan-300 transition-colors">
                          {comp.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {comp.subtitle}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                        isSelected
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {comp.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <span className="text-cyan-400 font-semibold">{comp.telemetry[0].label}:</span>
                    <span className="text-slate-300">
                      {comp.id === 'ultrasonic_sensor'
                        ? `${telemetry.ultrasonicDistanceCm} cm`
                        : comp.id === 'gear_motors'
                        ? `${telemetry.leftWheelRpm} RPM`
                        : comp.telemetry[0].value}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Dominant Hero 3D Robot Visualizer & Direct Control Pad */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800/90 relative overflow-hidden shadow-2xl min-h-[620px]">
          {/* Subtle Cyber Corner Marks */}
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Top Floating Action & Viewport Bar */}
          <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-mono shadow-xl">
            {/* Camera View Mode Presets */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-[10px] text-slate-400 px-1.5 font-semibold flex items-center gap-1">
                <Camera className="w-3 h-3 text-cyan-400" />
                CAM:
              </span>
              <button
                onClick={() => handleSelectCameraMode('follow')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                  cameraMode === 'follow'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Follow
              </button>
              <button
                onClick={() => handleSelectCameraMode('orbit')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                  cameraMode === 'orbit'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Orbit
              </button>
              <button
                onClick={() => handleSelectCameraMode('tactical')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                  cameraMode === 'tactical'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Tactical Top
              </button>
              <button
                onClick={() => handleSelectCameraMode('sonar_pov')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                  cameraMode === 'sonar_pov'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Sonar POV
              </button>
            </div>

            {/* Quick Action Toggles */}
            <div className="flex items-center gap-1.5">
              {/* Autonomous Mode Toggle Button */}
              <button
                onClick={handleToggleAutonomous}
                title="Toggle Autonomous Obstacle-Avoidance Mode (T)"
                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAutonomous
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400 animate-pulse'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50'
                }`}
              >
                <Radar className="w-3.5 h-3.5" />
                <span>{isAutonomous ? 'AUTO AVOID: ON' : 'AUTO MODE'}</span>
              </button>

              {/* Exploded View Disassembly */}
              <button
                onClick={() => handleToggleExplodedView()}
                title="Toggle internal subsystem exploded view"
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isExplodedView
                    ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-purple-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              {/* Reset to Spawn */}
              <button
                onClick={handleResetModel}
                title="Reset robot position to arena center (R)"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Voice Command Mic */}
              <button
                onClick={handleToggleVoice}
                title="Toggle voice command microphone"
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isVoiceListening
                    ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse'
                    : 'bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Canvas Viewport */}
          <div
            ref={canvasContainerRef}
            id="robot-3d-canvas"
            className="w-full flex-1 min-h-[460px] cursor-grab active:cursor-grabbing"
            title="Drive using WASD / Arrow Keys • Click to inspect • Orbit with mouse drag"
          />

          {/* Live Floating Sonar Obstacle Alert Banner */}
          {telemetry.obstacleState === 'CRITICAL_STOP' && (
            <div className="absolute top-16 left-4 right-4 z-20 px-3.5 py-2 rounded-xl bg-rose-950/90 backdrop-blur-md border border-rose-500 text-rose-200 font-mono text-xs shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="font-bold">OBSTACLE DETECTED ({telemetry.ultrasonicDistanceCm} cm): FORWARD DRIVE INHIBITED</span>
              </div>
              <span className="text-[10px] bg-rose-900/80 px-2 py-0.5 rounded text-white font-bold">EMERGENCY STOP</span>
            </div>
          )}

          {/* Hovered Zone Floating Tag */}
          {hoveredPartName && (
            <div className="absolute top-28 right-4 z-20 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 text-cyan-300 font-mono text-xs shadow-[0_0_15px_rgba(0,240,255,0.25)] pointer-events-none animate-in fade-in flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>COMPONENT: {hoveredPartName.toUpperCase()}</span>
            </div>
          )}

          {/* Interactive Robot Drive Controller Pad Overlay */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono z-20">
            {/* Directional Pad */}
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-1.5">
                <div />
                <button
                  onClick={() => handleDrive('forward')}
                  title="Forward (W / Up)"
                  className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    activeDriveCommand === 'forward'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div />

                <button
                  onClick={() => handleDrive('left')}
                  title="Turn Left (A / Left)"
                  className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    activeDriveCommand === 'left'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDrive('stop')}
                  title="Stop (Space / Halt)"
                  className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    activeDriveCommand === 'stop'
                      ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => handleDrive('right')}
                  title="Turn Right (D / Right)"
                  className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    activeDriveCommand === 'right'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div />
                <button
                  onClick={() => handleDrive('backward')}
                  title="Backward (S / Down)"
                  className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    activeDriveCommand === 'backward'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDrive('spin')}
                  title="360° Differential Pivot Spin"
                  className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    activeDriveCommand === 'spin'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-slate-900 border-slate-800 text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 leading-tight hidden sm:block">
                <span className="text-cyan-400 font-bold block">DIFFERENTIAL DRIVE</span>
                <span>W A S D / Space (Stop)</span>
              </div>
            </div>

            {/* Throttle Speed Slider & Expression Selector */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 shrink-0">PWM THROTTLE:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={throttleSpeed}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setThrottleSpeed(val);
                    physicsSimRef.current.throttle = val / 100;
                  }}
                  className="w-28 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-cyan-300 font-mono w-10 text-right">{throttleSpeed}%</span>
              </div>

              {/* Expression Selector Buttons */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 shrink-0">EYES:</span>
                {(['listening', 'scanning', 'excited', 'alert'] as const).map((expr) => (
                  <button
                    key={expr}
                    onClick={() => handleSetExpression(expr)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                      selectedExpression === expr
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {expr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry, Working Principle & Component Inspector */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              LIVE TELEMETRY HUD
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">1,000 Hz MOTOR LOOP</span>
          </div>

          {/* Card 1: Live Physics Telemetry Deck */}
          <div className="p-4 rounded-xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md space-y-3 font-mono shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">KINEMATICS & SENSORS</span>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                  telemetry.obstacleState === 'CRITICAL_STOP'
                    ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                    : telemetry.obstacleState === 'WARNING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                }`}
              >
                {telemetry.obstacleState === 'CRITICAL_STOP'
                  ? 'OBSTACLE DETECTED'
                  : telemetry.obstacleState === 'WARNING'
                  ? 'CAUTION (15-50cm)'
                  : 'PATH CLEAR'}
              </span>
            </div>

            {/* Ultrasonic Sonar Raycasting Live Measurement */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  HC-SR04 SONAR DISTANCE:
                </span>
                <span
                  className={`font-bold text-sm ${
                    telemetry.ultrasonicDistanceCm < 16
                      ? 'text-rose-400 animate-pulse'
                      : telemetry.ultrasonicDistanceCm < 48
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {telemetry.ultrasonicDistanceCm} cm
                </span>
              </div>

              {/* Distance Bar Visualizer */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    telemetry.ultrasonicDistanceCm < 16
                      ? 'bg-rose-500'
                      : telemetry.ultrasonicDistanceCm < 48
                      ? 'bg-amber-500'
                      : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, (telemetry.ultrasonicDistanceCm / 200) * 100)}%` }}
                />
              </div>

              {telemetry.detectedObstacleName && (
                <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
                  <span>TARGET:</span>
                  <span className="text-cyan-300 truncate max-w-[160px] font-semibold">{telemetry.detectedObstacleName}</span>
                </div>
              )}
            </div>

            {/* Differential Left & Right Wheel Velocity Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">LEFT WHEEL:</span>
                <div className="text-cyan-300 font-bold text-xs">{telemetry.leftWheelRpm} RPM</div>
                <span className="text-slate-500">{telemetry.leftWheelSpeedMs} m/s</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">RIGHT WHEEL:</span>
                <div className="text-cyan-300 font-bold text-xs">{telemetry.rightWheelRpm} RPM</div>
                <span className="text-slate-500">{telemetry.rightWheelSpeedMs} m/s</span>
              </div>
            </div>

            {/* Speed, Heading & Battery */}
            <div className="space-y-1 text-[10px] pt-1">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">ROBOT LINEAR VELOCITY:</span>
                <span className="text-slate-200 font-bold">{telemetry.linearSpeedCms} cm/s ({telemetry.linearSpeedMs} m/s)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">HEADING / COMPASS:</span>
                <span className="text-amber-400 font-bold">{telemetry.headingDeg}° [{telemetry.headingCompass}]</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">BATTERY POWER (2S):</span>
                <span className="text-emerald-400 font-bold">🔋 {telemetry.batteryVoltage}V ({telemetry.batteryPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Component Deep-Dive Inspection Panel */}
          <div className="p-4 rounded-xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md space-y-3 font-mono flex-1 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-slate-900 text-cyan-400 border border-slate-800">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{activeComponent.name}</h4>
                    <span className="text-[10px] text-cyan-300 block truncate">{activeComponent.subtitle}</span>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                  {activeComponent.category}
                </span>
              </div>

              {/* Working Principle & Purpose */}
              <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <div>
                  <span className="text-cyan-400 font-semibold block text-[10px]">FUNCTION & WORKING PRINCIPLE:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{activeComponent.howItWorks}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-amber-400 font-semibold block text-[10px] mb-1">SPECIFICATIONS:</span>
                  <div className="space-y-1">
                    {activeComponent.specs.slice(0, 3).map((spec, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Button & Log */}
            <div className="pt-2 space-y-2 border-t border-slate-800/80">
              <button
                onClick={runDiagnosticTest}
                disabled={isSimulatingDiagnostic}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{isSimulatingDiagnostic ? 'CALIBRATING SENSORS...' : 'RUN FULL DIAGNOSTIC'}</span>
              </button>

              <p className="text-[10px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 truncate">
                {diagnosticLog}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Technology Showcase (Core Firmware & Hardware Architecture Stack) */}
      <div className="mt-14 pt-8 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              // ARCHITECTURAL STACK //
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              ROBOTICS FIRMWARE & HARDWARE STACK
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Microsecond Sonar Ranging • Dual H-Bridge Drivers • OpenCV Neural Vision
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH_CARDS.map((tech) => (
            <div
              key={tech.id}
              className={`p-5 rounded-2xl bg-gradient-to-b ${tech.color} bg-slate-950/80 border ${tech.border} backdrop-blur-md space-y-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group font-mono`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 group-hover:scale-110 transition-transform">
                  {tech.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
                  {tech.category}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-mono tracking-tight group-hover:text-cyan-300 transition-colors">
                  {tech.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{tech.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                {tech.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300/90 border border-slate-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
