// objectPlacer.js — Places interactive objects throughout the city
import * as THREE from 'three';
import { Interactable } from './interactable.js';

export class ObjectPlacer {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
    }

    generate() {
        const placements = [
            // Firewalls — along perimeter-ish locations
            { position: new THREE.Vector3(-8.5, 0, -8.5), type: 'firewall', label: 'FIREWALL-A1', challengeType: 'password' },
            { position: new THREE.Vector3(8.5, 0, 8.5), type: 'firewall', label: 'FIREWALL-B2', challengeType: 'password' },
            // Routers — at road intersections
            { position: new THREE.Vector3(-25.5, 0, -8.5), type: 'router', label: 'ROUTER-CORE', challengeType: 'accessControl' },
            { position: new THREE.Vector3(25.5, 0, 8.5), type: 'router', label: 'ROUTER-EDGE', challengeType: 'accessControl' },
            // Security cameras
            { position: new THREE.Vector3(-8.5, 0, 25.5), type: 'camera', label: 'CAM-NORTH', challengeType: 'traffic' },
            { position: new THREE.Vector3(8.5, 0, -25.5), type: 'camera', label: 'CAM-SOUTH', challengeType: 'traffic' },
            // Encrypted terminals
            { position: new THREE.Vector3(-25.5, 0, 25.5), type: 'terminal', label: 'TERMINAL-SRV1', challengeType: 'restore' },
            { position: new THREE.Vector3(25.5, 0, -25.5), type: 'terminal', label: 'TERMINAL-SRV2', challengeType: 'restore' },
        ];

        for (const p of placements) {
            const obj = new Interactable(this.scene, p);
            this.objects.push(obj);
        }
    }

    update(dt, playerPos) {
        let nearestInteractable = null;
        let nearestDist = Infinity;

        for (const obj of this.objects) {
            const isNear = obj.update(dt, playerPos);
            if (isNear) {
                const dx = playerPos.x - obj.position.x;
                const dz = playerPos.z - obj.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestInteractable = obj;
                }
            }
        }

        return nearestInteractable;
    }

    get completedCount() {
        return this.objects.filter(o => o.completed).length;
    }

    get totalCount() {
        return this.objects.length;
    }
}
