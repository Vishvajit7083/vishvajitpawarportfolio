import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export interface PhysicsGrabState {
  isGrabbing: boolean;
  grabPoint: THREE.Vector3;
  targetPoint: THREE.Vector3;
  impulseForce: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  linearVelocity: THREE.Vector3;
  kineticEnergy: number;
  grabTension: number;
}

export interface PhysicsController {
  world: CANNON.World;
  body: CANNON.Body;
  grabState: PhysicsGrabState;
  startGrab: (intersectPoint: THREE.Vector3) => void;
  updateGrab: (newTargetPoint: THREE.Vector3, deltaRotation?: { dx: number; dy: number }) => void;
  endGrab: (releaseVelocity?: { vx: number; vy: number }) => void;
  step: (dt: number) => void;
  syncToThreeMesh: (meshOrGroup: THREE.Object3D) => void;
  applyImpulse: (force: THREE.Vector3, worldPoint?: THREE.Vector3) => void;
  resetPose: (position?: THREE.Vector3, rotation?: THREE.Euler) => void;
  dispose: () => void;
}

/**
 * Creates a high-fidelity CANNON.js physics body with 6-DOF constraints,
 * spring-damper mouse grabbing, angular damping, and physical inertia.
 */
export function createModelPhysics(options: {
  mass?: number;
  dimensions?: { x: number; y: number; z: number };
  initialPosition?: { x: number; y: number; z: number };
  initialRotation?: { x: number; y: number; z: number };
  angularDamping?: number;
  linearDamping?: number;
  springStiffness?: number;
  springDamping?: number;
  gravity?: { x: number; y: number; z: number };
}): PhysicsController {
  const {
    mass = 2.5,
    dimensions = { x: 1.6, y: 2.2, z: 1.6 },
    initialPosition = { x: 0, y: 0, z: 0 },
    initialRotation = { x: 0, y: 0, z: 0 },
    angularDamping = 0.55,
    linearDamping = 0.65,
    springStiffness = 180,
    springDamping = 12,
    gravity = { x: 0, y: 0, z: 0 }, // Zero-g / suspended workbench physics
  } = options;

  const world = new CANNON.World();
  world.gravity.set(gravity.x, gravity.y, gravity.z);
  world.broadphase = new CANNON.NaiveBroadphase();
  (world.solver as CANNON.GSSolver).iterations = 10;

  // Contact material for realistic friction & bounce
  const defaultMaterial = new CANNON.Material('default');
  const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.4,
    restitution: 0.25,
  });
  world.addContactMaterial(contactMaterial);

  // Main rigid body compound shape (box representation of bounding volume)
  const halfExtents = new CANNON.Vec3(dimensions.x / 2, dimensions.y / 2, dimensions.z / 2);
  const boxShape = new CANNON.Box(halfExtents);

  const body = new CANNON.Body({
    mass,
    material: defaultMaterial,
    linearDamping,
    angularDamping,
  });
  body.addShape(boxShape);
  body.position.set(initialPosition.x, initialPosition.y, initialPosition.z);

  const initEuler = new CANNON.Vec3(initialRotation.x, initialRotation.y, initialRotation.z);
  body.quaternion.setFromEuler(initEuler.x, initEuler.y, initEuler.z);
  world.addBody(body);

  // Default target orientation anchor to apply soft rotational stabilization
  const targetQuaternion = new CANNON.Quaternion();
  targetQuaternion.setFromEuler(initialRotation.x, initialRotation.y, initialRotation.z);

  // Physics Grab & Spring Constraint State
  const grabState: PhysicsGrabState = {
    isGrabbing: false,
    grabPoint: new THREE.Vector3(),
    targetPoint: new THREE.Vector3(),
    impulseForce: new THREE.Vector3(),
    angularVelocity: new THREE.Vector3(),
    linearVelocity: new THREE.Vector3(),
    kineticEnergy: 0,
    grabTension: 0,
  };

  let localGrabPoint = new CANNON.Vec3();

  const startGrab = (intersectPoint: THREE.Vector3) => {
    grabState.isGrabbing = true;
    grabState.grabPoint.copy(intersectPoint);
    grabState.targetPoint.copy(intersectPoint);

    // Calculate local anchor point relative to body position and rotation
    const worldGrab = new CANNON.Vec3(intersectPoint.x, intersectPoint.y, intersectPoint.z);
    body.pointToLocalFrame(worldGrab, localGrabPoint);
    body.wakeUp();
  };

  const updateGrab = (
    newTargetPoint: THREE.Vector3,
    deltaRotation?: { dx: number; dy: number }
  ) => {
    if (!grabState.isGrabbing) return;
    grabState.targetPoint.copy(newTargetPoint);

    // Apply angular torque based on mouse drag movement
    if (deltaRotation) {
      const torqueScale = 1.8;
      const torque = new CANNON.Vec3(
        deltaRotation.dy * torqueScale,
        deltaRotation.dx * torqueScale,
        0
      );
      body.torque.vadd(torque, body.torque);
    }
  };

  const endGrab = (releaseVelocity?: { vx: number; vy: number }) => {
    if (grabState.isGrabbing && releaseVelocity) {
      const impulseScale = 0.08;
      const angularImpulse = new CANNON.Vec3(
        releaseVelocity.vy * impulseScale,
        releaseVelocity.vx * impulseScale,
        0
      );
      body.angularVelocity.vadd(angularImpulse, body.angularVelocity);
    }
    grabState.isGrabbing = false;
    grabState.grabTension = 0;
    grabState.impulseForce.set(0, 0, 0);
  };

  const applyImpulse = (force: THREE.Vector3, worldPoint?: THREE.Vector3) => {
    const f = new CANNON.Vec3(force.x, force.y, force.z);
    const p = worldPoint
      ? new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z)
      : body.position;
    body.applyImpulse(f, p);
  };

  const resetPose = (
    position = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z),
    rotation = new THREE.Euler(initialRotation.x, initialRotation.y, initialRotation.z)
  ) => {
    body.position.set(position.x, position.y, position.z);
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    targetQuaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
  };

  const step = (dt: number) => {
    const clampedDt = Math.min(dt, 0.1);

    // If grabbing, calculate spring-damper force pulling the grab point to the target mouse point
    if (grabState.isGrabbing) {
      const currentWorldGrab = new CANNON.Vec3();
      body.pointToWorldFrame(localGrabPoint, currentWorldGrab);

      const targetPos = new CANNON.Vec3(
        grabState.targetPoint.x,
        grabState.targetPoint.y,
        grabState.targetPoint.z
      );

      // Spring displacement vector
      const displacement = targetPos.vsub(currentWorldGrab);
      const distance = displacement.length();
      grabState.grabTension = distance;

      // Spring Force: F = -k * x
      const springForce = displacement.scale(springStiffness);

      // Damper Force: F_damper = -c * (v_point)
      const pointVelocity = new CANNON.Vec3();
      body.getVelocityAtWorldPoint(currentWorldGrab, pointVelocity);
      const damperForce = pointVelocity.scale(-springDamping);

      // Total Grab Force
      const totalForce = springForce.vadd(damperForce);
      body.applyForce(totalForce, currentWorldGrab);

      grabState.impulseForce.set(totalForce.x, totalForce.y, totalForce.z);
    } else {
      // Gentle soft restorative rotational spring when not grabbed
      const currentRot = new THREE.Quaternion(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w
      );
      const targetRot = new THREE.Quaternion(
        targetQuaternion.x,
        targetQuaternion.y,
        targetQuaternion.z,
        targetQuaternion.w
      );

      // Slerp towards upright equilibrium with gentle damping
      currentRot.slerp(targetRot, 0.015);
      body.quaternion.set(currentRot.x, currentRot.y, currentRot.z, currentRot.w);

      // Soft position centering spring
      const homePos = new CANNON.Vec3(initialPosition.x, initialPosition.y, initialPosition.z);
      const posDisplacement = homePos.vsub(body.position);
      body.applyForce(posDisplacement.scale(12), body.position);
    }

    world.step(1 / 60, clampedDt, 3);

    // Update Telemetry Metrics
    grabState.linearVelocity.set(body.velocity.x, body.velocity.y, body.velocity.z);
    grabState.angularVelocity.set(
      body.angularVelocity.x,
      body.angularVelocity.y,
      body.angularVelocity.z
    );

    const vSq = body.velocity.lengthSquared();
    const wSq = body.angularVelocity.lengthSquared();
    grabState.kineticEnergy = 0.5 * mass * vSq + 0.5 * 0.4 * mass * wSq;
  };

  const syncToThreeMesh = (meshOrGroup: THREE.Object3D) => {
    meshOrGroup.position.set(body.position.x, body.position.y, body.position.z);
    meshOrGroup.quaternion.set(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    );
  };

  const dispose = () => {
    world.removeBody(body);
  };

  return {
    world,
    body,
    grabState,
    startGrab,
    updateGrab,
    endGrab,
    step,
    syncToThreeMesh,
    applyImpulse,
    resetPose,
    dispose,
  };
}
