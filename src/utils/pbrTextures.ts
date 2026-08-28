import * as THREE from 'three';

/**
 * Generates high-fidelity procedural PBR textures using HTML5 Canvas.
 * These give standard Three.js materials authentic micro-surface details,
 * industrial hazard markings, carbon fiber weave, and brushed metal anisotropic reflections.
 */

// 1. Carbon Fiber Weave Texture
export function createCarbonFiberTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111318';
  ctx.fillRect(0, 0, size, size);

  const step = 8;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const isAlt = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#1e2430' : '#0d0f14';
      ctx.fillRect(x, y, step, step);

      // Micro fiber highlight
      ctx.fillStyle = isAlt ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + 1, y + 1, step - 2, step / 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 2. Industrial Hazard Caution Stripes Texture (Yellow & Black / Cyan & Dark)
export function createHazardStripesTexture(theme: 'yellow' | 'cyan' = 'yellow'): THREE.CanvasTexture {
  const width = 256;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const color1 = theme === 'yellow' ? '#f59e0b' : '#00f0ff';
  const color2 = '#0f172a';

  ctx.fillStyle = color2;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = color1;
  const stripeWidth = 24;
  for (let x = -height; x < width + height; x += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth - height, height);
    ctx.lineTo(x - height, height);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

// 3. Brushed Metal Micro-Scratch Bump Map
export function createBrushedMetalBumpMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 2000; i++) {
    const y = Math.random() * size;
    const length = 20 + Math.random() * 80;
    const x = Math.random() * size;
    const brightness = Math.floor(100 + Math.random() * 60);

    ctx.strokeStyle = `rgb(${brightness},${brightness},${brightness})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// 4. Rivet / Bolt Normal Texture for Industrial Panels
export function createIndustrialPanelTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base panel color
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);

  // Border groove
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, size - 8, size - 8);

  // Corner Rivet Bolts
  const rivets = [
    [16, 16],
    [size - 16, 16],
    [16, size - 16],
    [size - 16, size - 16],
  ];

  rivets.forEach(([rx, ry]) => {
    // Outer shadow
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Inner chrome bolt
    ctx.beginPath();
    ctx.arc(rx, ry, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();

    // Hex socket
    ctx.beginPath();
    ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#090d16';
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
