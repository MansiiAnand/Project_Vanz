/**
 * Rune Keeper - Level 4: The Watchtower
 * The Sentinel's Eye - Intrusion Detection System (IDS)
 */

class Level4 {
    constructor() {
        this.name = 'The Watchtower';
        this.width = 1024;
        this.height = 768;
        this.objects = [];
        this.walls = [];
        this.player = null;
        this.npcs = [];
        this.hasIntroPlayed = false;
        this.puzzleSolved = false;
        this.gateUnlocked = false;
    }

    init() {
        console.log('[Level4] Initializing The Watchtower...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-4';
        
        // Create the environment
        this.createFloor();
        this.createWalls();
        this.createClouds();
        this.createWindEffect();
        this.createNPCs();
        this.createScryingPool();
        this.createGate();
        this.createPlayer();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('watchtower_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level4] Level initialized');
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor watchtower-floor';
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 50% 100%, rgba(75, 50, 100, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 20% 30%, rgba(100, 80, 150, 0.2) 0%, transparent 40%),
                radial-gradient(ellipse at 80% 20%, rgba(60, 40, 100, 0.3) 0%, transparent 35%),
                linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
        `;
        
        // Add stone balcony texture
        const balconyPattern = document.createElement('div');
        balconyPattern.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 150px;
            background: 
                repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    transparent 98px,
                    rgba(100, 100, 120, 0.15) 98px,
                    rgba(100, 100, 120, 0.15) 100px
                );
            pointer-events: none;
        `;
        floor.appendChild(balconyPattern);
        
        this.container.appendChild(floor);
    }

    createWalls() {
        // Border walls with iron/dark metal look
        const wallConfigs = [
            { x: 0, y: 0, w: 1024, h: 40 },
            { x: 0, y: 728, w: 1024, h: 40 },
            { x: 0, y: 40, w: 40, h: 688 },
            { x: 984, y: 40, w: 40, h: 688 }
        ];
        
        wallConfigs.forEach(config => {
            const wall = document.createElement('div');
            wall.className = 'wall';
            wall.style.cssText = `
                position: absolute;
                left: ${config.x}px;
                top: ${config.y}px;
                width: ${config.w}px;
                height: ${config.h}px;
                background: linear-gradient(180deg, #2a2a3a 0%, #1a1a2e 100%);
                border: 3px solid #3a3a5a;
                box-shadow: 0 0 20px rgba(0, 200, 255, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.5);
            `;
            
            this.container.appendChild(wall);
            this.walls.push({ x: config.x, y: config.y, width: config.w, height: config.h });
        });
    }

    createClouds() {
        // Add drifting clouds in corners
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cloudDrift {
                0% { transform: translateX(0) translateY(0); }
                50% { transform: translateX(30px) translateY(-10px); }
                100% { transform: translateX(0) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        const cloudConfigs = [
            { x: 50, y: 100, delay: '0s', scale: 1 },
            { x: 850, y: 150, delay: '2s', scale: 0.8 },
            { x: 100, y: 500, delay: '4s', scale: 0.6 },
            { x: 900, y: 450, delay: '1s', scale: 0.7 },
        ];
        
        cloudConfigs.forEach((config, i) => {
            const cloud = document.createElement('div');
            cloud.style.cssText = `
                position: absolute;
                left: ${config.x}px;
                top: ${config.y}px;
                width: ${150 * config.scale}px;
                height: ${80 * config.scale}px;
                background: radial-gradient(ellipse, rgba(200, 200, 220, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 5;
                animation: cloudDrift ${8 + i * 2}s ease-in-out infinite;
                animation-delay: ${config.delay};
                filter: blur(3px);
            `;
            
            // Add cloud puffs
            const puff1 = document.createElement('div');
            puff1.style.cssText = `
                position: absolute;
                left: 20%;
                top: -20%;
                width: 40%;
                height: 60%;
                background: radial-gradient(circle, rgba(200, 200, 220, 0.25) 0%, transparent 70%);
                border-radius: 50%;
            `;
            const puff2 = document.createElement('div');
            puff2.style.cssText = `
                position: absolute;
                right: 20%;
                top: -10%;
                width: 35%;
                height: 50%;
                background: radial-gradient(circle, rgba(200, 200, 220, 0.25) 0%, transparent 70%);
                border-radius: 50%;
            `;
            
            cloud.appendChild(puff1);
            cloud.appendChild(puff2);
            this.container.appendChild(cloud);
        });
    }

    createWindEffect() {
        // Add thin white SVG lines that drift horizontally
        const style = document.createElement('style');
        style.textContent = `
            @keyframes windDrift {
                0% { transform: translateX(-200px); opacity: 0; }
                10% { opacity: 0.6; }
                90% { opacity: 0.6; }
                100% { transform: translateX(1200px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Create wind lines
        for (let i = 0; i < 5; i++) {
            const windLine = document.createElement('div');
            const y = 100 + Math.random() * 500;
            const delay = Math.random() * 5;
            const duration = 4 + Math.random() * 3;
            
            windLine.style.cssText = `
                position: absolute;
                left: 0;
                top: ${y}px;
                width: 150px;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                pointer-events: none;
                z-index: 8;
                animation: windDrift ${duration}s linear infinite;
                animation-delay: ${delay}s;
            `;
            
            this.container.appendChild(windLine);
        }
    }

    createNPCs() {
        // Sentinel Jax
        const jax = new SentinelJax(512, 180);
        jax.create(this.container);
        this.npcs.push(jax);
        
        console.log('[Level4] Sentinel Jax placed');
    }

    createScryingPool() {
        // Central scrying pool for the IDS puzzle
        const poolContainer = document.createElement('div');
        poolContainer.className = 'ancient-object scrying-pool';
        poolContainer.style.cssText = `
            position: absolute;
            left: 362px;
            top: 380px;
            width: 300px;
            height: 300px;
            background: transparent;
            border: none;
            cursor: pointer;
        `;

        // Pool base
        const pool = document.createElement('div');
        pool.style.cssText = `
            width: 280px;
            height: 280px;
            border-radius: 50%;
            background: radial-gradient(circle, 
                rgba(0, 200, 255, 0.3) 0%, 
                rgba(0, 150, 200, 0.2) 40%,
                rgba(0, 100, 150, 0.3) 70%,
                rgba(0, 50, 100, 0.5) 100%);
            border: 4px solid rgba(0, 200, 255, 0.5);
            box-shadow: 
                0 0 60px rgba(0, 200, 255, 0.4),
                inset 0 0 40px rgba(0, 200, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        `;
        
        // Pool water shimmer effect
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
            animation: shimmer 4s ease-in-out infinite;
            pointer-events: none;
        `;
        
        const shimmerStyle = document.createElement('style');
        shimmerStyle.textContent = `
            @keyframes shimmer {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(10px, 10px); }
            }
        `;
        document.head.appendChild(shimmerStyle);
        
        pool.appendChild(shimmer);
        poolContainer.appendChild(pool);
        
        poolContainer.dataset.id = 'scrying_pool';
        poolContainer.dataset.type = 'scrying_pool';

        this.container.appendChild(poolContainer);
        this.objects.push({
            element: poolContainer,
            id: 'scrying_pool',
            type: 'scrying_pool',
            x: 362,
            y: 380,
            width: 300,
            height: 300,
            centerX: 512,
            centerY: 530
        });
    }

    createGate() {
        const gateContainer = document.createElement('div');
        gateContainer.className = 'ancient-object gate-container';
        gateContainer.id = 'level-gate';
        gateContainer.style.cssText = `
            position: absolute;
            left: 452px;
            top: 60px;
            width: 120px;
            height: 80px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const gate = document.createElement('div');
        gate.className = 'gate';
        gate.style.cssText = `
            width: 100px;
            height: 70px;
            border: 5px solid #3a3a5a;
            border-bottom: none;
            border-radius: 50px 50px 0 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            transition: all 0.5s ease;
            background: linear-gradient(180deg, rgba(0, 200, 255, 0.1) 0%, transparent 100%);
        `;
        gate.innerHTML = `
            <span style="color: #5a5a7a; font-size: 12px; font-family: serif;">🚪</span>
        `;

        gateContainer.appendChild(gate);
        gateContainer.dataset.id = 'gate_level_5';
        gateContainer.dataset.type = 'gate';

        this.container.appendChild(gateContainer);
        this.objects.push({
            element: gateContainer,
            id: 'gate_level_5',
            type: 'gate',
            x: 452,
            y: 60,
            width: 120,
            height: 80,
            centerX: 512,
            centerY: 100
        });
    }

    createPlayer() {
        const startX = 512;
        const startY = 650;
        
        this.player = new Player(startX, startY);
        this.player.create(this.container);
        
        GameState.setPlayerPosition(startX, startY);
        
        console.log('[Level4] Player created at entrance');
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('watchtower_intro');
        
        DialogueSystem.show(
            'Warden, look! The system logs—the Scrying Pool—is being flooded. Most of these signals are just the wind and the birds, but some... some are jagged. They are probes from the Shadow-Scribe. You must purge the corruption before they find a way in.',
            'Sentinel Jax',
            () => {
                setTimeout(() => {
                    DialogueSystem.show(
                        'Gaze into the pool and watch the flow of data. Click the corrupted runes—the ones that glow red and jitter—before they reach the bottom. Purge 15 to secure the system.',
                        'Sentinel Jax'
                    );
                }, 500);
            }
        );
    }

    openIDSPuzzle() {
        if (this.puzzleSolved) {
            DialogueSystem.show(
                'The Scrying Pool is calm. The corruption has been purged.',
                'Sentinel Jax'
            );
            return;
        }

        // Open the IDS puzzle
        IDSPuzzle.show(() => {
            this.puzzleSolved = true;
            GameState.completePuzzle('ids_cleared');
            GameState.addSecurityScore(200);
            
            this.unlockGate();
            
            setTimeout(() => {
                DialogueSystem.show(
                    'The corruption is purged! The system is secure. Take this Watchman\'s Sigil—you\'ve earned your place as a true sentinel.',
                    'Sentinel Jax'
                );
            }, 500);
        });
    }

    unlockGate() {
        this.gateUnlocked = true;
        const gate = this.container.querySelector('.gate');
        
        if (gate) {
            gate.style.borderColor = 'var(--cyber-teal)';
            gate.style.boxShadow = '0 0 40px rgba(0, 242, 255, 0.6), inset 0 0 30px rgba(0, 242, 255, 0.2)';
            gate.innerHTML = `
                <span style="color: var(--cyber-teal); font-size: 24px; filter: drop-shadow(0 0 10px currentColor);">⇧</span>
            `;
        }
    }

    transitionToLevel5() {
        if (!this.gateUnlocked) {
            DialogueSystem.show(
                'The gate remains sealed. Clear the corruption from the Scrying Pool first.',
                'Sealed Gate'
            );
            return;
        }

        GameState.unlockLevel(5);
        GameState.setLevel(5);
        
        DialogueSystem.show(
            'The Watchman\'s Sigil glows with approval. The path to the Grand Canyon opens...',
            'Gate Keeper',
            () => {
                Engine.transitionToLevel(5);
            }
        );
    }

    onInteract() {
        const nearest = this.getNearestObject();
        
        if (nearest && nearest.distance < 80) {
            this.interactWithObject(nearest.object);
        }
    }

    getNearestObject() {
        let nearest = null;
        let minDistance = Infinity;
        const playerPos = this.player.getPosition();
        
        this.objects.forEach(obj => {
            const objCenterX = obj.centerX || (obj.x + obj.width/2);
            const objCenterY = obj.centerY || (obj.y + obj.height/2);
            const dx = objCenterX - playerPos.x;
            const dy = objCenterY - playerPos.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = obj;
            }
        });
        
        this.npcs.forEach(npc => {
            const dx = npc.x - playerPos.x;
            const dy = npc.y - playerPos.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = {
                    element: npc.element,
                    id: npc.name,
                    type: 'npc',
                    npc: npc,
                    x: npc.x - npc.width/2,
                    y: npc.y - npc.height/2,
                    width: npc.width,
                    height: npc.height,
                    centerX: npc.x,
                    centerY: npc.y
                };
            }
        });
        
        return nearest ? { object: nearest, distance: minDistance } : null;
    }

    interactWithObject(obj) {
        if (DialogueSystem.isDialogueActive()) return;
        
        GameState.isDialogueActive = false;
        const onDialogueClose = () => {
            GameState.isDialogueActive = false;
        };
        
        switch (obj.type) {
            case 'npc':
                const dialogue = obj.npc.getNextDialogue();
                if (dialogue) {
                    DialogueSystem.show(dialogue.text, dialogue.speaker, onDialogueClose);
                }
                break;
            case 'scrying_pool':
                GameState.isDialogueActive = false;
                this.openIDSPuzzle();
                break;
            case 'gate':
                GameState.isDialogueActive = false;
                this.transitionToLevel5();
                break;
        }
    }

    update(deltaTime, keys) {
        if (!this.player) return;
        
        // Update player with collision detection
        if (!DialogueSystem.isDialogueActive() && !IDSPuzzle.isActive()) {
            this.player.update(deltaTime, keys, this.walls);
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
        
        // Update interaction hints
        this.updateInteractionHint();
    }

    updateInteractionHint() {
        const nearest = this.getNearestObject();
        const hint = document.getElementById('inventory-toggle');
        
        if (hint && nearest) {
            if (nearest.distance < 50) {
                hint.classList.add('near-interactive');
                let typeLabel;
                if (nearest.object.type === 'npc') {
                    typeLabel = nearest.object.id;
                } else if (nearest.object.type === 'scrying_pool') {
                    typeLabel = 'Gaze into Pool';
                } else if (nearest.object.type === 'gate') {
                    typeLabel = this.gateUnlocked ? 'Open Gate' : 'Sealed Gate';
                } else {
                    typeLabel = nearest.object.type.replace('_', ' ');
                }
                hint.textContent = `Press 'E' to interact with ${typeLabel}`;
            } else {
                hint.classList.remove('near-interactive');
                hint.textContent = "Press 'E' to Interact";
            }
        }
    }

    cleanup() {
        console.log('[Level4] Cleaning up...');
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Register the level
Engine.registerLevel(4, Level4);
