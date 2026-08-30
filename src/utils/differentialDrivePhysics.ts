import * as THREE from 'three';
import { ObstacleDefinition } from './robotArena';

export type DriveControlCommand = 'forward' | 'backward' | 'left' | 'right' | 'spin' | 'stop';
export type ObstacleState = 'CLEAR' | 'WARNING' | 'CRITICAL_STOP';
export type AutoNavState =
  | 'MANUAL'
  | 'AUTO_FORWARD'
  | 'AUTO_DECELERATE'
  | 'AUTO_SCAN_RIGHT'
  | 'AUTO_SCAN_LEFT'
  | 'AUTO_REVERSE'
  | 'AUTO_PIVOT_TURN'
  | 'AUTO_EVALUATE';

export interface TelemetryData {
  leftWheelRpm: number;
  rightWheelRpm: number;
  leftWheelSpeedMs: number;
  rightWheelSpeedMs: number;
  linearSpeedMs: number;
  linearSpeedCms: number;
  angularVelocityRad: number;
  headingDeg: number;
  headingCompass: string;
  ultrasonicDistanceCm: number;
  obstacleState: ObstacleState;
  detectedObstacleName: string | null;
  batteryPercent: number;
  batteryVoltage: number;
  motorCurrentAmps: number;
  panAngleDeg: number;
  drivingMode: 'MANUAL TELEOPERATION' | 'AUTONOMOUS OBSTACLE AVOIDANCE' | 'EMERGENCY BRAKE';
  autoState: AutoNavState;
  sonarStatus: 'ACTIVE SCANNING' | 'CLEAR PATH' | 'OBSTACLE DETECTED';
}

export class DifferentialDriveSimulation {
  // Physical parameters of the mobile robot
  public readonly wheelRadius = 0.38; // Radius of rubber wheels in world units
  public readonly trackWidth = 1.56; // Distance between left and right wheels
  public readonly robotColliderRadius = 0.82; // Physical collision boundary radius
  public readonly maxLinearSpeed = 2.4; // Max forward/reverse speed (m/s equivalent in world)
  public readonly maxRpm = 200; // TT Gearbox maximum 200 RPM

  // Robot Position and Pose
  public position = new THREE.Vector3(0, 0, 0);
  public rotationY = 0; // Heading in radians

  // Individual wheel kinematics
  public targetLeftVel = 0;
  public targetRightVel = 0;
  public currentLeftVel = 0;
  public currentRightVel = 0;
  public leftWheelAngle = 0;
  public rightWheelAngle = 0;

  // HC-SR04 Sonar Ultrasonic Sensor
  public panServoAngle = 0; // Radians (-1.0 to +1.0)
  public panServoSpeed = 2.4;
  public ultrasonicDistanceCm = 250;
  public nearestObstacleName: string | null = null;
  public obstacleState: ObstacleState = 'CLEAR';
  public rayHitPoint: THREE.Vector3 | null = null;
  private raycaster = new THREE.Raycaster();

  // Autonomous Mode State Machine
  public isAutonomous = false;
  public autoState: AutoNavState = 'MANUAL';
  private autoTimer = 0;
  private rightScanDistance = 250;
  private leftScanDistance = 250;
  private chosenTurnDir: 'left' | 'right' = 'right';

  // Battery and Power System
  public batteryPercent = 98.4;
  public batteryVoltage = 7.85;
  private batteryDrainTimer = 0;

  // Active Manual Control Command & Throttle
  public manualCommand: DriveControlCommand = 'stop';
  public throttle = 0.75; // 0.1 to 1.0

  constructor(initialPosition?: THREE.Vector3, initialRotationY?: number) {
    if (initialPosition) this.position.copy(initialPosition);
    if (initialRotationY !== undefined) this.rotationY = initialRotationY;
  }

  public setCommand(cmd: DriveControlCommand, throttleValue?: number) {
    this.manualCommand = cmd;
    if (throttleValue !== undefined) {
      this.throttle = Math.max(0.1, Math.min(1.0, throttleValue));
    }
  }

  public setAutonomous(enabled: boolean) {
    this.isAutonomous = enabled;
    if (enabled) {
      this.autoState = 'AUTO_FORWARD';
      this.autoTimer = 0;
    } else {
      this.autoState = 'MANUAL';
      this.setCommand('stop');
    }
  }

  public reset(pos: THREE.Vector3 = new THREE.Vector3(0, 0, 0), rotY: number = 0) {
    this.position.copy(pos);
    this.rotationY = rotY;
    this.currentLeftVel = 0;
    this.currentRightVel = 0;
    this.targetLeftVel = 0;
    this.targetRightVel = 0;
    this.leftWheelAngle = 0;
    this.rightWheelAngle = 0;
    this.panServoAngle = 0;
    this.manualCommand = 'stop';
    this.isAutonomous = false;
    this.autoState = 'MANUAL';
    this.ultrasonicDistanceCm = 250;
    this.obstacleState = 'CLEAR';
    this.nearestObstacleName = null;
    this.rayHitPoint = null;
  }

  /**
   * Main Physics & Kinematics Update Loop
   */
  public update(
    delta: number,
    obstacleMeshes: THREE.Object3D[],
    obstacles: ObstacleDefinition[],
    arenaBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  ) {
    // Clamp delta to prevent physics explosion on lag spikes
    const dt = Math.min(delta, 0.1);

    // 1. Raycast Front HC-SR04 Sonar against physical 3D obstacles
    this.updateUltrasonicSensor(obstacleMeshes);

    // 2. Process Autonomous Navigation or Manual Teleoperation Input
    if (this.isAutonomous) {
      this.updateAutonomousFSM(dt);
    } else {
      this.updateManualDriveTargets();
    }

    // 3. Acceleration & Inertia filter (Differential Motor Response)
    // TT DC motors have physical inductive ramp-up & friction deceleration
    const accelRate = 6.5; // Acceleration stiffness
    this.currentLeftVel += (this.targetLeftVel - this.currentLeftVel) * Math.min(1.0, dt * accelRate);
    this.currentRightVel += (this.targetRightVel - this.currentRightVel) * Math.min(1.0, dt * accelRate);

    // Zero-velocity threshold cutoff
    if (Math.abs(this.currentLeftVel) < 0.005 && Math.abs(this.targetLeftVel) < 0.005) {
      this.currentLeftVel = 0;
    }
    if (Math.abs(this.currentRightVel) < 0.005 && Math.abs(this.targetRightVel) < 0.005) {
      this.currentRightVel = 0;
    }

    // 4. Differential-Drive Kinematics Computation
    // Linear velocity v = (v_R + v_L) / 2
    // Angular velocity omega = (v_R - v_L) / L
    const linearVel = (this.currentRightVel + this.currentLeftVel) / 2;
    const angularVel = (this.currentRightVel - this.currentLeftVel) / this.trackWidth;

    // Update Heading (yaw)
    this.rotationY += angularVel * dt;
    // Normalize rotation to 0 - 2PI
    this.rotationY = (this.rotationY + Math.PI * 2) % (Math.PI * 2);

    // Compute robot forward vector based on heading
    // In Three.js coordinates, heading = 0 points towards +Z
    const forwardX = Math.sin(this.rotationY);
    const forwardZ = Math.cos(this.rotationY);

    // Calculate potential new position
    const nextX = this.position.x + forwardX * linearVel * dt;
    const nextZ = this.position.z + forwardZ * linearVel * dt;

    // 5. Physical Collision Boundary & Obstacle Clamping
    const resolvedPos = this.resolveCollisions(nextX, nextZ, obstacles, arenaBounds);
    this.position.x = resolvedPos.x;
    this.position.z = resolvedPos.z;

    // 6. Wheel Physical Rotation Angles (Synchronized with movement & slip)
    // Delta phi = (v_wheel * dt) / R_wheel
    this.leftWheelAngle += (this.currentLeftVel * dt) / this.wheelRadius;
    this.rightWheelAngle += (this.currentRightVel * dt) / this.wheelRadius;

    // 7. Battery Drain Simulation
    this.updateBattery(dt);
  }

  /**
   * Raycasts ultrasonic acoustic beam from HC-SR04 sensor in the 3D world
   */
  private updateUltrasonicSensor(obstacleMeshes: THREE.Object3D[]) {
    // Calculate global sensor position (front of robot)
    const sensorOffsetLocal = new THREE.Vector3(0, 0.18, 0.95);
    sensorOffsetLocal.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
    const sensorWorldPos = this.position.clone().add(sensorOffsetLocal);

    // Total sonar angle combines robot heading + pan servo angle
    const totalSonarAngle = this.rotationY + this.panServoAngle;
    const rayDir = new THREE.Vector3(
      Math.sin(totalSonarAngle),
      0,
      Math.cos(totalSonarAngle)
    ).normalize();

    this.raycaster.set(sensorWorldPos, rayDir);
    this.raycaster.far = 8.0; // 400cm max range in scaled world

    let minDistance = 8.0;
    let hitObject: THREE.Object3D | null = null;
    let hitPoint: THREE.Vector3 | null = null;

    if (obstacleMeshes.length > 0) {
      const intersections = this.raycaster.intersectObjects(obstacleMeshes, true);
      if (intersections.length > 0) {
        minDistance = intersections[0].distance;
        hitObject = intersections[0].object;
        hitPoint = intersections[0].point;
      }
    }

    // Also cast small ±7.5° side acoustic cone rays (realistic 15° beam aperture)
    const sideAngles = [-0.13, 0.13];
    for (const sAngle of sideAngles) {
      const coneDir = new THREE.Vector3(
        Math.sin(totalSonarAngle + sAngle),
        0,
        Math.cos(totalSonarAngle + sAngle)
      ).normalize();
      this.raycaster.set(sensorWorldPos, coneDir);
      if (obstacleMeshes.length > 0) {
        const sideHits = this.raycaster.intersectObjects(obstacleMeshes, true);
        if (sideHits.length > 0 && sideHits[0].distance < minDistance) {
          minDistance = sideHits[0].distance;
          hitObject = sideHits[0].object;
          hitPoint = sideHits[0].point;
        }
      }
    }

    // Convert world distance to realistic centimeters
    // Scale: 1.0 world unit = 50.0 cm of lab space
    const measuredCm = Math.round(minDistance * 50);
    this.ultrasonicDistanceCm = Math.min(400, Math.max(4, measuredCm));
    this.rayHitPoint = hitPoint;

    if (hitObject) {
      this.nearestObstacleName =
        hitObject.userData.obstacleName || hitObject.name || 'Lab Obstacle';
    } else {
      this.nearestObstacleName = null;
    }

    // Determine Obstacle Severity State
    if (this.ultrasonicDistanceCm <= 16) {
      this.obstacleState = 'CRITICAL_STOP';
    } else if (this.ultrasonicDistanceCm <= 48) {
      this.obstacleState = 'WARNING';
    } else {
      this.obstacleState = 'CLEAR';
    }
  }

  /**
   * Translates manual UI / keyboard commands to differential wheel velocity targets
   */
  private updateManualDriveTargets() {
    const baseSpeed = this.maxLinearSpeed * this.throttle;

    // Check if forward movement is blocked by proximity obstacle (< 16cm)
    const isForwardBlocked = this.obstacleState === 'CRITICAL_STOP';

    // Speed throttling if in CAUTION zone (16 - 32 cm)
    let forwardSpeedMultiplier = 1.0;
    if (this.ultrasonicDistanceCm < 32 && this.ultrasonicDistanceCm >= 16) {
      forwardSpeedMultiplier = 0.45; // Automatic safety deceleration
    }

    switch (this.manualCommand) {
      case 'forward':
        if (isForwardBlocked) {
          // Inhibit forward motor drive if obstacle is dangerously close
          this.targetLeftVel = 0;
          this.targetRightVel = 0;
        } else {
          this.targetLeftVel = baseSpeed * forwardSpeedMultiplier;
          this.targetRightVel = baseSpeed * forwardSpeedMultiplier;
        }
        break;

      case 'backward':
        // Reversing is always allowed to back away from obstacles
        this.targetLeftVel = -baseSpeed * 0.75;
        this.targetRightVel = -baseSpeed * 0.75;
        break;

      case 'left':
        // Differential Skid Turn Left: Left wheel reversed / Right wheel forward
        this.targetLeftVel = -baseSpeed * 0.55;
        this.targetRightVel = baseSpeed * 0.75;
        break;

      case 'right':
        // Differential Skid Turn Right: Left wheel forward / Right wheel reversed
        this.targetLeftVel = baseSpeed * 0.75;
        this.targetRightVel = -baseSpeed * 0.55;
        break;

      case 'spin':
        // 360 Zero-Radius Pivot Spin
        this.targetLeftVel = -baseSpeed * 0.8;
        this.targetRightVel = baseSpeed * 0.8;
        break;

      case 'stop':
      default:
        this.targetLeftVel = 0;
        this.targetRightVel = 0;
        break;
    }
  }

  /**
   * Autonomous Obstacle-Avoidance Finite State Machine (FSM)
   */
  private updateAutonomousFSM(dt: number) {
    this.autoTimer += dt;
    const baseSpeed = this.maxLinearSpeed * this.throttle;

    switch (this.autoState) {
      case 'AUTO_FORWARD':
        // Pan servo stays forward
        this.panServoAngle += (0 - this.panServoAngle) * Math.min(1.0, dt * 8);

        // If path is clear, drive forward
        if (this.ultrasonicDistanceCm > 40) {
          this.targetLeftVel = baseSpeed;
          this.targetRightVel = baseSpeed;
        } else if (this.ultrasonicDistanceCm > 24) {
          // In caution zone -> Slow down
          this.targetLeftVel = baseSpeed * 0.45;
          this.targetRightVel = baseSpeed * 0.45;
        } else {
          // Approached obstacle -> Transition to Stop and Scan
          this.targetLeftVel = 0;
          this.targetRightVel = 0;
          this.autoState = 'AUTO_SCAN_RIGHT';
          this.autoTimer = 0;
        }
        break;

      case 'AUTO_SCAN_RIGHT':
        // Stop wheels, pan HC-SR04 servo to +55° (Right)
        this.targetLeftVel = 0;
        this.targetRightVel = 0;
        const targetAngleRight = 0.95; // ~55 degrees
        this.panServoAngle += (targetAngleRight - this.panServoAngle) * Math.min(1.0, dt * 6);

        if (this.autoTimer > 0.45) {
          this.rightScanDistance = this.ultrasonicDistanceCm;
          this.autoState = 'AUTO_SCAN_LEFT';
          this.autoTimer = 0;
        }
        break;

      case 'AUTO_SCAN_LEFT':
        // Pan HC-SR04 servo to -55° (Left)
        this.targetLeftVel = 0;
        this.targetRightVel = 0;
        const targetAngleLeft = -0.95; // ~ -55 degrees
        this.panServoAngle += (targetAngleLeft - this.panServoAngle) * Math.min(1.0, dt * 6);

        if (this.autoTimer > 0.55) {
          this.leftScanDistance = this.ultrasonicDistanceCm;
          this.autoState = 'AUTO_EVALUATE';
          this.autoTimer = 0;
        }
        break;

      case 'AUTO_EVALUATE':
        this.targetLeftVel = 0;
        this.targetRightVel = 0;

        // Choose clearer direction
        if (this.leftScanDistance > this.rightScanDistance) {
          this.chosenTurnDir = 'left';
        } else {
          this.chosenTurnDir = 'right';
        }

        // Check if we need slight reverse clearance first
        if (this.ultrasonicDistanceCm < 20) {
          this.autoState = 'AUTO_REVERSE';
        } else {
          this.autoState = 'AUTO_PIVOT_TURN';
        }
        this.autoTimer = 0;
        break;

      case 'AUTO_REVERSE':
        // Re-center pan servo
        this.panServoAngle += (0 - this.panServoAngle) * Math.min(1.0, dt * 8);

        // Reverse slightly for 0.4 seconds
        this.targetLeftVel = -baseSpeed * 0.6;
        this.targetRightVel = -baseSpeed * 0.6;

        if (this.autoTimer > 0.42) {
          this.targetLeftVel = 0;
          this.targetRightVel = 0;
          this.autoState = 'AUTO_PIVOT_TURN';
          this.autoTimer = 0;
        }
        break;

      case 'AUTO_PIVOT_TURN':
        // Re-center servo while turning chassis
        this.panServoAngle += (0 - this.panServoAngle) * Math.min(1.0, dt * 8);

        const turnSpeed = baseSpeed * 0.75;
        if (this.chosenTurnDir === 'left') {
          this.targetLeftVel = -turnSpeed;
          this.targetRightVel = turnSpeed;
        } else {
          this.targetLeftVel = turnSpeed;
          this.targetRightVel = -turnSpeed;
        }

        // Pivot turn until front sonar measures clear path (> 65cm) and turned at least 0.55s
        if (this.autoTimer > 0.6 && this.ultrasonicDistanceCm > 65) {
          this.autoState = 'AUTO_FORWARD';
          this.autoTimer = 0;
        } else if (this.autoTimer > 2.5) {
          // Timeout failsafe -> resume forward
          this.autoState = 'AUTO_FORWARD';
          this.autoTimer = 0;
        }
        break;
    }
  }

  /**
   * Collision resolution against arena perimeter walls and obstacles
   */
  private resolveCollisions(
    candidateX: number,
    candidateZ: number,
    obstacles: ObstacleDefinition[],
    arenaBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  ): { x: number; z: number } {
    let resolvedX = candidateX;
    let resolvedZ = candidateZ;

    // 1. Clamp to Arena Perimeter Bounds
    resolvedX = Math.max(arenaBounds.minX, Math.min(arenaBounds.maxX, resolvedX));
    resolvedZ = Math.max(arenaBounds.minZ, Math.min(arenaBounds.maxZ, resolvedZ));

    // 2. Circle vs Circle/AABB Collision against Lab Obstacles
    const rRadius = this.robotColliderRadius;

    for (const obs of obstacles) {
      if (obs.type === 'wall') continue; // Handled by arena bounds

      const obsRadius = obs.radius || 0.8;
      const minDist = rRadius + obsRadius;

      const dx = resolvedX - obs.center.x;
      const dz = resolvedZ - obs.center.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < minDist * minDist && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        const pushX = (dx / dist) * overlap;
        const pushZ = (dz / dist) * overlap;

        resolvedX += pushX;
        resolvedZ += pushZ;

        // Dampen motor velocity upon obstacle contact
        this.currentLeftVel *= 0.4;
        this.currentRightVel *= 0.4;
      }
    }

    return { x: resolvedX, z: resolvedZ };
  }

  /**
   * Dynamic battery level and voltage simulation
   */
  private updateBattery(dt: number) {
    this.batteryDrainTimer += dt;
    if (this.batteryDrainTimer > 1.0) {
      this.batteryDrainTimer = 0;
      // Drain proportional to motor activity
      const motorLoad =
        (Math.abs(this.currentLeftVel) + Math.abs(this.currentRightVel)) /
        (this.maxLinearSpeed * 2);
      const drain = 0.003 + motorLoad * 0.012;
      this.batteryPercent = Math.max(12.0, this.batteryPercent - drain);
      this.batteryVoltage = 7.4 + (this.batteryPercent / 100) * 0.85;
    }
  }

  /**
   * Produces comprehensive telemetry for HUD display
   */
  public getTelemetry(): TelemetryData {
    // Wheel RPM = (v / (2 * PI * R)) * 60
    const leftRpm = Math.round((Math.abs(this.currentLeftVel) / (2 * Math.PI * this.wheelRadius)) * 60);
    const rightRpm = Math.round((Math.abs(this.currentRightVel) / (2 * Math.PI * this.wheelRadius)) * 60);

    const linearSpeedMs = (this.currentLeftVel + this.currentRightVel) / 2;
    const linearSpeedCms = Math.round(linearSpeedMs * 50); // Scale to cm/s

    const angularVelocityRad = (this.currentRightVel - this.currentLeftVel) / this.trackWidth;

    // Heading in degrees (0 - 360)
    const headingDeg = Math.round((this.rotationY * 180) / Math.PI) % 360;

    // Heading Compass Direction
    const compassDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const compassIndex = Math.round(headingDeg / 45) % 8;
    const headingCompass = compassDirs[compassIndex];

    const panAngleDeg = Math.round((this.panServoAngle * 180) / Math.PI);

    // Motor Current Draw Estimation
    const loadFactor = (Math.abs(this.currentLeftVel) + Math.abs(this.currentRightVel)) / (this.maxLinearSpeed * 2);
    const motorCurrentAmps = Number((0.25 + loadFactor * 1.45).toFixed(2));

    let drivingMode: 'MANUAL TELEOPERATION' | 'AUTONOMOUS OBSTACLE AVOIDANCE' | 'EMERGENCY BRAKE' =
      'MANUAL TELEOPERATION';
    if (this.isAutonomous) {
      drivingMode = 'AUTONOMOUS OBSTACLE AVOIDANCE';
    } else if (this.manualCommand === 'stop' && this.obstacleState === 'CRITICAL_STOP') {
      drivingMode = 'EMERGENCY BRAKE';
    }

    let sonarStatus: 'ACTIVE SCANNING' | 'CLEAR PATH' | 'OBSTACLE DETECTED' = 'CLEAR PATH';
    if (this.obstacleState === 'CRITICAL_STOP') {
      sonarStatus = 'OBSTACLE DETECTED';
    } else if (this.isAutonomous || Math.abs(this.panServoAngle) > 0.05) {
      sonarStatus = 'ACTIVE SCANNING';
    }

    return {
      leftWheelRpm: leftRpm,
      rightWheelRpm: rightRpm,
      leftWheelSpeedMs: Number(this.currentLeftVel.toFixed(2)),
      rightWheelSpeedMs: Number(this.currentRightVel.toFixed(2)),
      linearSpeedMs: Number(linearSpeedMs.toFixed(2)),
      linearSpeedCms,
      angularVelocityRad: Number(angularVelocityRad.toFixed(2)),
      headingDeg,
      headingCompass,
      ultrasonicDistanceCm: this.ultrasonicDistanceCm,
      obstacleState: this.obstacleState,
      detectedObstacleName: this.nearestObstacleName,
      batteryPercent: Number(this.batteryPercent.toFixed(1)),
      batteryVoltage: Number(this.batteryVoltage.toFixed(2)),
      motorCurrentAmps,
      panAngleDeg,
      drivingMode,
      autoState: this.autoState,
      sonarStatus,
    };
  }
}
