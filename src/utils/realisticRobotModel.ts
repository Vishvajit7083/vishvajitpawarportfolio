import * as THREE from 'three';

export interface RealisticRobotInstance {
  rootGroup: THREE.Group;
  headGroup: THREE.Group;
  baseGroup: THREE.Group;
  neckGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  facePlate: THREE.Mesh;
  materials: {
    purpleMetallic: THREE.MeshStandardMaterial;
    darkTitanium: THREE.MeshStandardMaterial;
    polishedChrome: THREE.MeshStandardMaterial;
    facePlateMat: THREE.MeshStandardMaterial;
    opticalEyeGlass: THREE.MeshStandardMaterial;
    eyeGlow: THREE.MeshStandardMaterial;
    cyanGlow: THREE.MeshStandardMaterial;
    magentaGlow: THREE.MeshStandardMaterial;
    innerChassis: THREE.MeshStandardMaterial;
  };
  animate: (elapsedTime: number, activeHotspot?: string, isScanning?: boolean) => void;
}

/**
 * Creates the sleek "ROBOTO ROBOT" designer 3D model.
 * Features:
 * - Satin-finished deep purple/indigo metallic cube pedestal base with chamfered bevels.
 * - Articulated chrome/titanium dual-gimbal neck pivot joint.
 * - Charismatically tilted rectangular/beveled cuboid head unit.
 * - Soft titanium inset faceplate bezel.
 * - Dual expressive circular optical camera lenses with responsive specular highlights.
 * - Side acoustic/sensor rotary ports.
 * - Expressive gaze-tracking kinematics and idle breathing physics.
 */
export function createRealisticRobot(scale: number = 1.0): RealisticRobotInstance {
  const rootGroup = new THREE.Group();
  rootGroup.scale.setScalar(scale);

  // -------------------------------------------------------------
  // 1. MASTER PBR STUDIO MATERIALS
  // -------------------------------------------------------------
  // Deep Satin Purple / Indigo Metallic (Matches Roboto Robot outer chassis)
  const purpleMetallic = new THREE.MeshStandardMaterial({
    color: 0x22133d, // Deep indigo purple
    roughness: 0.16,
    metalness: 0.94,
    envMapIntensity: 2.4,
  });

  // Dark Obsidian / Titanium
  const darkTitanium = new THREE.MeshStandardMaterial({
    color: 0x12101f,
    roughness: 0.28,
    metalness: 0.88,
    envMapIntensity: 1.8,
  });

  // Mirror-Polished Chrome for Mechanical Joints & Screws
  const polishedChrome = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.05,
    metalness: 0.98,
    envMapIntensity: 3.0,
  });

  // Inset Faceplate Bezel (Soft Titanium Silver / Pearlescent Satin)
  const facePlateMat = new THREE.MeshStandardMaterial({
    color: 0xa1a1aa, // Soft silver-grey faceplate
    roughness: 0.12,
    metalness: 0.92,
    envMapIntensity: 2.2,
  });

  // Expressive Glowing Eye Lens Material (Luminous White/Cyan with Depth)
  const eyeGlow = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xdbeafe,
    emissiveIntensity: 1.6,
    roughness: 0.08,
    metalness: 0.3,
  });

  // Outer Optical Eye Dome Glass
  const opticalEyeGlass = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.02,
    metalness: 0.95,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 3.5,
  });

  // Cyber Glow Accents
  const cyanGlow = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 2.2,
    roughness: 0.1,
  });

  const magentaGlow = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0xa855f7,
    emissiveIntensity: 2.0,
    roughness: 0.1,
  });

  const innerChassis = new THREE.MeshStandardMaterial({
    color: 0x090714,
    roughness: 0.45,
    metalness: 0.7,
  });

  // -------------------------------------------------------------
  // 2. PEDESTAL BASE CUBE CHASSIS
  // -------------------------------------------------------------
  const baseGroup = new THREE.Group();
  baseGroup.position.set(0, -0.65, 0);
  rootGroup.add(baseGroup);

  // Main Cube Body with Beveled Chamfers
  const baseSize = 1.15;
  const baseGeo = new THREE.BoxGeometry(baseSize, baseSize * 1.1, baseSize);
  const baseCube = new THREE.Mesh(baseGeo, purpleMetallic);
  baseCube.castShadow = true;
  baseCube.receiveShadow = true;
  baseGroup.add(baseCube);

  // Base Bottom Trim Skirt
  const baseTrimGeo = new THREE.BoxGeometry(baseSize * 1.04, 0.08, baseSize * 1.04);
  const baseTrim = new THREE.Mesh(baseTrimGeo, darkTitanium);
  baseTrim.position.set(0, -baseSize * 0.52, 0);
  baseGroup.add(baseTrim);

  // Base Top Collar Ring (Mount for Neck Pivot)
  const collarGeo = new THREE.CylinderGeometry(0.36, 0.42, 0.12, 32);
  const baseCollar = new THREE.Mesh(collarGeo, darkTitanium);
  baseCollar.position.set(0, baseSize * 0.55, 0);
  baseCollar.castShadow = true;
  baseGroup.add(baseCollar);

  // Chrome Collar Flange Ring
  const flangeGeo = new THREE.TorusGeometry(0.34, 0.025, 16, 32);
  const collarFlange = new THREE.Mesh(flangeGeo, polishedChrome);
  collarFlange.rotation.x = Math.PI / 2;
  collarFlange.position.set(0, baseSize * 0.58, 0);
  baseGroup.add(collarFlange);

  // -------------------------------------------------------------
  // 3. ARTICULATED GIMBAL NECK JOINT
  // -------------------------------------------------------------
  const neckGroup = new THREE.Group();
  neckGroup.position.set(0, 0.05, 0);
  rootGroup.add(neckGroup);

  // Spherical Ball-and-Socket Pivot
  const neckSphereGeo = new THREE.SphereGeometry(0.24, 32, 32);
  const neckSphere = new THREE.Mesh(neckSphereGeo, polishedChrome);
  neckSphere.position.set(0, 0.1, 0);
  neckSphere.castShadow = true;
  neckGroup.add(neckSphere);

  // Intermediate Articulated Neck Collar & Connector
  const neckConnectorGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.26, 24);
  const neckConnector = new THREE.Mesh(neckConnectorGeo, darkTitanium);
  neckConnector.position.set(0, 0.28, 0);
  neckConnector.castShadow = true;
  neckGroup.add(neckConnector);

  // Chrome Accent Ring on Neck
  const neckRingGeo = new THREE.TorusGeometry(0.2, 0.02, 16, 32);
  const neckRing = new THREE.Mesh(neckRingGeo, polishedChrome);
  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.set(0, 0.35, 0);
  neckGroup.add(neckRing);

  // -------------------------------------------------------------
  // 4. CHARISMATIC RECTANGULAR HEAD UNIT (Tilted & Articulated)
  // -------------------------------------------------------------
  const headGroup = new THREE.Group();
  // Set default stylish tilted pose (as in Roboto Robot reference image)
  headGroup.position.set(0, 0.82, 0);
  headGroup.rotation.z = -0.22; // Inquisitive side tilt
  headGroup.rotation.x = 0.06;  // Slight forward engagement pitch
  neckGroup.add(headGroup);

  // Head Outer Shell Dimensions
  const headW = 1.35;
  const headH = 0.95;
  const headD = 0.95;

  // Main Purple Metallic Cranial Housing
  const headHousingGeo = new THREE.BoxGeometry(headW, headH, headD);
  const headHousing = new THREE.Mesh(headHousingGeo, purpleMetallic);
  headHousing.castShadow = true;
  headHousing.receiveShadow = true;
  headGroup.add(headHousing);

  // Chamfered / Rounded Outer Perimeter Ring Bevel
  const headBezelGeo = new THREE.BoxGeometry(headW * 1.015, headH * 1.015, 0.06);
  const headBezel = new THREE.Mesh(headBezelGeo, polishedChrome);
  headBezel.position.set(0, 0, headD * 0.48);
  headGroup.add(headBezel);

  // Inset Front Faceplate (Recessed screen plate)
  const facePlateW = headW * 0.90;
  const facePlateH = headH * 0.86;
  const facePlateGeo = new THREE.BoxGeometry(facePlateW, facePlateH, 0.06);
  const facePlate = new THREE.Mesh(facePlateGeo, facePlateMat);
  facePlate.position.set(0, 0, headD * 0.5 + 0.02);
  facePlate.castShadow = true;
  facePlate.receiveShadow = true;
  headGroup.add(facePlate);

  // Inner Dark Faceplate Inset Border
  const faceInnerGeo = new THREE.BoxGeometry(facePlateW * 0.96, facePlateH * 0.94, 0.02);
  const faceInner = new THREE.Mesh(faceInnerGeo, innerChassis);
  faceInner.position.set(0, 0, headD * 0.5 + 0.04);
  headGroup.add(faceInner);

  // -------------------------------------------------------------
  // 5. DUAL EXPRESSIVE EYE CAMERA LENSES
  // -------------------------------------------------------------
  const eyeRadius = 0.165;
  const eyeSpacing = 0.28; // Distance from center
  const eyeZ = headD * 0.5 + 0.06;

  // Function to create each lens assembly
  const createEyeAssembly = (isLeft: boolean) => {
    const eyeGroup = new THREE.Group();
    const xPos = isLeft ? -eyeSpacing : eyeSpacing;
    eyeGroup.position.set(xPos, 0.04, eyeZ);

    // Chrome Outer Eye Bezel Ring
    const eyeBezelGeo = new THREE.TorusGeometry(eyeRadius * 1.12, 0.022, 16, 32);
    const eyeBezel = new THREE.Mesh(eyeBezelGeo, polishedChrome);
    eyeGroup.add(eyeBezel);

    // Dark Inset Lens Socket Cup
    const eyeCupGeo = new THREE.CylinderGeometry(eyeRadius * 1.08, eyeRadius * 0.95, 0.06, 32);
    const eyeCup = new THREE.Mesh(eyeCupGeo, darkTitanium);
    eyeCup.rotation.x = Math.PI / 2;
    eyeCup.position.set(0, 0, -0.02);
    eyeGroup.add(eyeCup);

    // Glowing Inner Spherical Eye Dome
    const eyeCoreGeo = new THREE.SphereGeometry(eyeRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const eyeCore = new THREE.Mesh(eyeCoreGeo, eyeGlow);
    eyeCore.rotation.x = Math.PI / 2;
    eyeCore.position.set(0, 0, 0.01);
    eyeGroup.add(eyeCore);

    // Clear Optical Lens Glass Cap (Catches Specular Glints)
    const glassDomeGeo = new THREE.SphereGeometry(eyeRadius * 1.03, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const glassDome = new THREE.Mesh(glassDomeGeo, opticalEyeGlass);
    glassDome.rotation.x = Math.PI / 2;
    glassDome.position.set(0, 0, 0.02);
    eyeGroup.add(glassDome);

    // Subtle Iris Pupil Ring Reflection
    const irisRingGeo = new THREE.RingGeometry(eyeRadius * 0.45, eyeRadius * 0.65, 32);
    const irisRing = new THREE.Mesh(
      irisRingGeo,
      new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
    );
    irisRing.position.set(0, 0, 0.035);
    eyeGroup.add(irisRing);

    return { eyeGroup, eyeCore };
  };

  const leftEyeData = createEyeAssembly(true);
  headGroup.add(leftEyeData.eyeGroup);

  const rightEyeData = createEyeAssembly(false);
  headGroup.add(rightEyeData.eyeGroup);

  // -------------------------------------------------------------
  // 6. SIDE EAR PORTS & ROTARY ENCODERS
  // -------------------------------------------------------------
  for (let s = -1; s <= 1; s += 2) {
    const earGroup = new THREE.Group();
    earGroup.position.set(s * (headW * 0.5 + 0.01), 0.02, 0);
    earGroup.rotation.z = s * (Math.PI / 2);

    // Circular Ear Disc Bezel
    const earDiscGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32);
    const earDisc = new THREE.Mesh(earDiscGeo, darkTitanium);
    earGroup.add(earDisc);

    // Chrome Accent Ring on Ear
    const earRingGeo = new THREE.TorusGeometry(0.18, 0.018, 16, 32);
    const earRing = new THREE.Mesh(earRingGeo, polishedChrome);
    earRing.rotation.x = Math.PI / 2;
    earRing.position.set(0, 0.02, 0);
    earGroup.add(earRing);

    // Center Ear Sensor Indicator
    const earCenterGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24);
    const earCenter = new THREE.Mesh(earCenterGeo, magentaGlow);
    earCenter.position.set(0, 0.025, 0);
    earGroup.add(earCenter);

    headGroup.add(earGroup);
  }

  // -------------------------------------------------------------
  // 7. SLEEK GROUND REFLECTION POOL & SHADOW DISC
  // -------------------------------------------------------------
  const groundShadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
  const groundShadowMat = new THREE.MeshBasicMaterial({
    color: 0x070414,
    transparent: true,
    opacity: 0.6,
  });
  const groundShadow = new THREE.Mesh(groundShadowGeo, groundShadowMat);
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.set(0, -1.25, 0);
  rootGroup.add(groundShadow);

  // Holographic Base Telemetry Ring
  const baseRingGeo = new THREE.RingGeometry(1.2, 1.23, 48);
  const baseRingMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.position.set(0, -1.24, 0);
  rootGroup.add(baseRing);

  // -------------------------------------------------------------
  // 8. MASTER KINEMATICS & ANIMATION LOOP
  // -------------------------------------------------------------
  const animate = (
    elapsedTime: number,
    activeHotspot?: string,
    isScanning: boolean = true
  ) => {
    // Idle breathing & gentle float
    const breathingOffset = Math.sin(elapsedTime * 1.6) * 0.025;
    headGroup.position.y = 0.82 + breathingOffset;

    // Subtle neck joint flex
    neckSphere.rotation.y = Math.sin(elapsedTime * 0.8) * 0.06;
    neckGroup.rotation.z = Math.sin(elapsedTime * 0.6) * 0.03;

    // Base telemetry ring rotation
    baseRing.rotation.z = elapsedTime * 0.3;

    // Eye luminosity and responsiveness
    const eyePulse = 1.5 + Math.sin(elapsedTime * 3.0) * 0.25;
    eyeGlow.emissiveIntensity = eyePulse;

    if (activeHotspot === 'voice') {
      magentaGlow.emissiveIntensity = 2.8 + Math.sin(elapsedTime * 12) * 1.2;
    } else if (activeHotspot === 'vision') {
      eyeGlow.emissiveIntensity = 2.4 + Math.sin(elapsedTime * 8) * 0.6;
    } else {
      magentaGlow.emissiveIntensity = 2.0 + Math.sin(elapsedTime * 2) * 0.3;
    }
  };

  return {
    rootGroup,
    headGroup,
    baseGroup,
    neckGroup,
    leftEye: leftEyeData.eyeCore,
    rightEye: rightEyeData.eyeCore,
    facePlate,
    materials: {
      purpleMetallic,
      darkTitanium,
      polishedChrome,
      facePlateMat,
      opticalEyeGlass,
      eyeGlow,
      cyanGlow,
      magentaGlow,
      innerChassis,
    },
    animate,
  };
}
