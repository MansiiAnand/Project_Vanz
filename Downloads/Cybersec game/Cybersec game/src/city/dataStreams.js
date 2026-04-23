// dataStreams.js — Animated data streams flowing through the city streets
import * as THREE from 'three';

export class DataStreams {
    constructor(scene) {
        this.scene = scene;
        this.streams = [];
    }

    generate() {
        // Create streams along main roads
        const paths = [
            // Horizontal streams
            { start: [-55, 0.5, -8.5], end: [55, 0.5, -8.5], color: 0x00f0ff },
            { start: [55, 0.5, 8.5], end: [-55, 0.5, 8.5], color: 0x39ff14 },
            { start: [-55, 0.5, -25.5], end: [55, 0.5, -25.5], color: 0xb44aff },
            { start: [55, 0.5, 25.5], end: [-55, 0.5, 25.5], color: 0x00f0ff },
            // Vertical streams
            { start: [-8.5, 0.5, -55], end: [-8.5, 0.5, 55], color: 0x39ff14 },
            { start: [8.5, 0.5, 55], end: [8.5, 0.5, -55], color: 0xb44aff },
            { start: [-25.5, 0.5, -55], end: [-25.5, 0.5, 55], color: 0x00f0ff },
            { start: [25.5, 0.5, 55], end: [25.5, 0.5, -55], color: 0x39ff14 },
        ];

        for (const path of paths) {
            this._createStream(path);
        }
    }

    _createStream({ start, end, color }) {
        const count = 150;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const offsets = new Float32Array(count); // individual time offsets

        const dir = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
        const len = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2);

        for (let i = 0; i < count; i++) {
            const t = Math.random();
            positions[i * 3] = start[0] + dir[0] * t + (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 1] = start[1] + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = start[2] + dir[2] * t + (Math.random() - 0.5) * 1.5;
            sizes[i] = 0.2 + Math.random() * 0.4;
            offsets[i] = t;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            color,
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);

        this.streams.push({
            points,
            start,
            dir: [dir[0] / len, dir[1] / len, dir[2] / len],
            len,
            speed: 5 + Math.random() * 5,
            offsets,
            count,
        });
    }

    update(dt) {
        for (const stream of this.streams) {
            const pos = stream.points.geometry.attributes.position.array;
            for (let i = 0; i < stream.count; i++) {
                stream.offsets[i] += (stream.speed * dt) / stream.len;
                if (stream.offsets[i] > 1) stream.offsets[i] -= 1;

                const t = stream.offsets[i];
                pos[i * 3] = stream.start[0] + (stream.dir[0] * stream.len) * t + (Math.sin(t * 20 + i) * 0.3);
                pos[i * 3 + 2] = stream.start[2] + (stream.dir[2] * stream.len) * t + (Math.cos(t * 20 + i) * 0.3);
            }
            stream.points.geometry.attributes.position.needsUpdate = true;
        }
    }
}
