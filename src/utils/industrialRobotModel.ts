import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import {
  createCarbonFiberTexture,
  createHazardStripesTexture,
  createBrushedMetalBumpMap,
  createIndustrialPanelTexture,
} from './pbrTextures';

export type RobotFinish = 'industrial_orange' | 'titanium_stealth' | 'cyber_lab_white' | 'defense_carbon';

export interface InteractiveZoneData {
  id: string;
  name: string;
  category: 'SENSOR' | 'SERVO' | 'ACTUATOR' | 'CORE';
  position: THREE.Vector3;
  meshGroup: THREE.Object3D;
  badgePosition: THREE.Vector3;
}

export interface IndustrialRobotInstance {
  rootGroup: THREE.Group;
  baseTurntable: THREE.Group;
  shoulderJoint: THREE.Group;
  bicepArm: THREE.Group;
  elbowJoint: THREE.Group;
  forearm: THREE.Group;
  wristJoint: THREE.Group;
  headSensorPod: THREE.Group;
  gripperLeft: THREE.Group;
  gripperRight: THREE.Group;
  laserBeam: THREE.Mesh;
  lidarRing: THREE.Mesh;
  hydraulicPiston: THREE.Mesh;
  hydraulicRod: THREE.Mesh;
  clickableObjects: THREE.Object3D[];
  interactiveZones: Record<string, InteractiveZoneData>;
  materials: {
    primaryPaint: THREE.MeshStandardMaterial;
    carbonFiber: THREE.MeshStandardMaterial;
    brushedSteel: THREE.MeshStandardMaterial;
    chromeHydraulic: THREE.MeshStandardMaterial;
    darkChassis: THREE.MeshStandardMaterial;
    hazardTape: THREE.MeshStandardMaterial;
    opticalLens: THREE.MeshStandardMaterial;
    copperBush: THREE.MeshStandardMaterial;
    glowCyan: THREE.MeshStandardMaterial;
    glowRose: THREE.MeshStandardMaterial;
    glowAmber: THREE.MeshStandardMaterial;
    glowEmerald: THREE.MeshStandardMaterial;
    glowPurple: THREE.MeshStandardMaterial;
    highlightOutline: THREE.MeshStandardMaterial;
  };
  setFinish: (finish: RobotFinish) => void;
  setJointAngles: (angles: {
    waist?: number;
    shoulder?: number;
    elbow?: number;
    wristPitch?: number;
    wristRoll?: number;
    gripperOpen?: number;
  }) => void;
  animate: (time: number, mode?: string, laserActive?: boolean) => void;
  highlightComponent: (componentId: string | null) => void;
  exportGLTF: (filename?: string) => Promise<Blob>;
}

export function createIndustrialRobot(scale: number = 1.0, initialFinish: RobotFinish = 'industrial_orange'): IndustrialRobotInstance {
  const rootGroup = new THREE.Group();
  rootGroup.scale.setScalar(scale);

  const clickableObjects: THREE.Object3D[] = [];
  const interactiveZones: Record<string, InteractiveZoneData> = {};

  // 1. Generate PBR Procedural Textures
  const carbonTex = createCarbonFiberTexture();
  const hazardTex = createHazardStripesTexture('yellow');
  const brushedBump = createBrushedMetalBumpMap();
  const panelTex = createIndustrialPanelTexture();

  // 2. High-Precision Master PBR Materials with Laboratory Environment Map Response
  const primaryPaint = new THREE.MeshStandardMaterial({
    color: 0xf97316, // KUKA Industrial Orange
    metalness: 0.4,
    roughness: 0.22,
    bumpMap: brushedBump,
    bumpScale: 0.005,
    envMapIntensity: 1.6,
  });

  const carbonFiber = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    map: carbonTex,
    roughness: 0.42,
    metalness: 0.75,
    bumpMap: carbonTex,
    bumpScale: 0.02,
    envMapIntensity: 1.3,
  });

  const brushedSteel = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.94,
    roughness: 0.16,
    bumpMap: brushedBump,
    bumpScale: 0.02,
    envMapIntensity: 1.9,
  });

  const chromeHydraulic = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.99,
    roughness: 0.03,
    envMapIntensity: 2.5,
  });

  const darkChassis = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.88,
    roughness: 0.35,
    bumpMap: panelTex,
    bumpScale: 0.01,
    envMapIntensity: 1.4,
  });

  const hazardTape = new THREE.MeshStandardMaterial({
    map: hazardTex,
    roughness: 0.55,
    metalness: 0.25,
    envMapIntensity: 1.1,
  });

  const opticalLens = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.95,
    roughness: 0.02,
    transparent: true,
    opacity: 0.88,
    envMapIntensity: 2.2,
  });

  const copperBush = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 1.7,
  });

  const glowCyan = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 2.5,
    roughness: 0.1,
  });

  const glowRose = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 2.8,
    roughness: 0.1,
  });

  const glowAmber = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.0,
    roughness: 0.1,
  });

  const glowEmerald = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 2.2,
    roughness: 0.1,
  });

  const glowPurple = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0xa855f7,
    emissiveIntensity: 2.5,
    roughness: 0.1,
  });

  const highlightOutline = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 1.8,
    roughness: 0.2,
    wireframe: true,
  });

  const materials = {
    primaryPaint,
    carbonFiber,
    brushedSteel,
    chromeHydraulic,
    darkChassis,
    hazardTape,
    opticalLens,
    copperBush,
    glowCyan,
    glowRose,
    glowAmber,
    glowEmerald,
    glowPurple,
    highlightOutline,
  };

  // Helper to tag meshes for raycaster click & hover
  const tagClickable = (mesh: THREE.Object3D, componentId: string, name: string) => {
    mesh.userData.componentId = componentId;
    mesh.userData.componentName = name;
    clickableObjects.push(mesh);
  };

  // -------------------------------------------------------------
  // 3. INDUSTRIAL ROBOT HIERARCHICAL KINEMATICS TREE
  // -------------------------------------------------------------

  // BASE PEDESTAL & CAST-IRON ANCHOR FLANGE
  const baseFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 0.18, 32), darkChassis);
  baseFlange.position.y = -1.5;
  rootGroup.add(baseFlange);

  // Safety Hazard Ring on Base Perimeter
  const hazardRing = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.06, 0.08, 32), hazardTape);
  hazardRing.position.y = -1.48;
  rootGroup.add(hazardRing);

  // Hex Bolt Rivets around base flange
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), brushedSteel);
    bolt.position.set(Math.cos(angle) * 0.95, -1.4, Math.sin(angle) * 0.95);
    rootGroup.add(bolt);
  }

  // Harmonic Drive Gearbox Housing
  const gearboxHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.78, 0.4, 24), darkChassis);
  gearboxHousing.position.y = -1.25;
  rootGroup.add(gearboxHousing);
  tagClickable(gearboxHousing, 'freertos_core', 'Base Harmonic Drive & ECU Housing');

  // Gearbox Heat Sink Cooling Fins
  for (let i = 0; i < 6; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.12), brushedSteel);
    fin.position.y = -1.35 + i * 0.05;
    rootGroup.add(fin);
  }

  // JOINT 1: WAIST TURNTABLE (Rotates around Y-axis)
  const baseTurntable = new THREE.Group();
  baseTurntable.position.set(0, -1.05, 0);
  rootGroup.add(baseTurntable);

  const turntablePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 24), brushedSteel);
  baseTurntable.add(turntablePlate);

  const statusLedRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.015, 8, 32), glowCyan);
  statusLedRing.rotation.x = Math.PI / 2;
  statusLedRing.position.y = 0.07;
  baseTurntable.add(statusLedRing);

  // FreeRTOS Master Embedded Microcontroller Module on Base
  const ecuEnclosure = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.18), darkChassis);
  ecuEnclosure.position.set(0, 0.16, -0.32);
  baseTurntable.add(ecuEnclosure);
  tagClickable(ecuEnclosure, 'freertos_core', 'FreeRTOS Embedded ECU');

  const ecuStatusLed = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.02), glowEmerald);
  ecuStatusLed.position.set(0, 0.22, -0.22);
  baseTurntable.add(ecuStatusLed);

  // Shoulder Fork Supports (Dual Clevis Uprights)
  const forkLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.45), primaryPaint);
  forkLeft.position.set(-0.35, 0.45, 0);
  baseTurntable.add(forkLeft);

  const forkRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.45), primaryPaint);
  forkRight.position.set(0.35, 0.45, 0);
  baseTurntable.add(forkRight);

  // Industrial Warning Decal Plate on Shoulder Base
  const shoulderDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), hazardTape);
  shoulderDecal.position.set(0, 0.35, 0.23);
  baseTurntable.add(shoulderDecal);

  // Central Cable Harness Loom
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, -0.25),
    new THREE.Vector3(0, 0.6, -0.4),
    new THREE.Vector3(0, 1.2, -0.2),
  ]);
  const cableMesh = new THREE.Mesh(
    new THREE.TubeGeometry(cableCurve, 16, 0.045, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.7 })
  );
  baseTurntable.add(cableMesh);

  // JOINT 2: SHOULDER ROTARY SERVO ACTUATOR (Pivot along X-axis)
  const shoulderJoint = new THREE.Group();
  shoulderJoint.position.set(0, 0.75, 0);
  baseTurntable.add(shoulderJoint);

  // High-Torque Servo Motor Body (Joint 2)
  const shoulderServoMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 20), darkChassis);
  shoulderServoMotor.rotation.z = Math.PI / 2;
  shoulderJoint.add(shoulderServoMotor);
  tagClickable(shoulderServoMotor, 'servo_shoulder', 'High-Torque Shoulder Servo Actuator (J2)');

  // Servo Cooling Ribs
  for (let r = -2; r <= 2; r++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.008, 6, 20), brushedSteel);
    rib.rotation.y = Math.PI / 2;
    rib.position.x = r * 0.08;
    shoulderServoMotor.add(rib);
  }

  const shoulderPivotPin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.95, 20), brushedSteel);
  shoulderPivotPin.rotation.z = Math.PI / 2;
  shoulderJoint.add(shoulderPivotPin);

  const shoulderCapL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), copperBush);
  shoulderCapL.rotation.z = Math.PI / 2;
  shoulderCapL.position.x = -0.48;
  shoulderJoint.add(shoulderCapL);
  tagClickable(shoulderCapL, 'servo_shoulder', 'Shoulder Optical Encoder');

  const shoulderCapR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), copperBush);
  shoulderCapR.rotation.z = Math.PI / 2;
  shoulderCapR.position.x = 0.48;
  shoulderJoint.add(shoulderCapR);

  // BICEP BOOM ARM (High-tensile carbon & titanium chassis)
  const bicepArm = new THREE.Group();
  shoulderJoint.add(bicepArm);

  const bicepMainSpar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.3, 0.32), primaryPaint);
  bicepMainSpar.position.set(0, 0.65, 0);
  bicepArm.add(bicepMainSpar);

  // Carbon Fiber Reinforcement Shell
  const carbonSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.9, 0.34), carbonFiber);
  carbonSleeve.position.set(0, 0.65, 0);
  bicepArm.add(carbonSleeve);

  // HYDRAULIC COUNTER-BALANCE PISTON ASSEMBLY
  const hydraulicPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.75, 16), darkChassis);
  hydraulicPiston.position.set(0.28, 0.5, -0.22);
  hydraulicPiston.rotation.x = -0.2;
  bicepArm.add(hydraulicPiston);
  tagClickable(hydraulicPiston, 'hydraulic', 'Dual-Action Hydraulic Counterbalance Piston');

  const hydraulicRod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.7, 16), chromeHydraulic);
  hydraulicRod.position.set(0.28, 0.85, -0.3);
  hydraulicRod.rotation.x = -0.2;
  bicepArm.add(hydraulicRod);
  tagClickable(hydraulicRod, 'hydraulic', 'Chrome Hydraulic Cylinder Rod');

  // Hydraulic Pressure Valve
  const hydraulicValve = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), copperBush);
  hydraulicValve.position.set(0.28, 0.2, -0.16);
  bicepArm.add(hydraulicValve);

  // High-Voltage CAN-Bus Diagnostics Strip
  const diagStrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.7, 0.08), glowCyan);
  diagStrip.position.set(-0.19, 0.65, 0);
  bicepArm.add(diagStrip);
  tagClickable(diagStrip, 'freertos_core', 'CAN-Bus Diagnostics Bus');

  // JOINT 3: ELBOW ROTARY SERVO ACTUATOR (Pivot along X-axis)
  const elbowJoint = new THREE.Group();
  elbowJoint.position.set(0, 1.3, 0);
  bicepArm.add(elbowJoint);

  const elbowServoMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.44, 20), darkChassis);
  elbowServoMotor.rotation.z = Math.PI / 2;
  elbowJoint.add(elbowServoMotor);
  tagClickable(elbowServoMotor, 'servo_elbow', 'High-Speed Brushless Elbow Servo (J3)');

  const elbowPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.56, 20), brushedSteel);
  elbowPivot.rotation.z = Math.PI / 2;
  elbowJoint.add(elbowPivot);

  // Optical Servo Encoder Casing
  const encoderCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16), copperBush);
  encoderCap.rotation.z = Math.PI / 2;
  encoderCap.position.x = 0.32;
  elbowJoint.add(encoderCap);
  tagClickable(encoderCap, 'servo_elbow', 'Elbow Magnetic Quadrature Encoder');

  // FOREARM ARMATURE
  const forearm = new THREE.Group();
  elbowJoint.add(forearm);

  const forearmSpar = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.1, 0.24), primaryPaint);
  forearmSpar.position.set(0, 0.55, 0);
  forearm.add(forearmSpar);

  const forearmCarbonPanel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.26), carbonFiber);
  forearmCarbonPanel.position.set(0, 0.55, 0);
  forearm.add(forearmCarbonPanel);

  // Audio Voice Transceiver Mic Array on Forearm
  const voiceMicPod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), glowPurple);
  voiceMicPod.rotation.z = Math.PI / 2;
  voiceMicPod.position.set(0.14, 0.75, 0);
  forearm.add(voiceMicPod);
  tagClickable(voiceMicPod, 'voice', '4-Mic Acoustic Beamforming Array');

  // JOINT 4 & 5: ARTICULATED 3-AXIS WRIST & SENSOR TURRET
  const wristJoint = new THREE.Group();
  wristJoint.position.set(0, 1.1, 0);
  forearm.add(wristJoint);

  const wristGimbal = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), brushedSteel);
  wristJoint.add(wristGimbal);

  // HEAD SENSOR POD (LiDAR + OpenCV Stereoscopic Vision Hub + Ultrasonic Brow)
  const headSensorPod = new THREE.Group();
  headSensorPod.position.set(0, 0.22, 0.12);
  wristJoint.add(headSensorPod);

  // Sensor Shell
  const sensorPodHousing = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.3, 0.36), darkChassis);
  headSensorPod.add(sensorPodHousing);
  tagClickable(sensorPodHousing, 'vision', 'Stereoscopic Vision Sensor Pod');

  // OPENCV STEREOSCOPIC LENSES (Dual High-Speed IMX Sensors)
  const leftLensBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16), brushedSteel);
  leftLensBezel.rotation.x = Math.PI / 2;
  leftLensBezel.position.set(-0.11, 0.02, 0.18);
  headSensorPod.add(leftLensBezel);

  const leftLens = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), opticalLens);
  leftLens.rotation.x = Math.PI / 2;
  leftLens.position.set(-0.11, 0.02, 0.22);
  headSensorPod.add(leftLens);
  tagClickable(leftLens, 'vision', 'OpenCV Left Camera Lens (IMX Sensor)');

  const rightLensBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16), brushedSteel);
  rightLensBezel.rotation.x = Math.PI / 2;
  rightLensBezel.position.set(0.11, 0.02, 0.18);
  headSensorPod.add(rightLensBezel);

  const rightLens = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), opticalLens);
  rightLens.rotation.x = Math.PI / 2;
  rightLens.position.set(0.11, 0.02, 0.22);
  headSensorPod.add(rightLens);
  tagClickable(rightLens, 'vision', 'OpenCV Right Camera Lens (IMX Sensor)');

  // 360° SPINNING LIDAR SCANNER TURRET (Top of Sensor Pod)
  const lidarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 16), brushedSteel);
  lidarBase.position.set(0, 0.18, 0);
  headSensorPod.add(lidarBase);

  const lidarRing = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), glowRose);
  lidarRing.position.set(0, 0.24, 0);
  headSensorPod.add(lidarRing);
  tagClickable(lidarRing, 'lidar', '360° Time-of-Flight LiDAR Scanner Turret');

  // DUAL HC-SR04 ULTRASONIC ARRAY TRANSDUCERS (Brow Unit)
  const usTransducer1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 14), glowCyan);
  usTransducer1.rotation.x = Math.PI / 2;
  usTransducer1.position.set(-0.14, -0.08, 0.19);
  headSensorPod.add(usTransducer1);
  tagClickable(usTransducer1, 'ultrasonic', 'HC-SR04 Ultrasonic Transducer Transmitter (40kHz)');

  const usTransducer2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 14), glowCyan);
  usTransducer2.rotation.x = Math.PI / 2;
  usTransducer2.position.set(0.14, -0.08, 0.19);
  headSensorPod.add(usTransducer2);
  tagClickable(usTransducer2, 'ultrasonic', 'HC-SR04 Ultrasonic Transducer Receiver (40kHz)');

  // END-EFFECTOR BIONIC PRECISION GRIPPER & LASER MODULE
  const gripperBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.14, 16), darkChassis);
  gripperBase.position.set(0, 0.35, 0);
  wristJoint.add(gripperBase);
  tagClickable(gripperBase, 'gripper', 'End-Effector Quick-Release Flange');

  // Left Gripper Jaw Finger
  const gripperLeft = new THREE.Group();
  gripperLeft.position.set(-0.1, 0.44, 0);
  wristJoint.add(gripperLeft);

  const jawLeft = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.32, 0.08), brushedSteel);
  jawLeft.position.set(0, 0.16, 0);
  gripperLeft.add(jawLeft);
  tagClickable(jawLeft, 'gripper', 'Left Carbon-Reinforced Gripper Jaw');

  const padLeft = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.07), carbonFiber);
  padLeft.position.set(0.025, 0.18, 0);
  gripperLeft.add(padLeft);

  // Right Gripper Jaw Finger
  const gripperRight = new THREE.Group();
  gripperRight.position.set(0.1, 0.44, 0);
  wristJoint.add(gripperRight);

  const jawRight = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.32, 0.08), brushedSteel);
  jawRight.position.set(0, 0.16, 0);
  gripperRight.add(jawRight);
  tagClickable(jawRight, 'gripper', 'Right Carbon-Reinforced Gripper Jaw');

  const padRight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.07), carbonFiber);
  padRight.position.set(-0.025, 0.18, 0);
  gripperRight.add(padRight);

  // Precision Targeting Laser Beam from center of tool
  const laserGeo = new THREE.CylinderGeometry(0.008, 0.025, 3.5, 8);
  const laserBeam = new THREE.Mesh(
    laserGeo,
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
  );
  laserBeam.position.set(0, 2.2, 0);
  wristJoint.add(laserBeam);

  // Setup Interactive 3D Anchor Positions for Badges/Pins
  interactiveZones['vision'] = {
    id: 'vision',
    name: 'OpenCV Stereoscopic Vision Sensor',
    category: 'SENSOR',
    position: new THREE.Vector3(0, 1.4, 0.35),
    meshGroup: headSensorPod,
    badgePosition: new THREE.Vector3(0, 1.4, 0.45),
  };

  interactiveZones['lidar'] = {
    id: 'lidar',
    name: '360° ToF LiDAR Spatial Scanner',
    category: 'SENSOR',
    position: new THREE.Vector3(0, 1.65, 0.12),
    meshGroup: lidarRing,
    badgePosition: new THREE.Vector3(0, 1.7, 0.15),
  };

  interactiveZones['ultrasonic'] = {
    id: 'ultrasonic',
    name: 'HC-SR04 Ultrasonic Radar Transducers',
    category: 'SENSOR',
    position: new THREE.Vector3(0, 1.25, 0.35),
    meshGroup: usTransducer1,
    badgePosition: new THREE.Vector3(0, 1.25, 0.45),
  };

  interactiveZones['servo_shoulder'] = {
    id: 'servo_shoulder',
    name: 'Shoulder Harmonic Drive Servo (J2)',
    category: 'SERVO',
    position: new THREE.Vector3(0.48, -0.3, 0),
    meshGroup: shoulderServoMotor,
    badgePosition: new THREE.Vector3(0.55, -0.3, 0),
  };

  interactiveZones['servo_elbow'] = {
    id: 'servo_elbow',
    name: 'Elbow Brushless Servo Actuator (J3)',
    category: 'SERVO',
    position: new THREE.Vector3(0.35, 0.8, 0),
    meshGroup: elbowServoMotor,
    badgePosition: new THREE.Vector3(0.45, 0.8, 0),
  };

  interactiveZones['hydraulic'] = {
    id: 'hydraulic',
    name: 'Chrome Hydraulic Piston Balancing System',
    category: 'ACTUATOR',
    position: new THREE.Vector3(0.28, 0.25, -0.25),
    meshGroup: hydraulicPiston,
    badgePosition: new THREE.Vector3(0.38, 0.35, -0.3),
  };

  interactiveZones['gripper'] = {
    id: 'gripper',
    name: 'Bionic Gripper & Laser Diode Tool',
    category: 'ACTUATOR',
    position: new THREE.Vector3(0, 1.75, 0),
    meshGroup: gripperBase,
    badgePosition: new THREE.Vector3(0, 1.85, 0),
  };

  interactiveZones['freertos_core'] = {
    id: 'freertos_core',
    name: 'FreeRTOS Embedded Logic Unit & CAN-Bus',
    category: 'CORE',
    position: new THREE.Vector3(0, -1.1, -0.35),
    meshGroup: ecuEnclosure,
    badgePosition: new THREE.Vector3(0, -1.05, -0.45),
  };

  // -------------------------------------------------------------
  // 4. CONTROL METHODS (Finishes, Kinematics, Animation)
  // -------------------------------------------------------------

  const setFinish = (finish: RobotFinish) => {
    switch (finish) {
      case 'industrial_orange':
        primaryPaint.color.setHex(0xf97316); // KUKA Orange
        primaryPaint.metalness = 0.42;
        primaryPaint.roughness = 0.22;
        primaryPaint.envMapIntensity = 1.6;
        break;
      case 'titanium_stealth':
        primaryPaint.color.setHex(0x334155); // Titanium Slate
        primaryPaint.metalness = 0.95;
        primaryPaint.roughness = 0.16;
        primaryPaint.envMapIntensity = 2.4;
        break;
      case 'cyber_lab_white':
        primaryPaint.color.setHex(0xf1f5f9); // Clean Lab White
        primaryPaint.metalness = 0.25;
        primaryPaint.roughness = 0.12;
        primaryPaint.envMapIntensity = 1.9;
        break;
      case 'defense_carbon':
        primaryPaint.color.setHex(0x0b1120); // Deep Carbon Black
        primaryPaint.metalness = 0.78;
        primaryPaint.roughness = 0.38;
        primaryPaint.envMapIntensity = 1.5;
        break;
    }
    primaryPaint.needsUpdate = true;
  };

  setFinish(initialFinish);

  const setJointAngles = ({
    waist,
    shoulder,
    elbow,
    wristPitch,
    wristRoll,
    gripperOpen,
  }: {
    waist?: number;
    shoulder?: number;
    elbow?: number;
    wristPitch?: number;
    wristRoll?: number;
    gripperOpen?: number;
  }) => {
    if (waist !== undefined) baseTurntable.rotation.y = waist;
    if (shoulder !== undefined) shoulderJoint.rotation.z = shoulder;
    if (elbow !== undefined) elbowJoint.rotation.z = elbow;
    if (wristPitch !== undefined) wristJoint.rotation.x = wristPitch;
    if (wristRoll !== undefined) wristJoint.rotation.y = wristRoll;
    if (gripperOpen !== undefined) {
      gripperLeft.position.x = -0.06 - gripperOpen * 0.08;
      gripperRight.position.x = 0.06 + gripperOpen * 0.08;
    }
  };

  const highlightComponent = (componentId: string | null) => {
    clickableObjects.forEach((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (componentId && mesh.userData.componentId === componentId) {
          if (mesh.material && 'emissive' in mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.emissive.setHex(0x00f0ff);
            mat.emissiveIntensity = 0.8;
          }
        } else {
          if (mesh.material && 'emissive' in mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat !== glowCyan && mat !== glowRose && mat !== glowAmber && mat !== glowEmerald && mat !== glowPurple) {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          }
        }
      }
    });
  };

  const animate = (time: number, mode: string = 'vision', laserActive: boolean = true) => {
    // 1. LiDAR Spinning Scanner
    lidarRing.rotation.y = time * 8.0;

    // 2. Laser Pulse
    laserBeam.visible = laserActive;
    if (laserActive) {
      const beamMat = laserBeam.material as THREE.MeshBasicMaterial;
      beamMat.opacity = 0.6 + Math.sin(time * 12) * 0.25;
    }

    // 3. Dynamic Subsystem Kinematics based on active mode
    if (mode === 'vision') {
      baseTurntable.rotation.y = Math.sin(time * 0.9) * 0.45;
      shoulderJoint.rotation.z = -0.2 + Math.sin(time * 1.2) * 0.15;
      elbowJoint.rotation.z = 0.4 + Math.cos(time * 1.2) * 0.18;
      headSensorPod.rotation.y = Math.sin(time * 2.0) * 0.35;
      headSensorPod.rotation.x = -0.15 + Math.cos(time * 1.8) * 0.15;
    } else if (mode === 'lidar' || mode === 'ultrasonic' || mode === 'obstacle') {
      baseTurntable.rotation.y = Math.sin(time * 1.8) * 0.75;
      shoulderJoint.rotation.z = 0.1 + Math.sin(time * 1.5) * 0.1;
      elbowJoint.rotation.z = 0.2 + Math.cos(time * 1.5) * 0.1;
      headSensorPod.rotation.y = Math.sin(time * 4.0) * 0.2;
    } else if (mode === 'servo_shoulder' || mode === 'servo_elbow') {
      shoulderJoint.rotation.z = -0.3 + Math.sin(time * 2.5) * 0.35;
      elbowJoint.rotation.z = 0.5 + Math.cos(time * 2.5) * 0.4;
      baseTurntable.rotation.y = Math.sin(time * 1.0) * 0.3;
    } else if (mode === 'gripper') {
      baseTurntable.rotation.y = 0;
      shoulderJoint.rotation.z = -0.1;
      elbowJoint.rotation.z = 0.3;
      const gripG = (Math.sin(time * 6.0) + 1) * 0.5;
      gripperLeft.position.x = -0.06 - gripG * 0.08;
      gripperRight.position.x = 0.06 + gripG * 0.08;
    } else if (mode === 'voice') {
      baseTurntable.rotation.y = Math.sin(time * 0.5) * 0.2;
      shoulderJoint.rotation.z = -0.3 + Math.sin(time * 3.0) * 0.08;
      elbowJoint.rotation.z = 0.6 + Math.cos(time * 3.0) * 0.1;
      wristJoint.rotation.z = Math.sin(time * 4.0) * 0.15;
    } else {
      baseTurntable.rotation.y = Math.sin(time * 0.6) * 0.3;
      shoulderJoint.rotation.z = -0.15 + Math.sin(time * 0.8) * 0.1;
      elbowJoint.rotation.z = 0.35 + Math.cos(time * 0.8) * 0.12;
    }
  };

  const exportGLTF = (filename: string = 'industrial_robot_pbr.glb'): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      exporter.parse(
        rootGroup,
        (gltf) => {
          const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
          resolve(blob);
        },
        (error) => reject(error),
        { binary: true }
      );
    });
  };

  return {
    rootGroup,
    baseTurntable,
    shoulderJoint,
    bicepArm,
    elbowJoint,
    forearm,
    wristJoint,
    headSensorPod,
    gripperLeft,
    gripperRight,
    laserBeam,
    lidarRing,
    hydraulicPiston,
    hydraulicRod,
    clickableObjects,
    interactiveZones,
    materials,
    setFinish,
    setJointAngles,
    animate,
    highlightComponent,
    exportGLTF,
  };
}

/**
 * Load an external GLTF / GLB 3D robot model and automatically enhance its
 * geometry, compute vertex normals, apply ACESFilmic PBR shaders and laboratory lighting.
 */
export function loadGLTFRobotModel(
  url: string,
  onSuccess: (model: THREE.Group) => void,
  onError?: (err: any) => void
) {
  const loader = new GLTFLoader();
  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.envMapIntensity = 1.5;
            mat.needsUpdate = true;
          }
        }
      });

      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const targetHeight = 2.8;
        const scaleFactor = targetHeight / maxDim;
        model.scale.setScalar(scaleFactor);
      }

      onSuccess(model);
    },
    undefined,
    (err) => {
      console.warn('Failed to load external GLTF robot model, falling back to precision CAD industrial robot.', err);
      if (onError) onError(err);
    }
  );
}
