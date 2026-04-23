// npcSystem.js — Walking NPC people in the CyberGrid city
import * as THREE from 'three';

const NPC_COLORS = [
    { body: 0x2a1a3e, glow: 0xb44aff },
    { body: 0x1a2a3e, glow: 0x00f0ff },
    { body: 0x1a3a2a, glow: 0x39ff14 },
    { body: 0x3a1a2a, glow: 0xff2d7c },
    { body: 0x2a2a1a, glow: 0xff6a00 },
    { body: 0x1a1a3a, glow: 0x6a8fff },
];

const SKIN_TONES = [0xc4a882, 0xb08968, 0xd4a574, 0x8d6e53, 0xe0c4a8, 0xa0785a];

export class NPCSystem {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
    }

    generate(count = 20) {
        for (let i = 0; i < count; i++) {
            this._createNPC(i);
        }
    }

    _createNPC(index) {
        const group = new THREE.Group();
        const palette = NPC_COLORS[index % NPC_COLORS.length];
        const skinTone = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];

        // Humanoid variety
        const hScale = 0.9 + Math.random() * 0.2;
        const wScale = 0.8 + Math.random() * 0.4;

        // Shared Physical Material
        const armorMat = new THREE.MeshPhysicalMaterial({
            color: palette.body,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0
        });

        // Torso - Multi-part armor
        const torsoGroup = new THREE.Group();
        const torsoH = 0.7 * hScale;
        const torsoW = 0.55 * wScale;

        // Lower torso / belt
        const beltGeo = new THREE.BoxGeometry(torsoW * 1.1, 0.15, 0.35);
        const belt = new THREE.Mesh(beltGeo, armorMat);
        belt.position.y = 0.7 + 0.1;
        torsoGroup.add(belt);

        // Chest Plate
        const chestGeo = new THREE.BoxGeometry(torsoW, torsoH * 0.6, 0.35);
        const chest = new THREE.Mesh(chestGeo, armorMat);
        chest.position.y = 0.7 + 0.5 * hScale;
        torsoGroup.add(chest);

        // Core / Abdomen (Inset)
        const coreGeo = new THREE.BoxGeometry(torsoW * 0.8, torsoH * 0.3, 0.25);
        const core = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({ color: 0x111122 }));
        core.position.y = 0.7 + 0.3 * hScale;
        torsoGroup.add(core);

        group.add(torsoGroup);

        // Shoulder Guards
        const guardGeo = new THREE.BoxGeometry(0.25 * wScale, 0.15, 0.38);
        const lGuard = new THREE.Mesh(guardGeo, armorMat);
        lGuard.position.set(-torsoW * 0.6, chest.position.y + 0.1, 0);
        torsoGroup.add(lGuard);
        const rGuard = lGuard.clone();
        rGuard.position.x = torsoW * 0.6;
        torsoGroup.add(rGuard);

        // Chest glow strip
        const stripMat = new THREE.MeshBasicMaterial({ color: palette.glow, transparent: true, opacity: 0.6 });
        const strip = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 0.6, 0.04, 0.36), stripMat);
        strip.position.y = chest.position.y + 0.1;
        torsoGroup.add(strip);

        // Head
        const headGroup = new THREE.Group();
        const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const headMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.8 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = chest.position.y + (torsoH * 0.4) + 0.25;
        headGroup.add(head);

        // Visor / Accessories
        if (Math.random() > 0.4) {
            const visorGeo = new THREE.BoxGeometry(0.32, 0.08, 0.15);
            const visor = new THREE.Mesh(visorGeo, stripMat);
            visor.position.set(0, head.position.y + 0.05, 0.1);
            headGroup.add(visor);
        }
        group.add(headGroup);

        // Arms (Sleeker)
        const armGeo = new THREE.BoxGeometry(0.14, 0.6 * hScale, 0.14);
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-torsoW * 0.7, chest.position.y + 0.1, 0);
        const leftArm = new THREE.Mesh(armGeo, armorMat);
        leftArm.position.y = -0.25 * hScale;
        leftArmPivot.add(leftArm);
        group.add(leftArmPivot);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(torsoW * 0.7, chest.position.y + 0.1, 0);
        const rightArm = new THREE.Mesh(armGeo, armorMat);
        rightArm.position.y = -0.25 * hScale;
        rightArmPivot.add(rightArm);
        group.add(rightArmPivot);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.18, 0.75, 0.18);
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.18 * wScale, 0.75, 0);
        const leftLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x050510, metalness: 0.8 }));
        leftLeg.position.y = -0.35;
        leftLegPivot.add(leftLeg);
        group.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.18 * wScale, 0.75, 0);
        const rightLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x050510, metalness: 0.8 }));
        rightLeg.position.y = -0.35;
        rightLegPivot.add(rightLeg);
        group.add(rightLegPivot);

        // Shoe glow
        const shoeGeo = new THREE.BoxGeometry(0.18, 0.03, 0.2);
        const shoeMat = new THREE.MeshBasicMaterial({ color: palette.glow, transparent: true, opacity: 0.3 });
        const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
        leftShoe.position.y = -0.53;
        leftLegPivot.add(leftShoe);
        const rightShoe = new THREE.Mesh(shoeGeo, shoeMat.clone());
        rightShoe.position.y = -0.53;
        rightLegPivot.add(rightShoe);

        // Spawn at a random road position
        const roadPositions = this._getRoadPositions();
        const startPos = roadPositions[Math.floor(Math.random() * roadPositions.length)];
        group.position.set(
            startPos.x + (Math.random() - 0.5) * 3,
            0,
            startPos.z + (Math.random() - 0.5) * 3,
        );

        // Pick a random walk direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2.5;

        group.rotation.y = angle;
        this.scene.add(group);

        this.npcs.push({
            group,
            leftArmPivot,
            rightArmPivot,
            leftLegPivot,
            rightLegPivot,
            speed,
            walkTime: Math.random() * 100,
            direction: angle,
            turnTimer: 3 + Math.random() * 8,
            pauseTimer: 0,
            isPaused: false,
        });
    }

    _getRoadPositions() {
        // Road intersection positions
        const positions = [];
        for (let gx = -2; gx <= 2; gx++) {
            for (let gz = -2; gz <= 2; gz++) {
                positions.push({ x: gx * 17 - 8.5, z: gz * 17 - 8.5 });
                positions.push({ x: gx * 17, z: gz * 17 - 8.5 });
                positions.push({ x: gx * 17 - 8.5, z: gz * 17 });
            }
        }
        return positions;
    }

    update(dt) {
        for (const npc of this.npcs) {
            npc.walkTime += dt * 8;

            // Pause behavior
            if (npc.isPaused) {
                npc.pauseTimer -= dt;
                if (npc.pauseTimer <= 0) {
                    npc.isPaused = false;
                    npc.direction = Math.random() * Math.PI * 2;
                    npc.turnTimer = 3 + Math.random() * 8;
                }
                // Idle animation
                npc.leftArmPivot.rotation.x = 0;
                npc.rightArmPivot.rotation.x = 0;
                npc.leftLegPivot.rotation.x = 0;
                npc.rightLegPivot.rotation.x = 0;
                continue;
            }

            // Turn timer — occasionally change direction or pause
            npc.turnTimer -= dt;
            if (npc.turnTimer <= 0) {
                if (Math.random() < 0.3) {
                    // Pause for a bit
                    npc.isPaused = true;
                    npc.pauseTimer = 1 + Math.random() * 3;
                    continue;
                }
                npc.direction += (Math.random() - 0.5) * Math.PI;
                npc.turnTimer = 3 + Math.random() * 8;
            }

            // Move
            const dx = Math.sin(npc.direction) * npc.speed * dt;
            const dz = Math.cos(npc.direction) * npc.speed * dt;
            npc.group.position.x += dx;
            npc.group.position.z += dz;

            // Smooth face direction
            let targetY = npc.direction;
            let diff = targetY - npc.group.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            npc.group.rotation.y += diff * 0.08;

            // Boundary bounce
            const bound = 52;
            if (Math.abs(npc.group.position.x) > bound || Math.abs(npc.group.position.z) > bound) {
                npc.direction += Math.PI;
                npc.group.position.x = Math.max(-bound, Math.min(bound, npc.group.position.x));
                npc.group.position.z = Math.max(-bound, Math.min(bound, npc.group.position.z));
            }

            // Walk animation
            const swing = Math.sin(npc.walkTime) * 0.5;
            npc.leftArmPivot.rotation.x = swing;
            npc.rightArmPivot.rotation.x = -swing;
            npc.leftLegPivot.rotation.x = -swing * 0.7;
            npc.rightLegPivot.rotation.x = swing * 0.7;
        }
    }
}
