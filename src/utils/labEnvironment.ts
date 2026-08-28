import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface LabEnvironmentOptions {
  theme?: 'cyber_lab' | 'cleanroom' | 'deep_space' | 'industrial';
  ambientIntensity?: number;
  rimColor?: number;
  overheadColor?: number;
}

/**
 * Creates a high-fidelity Laboratory Environment Map using Three.js PMREMGenerator.
 * Constructs an authentic cleanroom / high-tech hardware laboratory scene with
 * overhead LED light matrices, metallic reflective walls, and cybernetic rim panels.
 * This supplies accurate Image-Based Lighting (IBL) & specular reflections to all PBR materials.
 */
export function createLaboratoryEnvironment(
  renderer: THREE.WebGLRenderer,
  options: LabEnvironmentOptions = {}
): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // Create custom laboratory environment scene
  const envScene = new THREE.Scene();

  // Base subtle room ambient
  const roomGeo = new THREE.BoxGeometry(40, 30, 40);
  const roomMat = new THREE.MeshStandardMaterial({
    color: 0x060c18,
    side: THREE.BackSide,
    roughness: 0.8,
    metalness: 0.2,
  });
  const roomMesh = new THREE.Mesh(roomGeo, roomMat);
  envScene.add(roomMesh);

  // 1. Overhead Cleanroom Linear LED Light Array
  const lightBarGeo = new THREE.BoxGeometry(2.5, 0.2, 14);
  const lightBarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = -2; i <= 2; i++) {
    const bar = new THREE.Mesh(lightBarGeo, lightBarMat);
    bar.position.set(i * 4.5, 12, 0);
    envScene.add(bar);
  }

  // 2. High-Tech Cyan Specular Accent Panels (Left Laboratory Wall)
  const cyanPanelMat = new THREE.MeshBasicMaterial({ color: options.rimColor ?? 0x00f0ff });
  const cyanPanel1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 12), cyanPanelMat);
  cyanPanel1.position.set(-18, 4, 0);
  envScene.add(cyanPanel1);

  // 3. Violet / Cyber Telemetry Panels (Right Wall)
  const purplePanelMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
  const purplePanel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 10), purplePanelMat);
  purplePanel.position.set(18, 3, 2);
  envScene.add(purplePanel);

  // 4. Amber Safety & Warning Diagnostic Beacons (Rear Upper Corners)
  const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const beaconL = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), amberMat);
  beaconL.position.set(-10, 10, -16);
  envScene.add(beaconL);

  const beaconR = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), amberMat);
  beaconR.position.set(10, 10, -16);
  envScene.add(beaconR);

  // 5. Stainless Steel Laboratory Floor Reflection Strip
  const floorStripMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  const floorStrip = new THREE.Mesh(new THREE.BoxGeometry(16, 0.1, 28), floorStripMat);
  floorStrip.position.set(0, -14, 0);
  envScene.add(floorStrip);

  // Generate the PMREM Texture from the laboratory scene
  const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;

  // Dispose PMREM generator and temporary geometries/materials to avoid memory leaks
  pmremGenerator.dispose();
  roomGeo.dispose();
  roomMat.dispose();
  lightBarGeo.dispose();
  lightBarMat.dispose();
  cyanPanelMat.dispose();
  purplePanelMat.dispose();
  amberMat.dispose();
  floorStripMat.dispose();

  return envTexture;
}

/**
 * Creates standard RoomEnvironment texture fallback
 */
export function createStandardRoomEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  pmremGenerator.dispose();
  roomEnv.dispose();
  return envTexture;
}
