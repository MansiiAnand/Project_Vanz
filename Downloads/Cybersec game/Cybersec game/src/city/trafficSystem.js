import * as THREE from 'three';

export class TrafficSystem {
    constructor(scene) {
        this.scene = scene;
        this.vehicles = [];
        this.roadPositions = this._getRoadPositions();
        this.vehicleColors = [0x00f0ff, 0xb44aff, 0xff2d7c, 0x39ff14];
    }

    _getRoadPositions() {
        // Aligned with CityGenerator roads
        const positions = [];
        for (let g = -2; g <= 2; g++) {
            positions.push(g * 17 - 8.5);
        }
        return positions;
    }

    generate(count = 15) {
        for (let i = 0; i < count; i++) {
            this._createVehicle();
        }
    }

    _createVehicle() {
        const group = new THREE.Group();
        const color = this.vehicleColors[Math.floor(Math.random() * this.vehicleColors.length)];

        // Hull body
        const hullGeo = new THREE.BoxGeometry(0.8, 0.4, 1.8);
        const hullMat = new THREE.MeshStandardMaterial({
            color: 0x111122,
            metalness: 0.9,
            roughness: 0.2
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.castShadow = true;
        group.add(hull);

        // Cockpit/Windows
        const cockpitGeo = new THREE.BoxGeometry(0.7, 0.25, 0.8);
        const cockpitMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.set(0, 0.25, 0.2);
        group.add(cockpit);

        // Underglow
        const glowGeo = new THREE.PlaneGeometry(0.7, 1.6);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.rotation.x = Math.PI / 2;
        glow.position.y = -0.22;
        group.add(glow);

        // Headlights
        const lightGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const l1 = new THREE.Mesh(lightGeo, lightMat);
        l1.position.set(-0.25, -0.05, 0.9);
        group.add(l1);
        const l2 = l1.clone();
        l2.position.x = 0.25;
        group.add(l2);

        // Tail lights (red)
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const t1 = new THREE.Mesh(lightGeo, tailMat);
        t1.position.set(-0.25, -0.05, -0.9);
        group.add(t1);
        const t2 = t1.clone();
        t2.position.x = 0.25;
        group.add(t2);

        // Random road and orientation
        const isHorizontal = Math.random() > 0.5;
        const roadCoord = this.roadPositions[Math.floor(Math.random() * this.roadPositions.length)];
        const startPos = (Math.random() - 0.5) * 120;
        const direction = Math.random() > 0.5 ? 1 : -1;

        if (isHorizontal) {
            group.position.set(startPos, 0.8, roadCoord + (Math.random() > 0.5 ? 1 : -1));
            group.rotation.y = direction === 1 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            group.position.set(roadCoord + (Math.random() > 0.5 ? 1 : -1), 0.8, startPos);
            group.rotation.y = direction === 1 ? 0 : Math.PI;
        }

        this.scene.add(group);
        this.vehicles.push({
            group,
            speed: 15 + Math.random() * 10,
            isHorizontal,
            direction
        });
    }

    update(dt) {
        const bound = 60;
        for (const v of this.vehicles) {
            if (v.isHorizontal) {
                v.group.position.x += v.speed * v.direction * dt;
                if (Math.abs(v.group.position.x) > bound) {
                    v.group.position.x = -bound * v.direction;
                }
            } else {
                v.group.position.z += v.speed * v.direction * dt;
                if (Math.abs(v.group.position.z) > bound) {
                    v.group.position.z = -bound * v.direction;
                }
            }

            // Hover bobbing
            v.group.position.y = 0.8 + Math.sin(performance.now() * 0.005 + v.group.id) * 0.1;
        }
    }
}
