import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Play,
  Pause,
  Cpu,
  Eye,
  Sparkles,
  Info,
  CheckCircle2,
  Maximize2,
  Activity,
  Layers,
  Radio,
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import { createLaboratoryEnvironment } from '../utils/labEnvironment';
import { useTheme } from '../context/ThemeContext';

export interface ComponentAnnotation {
  id: string;
  name: string;
  category: string;
  targetPos: { x: number; y: number; z: number; rx: number; ry: number };
  description: string;
  pinout: string;
  specs: string[];
}

export const BOARD_COMPONENTS: ComponentAnnotation[] = [
  {
    id: 'all',
    name: 'Full Circuit Assembly',
    category: 'ESP32 + Sensors Bus',
    targetPos: { x: 0, y: 2.4, z: 3.6, rx: -0.35, ry: 0 },
    description:
      'Complete IoT weather monitoring hardware assembly featuring ESP-WROOM-32, DHT11, and BMP180 on I2C bus with gold-plated GPIO headers.',
    pinout: 'ESP32 3V3 Rail • GPIO21(SDA) • GPIO22(SCL) • GPIO4(DHT11) • GND',
    specs: ['240MHz Dual-Core', 'I2C @ 400kHz', '3.3V Logic Bus', 'PBR Metallic Specular'],
  },
  {
    id: 'esp32',
    name: 'ESP-WROOM-32 SoC',
    category: 'Dual-Core Xtensa LX6 @ 240MHz',
    targetPos: { x: 0, y: 1.6, z: 2.3, rx: -0.2, ry: 0 },
    description:
      'Stainless steel RF shield housing dual-core 32-bit CPU, 520KB SRAM, 2.4GHz Wi-Fi and Bluetooth LE transceiver with PCB trace antenna.',
    pinout: '38-Pin Standard NodeMCU footprint • 3.3V Logic Level • AMS1117 LDO',
    specs: ['520 KB SRAM', '4MB Flash Storage', 'Wi-Fi 802.11 b/g/n', 'BLE 4.2 / Mesh'],
  },
  {
    id: 'dht11',
    name: 'DHT11 Sensor Pod',
    category: 'Humidity & Temp Sensor',
    targetPos: { x: -1.3, y: 1.4, z: 2.2, rx: -0.25, ry: 0.35 },
    description:
      'Capacitive humidity sensing component and NTC temperature thermistor with custom single-wire digital serial communication.',
    pinout: 'VCC (3.3V) • GND • DATA (GPIO4 with 10k pull-up resistor)',
    specs: ['0–50°C (±2°C)', '20–90% RH (±5%)', '1Hz Sample Rate', 'Single-Wire Protocol'],
  },
  {
    id: 'bmp180',
    name: 'BMP180 Barometer',
    category: 'Piezoresistive Pressure IC',
    targetPos: { x: 1.3, y: 1.4, z: 2.2, rx: -0.25, ry: -0.35 },
    description:
      'High-precision barometric pressure sensor for barometric altitude estimation and atmospheric pressure tracking over Two-Wire I2C.',
    pinout: 'VCC (3.3V) • GND • SCL (GPIO22) • SDA (GPIO21)',
    specs: ['300–1100 hPa', '0.02 hPa (17cm) Res', 'I2C Fast Mode', 'Ultra-Low 3µA Power'],
  },
];

export const ESP32InteractiveBoard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [hovered3DComp, setHovered3DComp] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { theme, isStealth, isEmerald, isAmber } = useTheme();

  // State refs for animation loop
  const autoRotateRef = useRef(autoRotate);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: -0.35, y: 0 });
  const targetCamPosRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 2.4, z: 3.6 });
  const lightsRef = useRef<{
    ambLight?: THREE.AmbientLight;
    spotLight?: THREE.SpotLight;
    cyanLight?: THREE.DirectionalLight;
    renderer?: THREE.WebGLRenderer;
  }>({});

  // Keep autoRotateRef in sync without triggering full Three.js re-initialization
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Adjust Three.js lighting and exposure dynamically when theme mode toggles
  useEffect(() => {
    if (!lightsRef.current.ambLight || !lightsRef.current.renderer) return;

    if (isEmerald) {
      lightsRef.current.ambLight.intensity = 1.9;
      lightsRef.current.ambLight.color.setHex(0x022013);
      if (lightsRef.current.spotLight) lightsRef.current.spotLight.intensity = 5.0;
      if (lightsRef.current.cyanLight) {
        lightsRef.current.cyanLight.color.setHex(0x10b981);
        lightsRef.current.cyanLight.intensity = 2.8;
      }
      lightsRef.current.renderer.toneMappingExposure = 1.35;
    } else if (isAmber) {
      lightsRef.current.ambLight.intensity = 1.9;
      lightsRef.current.ambLight.color.setHex(0x1c0d02);
      if (lightsRef.current.spotLight) lightsRef.current.spotLight.intensity = 5.0;
      if (lightsRef.current.cyanLight) {
        lightsRef.current.cyanLight.color.setHex(0xf59e0b);
        lightsRef.current.cyanLight.intensity = 2.8;
      }
      lightsRef.current.renderer.toneMappingExposure = 1.35;
    } else if (isStealth) {
      lightsRef.current.ambLight.intensity = 1.9;
      lightsRef.current.ambLight.color.setHex(0x111827);
      if (lightsRef.current.spotLight) lightsRef.current.spotLight.intensity = 4.8;
      if (lightsRef.current.cyanLight) {
        lightsRef.current.cyanLight.color.setHex(0x38bdf8);
        lightsRef.current.cyanLight.intensity = 2.4;
      }
      lightsRef.current.renderer.toneMappingExposure = 1.3;
    } else {
      lightsRef.current.ambLight.intensity = 1.8;
      lightsRef.current.ambLight.color.setHex(0x0e1b2e);
      if (lightsRef.current.spotLight) lightsRef.current.spotLight.intensity = 5.0;
      if (lightsRef.current.cyanLight) {
        lightsRef.current.cyanLight.color.setHex(0x00f0ff);
        lightsRef.current.cyanLight.intensity = 2.8;
      }
      lightsRef.current.renderer.toneMappingExposure = 1.35;
    }
  }, [theme, isStealth, isEmerald, isAmber]);

  // Primary Three.js Mounting & Lifecycle
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Clean up any stale canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 340;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.4, 3.6);
    camera.lookAt(0, 0, 0);

    // WebGL Renderer with High-Precision PBR settings
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.error('Failed to create WebGLRenderer', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isStealth ? 1.3 : 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Laboratory Environment Map
    let labEnv: THREE.Texture | null = null;
    try {
      labEnv = createLaboratoryEnvironment(renderer, {
        theme: 'cleanroom',
        rimColor: 0x00f0ff,
      });
      scene.environment = labEnv;
    } catch (err) {
      console.warn('Could not initialize laboratory environment map', err);
    }

    // Studio Multi-Point Lighting Rig
    const ambLight = new THREE.AmbientLight(isStealth ? 0x111827 : 0x0e1b2e, isStealth ? 1.9 : 1.8);
    scene.add(ambLight);

    const keySpotlight = new THREE.SpotLight(0xffffff, isStealth ? 4.8 : 5.0, 15, Math.PI / 4, 0.4, 1.2);
    keySpotlight.position.set(2.2, 4.5, 3.0);
    keySpotlight.castShadow = true;
    keySpotlight.shadow.mapSize.width = 1024;
    keySpotlight.shadow.mapSize.height = 1024;
    scene.add(keySpotlight);

    const cyanLight = new THREE.DirectionalLight(0x00f0ff, isStealth ? 2.4 : 2.8);
    cyanLight.position.set(-3.0, 2.5, -1.5);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.0, 10);
    purpleLight.position.set(2.5, 1.2, 1.5);
    scene.add(purpleLight);

    lightsRef.current = {
      ambLight,
      spotLight: keySpotlight,
      cyanLight,
      renderer,
    };

    // Board Main Assembly Group
    const boardGroup = new THREE.Group();
    boardGroup.rotation.x = -0.35;
    scene.add(boardGroup);

    // -------------------------------------------------------------
    // PBR MATERIALS DEFINITIONS
    // -------------------------------------------------------------
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Solder-mask Green
      roughness: 0.26,
      metalness: 0.2,
      envMapIntensity: 1.4,
    });

    const metalShieldMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Stainless Steel / Nickel RF Can
      roughness: 0.08,
      metalness: 0.98,
      envMapIntensity: 2.6,
    });

    const dht11BlueMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Classic DHT11 Plastic Casing
      roughness: 0.35,
      metalness: 0.15,
      envMapIntensity: 1.2,
    });

    const bmp180PurpleMat = new THREE.MeshStandardMaterial({
      color: 0x7e22ce, // SparkFun/Adafruit Purple Breakout PCB
      roughness: 0.3,
      metalness: 0.35,
      envMapIntensity: 1.4,
    });

    const glowingCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.4,
      roughness: 0.1,
    });

    const glowingRedMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });

    const copperPinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold-Plated Header Pins
      metalness: 0.96,
      roughness: 0.08,
      envMapIntensity: 2.2,
    });

    const darkComponentMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // SMT Resistors, Capacitors & IC packages
      metalness: 0.8,
      roughness: 0.35,
      envMapIntensity: 1.2,
    });

    const chromeUsbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.97,
      roughness: 0.05,
      envMapIntensity: 2.4,
    });

    // Array of interactive meshes for Raycasting
    const interactiveMeshes: THREE.Object3D[] = [];

    // -------------------------------------------------------------
    // 1. ESP32 NodeMCU Development Board
    // -------------------------------------------------------------
    const pcbGeo = new THREE.BoxGeometry(2.0, 0.06, 2.9);
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    pcb.userData = { compId: 'all' };
    boardGroup.add(pcb);
    interactiveMeshes.push(pcb);

    // ESP-WROOM-32 Metal RF Shield
    const socGeo = new THREE.BoxGeometry(1.05, 0.09, 1.25);
    const soc = new THREE.Mesh(socGeo, metalShieldMat);
    soc.position.set(0, 0.075, -0.25);
    soc.castShadow = true;
    soc.userData = { compId: 'esp32' };
    boardGroup.add(soc);
    interactiveMeshes.push(soc);

    // Micro-USB Port
    const usbPort = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.4), chromeUsbMat);
    usbPort.position.set(0, 0.09, -1.35);
    usbPort.castShadow = true;
    boardGroup.add(usbPort);

    // Reset & Boot Tactile Switches
    const btnL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), darkComponentMat);
    btnL.position.set(-0.7, 0.08, -1.2);
    boardGroup.add(btnL);

    const btnR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), darkComponentMat);
    btnR.position.set(0.7, 0.08, -1.2);
    boardGroup.add(btnR);

    // CP2102 USB-to-UART Bridge IC
    const uartIc = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.35), darkComponentMat);
    uartIc.position.set(0, 0.06, -0.95);
    boardGroup.add(uartIc);

    // Voltage Regulator (AMS1117 3.3V)
    const vReg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.2), darkComponentMat);
    vReg.position.set(-0.6, 0.06, -0.65);
    boardGroup.add(vReg);

    // Power & Status LEDs
    const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), glowingRedMat);
    pwrLed.position.set(0.65, 0.06, -0.65);
    boardGroup.add(pwrLed);

    const wifiLed = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), glowingCyanMat);
    wifiLed.position.set(0.65, 0.06, -0.45);
    boardGroup.add(wifiLed);

    // 2.4GHz PCB Trace Antenna
    const pcbAnt = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.4), glowingCyanMat);
    pcbAnt.position.set(0, 0.045, 0.95);
    boardGroup.add(pcbAnt);

    // -------------------------------------------------------------
    // 2. DHT11 Temperature & Humidity Sensor Module
    // -------------------------------------------------------------
    const dht11Group = new THREE.Group();
    dht11Group.position.set(-1.6, 0.25, 0.4);
    boardGroup.add(dht11Group);

    const dht11Body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.32), dht11BlueMat);
    dht11Body.castShadow = true;
    dht11Body.userData = { compId: 'dht11' };
    dht11Group.add(dht11Body);
    interactiveMeshes.push(dht11Body);

    const ventMat = new THREE.MeshBasicMaterial({ color: 0x082f49 });
    for (let i = -2; i <= 2; i++) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.02), ventMat);
      vent.position.set(0, i * 0.1, 0.17);
      dht11Group.add(vent);
    }

    const dht11Pcb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.05), pcbMat);
    dht11Pcb.position.set(0, 0, -0.18);
    dht11Group.add(dht11Pcb);

    // -------------------------------------------------------------
    // 3. BMP180 Barometric Pressure Sensor Module
    // -------------------------------------------------------------
    const bmp180Group = new THREE.Group();
    bmp180Group.position.set(1.6, 0.15, 0.4);
    boardGroup.add(bmp180Group);

    const bmp180Pcb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.72), bmp180PurpleMat);
    bmp180Pcb.castShadow = true;
    bmp180Pcb.userData = { compId: 'bmp180' };
    bmp180Group.add(bmp180Pcb);
    interactiveMeshes.push(bmp180Pcb);

    const bmp180Chip = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.26), metalShieldMat);
    bmp180Chip.position.set(0, 0.05, 0);
    bmp180Chip.castShadow = true;
    bmp180Chip.userData = { compId: 'bmp180' };
    bmp180Group.add(bmp180Chip);
    interactiveMeshes.push(bmp180Chip);

    const rArray = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.1), darkComponentMat);
    rArray.position.set(0, 0.035, -0.22);
    bmp180Group.add(rArray);

    // -------------------------------------------------------------
    // 4. Jumper Wiring (CatmullRom 3D Splines)
    // -------------------------------------------------------------
    const curvePointsDHT = [
      new THREE.Vector3(-1.3, 0.1, 0.4),
      new THREE.Vector3(-0.7, 0.45, 0.2),
      new THREE.Vector3(-0.95, 0.1, 0.2),
    ];
    const curveDHT = new THREE.CatmullRomCurve3(curvePointsDHT);
    const wireDHT = new THREE.Mesh(
      new THREE.TubeGeometry(curveDHT, 24, 0.022, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 })
    );
    boardGroup.add(wireDHT);

    const curvePointsDHTPwr = [
      new THREE.Vector3(-1.3, 0.05, 0.25),
      new THREE.Vector3(-0.75, 0.35, 0.05),
      new THREE.Vector3(-0.95, 0.1, 0.0),
    ];
    const curveDHTPwr = new THREE.CatmullRomCurve3(curvePointsDHTPwr);
    const wireDHTPwr = new THREE.Mesh(
      new THREE.TubeGeometry(curveDHTPwr, 24, 0.02, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    boardGroup.add(wireDHTPwr);

    const curvePointsSDA = [
      new THREE.Vector3(1.3, 0.1, 0.4),
      new THREE.Vector3(0.7, 0.45, 0.2),
      new THREE.Vector3(0.95, 0.1, 0.2),
    ];
    const curveSDA = new THREE.CatmullRomCurve3(curvePointsSDA);
    const wireSDA = new THREE.Mesh(
      new THREE.TubeGeometry(curveSDA, 24, 0.022, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.4 })
    );
    boardGroup.add(wireSDA);

    const curvePointsSCL = [
      new THREE.Vector3(1.3, 0.05, 0.2),
      new THREE.Vector3(0.75, 0.35, 0.0),
      new THREE.Vector3(0.95, 0.1, 0.0),
    ];
    const curveSCL = new THREE.CatmullRomCurve3(curvePointsSCL);
    const wireSCL = new THREE.Mesh(
      new THREE.TubeGeometry(curveSCL, 24, 0.02, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
    );
    boardGroup.add(wireSCL);

    // -------------------------------------------------------------
    // 5. Dual 15-Pin GPIO Header Pin Rows
    // -------------------------------------------------------------
    for (let z = -1.15; z <= 1.15; z += 0.19) {
      const pinL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.22, 0.045), copperPinMat);
      pinL.position.set(-0.95, 0.11, z);
      pinL.castShadow = true;
      boardGroup.add(pinL);

      const pinR = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.22, 0.045), copperPinMat);
      pinR.position.set(0.95, 0.11, z);
      pinR.castShadow = true;
      boardGroup.add(pinR);
    }

    // -------------------------------------------------------------
    // INTERACTION & RAYCASTING
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let dragDistance = 0;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDistance = 0;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast hover check
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, true);

      if (intersects.length > 0) {
        let foundId = intersects[0].object.userData?.compId || null;
        if (!foundId && intersects[0].object.parent?.userData?.compId) {
          foundId = intersects[0].object.parent.userData.compId;
        }
        setHovered3DComp(foundId);
      } else {
        setHovered3DComp(null);
      }

      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      dragDistance += Math.abs(dx) + Math.abs(dy);

      boardGroup.rotation.y += dx * 0.008;
      boardGroup.rotation.x += dy * 0.006;
      boardGroup.rotation.x = Math.max(-1.4, Math.min(0.4, boardGroup.rotation.x));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = (e: MouseEvent) => {
      // If was a click rather than a drag, check raycasting to select component
      if (dragDistance < 6) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, true);

        if (intersects.length > 0) {
          const compId = intersects[0].object.userData?.compId;
          if (compId) {
            const comp = BOARD_COMPONENTS.find((c) => c.id === compId);
            if (comp) {
              handleSelectComponent(comp);
            }
          }
        }
      }
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        dragDistance = 0;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - prevX;
      const dy = e.touches[0].clientY - prevY;
      dragDistance += Math.abs(dx) + Math.abs(dy);

      boardGroup.rotation.y += dx * 0.008;
      boardGroup.rotation.x += dy * 0.006;
      boardGroup.rotation.x = Math.max(-1.4, Math.min(0.4, boardGroup.rotation.x));
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: rw, height: rh } = entry.contentRect;
        if (rw > 0 && rh > 0) {
          camera.aspect = rw / rh;
          camera.updateProjectionMatrix();
          renderer.setSize(rw, rh);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth camera interpolation towards selected target
      camera.position.x += (targetCamPosRef.current.x - camera.position.x) * 0.08;
      camera.position.y += (targetCamPosRef.current.y - camera.position.y) * 0.08;
      camera.position.z += (targetCamPosRef.current.z - camera.position.z) * 0.08;

      if (!isDragging) {
        if (autoRotateRef.current) {
          boardGroup.rotation.y += 0.007;
          boardGroup.position.y = Math.sin(t * 1.5) * 0.035;
        } else {
          boardGroup.rotation.x += (targetRotationRef.current.x - boardGroup.rotation.x) * 0.06;
          boardGroup.rotation.y += (targetRotationRef.current.y - boardGroup.rotation.y) * 0.06;
          boardGroup.position.y = 0;
        }
      }

      // Emissive pulse on LEDs and Antenna
      glowingCyanMat.emissiveIntensity = 1.6 + Math.sin(t * 8) * 0.9;
      glowingRedMat.emissiveIntensity = 2.0 + Math.sin(t * 2) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('touchstart', onTouchStart);

      if (labEnv) labEnv.dispose();
      pcbGeo.dispose();
      socGeo.dispose();
      pcbMat.dispose();
      metalShieldMat.dispose();
      dht11BlueMat.dispose();
      bmp180PurpleMat.dispose();
      glowingCyanMat.dispose();
      glowingRedMat.dispose();
      copperPinMat.dispose();
      darkComponentMat.dispose();
      chromeUsbMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleSelectComponent = (comp: ComponentAnnotation) => {
    sound.playClick();
    setSelectedComp(comp.id);
    setAutoRotate(false);

    targetCamPosRef.current = {
      x: comp.targetPos.x,
      y: comp.targetPos.y,
      z: comp.targetPos.z,
    };
    targetRotationRef.current = {
      x: comp.targetPos.rx,
      y: comp.targetPos.ry,
    };
  };

  const handleResetView = () => {
    sound.playClick();
    setSelectedComp('all');
    setAutoRotate(true);
    targetCamPosRef.current = { x: 0, y: 2.4, z: 3.6 };
    targetRotationRef.current = { x: -0.35, y: 0 };
  };

  const activeCompInfo =
    BOARD_COMPONENTS.find((c) => c.id === selectedComp) || BOARD_COMPONENTS[0];

  return (
    <div className="flex-1 flex flex-col justify-between space-y-3 font-mono">
      {/* 3D Viewport Box with Interactive Motion Hover Glow */}
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{
          scale: 1.006,
          boxShadow: isStealth
            ? '0 0 25px rgba(56, 189, 248, 0.25), 0 8px 30px rgba(0, 0, 0, 0.5)'
            : '0 0 35px rgba(0, 240, 255, 0.35), inset 0 0 15px rgba(0, 240, 255, 0.08)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative w-full h-[320px] sm:h-[350px] rounded-xl overflow-hidden bg-slate-950/85 border border-[var(--border-primary)] shadow-[var(--shadow-panel)] group"
      >
        {/* Animated Cybernetic Corner Accent Borders */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-10 pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-cyan-300" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-10 pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-cyan-300" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-10 pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-cyan-300" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-10 pointer-events-none transition-all duration-300 group-hover:w-5 group-hover:h-5 group-hover:border-cyan-300" />

        {/* Ambient background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Three.js Canvas Container */}
        <div
          ref={containerRef}
          id="esp32-3d-canvas"
          className="w-full h-full cursor-grab active:cursor-grabbing relative z-0"
        />

        {/* Top Overlay HUD */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-2.5 py-1 rounded-lg bg-black/85 border border-cyan-500/40 backdrop-blur-md text-[10px] text-cyan-300 flex items-center gap-1.5 shadow-md"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold tracking-wider">ESP32-WROOM-32 SCHEMATIC</span>
          </motion.div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {hovered3DComp && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-[10px] backdrop-blur-sm"
              >
                <Radio className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>INSPECT: {hovered3DComp.toUpperCase()}</span>
              </motion.span>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sound.playClick();
                setAutoRotate(!autoRotate);
              }}
              title={autoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
              className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md ${
                autoRotate
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-900/85 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[10px] font-semibold">
                {autoRotate ? 'ROTATING' : 'PAUSED'}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetView}
              title="Reset 3D Camera"
              className="p-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">RESET</span>
            </motion.button>
          </div>
        </div>

        {/* Viewport Bottom Hint HUD */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] text-slate-400 pointer-events-none z-10">
          <span className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm text-[10px]">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Click & Drag to Orbit • Click Components to Focus</span>
          </span>
          <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 backdrop-blur-sm hidden sm:flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            60 FPS PBR
          </span>
        </div>
      </motion.div>

      {/* Component Focus Selector Pills with Motion Glow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {BOARD_COMPONENTS.map((comp) => {
          const isSelected = selectedComp === comp.id;
          return (
            <motion.button
              key={comp.id}
              whileHover={{
                y: -2,
                scale: 1.02,
                boxShadow: isStealth
                  ? '0 4px 15px rgba(56, 189, 248, 0.2)'
                  : '0 0 16px rgba(0, 240, 255, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectComponent(comp)}
              onMouseEnter={() => sound.playHover()}
              className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border relative overflow-hidden ${
                isSelected
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)] font-semibold'
                  : 'bg-[var(--bg-panel-solid)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-cyan-500/50'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-tab-glow"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent pointer-events-none"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-[11px] block font-bold truncate">{comp.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </div>
              <span className="text-[9px] opacity-75 block truncate mt-0.5">{comp.category}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Active Focused Component Specification Breakdown Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCompInfo.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          whileHover={{
            boxShadow: isStealth
              ? '0 6px 20px rgba(0, 0, 0, 0.4)'
              : '0 0 20px rgba(0, 240, 255, 0.15)',
          }}
          className="p-3.5 rounded-xl bg-[var(--bg-panel-solid)] border border-[var(--border-primary)] space-y-2 text-xs shadow-sm transition-all"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{activeCompInfo.name}</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
              {activeCompInfo.category}
            </span>
          </div>

          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-mono">
            {activeCompInfo.description}
          </p>

          {/* Key Hardware Specs Pills */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {activeCompInfo.specs.map((spec, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[10px] text-cyan-400 font-medium"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Bus Routing / Pin Connections */}
          <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[10px] text-cyan-400">
            <span className="text-[var(--text-muted)] font-semibold">BUS ROUTING:</span>
            <span className="truncate">{activeCompInfo.pinout}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
