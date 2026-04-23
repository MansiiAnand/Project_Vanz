// main.js — CyberGrid entry point and game loop
import * as THREE from 'three';
import { Controls } from './controls.js';
import { Player } from './player.js';
import { CityGenerator } from './city/cityGenerator.js';
import { DataStreams } from './city/dataStreams.js';
import { HoloPanels } from './city/holoPanels.js';
import { ParticleSystem } from './effects/particles.js';
import { setupBloom } from './effects/bloomSetup.js';
import { ObjectPlacer } from './objects/objectPlacer.js';
import { ChallengeManager } from './challenges/challengeManager.js';
import { NPCSystem } from './npcSystem.js';
import { TrafficSystem } from './city/trafficSystem.js';


// ─── Globals ───
let scene, camera, renderer, composer;
let controls, player, city, dataStreams, holoPanels, particles, objectPlacer, challengeManager, npcSystem, trafficSystem;

let clock;
let gameStarted = false;
let gamePaused = false;
let startTime = 0;

// ─── DOM refs ───
const canvas = document.getElementById('game-canvas');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const hud = document.getElementById('hud');
const interactPrompt = document.getElementById('interact-prompt');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const missionText = document.getElementById('mission-text');
const hudAlerts = document.getElementById('hud-alerts');
const winScreen = document.getElementById('win-screen');
const winStats = document.getElementById('win-stats');
const restartBtn = document.getElementById('restart-btn');
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas.getContext('2d');

// ─── Init ───
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.012);
    scene.background = new THREE.Color(0x020205);


    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 10, 15);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    // Additional Moon Light / Rim Light for architectural detail
    const moonLight = new THREE.DirectionalLight(0x4444ff, 0.4);
    moonLight.position.set(-20, 30, -10);
    scene.add(moonLight);



    // Bloom
    const bloomResult = setupBloom(renderer, scene, camera);
    composer = bloomResult.composer;

    // Controls (drag-to-orbit, no pointer lock)
    controls = new Controls();
    controls.init(canvas);

    // City
    city = new CityGenerator(scene);
    city.generate();

    // Data streams
    dataStreams = new DataStreams(scene);
    dataStreams.generate();

    // Holo panels
    holoPanels = new HoloPanels(scene);
    holoPanels.generate();

    // Particles
    particles = new ParticleSystem(scene);
    particles.generate();

    // Player
    player = new Player(scene, camera);

    // NPC people
    npcSystem = new NPCSystem(scene);
    npcSystem.generate(20);

    // Traffic System
    trafficSystem = new TrafficSystem(scene);
    trafficSystem.generate(20);


    // Interactive objects
    objectPlacer = new ObjectPlacer(scene);
    objectPlacer.generate();

    // Challenge manager
    challengeManager = new ChallengeManager();
    challengeManager.onComplete = onChallengeComplete;

    // Clock
    clock = new THREE.Clock();

    // Events
    window.addEventListener('resize', onResize);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);

    // Start render loop (game paused until user clicks start)
    animate();
}

function startGame() {
    gameStarted = true;
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    startTime = performance.now();
    showAlert('SYSTEM: Connection established. Secure the CyberGrid network.', 'success');
    showAlert('Drag mouse to orbit camera. WASD to move. E to interact.', '');
}

function restartGame() {
    location.reload();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// ─── Game Loop ───
function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);

    if (gameStarted) {
        gamePaused = challengeManager.active;

        // Update player
        player.update(dt, controls, gamePaused);

        // Update world
        dataStreams.update(dt);
        holoPanels.update(dt);
        particles.update(dt);

        // Update NPCs and Traffic
        npcSystem.update(dt);
        trafficSystem.update(dt);


        // Update interactive objects
        const nearestObj = objectPlacer.update(dt, player.position);

        // Show/hide interact prompt
        if (nearestObj && !gamePaused) {
            interactPrompt.classList.remove('hidden');

            // Check for E press
            if (controls.consumeInteract()) {
                challengeManager.open(nearestObj);
            }
        } else {
            interactPrompt.classList.add('hidden');
            controls.consumeInteract();
        }

        // Update minimap
        drawMinimap();
    }

    // Render with bloom
    composer.render();
}

// ─── HUD Updates ───
function onChallengeComplete() {
    const completed = objectPlacer.completedCount;
    const total = objectPlacer.totalCount;

    progressFill.style.width = `${(completed / total) * 100}%`;
    progressText.textContent = `${completed} / ${total}`;

    showAlert(`NODE SECURED: ${challengeManager.currentObject.label}`, 'success');

    if (completed < total) {
        missionText.textContent = `${total - completed} vulnerable systems remaining`;
    }

    // Win condition
    if (completed >= total) {
        setTimeout(() => {
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
            winStats.textContent = `All ${total} systems secured in ${elapsed} seconds.`;
            winScreen.classList.remove('hidden');
            hud.classList.add('hidden');
        }, 1800);
    }
}

function showAlert(text, type = '') {
    const alert = document.createElement('div');
    alert.className = `hud-alert ${type}`;
    alert.textContent = text;
    hudAlerts.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) alert.parentNode.removeChild(alert);
    }, 4500);
}

// ─── Minimap ───
function drawMinimap() {
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;
    const scale = w / 120;
    const cx = w / 2;
    const cy = h / 2;

    minimapCtx.clearRect(0, 0, w, h);

    // Background
    minimapCtx.fillStyle = 'rgba(5, 5, 20, 0.9)';
    minimapCtx.fillRect(0, 0, w, h);

    // Grid
    minimapCtx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    minimapCtx.lineWidth = 0.5;
    for (let i = 0; i < w; i += 15) {
        minimapCtx.beginPath();
        minimapCtx.moveTo(i, 0);
        minimapCtx.lineTo(i, h);
        minimapCtx.stroke();
        minimapCtx.beginPath();
        minimapCtx.moveTo(0, i);
        minimapCtx.lineTo(w, i);
        minimapCtx.stroke();
    }

    // Buildings
    for (const b of city.buildingPositions) {
        const bx = cx + b.x * scale;
        const bz = cy + b.z * scale;
        const bw = b.w * scale;
        const bd = b.d * scale;
        minimapCtx.fillStyle = 'rgba(0, 100, 140, 0.5)';
        minimapCtx.fillRect(bx - bw / 2, bz - bd / 2, bw, bd);
        minimapCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        minimapCtx.lineWidth = 0.5;
        minimapCtx.strokeRect(bx - bw / 2, bz - bd / 2, bw, bd);
    }

    // Interactive objects
    for (const obj of objectPlacer.objects) {
        const ox = cx + obj.position.x * scale;
        const oz = cy + obj.position.z * scale;
        minimapCtx.beginPath();
        minimapCtx.arc(ox, oz, 3, 0, Math.PI * 2);
        if (obj.completed) {
            minimapCtx.fillStyle = '#39ff14';
        } else {
            minimapCtx.fillStyle = obj.mainColor ? `#${obj.mainColor.toString(16).padStart(6, '0')}` : '#ff2d7c';
        }
        minimapCtx.fill();
    }

    // NPC dots on minimap
    for (const npc of npcSystem.npcs) {
        const nx = cx + npc.group.position.x * scale;
        const nz = cy + npc.group.position.z * scale;
        minimapCtx.beginPath();
        minimapCtx.arc(nx, nz, 1.5, 0, Math.PI * 2);
        minimapCtx.fillStyle = 'rgba(180, 180, 255, 0.4)';
        minimapCtx.fill();
    }

    // Player
    const px = cx + player.position.x * scale;
    const pz = cy + player.position.z * scale;

    // Player direction
    const dirLen = 6;
    const dirX = px + Math.sin(player.yaw) * dirLen;
    const dirZ = pz + Math.cos(player.yaw) * dirLen;
    minimapCtx.strokeStyle = '#00f0ff';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.beginPath();
    minimapCtx.moveTo(px, pz);
    minimapCtx.lineTo(dirX, dirZ);
    minimapCtx.stroke();

    // Player dot
    minimapCtx.beginPath();
    minimapCtx.arc(px, pz, 3, 0, Math.PI * 2);
    minimapCtx.fillStyle = '#00f0ff';
    minimapCtx.fill();
    minimapCtx.strokeStyle = '#ffffff';
    minimapCtx.lineWidth = 1;
    minimapCtx.stroke();
}

// ─── Start ───
init();
