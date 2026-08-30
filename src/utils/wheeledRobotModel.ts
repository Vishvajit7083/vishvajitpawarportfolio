import * as THREE from 'three';
import {
  createCarbonFiberTexture,
  createHazardStripesTexture,
  createBrushedMetalBumpMap,
  createIndustrialPanelTexture,
} from './pbrTextures';

export type WheeledRobotFinish = 'authentic_lab' | 'titanium_stealth' | 'cyber_lab_white' | 'defense_carbon';

export interface InteractiveComponentInfo {
  id: string;
  name: string;
  category: 'PERCEPTION' | 'COMPUTE' | 'ACTUATOR' | 'TRACTION' | 'POWER' | 'CHASSIS';
  title: string;
  subtitle: string;
  description: string;
  howItWorks: string;
  specs: string[];
  pinout: string;
  voltage: string;
  cameraTarget: { x: number; y: number; z: number; lookAtY: number };
  accentColor: string;
  telemetry: { label: string; value: string }[];
}

export const WHEELED_ROBOT_COMPONENTS: InteractiveComponentInfo[] = [
  {
    id: 'ultrasonic_sensor',
    name: 'HC-SR04 Ultrasonic Sonar',
    category: 'PERCEPTION',
    title: 'HC-SR04 Ultrasonic Sensor & Pan Servo',
    subtitle: 'Dual 40kHz Acoustic Transducers (2cm - 400cm)',
    description:
      'Front-mounted ultrasonic obstacle avoidance transducer module. Features dual acoustic barrels (Transmitter & Receiver) mounted on an SG90 micro servo for 180° spatial obstacle mapping.',
    howItWorks:
      'Emits an 8-cycle 40kHz ultrasonic burst via the Trig pin. The Echo pin stays HIGH until the reflected sound wave returns. Microcontroller measures pulse width to compute distance using (Time × 340 m/s) / 2.',
    specs: [
      'Operating Frequency: 40 kHz ultrasound',
      'Ranging Distance: 2 cm to 400 cm (accuracy ±3mm)',
      'Measuring Angle: 15° cone aperture',
      'Integrated SG90 Micro-Servo for 180° sweep panning',
    ],
    pinout: 'VCC (5V), TRIG (Pin 12), ECHO (Pin 13), GND',
    voltage: '5.0V DC / 15mA',
    cameraTarget: { x: 0, y: 0.15, z: 2.2, lookAtY: 0.15 },
    accentColor: '#00f0ff',
    telemetry: [
      { label: 'SONAR FREQ', value: '40.0 kHz' },
      { label: 'RANGE', value: '2cm - 400cm' },
      { label: 'SWEEP ANGLE', value: '180° SERVO' },
    ],
  },
  {
    id: 'robot_display',
    name: 'Raspberry Pi & Robot Face Display',
    category: 'COMPUTE',
    title: 'Raspberry Pi & High-Res Robot Face LCD',
    subtitle: 'Quad-Core 64-bit SoC + Animated Eye UI',
    description:
      'Top-deck primary intelligence hub. Drives real-time animated emotive robot eyes, OpenCV vision algorithms, speech recognition, and high-level autonomous navigation pathways.',
    howItWorks:
      'Executes Python/OpenCV computer vision and GUI render loops on the 3.5" high-contrast display. Translates sensor state and obstacle telemetry into expressive dynamic eye animations (listening, excited, alert).',
    specs: [
      'Quad-Core ARM Cortex-A72 @ 1.5 GHz',
      '3.5" 480×320 IPS display with custom Canvas eye animation engine',
      'Dual-band 2.4/5.0 GHz Wi-Fi & Bluetooth 5.0 BLE',
      'USB 3.0 / GPIO interface for sensor shield telemetry',
    ],
    pinout: '40-pin GPIO, HDMI / DSI, USB 3.0, Type-C Power',
    voltage: '5.1V DC / 3.0A Type-C',
    cameraTarget: { x: 0, y: 0.65, z: 2.2, lookAtY: 0.5 },
    accentColor: '#38bdf8',
    telemetry: [
      { label: 'CPU LOAD', value: '18% QUAD' },
      { label: 'EYE STATE', value: 'LISTENING' },
      { label: 'FRAME RATE', value: '60 FPS' },
    ],
  },
  {
    id: 'gear_motors',
    name: 'TT DC Gear Motors (1:48)',
    category: 'ACTUATOR',
    title: 'Dual TT DC Gearbox Motors',
    subtitle: 'High-Torque 1:48 Reduction Gearbox (200 RPM)',
    description:
      'High-efficiency brushed DC motors paired with rugged yellow reduction gearboxes and dual-output shafts, delivering smooth acceleration and substantial hill-climbing torque.',
    howItWorks:
      'Pulse-Width Modulation (PWM) from the motor driver regulates coil voltage. Internal multi-stage spur gears convert 10,000 RPM armature rotation into 200 RPM high-torque wheel drive.',
    specs: [
      'Gearbox Ratio: 1:48 high-torque reduction',
      'No-Load Speed: 200 RPM @ 6V DC',
      'Stall Torque: 0.8 kg·cm (78 mN·m)',
      'Dual flat D-shaft with anti-slip lock coupler',
    ],
    pinout: 'Motor+ / Motor- to L298N H-Bridge Output Terminals',
    voltage: '3V - 9V DC (6V Nominal)',
    cameraTarget: { x: 0.6, y: -0.1, z: 2.0, lookAtY: -0.1 },
    accentColor: '#f59e0b',
    telemetry: [
      { label: 'RATIO', value: '1:48 TORQUE' },
      { label: 'MAX RPM', value: '200 RPM' },
      { label: 'STALL TORQUE', value: '0.8 kg·cm' },
    ],
  },
  {
    id: 'wheels',
    name: 'High-Grip Tread Wheels & Yellow Hubs',
    category: 'TRACTION',
    title: '65mm Deep-Tread Rubber Wheels',
    subtitle: 'High-Friction Anti-Slip Tire on 5-Spoke Yellow Hub',
    description:
      'Rugged 65mm all-terrain drive wheels featuring yellow polymer 5-spoke hub assemblies and deep cross-tread vulcanized rubber tires designed for zero-slip skid steering.',
    howItWorks:
      'The deep rubber chevron tread maximizes static friction (μ ≈ 0.85). Differential speed variation between left and right wheels enables zero-radius pivot spinning and precise heading adjustments.',
    specs: [
      'Wheel Diameter: 65 mm | Width: 26 mm',
      'Tire Material: High-friction vulcanized elastomer',
      'Rim: Reinforced ABS 5-spoke impact hub',
      'Center lock brass threaded axle mount',
    ],
    pinout: 'Mechanical D-Axle Press Fit + Lock Screw',
    voltage: 'Mechanical Component',
    cameraTarget: { x: -0.65, y: -0.15, z: 2.0, lookAtY: -0.15 },
    accentColor: '#eab308',
    telemetry: [
      { label: 'DIAMETER', value: '65 mm' },
      { label: 'TIRE COMPOUND', value: 'RUBBER TREAD' },
      { label: 'FRICTION μ', value: '0.85 STATIC' },
    ],
  },
  {
    id: 'microcontroller',
    name: 'Microcontroller & Sensor Shield',
    category: 'COMPUTE',
    title: 'Microcontroller & Sensor Shield V5.0',
    subtitle: '16MHz / 240MHz Real-Time I/O Controller',
    description:
      'Deterministic low-level peripheral controller board equipped with a multi-pin Sensor Expansion Shield providing dedicated 3-pin G-V-S headers for ultrasonic sensors, servos, and PWM motor gates.',
    howItWorks:
      'Runs bare-metal firmware with 1kHz timer interrupts to generate precise microsecond pulses for the ultrasonic trigger and PWM waveforms for differential speed control.',
    specs: [
      '14 Digital I/O Pins (6 PWM channels)',
      '6 Analog Input Pins (10-bit ADC)',
      'Sensor Shield V5.0 with dedicated 3-pin G-V-S headers',
      'Hardware UART, I2C, and SPI bus communication',
    ],
    pinout: 'PWM D3, D5, D6, D9, D10, D11 | I2C A4/A5',
    voltage: '5V DC Logic / 7-12V Vin',
    cameraTarget: { x: 0, y: 0.3, z: 2.0, lookAtY: 0.25 },
    accentColor: '#10b981',
    telemetry: [
      { label: 'PWM CHANNELS', value: '6 HARDWARE' },
      { label: 'INTERRUPT', value: '< 5 µs ISR' },
      { label: 'BUS INTERFACE', value: 'I2C / SPI / UART' },
    ],
  },
  {
    id: 'battery_pack',
    name: 'Dual 18650 Li-Ion Battery Pack',
    category: 'POWER',
    title: '7.4V Dual 18650 Li-Ion Power System',
    subtitle: 'High-Discharge 2S Battery Pack (5200 mAh)',
    description:
      'Rear-mounted enclosed high-discharge lithium-ion battery module with integrated master power toggle switch, low-voltage cutoff, and isolated power rails for logic and motors.',
    howItWorks:
      'Supplies raw 7.4V - 8.4V unregulated power to the L298N motor driver and steps down through a high-efficiency DC-DC buck regulator to provide clean 5.0V ripple-free power to the computing units.',
    specs: [
      'Chemistry: 2S Lithium-Ion (18650 cells)',
      'Nominal Voltage: 7.4V (8.4V Peak fully charged)',
      'Capacity: 5200 mAh total energy storage',
      'Integrated Master On/Off Rocker Switch',
    ],
    pinout: 'Red (+) 7.4V Rail, Black (-) Common Ground',
    voltage: '7.4V - 8.4V DC',
    cameraTarget: { x: 0, y: 0.25, z: -2.0, lookAtY: 0.2 },
    accentColor: '#ec4899',
    telemetry: [
      { label: 'VOLTAGE', value: '7.85 V DC' },
      { label: 'CAPACITY', value: '5,200 mAh' },
      { label: 'RUNTIME', value: '4.5 HOURS' },
    ],
  },
  {
    id: 'motor_driver',
    name: 'L298N Dual H-Bridge Motor Driver',
    category: 'ACTUATOR',
    title: 'L298N Dual Full-Bridge Motor Driver',
    subtitle: '2A Peak Current Driver with Aluminum Heatsink',
    description:
      'Heavy-duty dual H-bridge motor driver module featuring a finned aluminum cooling heatsink, onboard 5V regulator, and optocoupler isolation for robust inductive spike protection.',
    howItWorks:
      'Transistor H-bridge configurations swap current polarity across motor coils to change rotation direction (forward/reverse). PWM duty cycle on ENA/ENB controls motor velocity.',
    specs: [
      'Dual H-Bridge Driver IC with internal flyback diodes',
      'Peak Output Current: 2.0A per channel',
      'Control Logic: IN1, IN2, IN3, IN4 directional pins + ENA/ENB PWM',
      'Black extruded aluminum heatsink for thermal dissipation',
    ],
    pinout: 'IN1, IN2, IN3, IN4, ENA, ENB, Motor A/B Screw Terminals',
    voltage: '5V - 35V Motor Vin',
    cameraTarget: { x: -0.3, y: 0.05, z: 2.0, lookAtY: 0.05 },
    accentColor: '#ef4444',
    telemetry: [
      { label: 'PEAK CURRENT', value: '2.0A / CH' },
      { label: 'HEATSINK TEMP', value: '38.4 °C' },
      { label: 'EFFICIENCY', value: '88% ACTIVE' },
    ],
  },
  {
    id: 'chassis',
    name: 'Dual-Tier Laser-Cut Chassis',
    category: 'CHASSIS',
    title: 'Dual-Tier Laser-Cut Acrylic Platform',
    subtitle: 'Black Acrylic Decks & Brass Standoff Pillars',
    description:
      'Rigid dual-tier black acrylic chassis platform engineered with precision laser-cut mounting matrices for modular sensor positioning, low center-of-gravity, and brass structural standoffs.',
    howItWorks:
      'Distributes component payload evenly over the wheelbase to maintain optimal ground friction while providing internal clearance for cable routing and motor gearboxes.',
    specs: [
      'Material: 3.0mm high-gloss laser-cut black acrylic',
      'Hardware: M3 brass hexagonal standoffs & stainless steel screws',
      'Modular mounting grid for sensors, controllers, and cameras',
      'Integrated wire pass-through routing channels',
    ],
    pinout: 'Mechanical Chassis Assembly',
    voltage: 'Structural Component',
    cameraTarget: { x: 0, y: 0.0, z: 2.4, lookAtY: 0.0 },
    accentColor: '#94a3b8',
    telemetry: [
      { label: 'PAYLOAD CAP', value: '1.5 kg' },
      { label: 'MATERIAL', value: '3mm ACRYLIC' },
      { label: 'STANDOFFS', value: 'M3 BRASS' },
    ],
  },
];

export interface WheeledRobotInstance {
  rootGroup: THREE.Group;
  screenGroup: THREE.Group;
  screenMesh: THREE.Mesh;
  chassisTop: THREE.Group;
  chassisBottom: THREE.Group;
  sensorPanGroup: THREE.Group;
  sonarWaveMesh: THREE.Mesh;
  wheelFrontLeft: THREE.Group;
  wheelFrontRight: THREE.Group;
  wheelRearLeft: THREE.Group;
  wheelRearRight: THREE.Group;
  motorFL: THREE.Group;
  motorFR: THREE.Group;
  motorRL: THREE.Group;
  motorRR: THREE.Group;
  batteryPack: THREE.Group;
  electronicsBoard: THREE.Group;
  clickableObjects: THREE.Object3D[];
  materials: Record<string, THREE.Material>;
  updateFaceCanvas: (expression: 'listening' | 'scanning' | 'excited' | 'alert' | 'idle', obstacleCm?: number) => void;
  setDriveCommand: (cmd: 'forward' | 'backward' | 'left' | 'right' | 'spin' | 'stop', speedPercent?: number) => void;
  setFinish: (finish: WheeledRobotFinish) => void;
  animate: (elapsedTime: number, delta: number, options?: { isScanning?: boolean; obstacleCm?: number }) => void;
}

/**
 * Creates the authentic Wheeled Robotic Car 3D model matching the user's reference photos.
 */
export function createWheeledRobot(scale: number = 1.0, initialFinish: WheeledRobotFinish = 'authentic_lab'): WheeledRobotInstance {
  const rootGroup = new THREE.Group();
  rootGroup.scale.setScalar(scale);

  const clickableObjects: THREE.Object3D[] = [];

  // -------------------------------------------------------------
  // 1. PROCEDURAL TEXTURES & MASTER PBR MATERIALS
  // -------------------------------------------------------------
  const carbonTex = createCarbonFiberTexture();
  const brushedBump = createBrushedMetalBumpMap();

  // Acrylic Glossy Black Chassis Material
  const acrylicBlack = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.15,
    metalness: 0.85,
    envMapIntensity: 2.0,
    bumpMap: brushedBump,
    bumpScale: 0.002,
  });

  // Bright Yellow Gearbox Plastic (TT Motor Housing)
  const yellowPlastic = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Vibrant yellow/amber
    roughness: 0.35,
    metalness: 0.1,
    envMapIntensity: 1.2,
  });

  // Yellow Wheel Hub Material
  const yellowRimMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.28,
    metalness: 0.15,
    envMapIntensity: 1.5,
  });

  // Deep Tread Rubber Tire Material
  const rubberTreadMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.05,
    bumpMap: carbonTex,
    bumpScale: 0.05,
    envMapIntensity: 0.5,
  });

  // HC-SR04 Blue PCB Material
  const pcbBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Vibrant blue PCB
    roughness: 0.3,
    metalness: 0.4,
    envMapIntensity: 1.6,
  });

  // Controller Dark Green / Blue PCB Material
  const pcbController = new THREE.MeshStandardMaterial({
    color: 0x064e3b, // Emerald / dark green PCB
    roughness: 0.35,
    metalness: 0.4,
    envMapIntensity: 1.5,
  });

  // Silver Acoustic Transducer Mesh / Metal Can Material
  const silverTransducer = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.18,
    metalness: 0.95,
    envMapIntensity: 2.5,
  });

  // Transducer Mesh Screen Material (Darker Silver)
  const meshTransducer = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.45,
    metalness: 0.8,
    bumpMap: carbonTex,
    bumpScale: 0.08,
  });

  // Brass Hex Standoffs Material
  const brassStandoff = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Amber brass
    roughness: 0.22,
    metalness: 0.92,
    envMapIntensity: 2.6,
  });

  // Polished Chrome Screws & Motors
  const chromeMetal = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.08,
    metalness: 0.98,
    envMapIntensity: 3.0,
  });

  // Blue Mini-Servo SG90 Material
  const servoBlue = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.9,
  });

  // Red L298N Heatsink Material
  const redHeatsink = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.25,
    metalness: 0.7,
  });

  // Glowing Cyan Sonar Acoustic Wave Material
  const sonarWaveMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    wireframe: true,
  });

  // -------------------------------------------------------------
  // 2. DYNAMIC ROBOT FACE CANVAS TEXTURE (Animated Eyes)
  // -------------------------------------------------------------
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 512;
  faceCanvas.height = 320;
  const faceCtx = faceCanvas.getContext('2d')!;

  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.minFilter = THREE.LinearFilter;
  faceTexture.magFilter = THREE.LinearFilter;

  const screenDisplayMat = new THREE.MeshBasicMaterial({
    map: faceTexture,
  });

  let currentExpression: 'listening' | 'scanning' | 'excited' | 'alert' | 'idle' = 'listening';
  let eyeBlinkTimer = 0;
  let eyeLookOffset = { x: 0, y: 0 };
  let currentObstacleDistance = 48;

  const drawFace = () => {
    if (!faceCtx) return;
    const w = faceCanvas.width;
    const h = faceCanvas.height;

    // Dark terminal background
    faceCtx.fillStyle = '#050b14';
    faceCtx.fillRect(0, 0, w, h);

    // Subtle grid scanlines
    faceCtx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    faceCtx.lineWidth = 1;
    for (let y = 0; y < h; y += 8) {
      faceCtx.beginPath();
      faceCtx.moveTo(0, y);
      faceCtx.lineTo(w, y);
      faceCtx.stroke();
    }

    // Top Window Header Bar (like reference image `Unnamed Window`)
    faceCtx.fillStyle = '#0f172a';
    faceCtx.fillRect(0, 0, w, 32);
    faceCtx.fillStyle = '#38bdf8';
    faceCtx.font = 'bold 14px monospace';
    faceCtx.fillText('Unnamed Window', w / 2 - 60, 21);

    // Window controls
    faceCtx.fillStyle = '#64748b';
    faceCtx.fillText('—  □  ✕', w - 75, 21);

    // Status pill
    let statusText = '[ LISTENING ]';
    let statusColor = '#38bdf8';
    if (currentExpression === 'scanning') {
      statusText = '[ SCANNING... ]';
      statusColor = '#00f0ff';
    } else if (currentExpression === 'excited') {
      statusText = '[ HIGH SPEED DRIVE ]';
      statusColor = '#10b981';
    } else if (currentExpression === 'alert') {
      statusText = `[ CAUTION: ${currentObstacleDistance}cm ]`;
      statusColor = '#f43f5e';
    } else if (currentExpression === 'idle') {
      statusText = '[ STANDBY ]';
      statusColor = '#94a3b8';
    }

    faceCtx.fillStyle = statusColor;
    faceCtx.font = 'bold 15px monospace';
    faceCtx.fillText(statusText, 24, 60);

    // Calculate Eye Blink / Squint
    const isBlinking = eyeBlinkTimer > 3.8 && eyeBlinkTimer < 4.0;
    const eyeHeight = isBlinking ? 6 : currentExpression === 'alert' ? 70 : 85;
    const eyeWidth = currentExpression === 'alert' ? 88 : 80;
    const eyeCornerRadius = isBlinking ? 3 : 24;

    const leftEyeX = 140 + eyeLookOffset.x;
    const rightEyeX = 292 + eyeLookOffset.x;
    const eyeY = 145 + eyeLookOffset.y;

    // Glowing Neon Robot Eyes (Cyan rounded rectangles from reference image)
    const drawEye = (x: number, y: number) => {
      faceCtx.save();
      // Outer glow
      faceCtx.shadowColor = currentExpression === 'alert' ? '#f43f5e' : '#00f0ff';
      faceCtx.shadowBlur = 25;
      faceCtx.fillStyle = currentExpression === 'alert' ? '#fb7185' : '#38bdf8';

      // Rounded Eye Path
      faceCtx.beginPath();
      faceCtx.roundRect(x - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, eyeCornerRadius);
      faceCtx.fill();

      // Inner intense core
      if (!isBlinking) {
        faceCtx.shadowBlur = 8;
        faceCtx.fillStyle = '#ffffff';
        faceCtx.beginPath();
        faceCtx.roundRect(x - eyeWidth / 2 + 10, y - eyeHeight / 2 + 8, eyeWidth - 20, eyeHeight - 16, 16);
        faceCtx.fill();
      }

      faceCtx.restore();
    };

    drawEye(leftEyeX, eyeY);
    drawEye(rightEyeX, eyeY);

    // Bottom Taskbar Controls (from reference image)
    faceCtx.fillStyle = '#090e17';
    faceCtx.fillRect(0, h - 36, w, 36);

    faceCtx.fillStyle = '#0284c7';
    faceCtx.font = '11px monospace';
    faceCtx.fillText('ESC:quit', 20, h - 14);

    // Audio Visualizer mini bars on screen bottom
    const barCount = 10;
    for (let i = 0; i < barCount; i++) {
      const barH = 4 + Math.sin(Date.now() * 0.008 + i) * 6;
      faceCtx.fillStyle = '#38bdf8';
      faceCtx.fillRect(160 + i * 12, h - 22 - barH / 2, 8, barH);
    }

    // Wi-Fi / Battery icons
    faceCtx.fillStyle = '#38bdf8';
    faceCtx.fillText('📶  🔋 98%  [▶ 2!]', w - 160, h - 14);

    faceTexture.needsUpdate = true;
  };

  const updateFaceCanvas = (expression: 'listening' | 'scanning' | 'excited' | 'alert' | 'idle', obstacleCm?: number) => {
    currentExpression = expression;
    if (obstacleCm !== undefined) currentObstacleDistance = obstacleCm;
    drawFace();
  };

  // Initial draw
  drawFace();

  // -------------------------------------------------------------
  // 3. 3D CHASSIS GEOMETRY & ASSEMBLY
  // -------------------------------------------------------------
  // Lower Acrylic Chassis Plate
  const chassisBottom = new THREE.Group();
  rootGroup.add(chassisBottom);

  const bottomPlateShape = new THREE.Shape();
  const pw = 1.3;
  const pl = 1.8;
  const pr = 0.22;
  bottomPlateShape.moveTo(-pw / 2 + pr, -pl / 2);
  bottomPlateShape.lineTo(pw / 2 - pr, -pl / 2);
  bottomPlateShape.quadraticCurveTo(pw / 2, -pl / 2, pw / 2, -pl / 2 + pr);
  bottomPlateShape.lineTo(pw / 2, pl / 2 - pr);
  bottomPlateShape.quadraticCurveTo(pw / 2, pl / 2, pw / 2 - pr, pl / 2);
  bottomPlateShape.lineTo(-pw / 2 + pr, pl / 2);
  bottomPlateShape.quadraticCurveTo(-pw / 2, pl / 2, -pw / 2, pl / 2 - pr);
  bottomPlateShape.lineTo(-pw / 2, -pl / 2 + pr);
  bottomPlateShape.quadraticCurveTo(-pw / 2, -pl / 2, -pw / 2 + pr, -pl / 2);

  const extrudeSettings = {
    depth: 0.035,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  };

  const bottomPlateGeom = new THREE.ExtrudeGeometry(bottomPlateShape, extrudeSettings);
  const bottomPlateMesh = new THREE.Mesh(bottomPlateGeom, acrylicBlack);
  bottomPlateMesh.rotation.x = Math.PI / 2;
  bottomPlateMesh.position.set(0, -0.15, 0);
  bottomPlateMesh.userData = { componentId: 'chassis', componentName: 'Lower Acrylic Chassis Plate' };
  clickableObjects.push(bottomPlateMesh);
  chassisBottom.add(bottomPlateMesh);

  // Upper Acrylic Deck Plate
  const chassisTop = new THREE.Group();
  rootGroup.add(chassisTop);

  const topPlateGeom = new THREE.ExtrudeGeometry(bottomPlateShape, extrudeSettings);
  const topPlateMesh = new THREE.Mesh(topPlateGeom, acrylicBlack);
  topPlateMesh.rotation.x = Math.PI / 2;
  topPlateMesh.position.set(0, 0.22, 0);
  topPlateMesh.userData = { componentId: 'chassis', componentName: 'Upper Acrylic Deck Plate' };
  clickableObjects.push(topPlateMesh);
  chassisTop.add(topPlateMesh);

  // Brass Hexagonal Standoff Pillars (connecting bottom and top chassis)
  const standoffGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.36, 6);
  const standoffPositions = [
    [-0.55, 0.035, -0.65],
    [0.55, 0.035, -0.65],
    [-0.55, 0.035, 0.65],
    [0.55, 0.035, 0.65],
    [-0.55, 0.035, 0.0],
    [0.55, 0.035, 0.0],
  ];

  standoffPositions.forEach((pos) => {
    const standoffMesh = new THREE.Mesh(standoffGeom, brassStandoff);
    standoffMesh.position.set(pos[0], pos[1], pos[2]);
    standoffMesh.userData = { componentId: 'chassis', componentName: 'Brass M3 Hex Standoff' };
    clickableObjects.push(standoffMesh);
    rootGroup.add(standoffMesh);

    // Top and bottom chrome screw heads
    const screwGeom = new THREE.CylinderGeometry(0.032, 0.032, 0.015, 12);
    const topScrew = new THREE.Mesh(screwGeom, chromeMetal);
    topScrew.position.set(pos[0], 0.245, pos[2]);
    rootGroup.add(topScrew);

    const bottomScrew = new THREE.Mesh(screwGeom, chromeMetal);
    bottomScrew.position.set(pos[0], -0.175, pos[2]);
    rootGroup.add(bottomScrew);
  });

  // -------------------------------------------------------------
  // 4. YELLOW TT DC GEAR MOTORS & BRACKETS
  // -------------------------------------------------------------
  const createTTMotor = (isLeft: boolean, name: string) => {
    const motorGroup = new THREE.Group();

    // Yellow Rectangular Gearbox Housing
    const boxGeom = new THREE.BoxGeometry(0.24, 0.38, 0.65);
    const boxMesh = new THREE.Mesh(boxGeom, yellowPlastic);
    boxMesh.userData = { componentId: 'gear_motors', componentName: name };
    clickableObjects.push(boxMesh);
    motorGroup.add(boxMesh);

    // Cylindrical Silver DC Motor Can behind gearbox
    const canGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.32, 16);
    const canMesh = new THREE.Mesh(canGeom, chromeMetal);
    canMesh.rotation.x = Math.PI / 2;
    canMesh.position.set(0, 0, isLeft ? 0.35 : -0.35);
    canMesh.userData = { componentId: 'gear_motors', componentName: `${name} (DC Motor Can)` };
    clickableObjects.push(canMesh);
    motorGroup.add(canMesh);

    // White Axle Output Hub
    const axleGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 12);
    const whiteAxleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const axleMesh = new THREE.Mesh(axleGeom, whiteAxleMat);
    axleMesh.rotation.z = Math.PI / 2;
    axleMesh.position.set(isLeft ? -0.16 : 0.16, 0, 0);
    motorGroup.add(axleMesh);

    // Black Metal Mounting Bracket
    const bracketGeom = new THREE.BoxGeometry(0.04, 0.42, 0.48);
    const bracketMesh = new THREE.Mesh(bracketGeom, acrylicBlack);
    bracketMesh.position.set(isLeft ? 0.12 : -0.12, 0, 0);
    motorGroup.add(bracketMesh);

    return motorGroup;
  };

  const motorFL = createTTMotor(true, 'Front-Left TT DC Gear Motor');
  motorFL.position.set(-0.46, -0.05, 0.45);
  rootGroup.add(motorFL);

  const motorFR = createTTMotor(false, 'Front-Right TT DC Gear Motor');
  motorFR.position.set(0.46, -0.05, 0.45);
  rootGroup.add(motorFR);

  const motorRL = createTTMotor(true, 'Rear-Left TT DC Gear Motor');
  motorRL.position.set(-0.46, -0.05, -0.45);
  rootGroup.add(motorRL);

  const motorRR = createTTMotor(false, 'Rear-Right TT DC Gear Motor');
  motorRR.position.set(0.46, -0.05, -0.45);
  rootGroup.add(motorRR);

  // -------------------------------------------------------------
  // 5. HIGH-GRIP TREAD WHEELS & YELLOW HUBS
  // -------------------------------------------------------------
  const createWheel = (name: string, isLeft: boolean) => {
    const wheelGroup = new THREE.Group();

    // Outer Rubber Tire with Deep Tread Grooves
    const tireOuterRadius = 0.38;
    const tireInnerRadius = 0.26;
    const tireWidth = 0.22;

    const tireGeom = new THREE.CylinderGeometry(tireOuterRadius, tireOuterRadius, tireWidth, 28, 1);
    const tireMesh = new THREE.Mesh(tireGeom, rubberTreadMat);
    tireMesh.rotation.z = Math.PI / 2;
    tireMesh.userData = { componentId: 'wheels', componentName: `${name} (Rubber Tread)` };
    clickableObjects.push(tireMesh);
    wheelGroup.add(tireMesh);

    // Chevron Tread Ribs (Detailed procedural treads)
    const treadCount = 16;
    for (let i = 0; i < treadCount; i++) {
      const angle = (i / treadCount) * Math.PI * 2;
      const ribGeom = new THREE.BoxGeometry(tireWidth * 0.9, 0.035, 0.045);
      const ribMesh = new THREE.Mesh(ribGeom, rubberTreadMat);
      ribMesh.position.set(
        0,
        Math.cos(angle) * (tireOuterRadius + 0.01),
        Math.sin(angle) * (tireOuterRadius + 0.01)
      );
      ribMesh.rotation.x = -angle;
      wheelGroup.add(ribMesh);
    }

    // Yellow 5-Spoke Wheel Rim Hub
    const hubDiskGeom = new THREE.CylinderGeometry(tireInnerRadius + 0.02, tireInnerRadius + 0.02, tireWidth * 0.85, 24);
    const hubMesh = new THREE.Mesh(hubDiskGeom, yellowRimMat);
    hubMesh.rotation.z = Math.PI / 2;
    hubMesh.userData = { componentId: 'wheels', componentName: `${name} (Yellow 5-Spoke Hub)` };
    clickableObjects.push(hubMesh);
    wheelGroup.add(hubMesh);

    // 5 Spokes Cutout Details
    for (let s = 0; s < 5; s++) {
      const spokeAngle = (s / 5) * Math.PI * 2;
      const cutoutGeom = new THREE.CylinderGeometry(0.045, 0.045, tireWidth + 0.02, 12);
      const cutoutMesh = new THREE.Mesh(cutoutGeom, acrylicBlack);
      cutoutMesh.rotation.z = Math.PI / 2;
      cutoutMesh.position.set(
        0,
        Math.cos(spokeAngle) * (tireInnerRadius * 0.6),
        Math.sin(spokeAngle) * (tireInnerRadius * 0.6)
      );
      wheelGroup.add(cutoutMesh);
    }

    // Center Lock Nut & D-Shaft Screw
    const nutGeom = new THREE.CylinderGeometry(0.065, 0.065, tireWidth + 0.04, 6);
    const nutMesh = new THREE.Mesh(nutGeom, chromeMetal);
    nutMesh.rotation.z = Math.PI / 2;
    wheelGroup.add(nutMesh);

    return wheelGroup;
  };

  const wheelFrontLeft = createWheel('Front-Left Wheel', true);
  wheelFrontLeft.position.set(-0.78, -0.05, 0.45);
  rootGroup.add(wheelFrontLeft);

  const wheelFrontRight = createWheel('Front-Right Wheel', false);
  wheelFrontRight.position.set(0.78, -0.05, 0.45);
  rootGroup.add(wheelFrontRight);

  const wheelRearLeft = createWheel('Rear-Left Wheel', true);
  wheelRearLeft.position.set(-0.78, -0.05, -0.45);
  rootGroup.add(wheelRearLeft);

  const wheelRearRight = createWheel('Rear-Right Wheel', false);
  wheelRearRight.position.set(0.78, -0.05, -0.45);
  rootGroup.add(wheelRearRight);

  // -------------------------------------------------------------
  // 6. FRONT HC-SR04 ULTRASONIC SENSOR & PAN SERVO
  // -------------------------------------------------------------
  const sensorPanGroup = new THREE.Group();
  sensorPanGroup.position.set(0, 0.18, 0.92);
  rootGroup.add(sensorPanGroup);

  // SG90 Blue Micro-Servo Motor Base
  const servoGeom = new THREE.BoxGeometry(0.18, 0.22, 0.28);
  const servoMesh = new THREE.Mesh(servoGeom, servoBlue);
  servoMesh.position.set(0, -0.08, -0.05);
  servoMesh.userData = { componentId: 'ultrasonic_sensor', componentName: 'SG90 Pan Micro-Servo' };
  clickableObjects.push(servoMesh);
  sensorPanGroup.add(servoMesh);

  // HC-SR04 Blue PCB
  const pcbGeom = new THREE.BoxGeometry(0.68, 0.32, 0.04);
  const pcbMesh = new THREE.Mesh(pcbGeom, pcbBlue);
  pcbMesh.position.set(0, 0.1, 0.05);
  pcbMesh.userData = { componentId: 'ultrasonic_sensor', componentName: 'HC-SR04 Ultrasonic Sonar Module' };
  clickableObjects.push(pcbMesh);
  sensorPanGroup.add(pcbMesh);

  // Dual Cylindrical Acoustic Transducers ("T" Transmitter & "R" Receiver)
  const barrelRadius = 0.11;
  const barrelLength = 0.16;
  const barrelGeom = new THREE.CylinderGeometry(barrelRadius, barrelRadius, barrelLength, 20);

  // Left Barrel (Transmitter)
  const leftBarrelMesh = new THREE.Mesh(barrelGeom, silverTransducer);
  leftBarrelMesh.rotation.x = Math.PI / 2;
  leftBarrelMesh.position.set(-0.2, 0.1, 0.13);
  leftBarrelMesh.userData = { componentId: 'ultrasonic_sensor', componentName: 'HC-SR04 Sonar Transmitter [T]' };
  clickableObjects.push(leftBarrelMesh);
  sensorPanGroup.add(leftBarrelMesh);

  // Left Barrel Mesh Grill
  const grillGeom = new THREE.CircleGeometry(barrelRadius * 0.88, 16);
  const leftGrillMesh = new THREE.Mesh(grillGeom, meshTransducer);
  leftGrillMesh.position.set(-0.2, 0.1, 0.211);
  sensorPanGroup.add(leftGrillMesh);

  // Right Barrel (Receiver)
  const rightBarrelMesh = new THREE.Mesh(barrelGeom, silverTransducer);
  rightBarrelMesh.rotation.x = Math.PI / 2;
  rightBarrelMesh.position.set(0.2, 0.1, 0.13);
  rightBarrelMesh.userData = { componentId: 'ultrasonic_sensor', componentName: 'HC-SR04 Sonar Receiver [R]' };
  clickableObjects.push(rightBarrelMesh);
  sensorPanGroup.add(rightBarrelMesh);

  // Right Barrel Mesh Grill
  const rightGrillMesh = new THREE.Mesh(grillGeom, meshTransducer);
  rightGrillMesh.position.set(0.2, 0.1, 0.211);
  sensorPanGroup.add(rightGrillMesh);

  // 4-Pin Header and Multi-Color Jumper Wires
  const pinHeaderGeom = new THREE.BoxGeometry(0.18, 0.06, 0.08);
  const pinHeaderMesh = new THREE.Mesh(pinHeaderGeom, acrylicBlack);
  pinHeaderMesh.position.set(0, -0.05, 0.05);
  sensorPanGroup.add(pinHeaderMesh);

  // Animated 3D Sonar Wave (Acoustic Cone radiating forward)
  const waveGeom = new THREE.ConeGeometry(0.8, 1.8, 16, 4, true);
  const sonarWaveMesh = new THREE.Mesh(waveGeom, sonarWaveMat);
  sonarWaveMesh.rotation.x = -Math.PI / 2;
  sonarWaveMesh.position.set(0, 0.1, 1.0);
  sonarWaveMesh.visible = true;
  sensorPanGroup.add(sonarWaveMesh);

  // -------------------------------------------------------------
  // 7. TOP RASPBERRY PI & ANIMATED ROBOT FACE LCD DISPLAY
  // -------------------------------------------------------------
  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, 0.65, 0.05);
  rootGroup.add(screenGroup);

  // LCD Screen Outer Bezel Frame (Black with soft chamfer)
  const screenWidth = 1.15;
  const screenHeight = 0.72;
  const screenDepth = 0.08;

  const bezelGeom = new THREE.BoxGeometry(screenWidth, screenHeight, screenDepth);
  const bezelMesh = new THREE.Mesh(bezelGeom, acrylicBlack);
  bezelMesh.userData = { componentId: 'robot_display', componentName: 'Raspberry Pi LCD Screen Bezel' };
  clickableObjects.push(bezelMesh);
  screenGroup.add(bezelMesh);

  // Active Display Panel Plane (Hosts the dynamic animated robot face texture!)
  const displayPlaneGeom = new THREE.PlaneGeometry(screenWidth * 0.94, screenHeight * 0.92);
  const screenMesh = new THREE.Mesh(displayPlaneGeom, screenDisplayMat);
  screenMesh.position.set(0, 0, screenDepth / 2 + 0.005);
  screenMesh.userData = { componentId: 'robot_display', componentName: 'Interactive Animated Robot Face' };
  clickableObjects.push(screenMesh);
  screenGroup.add(screenMesh);

  // Raspberry Pi Board Mounted behind display
  const piBoardGeom = new THREE.BoxGeometry(0.95, 0.62, 0.04);
  const piBoardMesh = new THREE.Mesh(piBoardGeom, pcbController);
  piBoardMesh.position.set(0, 0, -screenDepth / 2 - 0.025);
  piBoardMesh.userData = { componentId: 'robot_display', componentName: 'Raspberry Pi 4 Quad-Core SBC' };
  clickableObjects.push(piBoardMesh);
  screenGroup.add(piBoardMesh);

  // USB Wi-Fi / Dongles on the side (matching reference image)
  const usbDongleGeom = new THREE.BoxGeometry(0.12, 0.08, 0.16);
  const usbDongleMesh = new THREE.Mesh(usbDongleGeom, acrylicBlack);
  usbDongleMesh.position.set(screenWidth / 2 + 0.05, 0.1, 0);
  screenGroup.add(usbDongleMesh);

  const usbMetalGeom = new THREE.BoxGeometry(0.04, 0.06, 0.12);
  const usbMetalMesh = new THREE.Mesh(usbMetalGeom, chromeMetal);
  usbMetalMesh.position.set(screenWidth / 2 + 0.01, 0.1, 0);
  screenGroup.add(usbMetalMesh);

  // Dual Rear Display Metal Support Stems
  const supportPoleGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.45, 12);
  const leftPole = new THREE.Mesh(supportPoleGeom, brassStandoff);
  leftPole.position.set(-0.35, -0.22, -0.05);
  screenGroup.add(leftPole);

  const rightPole = new THREE.Mesh(supportPoleGeom, brassStandoff);
  rightPole.position.set(0.35, -0.22, -0.05);
  screenGroup.add(rightPole);

  // -------------------------------------------------------------
  // 8. MICROCONTROLLER & SENSOR EXPANSION SHIELD
  // -------------------------------------------------------------
  const electronicsBoard = new THREE.Group();
  electronicsBoard.position.set(0, 0.26, 0.32);
  rootGroup.add(electronicsBoard);

  // Lower Microcontroller Board (Arduino / ESP32)
  const mcuGeom = new THREE.BoxGeometry(0.72, 0.035, 0.52);
  const mcuMesh = new THREE.Mesh(mcuGeom, pcbBlue);
  mcuMesh.userData = { componentId: 'microcontroller', componentName: 'Microcontroller Base Board' };
  clickableObjects.push(mcuMesh);
  electronicsBoard.add(mcuMesh);

  // Top Sensor Expansion Shield V5.0
  const shieldGeom = new THREE.BoxGeometry(0.68, 0.03, 0.48);
  const shieldMesh = new THREE.Mesh(shieldGeom, pcbController);
  shieldMesh.position.set(0, 0.04, 0);
  shieldMesh.userData = { componentId: 'microcontroller', componentName: 'Sensor Shield V5.0 Expansion' };
  clickableObjects.push(shieldMesh);
  electronicsBoard.add(shieldMesh);

  // Red & Black Pin Header Rows on Shield
  const redHeaderMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const blackHeaderMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
  const yellowHeaderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });

  for (let r = 0; r < 3; r++) {
    const rowGeom = new THREE.BoxGeometry(0.5, 0.04, 0.025);
    const rowMat = r === 0 ? yellowHeaderMat : r === 1 ? redHeaderMat : blackHeaderMat;
    const rowMesh = new THREE.Mesh(rowGeom, rowMat);
    rowMesh.position.set(0, 0.07, -0.15 + r * 0.04);
    electronicsBoard.add(rowMesh);
  }

  // Silver USB Type-B Port
  const usbPortGeom = new THREE.BoxGeometry(0.12, 0.08, 0.14);
  const usbPortMesh = new THREE.Mesh(usbPortGeom, chromeMetal);
  usbPortMesh.position.set(-0.28, 0.05, -0.18);
  electronicsBoard.add(usbPortMesh);

  // -------------------------------------------------------------
  // 9. DUAL 18650 LI-ION BATTERY ENCLOSURE
  // -------------------------------------------------------------
  const batteryPack = new THREE.Group();
  batteryPack.position.set(0, 0.32, -0.52);
  rootGroup.add(batteryPack);

  // Black Enclosed Battery Case (matching reference photo)
  const caseGeom = new THREE.BoxGeometry(0.68, 0.22, 0.48);
  const caseMesh = new THREE.Mesh(caseGeom, acrylicBlack);
  caseMesh.userData = { componentId: 'battery_pack', componentName: 'Dual 18650 Li-Ion Battery Box' };
  clickableObjects.push(caseMesh);
  batteryPack.add(caseMesh);

  // Master Rocker Power Switch on top of battery box
  const switchBaseGeom = new THREE.BoxGeometry(0.1, 0.03, 0.14);
  const switchBase = new THREE.Mesh(switchBaseGeom, acrylicBlack);
  switchBase.position.set(0.2, 0.12, 0.1);
  batteryPack.add(switchBase);

  const switchRockerGeom = new THREE.BoxGeometry(0.06, 0.04, 0.08);
  const switchRockerMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
  const switchRocker = new THREE.Mesh(switchRockerGeom, switchRockerMat);
  switchRocker.position.set(0.2, 0.14, 0.1);
  batteryPack.add(switchRocker);

  // -------------------------------------------------------------
  // 10. L298N DUAL H-BRIDGE MOTOR DRIVER MODULE
  // -------------------------------------------------------------
  const driverGroup = new THREE.Group();
  driverGroup.position.set(0, 0.02, 0.0);
  rootGroup.add(driverGroup);

  // Red Heatsink with Fins
  const heatsinkGeom = new THREE.BoxGeometry(0.26, 0.22, 0.26);
  const heatsinkMesh = new THREE.Mesh(heatsinkGeom, redHeatsink);
  heatsinkMesh.userData = { componentId: 'motor_driver', componentName: 'L298N Aluminum Heatsink' };
  clickableObjects.push(heatsinkMesh);
  driverGroup.add(heatsinkMesh);

  // Blue Screw Terminals for Motor Lines
  const terminalGeom = new THREE.BoxGeometry(0.12, 0.08, 0.14);
  const term1 = new THREE.Mesh(terminalGeom, pcbBlue);
  term1.position.set(-0.2, -0.05, 0);
  driverGroup.add(term1);

  const term2 = new THREE.Mesh(terminalGeom, pcbBlue);
  term2.position.set(0.2, -0.05, 0);
  driverGroup.add(term2);

  // -------------------------------------------------------------
  // 11. RAINBOW JUMPER WIRING HARNESS (Realistic Curves)
  // -------------------------------------------------------------
  const createWiringCurve = (points: THREE.Vector3[], color: number) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.012, 8, false);
    const wireMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const wireMesh = new THREE.Mesh(tubeGeom, wireMat);
    wireMesh.userData = { componentId: 'wiring', componentName: 'Low-Noise Signal Wire Ribbon' };
    clickableObjects.push(wireMesh);
    rootGroup.add(wireMesh);
  };

  // Ultrasonic Jumper Wires
  createWiringCurve(
    [
      new THREE.Vector3(-0.06, 0.12, 0.95),
      new THREE.Vector3(-0.12, 0.18, 0.75),
      new THREE.Vector3(-0.1, 0.28, 0.45),
    ],
    0x9333ea // Purple
  );
  createWiringCurve(
    [
      new THREE.Vector3(-0.02, 0.12, 0.95),
      new THREE.Vector3(-0.05, 0.22, 0.72),
      new THREE.Vector3(-0.04, 0.28, 0.45),
    ],
    0x2563eb // Blue
  );
  createWiringCurve(
    [
      new THREE.Vector3(0.02, 0.12, 0.95),
      new THREE.Vector3(0.05, 0.22, 0.72),
      new THREE.Vector3(0.04, 0.28, 0.45),
    ],
    0xeab308 // Yellow
  );
  createWiringCurve(
    [
      new THREE.Vector3(0.06, 0.12, 0.95),
      new THREE.Vector3(0.12, 0.18, 0.75),
      new THREE.Vector3(0.1, 0.28, 0.45),
    ],
    0xdc2626 // Red
  );

  // Battery Power Leads
  createWiringCurve(
    [
      new THREE.Vector3(-0.15, 0.32, -0.45),
      new THREE.Vector3(-0.25, 0.18, -0.2),
      new THREE.Vector3(-0.15, 0.05, -0.05),
    ],
    0xdc2626 // Red (+)
  );
  createWiringCurve(
    [
      new THREE.Vector3(-0.12, 0.32, -0.45),
      new THREE.Vector3(-0.22, 0.16, -0.2),
      new THREE.Vector3(-0.12, 0.05, -0.05),
    ],
    0x18181b // Black (-)
  );

  // -------------------------------------------------------------
  // 12. KINEMATIC DRIVE & WHEEL SPEED CONTROLLER
  // -------------------------------------------------------------
  let driveCommand: 'forward' | 'backward' | 'left' | 'right' | 'spin' | 'stop' = 'stop';
  let driveSpeed = 0; // 0 to 1
  let leftWheelAngle = 0;
  let rightWheelAngle = 0;
  let panServoAngle = 0;
  let panDirection = 1;

  const setDriveCommand = (cmd: 'forward' | 'backward' | 'left' | 'right' | 'spin' | 'stop', speedPercent: number = 70) => {
    driveCommand = cmd;
    driveSpeed = speedPercent / 100;

    if (cmd === 'forward') {
      updateFaceCanvas('excited');
    } else if (cmd === 'stop') {
      updateFaceCanvas('listening');
    } else if (cmd === 'left') {
      eyeLookOffset.x = -18;
      updateFaceCanvas('listening');
    } else if (cmd === 'right') {
      eyeLookOffset.x = 18;
      updateFaceCanvas('listening');
    } else if (cmd === 'spin') {
      updateFaceCanvas('scanning');
    }
  };

  // -------------------------------------------------------------
  // 13. FINISH STYLES (Cyber Lab Yellow, Titanium, Lab White, Carbon)
  // -------------------------------------------------------------
  const setFinish = (finish: WheeledRobotFinish) => {
    if (finish === 'titanium_stealth') {
      acrylicBlack.color.setHex(0x1e293b);
      yellowPlastic.color.setHex(0x475569);
      yellowRimMat.color.setHex(0x64748b);
      brassStandoff.color.setHex(0x94a3b8);
    } else if (finish === 'cyber_lab_white') {
      acrylicBlack.color.setHex(0xf8fafc);
      yellowPlastic.color.setHex(0x38bdf8);
      yellowRimMat.color.setHex(0x0284c7);
      brassStandoff.color.setHex(0x38bdf8);
    } else if (finish === 'defense_carbon') {
      acrylicBlack.color.setHex(0x0a0a0c);
      yellowPlastic.color.setHex(0x7c3aed);
      yellowRimMat.color.setHex(0x9333ea);
      brassStandoff.color.setHex(0xa855f7);
    } else {
      // authentic_lab
      acrylicBlack.color.setHex(0x111317);
      yellowPlastic.color.setHex(0xf59e0b);
      yellowRimMat.color.setHex(0xeab308);
      brassStandoff.color.setHex(0xd97706);
    }
  };

  setFinish(initialFinish);

  // -------------------------------------------------------------
  // 14. MASTER ANIMATION LOOP
  // -------------------------------------------------------------
  const animate = (elapsedTime: number, delta: number, options?: { isScanning?: boolean; obstacleCm?: number }) => {
    const isScanning = options?.isScanning ?? false;
    const obstacleCm = options?.obstacleCm ?? currentObstacleDistance;

    // Eye blinking timer
    eyeBlinkTimer += delta;
    if (eyeBlinkTimer > 4.2) {
      eyeBlinkTimer = 0;
      // Random gentle eye gaze shift
      if (driveCommand === 'stop' && Math.random() > 0.4) {
        eyeLookOffset.x = (Math.random() - 0.5) * 16;
        eyeLookOffset.y = (Math.random() - 0.5) * 8;
      }
    }

    // Sonar distance detection logic
    if (obstacleCm < 18 && currentExpression !== 'alert') {
      updateFaceCanvas('alert', obstacleCm);
    } else if (obstacleCm >= 18 && currentExpression === 'alert' && driveCommand !== 'stop') {
      updateFaceCanvas('listening', obstacleCm);
    }

    // Ultrasonic Pan Servo Sweep Animation
    if (isScanning || currentExpression === 'scanning') {
      panServoAngle += panDirection * delta * 1.6;
      if (panServoAngle > 0.8) {
        panServoAngle = 0.8;
        panDirection = -1;
      } else if (panServoAngle < -0.8) {
        panServoAngle = -0.8;
        panDirection = 1;
      }
      sensorPanGroup.rotation.y = panServoAngle;
    } else if (driveCommand === 'stop') {
      // Soft gentle natural tracking
      sensorPanGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.15;
    }

    // Sonar Wave Pulse Effect
    if (sonarWaveMesh) {
      const waveScale = 1.0 + Math.sin(elapsedTime * 8) * 0.25;
      sonarWaveMesh.scale.set(waveScale, waveScale, waveScale);
      (sonarWaveMat as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(elapsedTime * 12) * 0.25;
    }

    // Wheel Rotation Kinematics based on active drive command
    const baseRotationSpeed = delta * 18 * driveSpeed;

    if (driveCommand === 'forward') {
      leftWheelAngle += baseRotationSpeed;
      rightWheelAngle += baseRotationSpeed;
    } else if (driveCommand === 'backward') {
      leftWheelAngle -= baseRotationSpeed;
      rightWheelAngle -= baseRotationSpeed;
    } else if (driveCommand === 'left') {
      leftWheelAngle -= baseRotationSpeed * 0.6;
      rightWheelAngle += baseRotationSpeed;
    } else if (driveCommand === 'right') {
      leftWheelAngle += baseRotationSpeed;
      rightWheelAngle -= baseRotationSpeed * 0.6;
    } else if (driveCommand === 'spin') {
      leftWheelAngle -= baseRotationSpeed;
      rightWheelAngle += baseRotationSpeed;
    }

    // Apply rotation to wheel meshes
    wheelFrontLeft.rotation.x = leftWheelAngle;
    wheelRearLeft.rotation.x = leftWheelAngle;
    wheelFrontRight.rotation.x = rightWheelAngle;
    wheelRearRight.rotation.x = rightWheelAngle;

    // Refresh dynamic face canvas periodically
    drawFace();
  };

  return {
    rootGroup,
    screenGroup,
    screenMesh,
    chassisTop,
    chassisBottom,
    sensorPanGroup,
    sonarWaveMesh,
    wheelFrontLeft,
    wheelFrontRight,
    wheelRearLeft,
    wheelRearRight,
    motorFL,
    motorFR,
    motorRL,
    motorRR,
    batteryPack,
    electronicsBoard,
    clickableObjects,
    materials: {
      acrylicBlack,
      yellowPlastic,
      yellowRimMat,
      rubberTreadMat,
      pcbBlue,
      pcbController,
      silverTransducer,
      brassStandoff,
      chromeMetal,
    },
    updateFaceCanvas,
    setDriveCommand,
    setFinish,
    animate,
  };
}
