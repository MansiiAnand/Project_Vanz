// cityGenerator.js — Procedural CyberGrid city
import * as THREE from 'three';

export class CityGenerator {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.buildingPositions = [];
    }

    generate() {
        this._createGround();
        this._createBuildings();
        this._createRoads();
        this._createStreetFurniture();
        this._createGroundProps();
        this._createHoloBillboards();
        this._createOverheadCables();
        this._createSkyElements();

        this._createAmbientLights();
    }

    _createGround() {
        // Grid floor
        const gridSize = 120;
        const gridHelper = new THREE.GridHelper(gridSize, 60, 0x004466, 0x002233);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);

        // Base ground plane with Physical Material (Wet looking)
        const groundGeo = new THREE.PlaneGeometry(gridSize, gridSize);
        const groundMat = new THREE.MeshPhysicalMaterial({
            color: 0x050510,
            metalness: 1.0,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 1.0
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Subtle glow grid lines on ground using additional grids
        const glowGrid = new THREE.GridHelper(gridSize, 30, 0x00f0ff, 0x000000);
        glowGrid.material.transparent = true;
        glowGrid.material.opacity = 0.08;
        glowGrid.position.y = 0.02;
        this.scene.add(glowGrid);
    }

    _createOverheadCables() {
        const cableMat = new THREE.MeshBasicMaterial({ color: 0x001122, transparent: true, opacity: 0.6 });

        for (let i = 0; i < 30; i++) {
            const b1 = this.buildingPositions[Math.floor(Math.random() * this.buildingPositions.length)];
            const b2 = this.buildingPositions[Math.floor(Math.random() * this.buildingPositions.length)];
            if (b1 === b2) continue;

            // Start/End heights
            const h1 = b1.h * 0.8;
            const h2 = b2.h * 0.8;

            const start = new THREE.Vector3(b1.x, h1, b1.z);
            const end = new THREE.Vector3(b2.x, h2, b2.z);

            // Catenary curve (sagging wire) approximation
            const mid = start.clone().lerp(end, 0.5);
            mid.y -= 2 + Math.random() * 3; // Sag

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            const points = curve.getPoints(12);

            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, cableMat);
            this.scene.add(line);
        }
    }

    _createBuildings() {
        // Layout: grid-based city blocks with varying heights
        const blockSize = 12;
        const streetWidth = 5;
        const spacing = blockSize + streetWidth;

        // Building configurations per block
        const configs = [
            // Inner ring - tall server buildings
            { gx: -2, gz: -2, w: 5, d: 5, h: 18, color: 0x0a1628 },
            { gx: -2, gz: -1, w: 4, d: 4, h: 12, color: 0x0d1a30 },
            { gx: -2, gz: 0, w: 5, d: 6, h: 22, color: 0x0a1628 },
            { gx: -2, gz: 1, w: 4, d: 5, h: 15, color: 0x0f1e38 },
            { gx: -2, gz: 2, w: 5, d: 4, h: 10, color: 0x0d1a30 },
            { gx: -1, gz: -2, w: 6, d: 5, h: 25, color: 0x0f1e38 },
            { gx: -1, gz: -1, w: 4, d: 4, h: 8, color: 0x0a1628 },
            { gx: -1, gz: 1, w: 5, d: 5, h: 20, color: 0x0d1a30 },
            { gx: -1, gz: 2, w: 4, d: 6, h: 14, color: 0x0f1e38 },
            { gx: 0, gz: -2, w: 5, d: 4, h: 16, color: 0x0d1a30 },
            { gx: 0, gz: -1, w: 6, d: 5, h: 28, color: 0x0a1628 },
            { gx: 0, gz: 1, w: 5, d: 4, h: 11, color: 0x0f1e38 },
            { gx: 0, gz: 2, w: 4, d: 5, h: 19, color: 0x0a1628 },
            { gx: 1, gz: -2, w: 4, d: 4, h: 13, color: 0x0f1e38 },
            { gx: 1, gz: -1, w: 5, d: 6, h: 24, color: 0x0d1a30 },
            { gx: 1, gz: 1, w: 6, d: 5, h: 17, color: 0x0a1628 },
            { gx: 1, gz: 2, w: 4, d: 4, h: 9, color: 0x0d1a30 },
            { gx: 2, gz: -2, w: 5, d: 5, h: 21, color: 0x0f1e38 },
            { gx: 2, gz: -1, w: 4, d: 4, h: 7, color: 0x0a1628 },
            { gx: 2, gz: 0, w: 5, d: 5, h: 30, color: 0x0d1a30 },
            { gx: 2, gz: 1, w: 6, d: 4, h: 14, color: 0x0f1e38 },
            { gx: 2, gz: 2, w: 5, d: 5, h: 11, color: 0x0a1628 },
        ];

        for (const cfg of configs) {
            const x = cfg.gx * spacing;
            const z = cfg.gz * spacing;
            this._createBuilding(x, z, cfg.w, cfg.d, cfg.h, cfg.color);
        }
    }

    _createBuilding(x, z, w, d, h, baseColor) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Building segments (stacked for detail)
        const segments = Math.floor(h / 8) + 1;
        const segH = h / segments;

        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: baseColor,
            metalness: 0.9,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
        });

        for (let s = 0; s < segments; s++) {
            const sw = w * (1 - s * 0.05);
            const sd = d * (1 - s * 0.05);
            const sy = s * segH;

            const bodyGeo = new THREE.BoxGeometry(sw, segH, sd);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = sy + segH / 2;
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Detail panels / armor on segments
            this._addGreebles(group, sw, sd, segH, sy);
        }

        // Roof Assets
        this._addRooftopDetails(group, w, d, h);

        // Advanced window patterns 
        this._addWindows(group, w, d, h);

        this.scene.add(group);
        this.buildings.push(group);
        this.buildingPositions.push({ x, z, w, d, h });
    }

    _addGreebles(group, w, d, h, yOffset) {
        const greebleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.8, roughness: 0.2 });
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 1.0, roughness: 0.1 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });

        // Vertical Pipes
        const numPipes = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numPipes; i++) {
            const pGeo = new THREE.CylinderGeometry(0.1, 0.1, h, 6);
            const pipe = new THREE.Mesh(pGeo, pipeMat);
            const px = (Math.random() > 0.5 ? 1 : -1) * (w / 2 + 0.1);
            const pz = (Math.random() - 0.5) * d;
            pipe.position.set(px, yOffset + h / 2, pz);
            group.add(pipe);

            // Pipe rings
            const rGeo = new THREE.TorusGeometry(0.12, 0.02, 4, 12);
            for (let r = 0; r < 2; r++) {
                const ring = new THREE.Mesh(rGeo, greebleMat);
                ring.rotation.x = Math.PI / 2;
                ring.position.set(px, yOffset + (r + 1) * (h / 3), pz);
                group.add(ring);
            }
        }

        // Surface Panels
        const numPanels = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numPanels; i++) {
            const pw = 0.5 + Math.random() * 1.5;
            const ph = 0.5 + Math.random() * h;
            const pGeo = new THREE.BoxGeometry(pw, ph, 0.1);
            const panel = new THREE.Mesh(pGeo, greebleMat);

            const side = Math.floor(Math.random() * 4);
            const py = yOffset + (Math.random() * (h - ph)) + ph / 2;
            if (side === 0) panel.position.set((Math.random() - 0.5) * w, py, d / 2 + 0.02);
            else if (side === 1) { panel.position.set((Math.random() - 0.5) * w, py, -d / 2 - 0.02); panel.rotation.y = Math.PI; }
            else if (side === 2) { panel.position.set(w / 2 + 0.02, py, (Math.random() - 0.5) * d); panel.rotation.y = Math.PI / 2; }
            else { panel.position.set(-w / 2 - 0.02, py, (Math.random() - 0.5) * d); panel.rotation.y = -Math.PI / 2; }

            group.add(panel);
        }
    }

    _addRooftopDetails(group, w, d, h) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x111122 });
        // Water tank
        if (Math.random() > 0.5) {
            const siloGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 8);
            const silo = new THREE.Mesh(siloGeo, mat);
            silo.position.set((Math.random() - 0.5) * (w - 2), h + 1, (Math.random() - 0.5) * (d - 2));
            group.add(silo);
        }

        // Vents
        for (let i = 0; i < 2; i++) {
            const vent = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), mat);
            vent.position.set((Math.random() - 0.5) * (w - 1), h + 0.3, (Math.random() - 0.5) * (d - 1));
            group.add(vent);
        }

        // Antennas
        const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 3);
        const ant = new THREE.Mesh(antGeo, mat);
        ant.position.set((Math.random() - 0.5) * (w - 1), h + 1.5, (Math.random() - 0.5) * (d - 1));
        group.add(ant);
    }

    _addWindows(group, w, d, h) {
        const windowColors = [0x00f0ff, 0xb44aff, 0xff2d7c, 0x39ff14];
        const numWindows = Math.floor(h * 0.8);
        for (let i = 0; i < numWindows; i++) {
            if (Math.random() > 0.4) continue;
            const wColor = windowColors[Math.floor(Math.random() * windowColors.length)];
            const winW = 0.3 + Math.random() * 1.5;
            const winGeo = new THREE.PlaneGeometry(winW, 0.3);
            const winMat = new THREE.MeshBasicMaterial({ color: wColor, transparent: true, opacity: 0.5 + Math.random() * 0.5 });

            const win = new THREE.Mesh(winGeo, winMat);
            const side = Math.floor(Math.random() * 4);
            const wy = Math.random() * (h - 1) + 0.5;
            if (side === 0) win.position.set((Math.random() - 0.5) * (w - winW), wy, d / 2 + 0.01);
            else if (side === 1) { win.position.set((Math.random() - 0.5) * (w - winW), wy, -d / 2 - 0.01); win.rotation.y = Math.PI; }
            else if (side === 2) { win.position.set(w / 2 + 0.01, wy, (Math.random() - 0.5) * (d - winW)); win.rotation.y = Math.PI / 2; }
            else { win.position.set(-w / 2 - 0.01, wy, (Math.random() - 0.5) * (d - winW)); win.rotation.y = -Math.PI / 2; }

            group.add(win);
        }
    }

    _createRoads() {
        // Create glowing road strips between building blocks
        const roadMat = new THREE.MeshBasicMaterial({
            color: 0x002244,
            transparent: true,
            opacity: 0.3,
        });

        const roadCenterMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.15,
        });

        // Horizontal roads
        for (let gz = -2; gz <= 2; gz++) {
            const z = gz * 17 - 8.5;
            const roadGeo = new THREE.PlaneGeometry(120, 4);
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.rotation.x = -Math.PI / 2;
            road.position.set(0, 0.03, z);
            this.scene.add(road);

            // Center line
            const lineGeo = new THREE.PlaneGeometry(120, 0.15);
            const line = new THREE.Mesh(lineGeo, roadCenterMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.04, z);
            this.scene.add(line);
        }

        // Vertical roads
        for (let gx = -2; gx <= 2; gx++) {
            const x = gx * 17 - 8.5;
            const roadGeo = new THREE.PlaneGeometry(4, 120);
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.rotation.x = -Math.PI / 2;
            road.position.set(x, 0.03, 0);
            this.scene.add(road);

            const lineGeo = new THREE.PlaneGeometry(0.15, 120);
            const line = new THREE.Mesh(lineGeo, roadCenterMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.04, 0);
            this.scene.add(line);
        }
    }

    _createSkyElements() {
        // Distant holographic ring
        const ringGeo = new THREE.TorusGeometry(50, 0.2, 8, 100);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xb44aff,
            transparent: true,
            opacity: 0.15,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 35;
        this.scene.add(ring);

        // Second ring
        const ring2 = ring.clone();
        ring2.scale.set(0.7, 0.7, 0.7);
        ring2.position.y = 40;
        ring2.material = ringMat.clone();
        ring2.material.color.set(0x00f0ff);
        ring2.material.opacity = 0.08;
        this.scene.add(ring2);
    }

    _createAmbientLights() {
        // Ambient — brighter for realism
        const ambient = new THREE.AmbientLight(0x223355, 0.9);
        this.scene.add(ambient);

        // Hemisphere light for natural sky/ground coloring
        const hemi = new THREE.HemisphereLight(0x334466, 0x0a0a18, 0.5);
        this.scene.add(hemi);

        // Main directional — moonlight
        const dir = new THREE.DirectionalLight(0x6688cc, 0.6);
        dir.position.set(20, 40, 10);
        dir.castShadow = true;
        this.scene.add(dir);

        // Neon point lights at strategic locations
        const neonPositions = [
            { x: 0, y: 3, z: 0, color: 0x00f0ff, intensity: 1.2 },
            { x: -25, y: 5, z: -25, color: 0xb44aff, intensity: 1.0 },
            { x: 25, y: 5, z: 25, color: 0x39ff14, intensity: 1.0 },
            { x: -25, y: 5, z: 25, color: 0xff2d7c, intensity: 0.8 },
            { x: 25, y: 5, z: -25, color: 0x00f0ff, intensity: 0.8 },
            { x: 0, y: 5, z: -35, color: 0xb44aff, intensity: 0.6 },
            { x: 0, y: 5, z: 35, color: 0x39ff14, intensity: 0.6 },
        ];

        for (const p of neonPositions) {
            const light = new THREE.PointLight(p.color, p.intensity, 35);
            light.position.set(p.x, p.y, p.z);
            this.scene.add(light);
        }
    }

    _createStreetFurniture() {
        // Street lamps along roads
        const lampPositions = [];
        for (let gx = -2; gx <= 2; gx++) {
            for (let gz = -2; gz <= 2; gz++) {
                const x = gx * 17 - 8.5;
                const z = gz * 17 - 8.5;
                lampPositions.push({ x: x + 2, z: z + 2 });
                lampPositions.push({ x: x - 2, z: z - 2 });
            }
        }

        for (const pos of lampPositions) {
            this._createStreetLamp(pos.x, pos.z);
        }

        // Sidewalk curbs along roads
        this._createSidewalks();

        // Digital benches at some intersections
        const benchPositions = [
            { x: -8.5, z: -8.5 }, { x: 8.5, z: 8.5 },
            { x: -25.5, z: 8.5 }, { x: 25.5, z: -8.5 },
            { x: 0, z: -25.5 }, { x: 0, z: 25.5 },
        ];
        for (const pos of benchPositions) {
            this._createBench(pos.x + 3, pos.z + 3);
        }
    }

    _createStreetLamp(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.04, 0.06, 4, 6);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8, roughness: 0.2 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2;
        group.add(pole);

        // Lamp head (horizontal arm)
        const armGeo = new THREE.BoxGeometry(0.8, 0.06, 0.06);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(0.4, 4, 0);
        group.add(arm);

        // Light fixture
        const fixtureGeo = new THREE.BoxGeometry(0.4, 0.08, 0.25);
        const fixtureMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });
        const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
        fixture.position.set(0.6, 3.92, 0);
        group.add(fixture);

        // Actual light
        const lampColor = [0x00f0ff, 0xb44aff, 0x39ff14][Math.floor(Math.random() * 3)];
        const light = new THREE.PointLight(lampColor, 0.6, 10);
        light.position.set(0.6, 3.85, 0);
        group.add(light);

        // Base glow ring
        const baseGeo = new THREE.RingGeometry(0.15, 0.3, 16);
        const baseMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.rotation.x = -Math.PI / 2;
        base.position.y = 0.02;
        group.add(base);

        this.scene.add(group);
    }

    _createSidewalks() {
        const sidewalkMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d1e,
            metalness: 0.5,
            roughness: 0.6,
        });

        // Horizontal sidewalks
        for (let gz = -2; gz <= 2; gz++) {
            const z = gz * 17 - 8.5;
            // Top sidewalk
            const geo1 = new THREE.BoxGeometry(120, 0.12, 0.5);
            const sw1 = new THREE.Mesh(geo1, sidewalkMat);
            sw1.position.set(0, 0.06, z + 2.2);
            this.scene.add(sw1);
            // Bottom sidewalk
            const sw2 = sw1.clone();
            sw2.position.z = z - 2.2;
            this.scene.add(sw2);
        }

        // Vertical sidewalks
        for (let gx = -2; gx <= 2; gx++) {
            const x = gx * 17 - 8.5;
            const geo = new THREE.BoxGeometry(0.5, 0.12, 120);
            const sw1 = new THREE.Mesh(geo, sidewalkMat);
            sw1.position.set(x + 2.2, 0.06, 0);
            this.scene.add(sw1);
            const sw2 = sw1.clone();
            sw2.position.x = x - 2.2;
            this.scene.add(sw2);
        }
    }

    _createBench(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        const benchMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.6, roughness: 0.4 });

        // Seat
        const seatGeo = new THREE.BoxGeometry(1.2, 0.06, 0.4);
        const seat = new THREE.Mesh(seatGeo, benchMat);
        seat.position.y = 0.45;
        group.add(seat);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.06, 0.4, 0.06);
        const positions = [[-0.5, 0.2, 0.15], [0.5, 0.2, 0.15], [-0.5, 0.2, -0.15], [0.5, 0.2, -0.15]];
        for (const p of positions) {
            const leg = new THREE.Mesh(legGeo, benchMat);
            leg.position.set(...p);
            group.add(leg);
        }

        // Glow strip on seat edge
        const glowGeo = new THREE.BoxGeometry(1.22, 0.02, 0.42);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.2 });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 0.49;
        group.add(glow);

        this.scene.add(group);
    }

    _createGroundProps() {
        // Add mental plates, grates, and manhole covers
        const plateGeo = new THREE.PlaneGeometry(1.5, 1.5);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.9, roughness: 0.3 });

        for (let i = 0; i < 40; i++) {
            const plate = new THREE.Mesh(plateGeo, plateMat);
            plate.rotation.x = -Math.PI / 2;
            plate.position.set((Math.random() - 0.5) * 100, 0.02, (Math.random() - 0.5) * 100);
            if (this.isInsideBuilding(plate.position.x, plate.position.z, 0)) continue;
            this.scene.add(plate);
        }
    }

    _createHoloBillboards() {
        const billboardGeo = new THREE.PlaneGeometry(4, 6);
        const billboardColors = [0x00f0ff, 0xb44aff, 0xff2d7c];

        for (let i = 0; i < 8; i++) {
            const color = billboardColors[i % billboardColors.length];
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide
            });
            const billboard = new THREE.Mesh(billboardGeo, mat);
            billboard.position.set((Math.random() - 0.5) * 60, 10 + Math.random() * 15, (Math.random() - 0.5) * 60);
            billboard.rotation.y = Math.random() * Math.PI;
            this.scene.add(billboard);

            // Add a glowing wireframe for crispness
            const wire = new THREE.Mesh(billboardGeo, new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.3 }));
            billboard.add(wire);
        }
    }

    // Check if a position is inside a building (for collision)

    isInsideBuilding(x, z, margin = 1) {
        for (const b of this.buildingPositions) {
            if (
                x > b.x - b.w / 2 - margin && x < b.x + b.w / 2 + margin &&
                z > b.z - b.d / 2 - margin && z < b.z + b.d / 2 + margin
            ) {
                return true;
            }
        }
        return false;
    }
}

