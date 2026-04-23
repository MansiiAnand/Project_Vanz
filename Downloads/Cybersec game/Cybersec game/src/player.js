// player.js — Cyber investigator character with third-person camera (drag orbit)
import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.speed = 8;
        this.sprintMultiplier = 1.6;
        this.group = new THREE.Group();
        this.yaw = 0;      // horizontal camera orbit
        this.pitch = 0.35;  // vertical camera angle
        this.camDist = 7;   // camera distance
        this.bobTime = 0;
        this.isMoving = false;
        this._buildCharacter();
        this.group.position.set(0, 0, 0);
        scene.add(this.group);
    }

    _buildCharacter() {
        const armorMat = new THREE.MeshPhysicalMaterial({
            color: 0x1c1c2e,
            metalness: 0.9,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        // --- TORSO ---
        const torsoGroup = new THREE.Group();

        // Chest Plate
        const chestGeo = new THREE.BoxGeometry(0.7, 0.6, 0.45);
        this.body = new THREE.Mesh(chestGeo, armorMat);
        this.body.position.y = 1.35;
        this.body.castShadow = true;
        torsoGroup.add(this.body);

        // Abdomen / Core
        const coreGeo = new THREE.BoxGeometry(0.55, 0.35, 0.35);
        const core = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a1a }));
        core.position.y = 1.05;
        torsoGroup.add(core);

        // Shoulder Guards
        const guardGeo = new THREE.BoxGeometry(0.3, 0.18, 0.5);
        const lGuard = new THREE.Mesh(guardGeo, armorMat);
        lGuard.position.set(-0.5, 1.5, 0);
        torsoGroup.add(lGuard);
        const rGuard = lGuard.clone();
        rGuard.position.x = 0.5;
        torsoGroup.add(rGuard);

        this.group.add(torsoGroup);

        // Chest circuitry glow overlay
        const circuitMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        this.circuitMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.47), circuitMat);
        this.circuitMesh.position.y = 1.35;
        this.group.add(this.circuitMesh);

        // --- HEAD ---
        const headGroup = new THREE.Group();
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.8 });
        this.head = new THREE.Mesh(headGeo, headMat);
        this.head.position.y = 1.95;
        headGroup.add(this.head);

        // Advanced Visor
        const visorGeo = new THREE.BoxGeometry(0.44, 0.1, 0.15);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 });
        this.visorMesh = new THREE.Mesh(visorGeo, visorMat);
        this.visorMesh.position.set(0, 1.98, 0.22);
        headGroup.add(this.visorMesh);

        // Visor Side Pods
        const podGeo = new THREE.BoxGeometry(0.1, 0.15, 0.2);
        const lPod = new THREE.Mesh(podGeo, armorMat);
        lPod.position.set(-0.25, 1.98, 0.1);
        headGroup.add(lPod);
        const rPod = lPod.clone();
        rPod.position.x = 0.25;
        headGroup.add(rPod);

        this.group.add(headGroup);

        // --- ARMS ---
        const armGeo = new THREE.BoxGeometry(0.18, 0.75, 0.18);
        this.leftArmPivot = new THREE.Group();
        this.leftArmPivot.position.set(-0.55, 1.5, 0);
        const leftArmMesh = new THREE.Mesh(armGeo, armorMat);
        leftArmMesh.position.y = -0.3;
        this.leftArmPivot.add(leftArmMesh);
        this.group.add(this.leftArmPivot);

        this.rightArmPivot = new THREE.Group();
        this.rightArmPivot.position.set(0.55, 1.5, 0);
        const rightArmMesh = new THREE.Mesh(armGeo, armorMat);
        rightArmMesh.position.y = -0.3;
        this.rightArmPivot.add(rightArmMesh);
        this.group.add(this.rightArmPivot);

        // --- LEGS ---
        const legGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        this.leftLegPivot = new THREE.Group();
        this.leftLegPivot.position.set(-0.2, 0.8, 0);
        const leftLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.7 }));
        leftLeg.position.y = -0.35;
        this.leftLegPivot.add(leftLeg);
        this.group.add(this.leftLegPivot);

        this.rightLegPivot = new THREE.Group();
        this.rightLegPivot.position.set(0.2, 0.8, 0);
        const rightLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.7 }));
        rightLeg.position.y = -0.35;
        this.rightLegPivot.add(rightLeg);
        this.group.add(this.rightLegPivot);
    }

    update(dt, controls, paused) {
        if (paused) {
            this._updateCamera();
            return;
        }

        // Mouse orbit — only when dragging
        const mouse = controls.consumeMouse();
        this.yaw -= mouse.dx * 0.004;
        this.pitch = Math.max(0.05, Math.min(1.2, this.pitch + mouse.dy * 0.004));

        // Movement
        const move = controls.moveDir;
        this.isMoving = (move.x !== 0 || move.z !== 0);

        if (this.isMoving) {
            const spd = this.speed * (controls.keys.shift ? this.sprintMultiplier : 1) * dt;

            // Calculate movement relative to camera orientation
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

            // move.z is -1 for W, +1 for S. move.x is -1 for A, +1 for D.
            const moveDir = new THREE.Vector3();
            moveDir.addScaledVector(forward, -move.z);
            moveDir.addScaledVector(right, move.x);

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize();
                this.group.position.addScaledVector(moveDir, spd);

                // Face movement direction (smooth rotation)
                const targetAngle = Math.atan2(moveDir.x, moveDir.z);
                let diff = targetAngle - this.group.rotation.y;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                this.group.rotation.y += diff * 0.12;
            }
        }

        // Boundary clamp
        const bound = 55;
        this.group.position.x = Math.max(-bound, Math.min(bound, this.group.position.x));
        this.group.position.z = Math.max(-bound, Math.min(bound, this.group.position.z));

        // Walk animation
        if (this.isMoving) {
            this.bobTime += dt * (controls.keys.shift ? 14 : 10);
            const bob = Math.sin(this.bobTime) * 0.04;
            this.body.position.y = 1.15 + bob;
            this.head.position.y = 1.85 + bob;

            // Arm swing from pivots
            this.leftArmPivot.rotation.x = Math.sin(this.bobTime) * 0.5;
            this.rightArmPivot.rotation.x = -Math.sin(this.bobTime) * 0.5;
            // Leg swing from pivots
            this.leftLegPivot.rotation.x = -Math.sin(this.bobTime) * 0.6;
            this.rightLegPivot.rotation.x = Math.sin(this.bobTime) * 0.6;
        } else {
            // Idle breathing
            this.bobTime += dt * 2;
            const breath = Math.sin(this.bobTime) * 0.012;
            this.body.position.y = 1.15 + breath;
            this.leftArmPivot.rotation.x = 0;
            this.rightArmPivot.rotation.x = 0;
            this.leftLegPivot.rotation.x = 0;
            this.rightLegPivot.rotation.x = 0;
        }

        // Glow pulse
        this.circuitMesh.material.opacity = 0.2 + Math.sin(this.bobTime * 0.5) * 0.1;
        this.visorMesh.material.opacity = 0.65 + Math.sin(this.bobTime * 0.7) * 0.15;

        this._updateCamera();
    }

    _updateCamera() {
        // Smooth third-person camera following the character
        const targetX = this.group.position.x - Math.sin(this.yaw) * Math.cos(this.pitch) * this.camDist;
        const targetY = this.group.position.y + 2.5 + Math.sin(this.pitch) * this.camDist;
        const targetZ = this.group.position.z - Math.cos(this.yaw) * Math.cos(this.pitch) * this.camDist;

        // Smooth camera follow (lerp)
        this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;

        this.camera.lookAt(
            this.group.position.x,
            this.group.position.y + 1.5,
            this.group.position.z
        );
    }

    get position() {
        return this.group.position;
    }
}
