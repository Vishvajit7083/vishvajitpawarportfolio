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
  Flame
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

export const RobotProject: React.FC = () => {
  const { themeConfig } = useTheme();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Active Selected Component for Deep-Dive Inspection
  const [activeComponentId, setActiveComponentId] = useState<string>('ultrasonic_sensor');
  const [selectedFinish, setSelectedFinish] = useState<WheeledRobotFinish>('authentic_lab');
  const [activeDriveCommand, setActiveDriveCommand] = useState<'forward' | 'backward' | 'left' | 'right' | 'spin' | 'stop'>('stop');
  const [throttleSpeed, setThrottleSpeed] = useState<number>(75); // 0 to 100%
  const [obstacleDistance, setObstacleDistance] = useState<number>(48); // 5 to 200 cm
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [selectedExpression, setSelectedExpression] = useState<'listening' | 'scanning' | 'excited' | 'alert' | 'idle'>('listening');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isExplodedView, setIsExplodedView] = useState<boolean>(false);
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);
  const [isSimulatingDiagnostic, setIsSimulatingDiagnostic] = useState<boolean>(false);
  const [diagnosticLog, setDiagnosticLog] = useState<string>(
    'Wheeled Robot Telemetry online. Click 3D parts or drive controls to interact.'
  );

  // Voice Interaction
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  // 3D Engine & Animation Refs
  const isAutoRotatingRef = useRef(false);
  const isExplodedViewRef = useRef(false);
  const explodeProgressRef = useRef(0);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotInstanceRef = useRef<WheeledRobotInstance | null>(null);
  const targetCameraPosRef = useRef<{ x: number; y: number; z: number; lookAtY: number }>({
    x: 0,
    y: 0.5,
    z: 3.2,
    lookAtY: 0.2,
  });

  const activeComponent =
    WHEELED_ROBOT_COMPONENTS.find((c) => c.id === activeComponentId) || WHEELED_ROBOT_COMPONENTS[0];

  // Sync state refs
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    isExplodedViewRef.current = isExplodedView;
  }, [isExplodedView]);

  // Handle Drive Commands
  const handleDrive = useCallback(
    (cmd: 'forward' | 'backward' | 'left' | 'right' | 'spin' | 'stop') => {
      sound.playClick();
      setActiveDriveCommand(cmd);

      if (robotInstanceRef.current) {
        robotInstanceRef.current.setDriveCommand(cmd, throttleSpeed);
      }

      if (cmd === 'forward') {
        sound.playBootBeep(520, 0.08);
        setDiagnosticLog(`MOTOR DRIVE: [FORWARD ${throttleSpeed}% PWM] • Dual H-Bridge Active`);
      } else if (cmd === 'backward') {
        sound.playBootBeep(440, 0.08);
        setDiagnosticLog(`MOTOR DRIVE: [REVERSE ${throttleSpeed}% PWM] • Dual H-Bridge Inverted`);
      } else if (cmd === 'left') {
        sound.playBootBeep(660, 0.06);
        setDiagnosticLog('STEERING: [SKID-TURN LEFT] • Differential Gearbox Bias');
      } else if (cmd === 'right') {
        sound.playBootBeep(660, 0.06);
        setDiagnosticLog('STEERING: [SKID-TURN RIGHT] • Differential Gearbox Bias');
      } else if (cmd === 'spin') {
        sound.playLaserScan();
        setDiagnosticLog('DYNAMIC MANEUVER: [360° ZERO-RADIUS PIVOT SPIN]');
      } else {
        setDiagnosticLog('BRAKING: [MOTOR HALT] • Regenerative Damping Engaged');
      }
    },
    [throttleSpeed]
  );

  // Keyboard navigation for driving the robot directly in the 3D lab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting inputs if user is typing in a textarea or modal
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
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        handleDrive('stop');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleDrive]);

  // Voice command controls
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
    setDiagnosticLog(`3D Auto-Rotation: [${nextState ? 'ENGAGED' : 'PAUSED'}]`);
    voiceAssistant.speak(nextState ? '3D auto-rotation activated.' : 'Auto-rotation stopped.');
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
    setIsAutoRotating(false);
    isAutoRotatingRef.current = false;
    setIsExplodedView(false);
    isExplodedViewRef.current = false;
    setActiveDriveCommand('stop');
    setActiveComponentId('ultrasonic_sensor');
    targetCameraPosRef.current = { x: 0, y: 0.5, z: 3.2, lookAtY: 0.2 };
    if (robotInstanceRef.current) {
      robotInstanceRef.current.setDriveCommand('stop', throttleSpeed);
      robotInstanceRef.current.updateFaceCanvas('listening', 48);
    }
    if (robotGroupRef.current) {
      robotGroupRef.current.rotation.set(0, 0, 0);
    }
    setDiagnosticLog('SYSTEM RESET: Default lab camera & home position restored.');
    voiceAssistant.speak('Robot chassis reset to home position.');
  };

  // Camera preset viewpoints
  const handleCameraPreset = (preset: 'overview' | 'sonar' | 'screen' | 'motors' | 'battery') => {
    sound.playClick();
    if (preset === 'overview') {
      targetCameraPosRef.current = { x: 1.8, y: 1.2, z: 2.8, lookAtY: 0.2 };
    } else if (preset === 'sonar') {
      targetCameraPosRef.current = { x: 0, y: 0.2, z: 2.2, lookAtY: 0.15 };
      setActiveComponentId('ultrasonic_sensor');
    } else if (preset === 'screen') {
      targetCameraPosRef.current = { x: 0, y: 0.7, z: 2.0, lookAtY: 0.6 };
      setActiveComponentId('robot_display');
    } else if (preset === 'motors') {
      targetCameraPosRef.current = { x: 1.6, y: 0.1, z: 1.2, lookAtY: -0.05 };
      setActiveComponentId('gear_motors');
    } else if (preset === 'battery') {
      targetCameraPosRef.current = { x: 0, y: 0.6, z: -2.4, lookAtY: 0.3 };
      setActiveComponentId('battery_pack');
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

      if (transcript.includes('forward') || action === 'robot_forward') {
        handleDrive('forward');
      } else if (transcript.includes('back') || transcript.includes('reverse')) {
        handleDrive('backward');
      } else if (transcript.includes('left')) {
        handleDrive('left');
      } else if (transcript.includes('right')) {
        handleDrive('right');
      } else if (transcript.includes('stop') || transcript.includes('halt')) {
        handleDrive('stop');
      } else if (transcript.includes('spin') || transcript.includes('rotate')) {
        handleToggleRotate();
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
    setDiagnosticLog('INITIALIZING 4-WHEEL DIFFERENTIAL DRIVE & SONAR RADAR CALIBRATION...');

    setTimeout(() => {
      setDiagnosticLog(`HC-SR04 SONAR: 40kHz acoustic echo verified @ ${obstacleDistance}cm. Sweep servo nominal.`);
      sound.playBootBeep(880, 0.05);
    }, 600);

    setTimeout(() => {
      setDiagnosticLog(
        `RASPBERRY PI & L298N: 4x TT DC motors synchronized @ ${throttleSpeed}% PWM. 7.85V battery rail nominal.`
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
    scene.fog = new THREE.FogExp2(0x030712, 0.028);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 3.2);
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
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    const keySpotlight = new THREE.SpotLight(0xffffff, 5.2, 18, Math.PI / 3.6, 0.35, 1.0);
    keySpotlight.position.set(3.0, 5.5, 3.5);
    keySpotlight.castShadow = true;
    keySpotlight.shadow.mapSize.width = 1024;
    keySpotlight.shadow.mapSize.height = 1024;
    keySpotlight.shadow.bias = -0.0001;
    scene.add(keySpotlight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f0ff, 3.2);
    cyanRimLight.position.set(-3.5, 2.5, -2.5);
    scene.add(cyanRimLight);

    const amberFillLight = new THREE.PointLight(0xf59e0b, 2.4, 10);
    amberFillLight.position.set(2.5, 1.0, -2.0);
    scene.add(amberFillLight);

    // 6. Grid Ground Plane
    const gridHelper = new THREE.GridHelper(20, 20, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -0.45;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const floorShadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.ShadowMaterial({ opacity: 0.48 })
    );
    floorShadowPlane.rotation.x = -Math.PI / 2;
    floorShadowPlane.position.y = -0.455;
    floorShadowPlane.receiveShadow = true;
    scene.add(floorShadowPlane);

    // 7. Wheeled Robotic Car 3D Model Instance
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

    // 8. Raycasting & Mouse Drag Orbit Controls
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

      robotGroup.rotation.y += dx * 0.008;
      robotGroup.rotation.x = Math.max(-0.4, Math.min(0.4, robotGroup.rotation.x + dy * 0.004));
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
          const hit = intersects[0].object;
          const compId = hit.userData.componentId;
          if (compId) {
            sound.playClick();
            setActiveComponentId(compId);
            const foundComp = WHEELED_ROBOT_COMPONENTS.find((c) => c.id === compId);
            if (foundComp) {
              targetCameraPosRef.current = foundComp.cameraTarget;
            }
            setDiagnosticLog(`INSPECTING 3D COMPONENT: [${(hit.userData.componentName || compId).toUpperCase()}]`);
          }
        }
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.002;
      targetCameraPosRef.current.z = Math.max(1.4, Math.min(5.5, targetCameraPosRef.current.z + zoomFactor));
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support
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
      robotGroup.rotation.y += dx * 0.008;
      robotGroup.rotation.x = Math.max(-0.4, Math.min(0.4, robotGroup.rotation.x + dy * 0.004));
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

    // 9. Master Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Camera Smooth Interpolation
      const targetPos = targetCameraPosRef.current;
      camera.position.x += (targetPos.x - camera.position.x) * 0.06;
      camera.position.y += (targetPos.y - camera.position.y) * 0.06;
      camera.position.z += (targetPos.z - camera.position.z) * 0.06;
      camera.lookAt(0, targetPos.lookAtY, 0);

      // Auto-Rotation
      if (isAutoRotatingRef.current && !isDragging) {
        robotGroup.rotation.y += 0.008;
      }

      // Exploded View Disassembly Animation
      const targetExplode = isExplodedViewRef.current ? 1.0 : 0.0;
      explodeProgressRef.current += (targetExplode - explodeProgressRef.current) * 0.08;
      const ep = explodeProgressRef.current;

      if (robotInstance) {
        // Disassemble components in 3D
        robotInstance.screenGroup.position.y = 0.65 + ep * 0.55;
        robotInstance.chassisTop.position.y = 0.22 + ep * 0.35;
        robotInstance.batteryPack.position.z = -0.52 - ep * 0.45;
        robotInstance.sensorPanGroup.position.z = 0.92 + ep * 0.45;

        // Spread wheels laterally outward
        robotInstance.wheelFrontLeft.position.x = -0.78 - ep * 0.35;
        robotInstance.wheelRearLeft.position.x = -0.78 - ep * 0.35;
        robotInstance.wheelFrontRight.position.x = 0.78 + ep * 0.35;
        robotInstance.wheelRearRight.position.x = 0.78 + ep * 0.35;

        // Run kinematic animation for wheels, eyes, pan servo, and sonar wave
        robotInstance.animate(elapsedTime, delta, {
          isScanning: isScanning,
          obstacleCm: obstacleDistance,
        });
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
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedFinish, isScanning, obstacleDistance]);

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
      robotInstanceRef.current.updateFaceCanvas(expr, obstacleDistance);
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
              <span>// PROJECT SHOWCASE • AUTONOMOUS SMART ROBOTIC CAR //</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
              INTERACTIVE ROBOTICS LAB
            </h2>
            <p className="text-sm font-mono text-cyan-300/90 mt-1">
              Raspberry Pi • OpenCV Neural Vision • HC-SR04 Sonar • FreeRTOS Motor Control
            </p>
            <p className="text-xs font-mono text-slate-400 mt-2 max-w-2xl leading-relaxed">
              An intelligent 4WD mobile robotic vehicle equipped with a top-mounted Raspberry Pi animated emotive LCD
              display, front HC-SR04 ultrasonic radar, dual-tier acrylic chassis, and high-torque TT DC gear motors with
              deep-tread traction wheels.
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
                    targetCameraPosRef.current = comp.cameraTarget;
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
                    <span className="text-slate-300">{comp.telemetry[0].value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Dominant Hero 3D Robot Visualizer & Direct Control Pad */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800/90 relative overflow-hidden shadow-2xl min-h-[600px]">
          {/* Subtle Cyber Corner Marks */}
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Top Floating Action & Viewport Bar */}
          <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-mono shadow-xl">
            {/* Camera View Presets */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-[10px] text-slate-400 px-1.5 font-semibold flex items-center gap-1">
                <Camera className="w-3 h-3 text-cyan-400" />
                VIEW:
              </span>
              <button
                onClick={() => handleCameraPreset('overview')}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Overview
              </button>
              <button
                onClick={() => handleCameraPreset('sonar')}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Sonar
              </button>
              <button
                onClick={() => handleCameraPreset('screen')}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Face LCD
              </button>
              <button
                onClick={() => handleCameraPreset('motors')}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Motors
              </button>
            </div>

            {/* Quick Action Toggles */}
            <div className="flex items-center gap-1.5">
              {/* Rotate 360 */}
              <button
                onClick={() => handleToggleRotate()}
                title="Toggle continuous 360° rotation"
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isAutoRotating
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
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

              {/* Reset View */}
              <button
                onClick={handleResetModel}
                title="Reset robot viewport & pose"
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
            title="Drag to orbit in 360° • Scroll to zoom • Click any component to inspect"
          />

          {/* Hovered Zone Floating Tag */}
          {hoveredPartName && (
            <div className="absolute top-16 right-4 z-20 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 text-cyan-300 font-mono text-xs shadow-[0_0_15px_rgba(0,240,255,0.25)] pointer-events-none animate-in fade-in flex items-center gap-2">
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
                  title="360° Spin"
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
                <span className="text-cyan-400 font-bold block">4WD SKID STEER</span>
                <span>WASD / Arrow Keys</span>
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
                    if (robotInstanceRef.current && activeDriveCommand !== 'stop') {
                      robotInstanceRef.current.setDriveCommand(activeDriveCommand, val);
                    }
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
              ENGINEERING INSPECTOR
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">1,000 Hz TELEMETRY</span>
          </div>

          {/* Card 1: Active Component Details & Working Principle */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md space-y-3 font-mono flex-1 flex flex-col justify-between shadow-xl">
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
                  <span className="text-cyan-400 font-semibold block text-[10px]">HOW IT WORKS IN THE ROBOT:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{activeComponent.howItWorks}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-amber-400 font-semibold block text-[10px] mb-1">TECHNICAL SPECIFICATIONS:</span>
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

            {/* Hardware Pinout & Voltage Chips */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[10px]">
              <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">PINOUT:</span>
                <span className="text-cyan-300 font-bold truncate max-w-[170px]">{activeComponent.pinout}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">VOLTAGE:</span>
                <span className="text-amber-400 font-bold">{activeComponent.voltage}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Ultrasonic Sonar Radar Simulation Slider */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-md space-y-3 font-mono shadow-xl">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>HC-SR04 SONAR DISTANCE:</span>
                <span
                  className={`font-bold ${
                    obstacleDistance < 18 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {obstacleDistance} cm {obstacleDistance < 18 ? '[OBSTACLE CLOSE!]' : '[PATH CLEAR]'}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={obstacleDistance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setObstacleDistance(val);
                  if (val < 18) {
                    sound.playErrorTone();
                    if (robotInstanceRef.current) {
                      robotInstanceRef.current.updateFaceCanvas('alert', val);
                    }
                  }
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div className="pt-1">
              <button
                onClick={runDiagnosticTest}
                disabled={isSimulatingDiagnostic}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{isSimulatingDiagnostic ? 'CALCULATING SENSORS...' : 'RUN SENSOR DIAGNOSTIC'}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 truncate">
              {diagnosticLog}
            </p>
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
