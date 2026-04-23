// holoPanels.js — Floating holographic display panels
import * as THREE from 'three';

export class HoloPanels {
    constructor(scene) {
        this.scene = scene;
        this.panels = [];
    }

    generate() {
        const panelConfigs = [
            { x: -15, y: 10, z: -15, rx: 0, ry: 0.3, text: 'TRAFFIC' },
            { x: 15, y: 12, z: -18, rx: 0, ry: -0.4, text: 'STATUS' },
            { x: -20, y: 8, z: 20, rx: 0, ry: 0.8, text: 'ALERTS' },
            { x: 20, y: 14, z: 15, rx: 0, ry: -0.6, text: 'NODES' },
            { x: 0, y: 16, z: -30, rx: 0, ry: 0, text: 'SECURITY' },
            { x: -30, y: 11, z: 0, rx: 0, ry: 1.2, text: 'FIREWALL' },
            { x: 30, y: 9, z: 0, rx: 0, ry: -1.2, text: 'SYSTEM' },
            { x: 0, y: 18, z: 30, rx: 0, ry: Math.PI, text: 'NETWORK' },
        ];

        for (const cfg of panelConfigs) {
            this._createPanel(cfg);
        }
    }

    _createPanel({ x, y, z, rx, ry, text }) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Will be drawn each frame
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const geo = new THREE.PlaneGeometry(4, 2);
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx, ry, 0);
        this.scene.add(mesh);

        // Border glow frame
        const frameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(4.1, 2.1, 0.01));
        const frameMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4 });
        const frame = new THREE.LineSegments(frameGeo, frameMat);
        frame.position.copy(mesh.position);
        frame.rotation.copy(mesh.rotation);
        this.scene.add(frame);

        this.panels.push({
            mesh,
            frame,
            canvas,
            ctx,
            texture,
            text,
            startY: y,
            time: Math.random() * 100,
            lines: this._generateInitialLines(),
        });
    }

    _generateInitialLines() {
        const lines = [];
        for (let i = 0; i < 8; i++) {
            lines.push(this._randomLogLine());
        }
        return lines;
    }

    _randomLogLine() {
        const types = [
            () => `[${this._ts()}] TCP ${this._ip()} > ${this._ip()}:${this._port()}`,
            () => `[${this._ts()}] ALERT: Scan detected from ${this._ip()}`,
            () => `[${this._ts()}] ACK ${this._ip()}:${this._port()} OK`,
            () => `[${this._ts()}] FW RULE ${Math.floor(Math.random() * 50)} APPLIED`,
            () => `[${this._ts()}] NODE ${this._node()} STATUS: ONLINE`,
            () => `[${this._ts()}] SSL HANDSHAKE ${this._ip()} ✓`,
            () => `[${this._ts()}] PACKET LOSS: ${(Math.random() * 2).toFixed(1)}%`,
            () => `[${this._ts()}] AUTH ${this._user()} → ${this._node()}`,
        ];
        return types[Math.floor(Math.random() * types.length)]();
    }

    _ts() { return `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`; }
    _ip() { return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`; }
    _port() { return Math.floor(1000 + Math.random() * 64000); }
    _node() { return `SRV-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`; }
    _user() { return ['admin', 'root', 'sysop', 'netadmin', 'secops'][Math.floor(Math.random() * 5)]; }

    update(dt) {
        for (const panel of this.panels) {
            panel.time += dt;

            // Floating bob
            panel.mesh.position.y = panel.startY + Math.sin(panel.time * 0.5) * 0.3;
            panel.frame.position.y = panel.mesh.position.y;

            // Update canvas every ~0.5s
            if (Math.floor(panel.time * 2) !== Math.floor((panel.time - dt) * 2)) {
                panel.lines.shift();
                panel.lines.push(this._randomLogLine());
                this._drawPanel(panel);
            }
        }
    }

    _drawPanel(panel) {
        const { ctx, canvas, text, lines, texture } = panel;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = 'rgba(0, 10, 20, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`─── ${text} ───`, 20, 28);

        // Separator
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(10, 38);
        ctx.lineTo(canvas.width - 10, 38);
        ctx.stroke();

        // Log lines
        ctx.font = '13px monospace';
        for (let i = 0; i < lines.length; i++) {
            const alpha = 0.4 + (i / lines.length) * 0.6;
            ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
            ctx.fillText(lines[i], 12, 58 + i * 24);
        }

        texture.needsUpdate = true;
    }
}
