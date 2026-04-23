// interactable.js — Base interactive object with proximity detection
import * as THREE from 'three';

export class Interactable {
    constructor(scene, { position, type, label, challengeType }) {
        this.scene = scene;
        this.type = type;
        this.label = label;
        this.challengeType = challengeType;
        this.completed = false;
        this.group = new THREE.Group();
        this.group.position.copy(position);

        this._buildByType(type);

        // Proximity glow ring on ground
        const ringGeo = new THREE.RingGeometry(1.5, 1.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.ring.rotation.x = -Math.PI / 2;
        this.ring.position.y = 0.05;
        this.group.add(this.ring);

        // Floating label sprite
        this.labelSprite = this._createLabel(label);
        this.labelSprite.position.y = 3.5;
        this.labelSprite.visible = false;
        this.group.add(this.labelSprite);

        this.time = Math.random() * 100;
        scene.add(this.group);
    }

    _buildByType(type) {
        switch (type) {
            case 'firewall':
                this._buildFirewall();
                break;
            case 'router':
                this._buildRouter();
                break;
            case 'camera':
                this._buildCamera();
                break;
            case 'terminal':
                this._buildTerminal();
                break;
        }
    }

    _buildFirewall() {
        // Shield-like wall structure
        const wallGeo = new THREE.BoxGeometry(2, 3, 0.3);
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x1a0a28,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.8,
        });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.y = 1.5;
        this.group.add(wall);

        // Hex pattern wireframe
        const wireGeo = new THREE.BoxGeometry(2.05, 3.05, 0.35);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xff2d7c,
            wireframe: true,
            transparent: true,
            opacity: 0.5,
        });
        this.glowMesh = new THREE.Mesh(wireGeo, wireMat);
        this.glowMesh.position.y = 1.5;
        this.group.add(this.glowMesh);

        // Top light
        const light = new THREE.PointLight(0xff2d7c, 0.8, 6);
        light.position.y = 3.5;
        this.group.add(light);
        this.mainColor = 0xff2d7c;
    }

    _buildRouter() {
        // Cylindrical hub with extending arms
        const hubGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 8);
        const hubMat = new THREE.MeshStandardMaterial({
            color: 0x0a1a28,
            metalness: 0.7,
            roughness: 0.3,
        });
        const hub = new THREE.Mesh(hubGeo, hubMat);
        hub.position.y = 0.75;
        this.group.add(hub);

        // Signal rings
        for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(0.8 + i * 0.4, 0.03, 8, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x39ff14,
                transparent: true,
                opacity: 0.4 - i * 0.1,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 1.5 + i * 0.3;
            this.group.add(ring);
        }

        this.glowMesh = hub;
        const light = new THREE.PointLight(0x39ff14, 0.6, 5);
        light.position.y = 2.5;
        this.group.add(light);
        this.mainColor = 0x39ff14;
    }

    _buildCamera() {
        // Security camera on a pole
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 6);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 1.5;
        this.group.add(pole);

        // Camera body
        const camGeo = new THREE.BoxGeometry(0.5, 0.3, 0.7);
        const camMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.7,
            roughness: 0.3,
        });
        const cam = new THREE.Mesh(camGeo, camMat);
        cam.position.set(0.3, 3, 0);
        this.group.add(cam);

        // Lens
        const lensGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0xb44aff });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.set(0.65, 3, 0);
        this.group.add(lens);

        this.glowMesh = lens;
        const light = new THREE.PointLight(0xb44aff, 0.5, 4);
        light.position.set(0.7, 3, 0);
        this.group.add(light);
        this.mainColor = 0xb44aff;
    }

    _buildTerminal() {
        // Terminal screen on a stand
        const standGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 6);
        const standMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a1e,
            metalness: 0.8,
            roughness: 0.3,
        });
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.y = 0.4;
        this.group.add(stand);

        // Screen
        const screenGeo = new THREE.BoxGeometry(1.5, 1, 0.08);
        const screenMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.3,
        });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.y = 1.3;
        screen.rotation.x = -0.2;
        this.group.add(screen);

        // Screen border
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.55, 1.05, 0.09));
        const borderMat = new THREE.LineBasicMaterial({ color: 0x00f0ff });
        const border = new THREE.LineSegments(borderGeo, borderMat);
        border.position.y = 1.3;
        border.rotation.x = -0.2;
        this.group.add(border);

        this.glowMesh = screen;
        const light = new THREE.PointLight(0x00f0ff, 0.5, 4);
        light.position.y = 1.5;
        this.group.add(light);
        this.mainColor = 0x00f0ff;
    }

    _createLabel(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.clearRect(0, 0, 256, 64);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(3, 0.75, 1);
        return sprite;
    }

    update(dt, playerPos) {
        this.time += dt;

        const dx = playerPos.x - this.group.position.x;
        const dz = playerPos.z - this.group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        const interactRange = 5;
        const isNear = dist < interactRange;

        // Proximity effects
        this.ring.material.opacity = isNear ? 0.3 + Math.sin(this.time * 3) * 0.1 : 0;
        this.labelSprite.visible = isNear;

        if (isNear) {
            this.labelSprite.position.y = 3.5 + Math.sin(this.time * 2) * 0.2;
        }

        // Completed state
        if (this.completed) {
            this.ring.material.color.set(0x39ff14);
        }

        return isNear && !this.completed;
    }

    get position() {
        return this.group.position;
    }
}
