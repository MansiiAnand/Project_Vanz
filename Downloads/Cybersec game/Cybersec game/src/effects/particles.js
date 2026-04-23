// particles.js — Floating code fragments and ambient particles
import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.systems = [];
    }

    generate() {
        this._createCodeParticles();
        this._createAmbientDust();
    }

    _createCodeParticles() {
        // Floating code characters rising upward
        const count = 300;
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = Math.random() * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
            velocities.push({
                x: (Math.random() - 0.5) * 0.3,
                y: 0.5 + Math.random() * 1.5,
                z: (Math.random() - 0.5) * 0.3,
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x00f0ff,
            size: 0.25,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);

        this.systems.push({ points, velocities, count, maxY: 45 });
    }

    _createAmbientDust() {
        const count = 200;
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            velocities.push({
                x: (Math.random() - 0.5) * 0.1,
                y: 0.1 + Math.random() * 0.3,
                z: (Math.random() - 0.5) * 0.1,
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xb44aff,
            size: 0.15,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);

        this.systems.push({ points, velocities, count, maxY: 35 });
    }

    update(dt) {
        for (const sys of this.systems) {
            const pos = sys.points.geometry.attributes.position.array;
            for (let i = 0; i < sys.count; i++) {
                pos[i * 3] += sys.velocities[i].x * dt;
                pos[i * 3 + 1] += sys.velocities[i].y * dt;
                pos[i * 3 + 2] += sys.velocities[i].z * dt;

                // Reset when too high
                if (pos[i * 3 + 1] > sys.maxY) {
                    pos[i * 3] = (Math.random() - 0.5) * 120;
                    pos[i * 3 + 1] = 0;
                    pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
                }
            }
            sys.points.geometry.attributes.position.needsUpdate = true;
        }
    }
}
