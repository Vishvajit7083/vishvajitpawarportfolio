import * as THREE from 'three';
import { createCarbonFiberTexture, createHazardStripesTexture } from './pbrTextures';

export interface ObstacleDefinition {
  id: string;
  name: string;
  type: 'crate' | 'barrel' | 'barrier' | 'pillar' | 'wall';
  mesh: THREE.Object3D;
  boundingBox: THREE.Box3;
  radius?: number;
  center: THREE.Vector3;
}

export interface ArenaEnvironment {
  sceneGroup: THREE.Group;
  obstacleMeshes: THREE.Object3D[];
  obstacles: ObstacleDefinition[];
  arenaBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  dispose: () => void;
}

/**
 * Builds a realistic high-tech Robotics Testing Arena inside the 3D scene.
 * Includes perimeter barrier walls with safety stripes, industrial cargo crates,
 * hazardous warning barrels, test pillars, ground calibration grid markings,
 * and reflective laboratory floor.
 */
export function createRoboticsArena(): ArenaEnvironment {
  const sceneGroup = new THREE.Group();
  const obstacleMeshes: THREE.Object3D[] = [];
  const obstacles: ObstacleDefinition[] = [];

  const arenaHalfSize = 7.5; // 15m x 15m testing arena
  const arenaBounds = {
    minX: -arenaHalfSize + 0.8,
    maxX: arenaHalfSize - 0.8,
    minZ: -arenaHalfSize + 0.8,
    maxZ: arenaHalfSize - 0.8,
  };

  const hazardTex = createHazardStripesTexture();
  const carbonTex = createCarbonFiberTexture();

  // -------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a101d,
    roughness: 0.25,
    metalness: 0.75,
    bumpMap: carbonTex,
    bumpScale: 0.005,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.4,
    metalness: 0.6,
  });

  const wallBorderMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.35,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    map: hazardTex,
    roughness: 0.4,
    metalness: 0.3,
  });

  const crateMatDark = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.8,
    bumpMap: carbonTex,
    bumpScale: 0.02,
  });

  const crateMatOrange = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.45,
    metalness: 0.2,
  });

  const barrelYellowMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.35,
    metalness: 0.65,
  });

  const barrelBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.35,
    metalness: 0.65,
  });

  const metalBandMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.9,
  });

  // -------------------------------------------------------------
  // 1. Arena Main Floor & Visual Grid
  // -------------------------------------------------------------
  const floorGeo = new THREE.PlaneGeometry(arenaHalfSize * 2, arenaHalfSize * 2);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.45;
  floorMesh.receiveShadow = true;
  sceneGroup.add(floorMesh);

  // Calibration Grid Lines
  const gridHelper = new THREE.GridHelper(arenaHalfSize * 2, 30, 0x00f0ff, 0x1e293b);
  gridHelper.position.y = -0.445;
  gridHelper.material.opacity = 0.45;
  gridHelper.material.transparent = true;
  sceneGroup.add(gridHelper);

  // Center Test Pad Ring
  const centerRingGeo = new THREE.RingGeometry(1.2, 1.28, 32);
  const centerRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat);
  centerRing.rotation.x = -Math.PI / 2;
  centerRing.position.y = -0.44;
  sceneGroup.add(centerRing);

  // -------------------------------------------------------------
  // 2. Perimeter Walls with Glowing Trims & Hazard Curbs
  // -------------------------------------------------------------
  const wallHeight = 1.6;
  const wallThickness = 0.4;
  const wallLength = arenaHalfSize * 2;

  const createWall = (
    pos: THREE.Vector3,
    size: [number, number, number],
    name: string
  ) => {
    const wallGroup = new THREE.Group();
    const wGeo = new THREE.BoxGeometry(...size);
    const wMesh = new THREE.Mesh(wGeo, wallMat);
    wMesh.castShadow = true;
    wMesh.receiveShadow = true;
    wMesh.position.y = size[1] / 2 - 0.45;
    wallGroup.add(wMesh);

    // Glowing Neon Top Trim
    const trimGeo = new THREE.BoxGeometry(
      size[0] + 0.05,
      0.08,
      size[2] + 0.05
    );
    const trimMesh = new THREE.Mesh(trimGeo, wallBorderMat);
    trimMesh.position.y = size[1] - 0.45;
    wallGroup.add(trimMesh);

    // Bottom Hazard Curb
    const curbGeo = new THREE.BoxGeometry(
      size[0] + (size[0] > size[2] ? 0 : 0.2),
      0.15,
      size[2] + (size[2] > size[0] ? 0 : 0.2)
    );
    const curbMesh = new THREE.Mesh(curbGeo, hazardMat);
    curbMesh.position.y = 0.075 - 0.45;
    wallGroup.add(curbMesh);

    wallGroup.position.copy(pos);
    sceneGroup.add(wallGroup);

    wMesh.userData = { isObstacle: true, obstacleName: name, obstacleType: 'wall' };
    obstacleMeshes.push(wMesh);

    const bBox = new THREE.Box3().setFromObject(wallGroup);
    obstacles.push({
      id: `wall_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      type: 'wall',
      mesh: wMesh,
      boundingBox: bBox,
      center: pos.clone(),
    });
  };

  // North Wall
  createWall(
    new THREE.Vector3(0, 0, -arenaHalfSize),
    [wallLength, wallHeight, wallThickness],
    'North Perimeter Wall'
  );
  // South Wall
  createWall(
    new THREE.Vector3(0, 0, arenaHalfSize),
    [wallLength, wallHeight, wallThickness],
    'South Perimeter Wall'
  );
  // East Wall
  createWall(
    new THREE.Vector3(arenaHalfSize, 0, 0),
    [wallThickness, wallHeight, wallLength],
    'East Perimeter Wall'
  );
  // West Wall
  createWall(
    new THREE.Vector3(-arenaHalfSize, 0, 0),
    [wallThickness, wallHeight, wallLength],
    'West Perimeter Wall'
  );

  // -------------------------------------------------------------
  // 3. Industrial Obstacles (Crates, Barrels, Test Pylons)
  // -------------------------------------------------------------

  // Function to create a realistic cargo crate
  const createCrate = (
    pos: THREE.Vector3,
    size: [number, number, number],
    rotationY: number,
    isOrange: boolean,
    name: string
  ) => {
    const crateGroup = new THREE.Group();
    const mainGeo = new THREE.BoxGeometry(...size);
    const mainMesh = new THREE.Mesh(mainGeo, isOrange ? crateMatOrange : crateMatDark);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    mainMesh.position.y = size[1] / 2 - 0.45;
    crateGroup.add(mainMesh);

    // Hazard Stripes on top rim
    const stripGeo = new THREE.BoxGeometry(size[0] * 0.95, 0.02, size[2] * 0.95);
    const stripMesh = new THREE.Mesh(stripGeo, hazardMat);
    stripMesh.position.y = size[1] - 0.44;
    crateGroup.add(stripMesh);

    // Metal corner protectors
    const cornerSize = 0.12;
    const cornerGeo = new THREE.BoxGeometry(cornerSize, size[1] * 0.98, cornerSize);
    const corners = [
      [-size[0] / 2, size[1] / 2 - 0.45, -size[2] / 2],
      [size[0] / 2, size[1] / 2 - 0.45, -size[2] / 2],
      [-size[0] / 2, size[1] / 2 - 0.45, size[2] / 2],
      [size[0] / 2, size[1] / 2 - 0.45, size[2] / 2],
    ];

    corners.forEach((cPos) => {
      const cMesh = new THREE.Mesh(cornerGeo, metalBandMat);
      cMesh.position.set(cPos[0], cPos[1], cPos[2]);
      crateGroup.add(cMesh);
    });

    crateGroup.position.copy(pos);
    crateGroup.rotation.y = rotationY;
    sceneGroup.add(crateGroup);

    mainMesh.userData = { isObstacle: true, obstacleName: name, obstacleType: 'crate' };
    obstacleMeshes.push(mainMesh);

    const bBox = new THREE.Box3().setFromObject(crateGroup);
    obstacles.push({
      id: `crate_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      type: 'crate',
      mesh: mainMesh,
      boundingBox: bBox,
      radius: Math.max(size[0], size[2]) * 0.65,
      center: pos.clone(),
    });
  };

  // Function to create an industrial hazard barrel
  const createBarrel = (
    pos: THREE.Vector3,
    radius: number,
    height: number,
    isYellow: boolean,
    name: string
  ) => {
    const barrelGroup = new THREE.Group();
    const bGeo = new THREE.CylinderGeometry(radius, radius, height, 20);
    const bMesh = new THREE.Mesh(bGeo, isYellow ? barrelYellowMat : barrelBlueMat);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    bMesh.position.y = height / 2 - 0.45;
    barrelGroup.add(bMesh);

    // Reinforcing Rib Bands
    const bandGeo = new THREE.CylinderGeometry(radius * 1.03, radius * 1.03, 0.05, 20);
    for (let i = -1; i <= 1; i++) {
      const band = new THREE.Mesh(bandGeo, metalBandMat);
      band.position.y = height / 2 - 0.45 + i * (height * 0.3);
      barrelGroup.add(band);
    }

    barrelGroup.position.copy(pos);
    sceneGroup.add(barrelGroup);

    bMesh.userData = { isObstacle: true, obstacleName: name, obstacleType: 'barrel' };
    obstacleMeshes.push(bMesh);

    const bBox = new THREE.Box3().setFromObject(barrelGroup);
    obstacles.push({
      id: `barrel_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      type: 'barrel',
      mesh: bMesh,
      boundingBox: bBox,
      radius: radius * 1.15,
      center: pos.clone(),
    });
  };

  // Function to create a futuristic test pillar
  const createTestPillar = (pos: THREE.Vector3, radius: number, height: number, name: string) => {
    const pillarGroup = new THREE.Group();
    const pGeo = new THREE.CylinderGeometry(radius, radius * 1.2, height, 24);
    const pMesh = new THREE.Mesh(pGeo, wallMat);
    pMesh.castShadow = true;
    pMesh.receiveShadow = true;
    pMesh.position.y = height / 2 - 0.45;
    pillarGroup.add(pMesh);

    // Glowing Cyan Core Ring
    const ringGeo = new THREE.TorusGeometry(radius * 1.05, 0.04, 12, 24);
    const ringMesh = new THREE.Mesh(ringGeo, wallBorderMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = height * 0.7 - 0.45;
    pillarGroup.add(ringMesh);

    pillarGroup.position.copy(pos);
    sceneGroup.add(pillarGroup);

    pMesh.userData = { isObstacle: true, obstacleName: name, obstacleType: 'pillar' };
    obstacleMeshes.push(pMesh);

    const bBox = new THREE.Box3().setFromObject(pillarGroup);
    obstacles.push({
      id: `pillar_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      type: 'pillar',
      mesh: pMesh,
      boundingBox: bBox,
      radius: radius * 1.25,
      center: pos.clone(),
    });
  };

  // -------------------------------------------------------------
  // Strategic Obstacle Placement for Obstacle Avoidance & Driving
  // -------------------------------------------------------------
  // Front-Center Obstacle (Primary forward obstacle test)
  createCrate(new THREE.Vector3(0, 0, 3.2), [1.6, 1.1, 1.2], 0.15, true, 'Test Cargo Crate Alpha');

  // North-West Obstacle Cluster
  createBarrel(new THREE.Vector3(-3.2, 0, -2.8), 0.55, 1.2, true, 'Safety Barrel Yellow #1');
  createBarrel(new THREE.Vector3(-4.2, 0, -2.2), 0.5, 1.0, false, 'Safety Barrel Blue #1');

  // North-East High Pillar
  createTestPillar(new THREE.Vector3(3.5, 0, -3.0), 0.6, 1.8, 'Sensor Calibration Pylon');

  // South-West Heavy Storage Crate
  createCrate(new THREE.Vector3(-3.8, 0, 2.6), [1.8, 1.3, 1.4], -0.25, false, 'Heavy Logistics Container');

  // South-East Secondary Barrier
  createBarrel(new THREE.Vector3(4.0, 0, 2.8), 0.55, 1.2, true, 'Safety Barrel Yellow #2');
  createCrate(new THREE.Vector3(4.8, 0, 1.2), [1.3, 0.9, 1.1], 0.35, true, 'Component Storage Crate');

  // Far North Center Barrier
  createCrate(new THREE.Vector3(0, 0, -4.5), [2.4, 0.9, 0.9], 0, false, 'Perimeter Barrier Alpha');

  // Clean-up method
  const dispose = () => {
    floorGeo.dispose();
    floorMat.dispose();
    hazardTex.dispose();
    carbonTex.dispose();
  };

  return {
    sceneGroup,
    obstacleMeshes,
    obstacles,
    arenaBounds,
    dispose,
  };
}
