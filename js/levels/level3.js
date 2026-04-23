/**
 * Rune Keeper - Level 3: The Sun Temple
 * The Rotating Cipher - Caesar Shift Encryption
 */

class Level3 {
    constructor() {
        this.name = 'The Sun Temple';
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
        console.log('[Level3] Initializing The Sun Temple...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-3';
        
        // Create the environment
        this.createFloor();
        this.createWalls();
        this.createLightRays();
        this.createFloatingDust();
        this.createNPCs();
        this.createPillar();
        this.createGate();
        this.createPlayer();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('sun_temple_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level3] Level initialized');
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor sun-temple-floor';
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 30% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 60%, rgba(255, 215, 0, 0.1) 0%, transparent 40%),
                linear-gradient(180deg, #f5f5f0 0%, #e8e4d9 50%, #d4d0c4 100%);
        `;
        
        // Add marble pattern
        const marblePattern = document.createElement('div');
        marblePattern.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                repeating-linear-gradient(
                    45deg,
                    transparent 0px,
                    transparent 100px,
                    rgba(184, 134, 11, 0.03) 100px,
                    rgba(184, 134, 11, 0.03) 102px
                ),
                repeating-linear-gradient(
                    -45deg,
                    transparent 0px,
                    transparent 150px,
                    rgba(184, 134, 11, 0.02) 150px,
                    rgba(184, 134, 11, 0.02) 152px
                );
            pointer-events: none;
        `;
        floor.appendChild(marblePattern);
        
        this.container.appendChild(floor);
    }

    createWalls() {
        // Border walls with gold trim
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
                background: linear-gradient(180deg, #f8f8f0 0%, #e8e8e0 100%);
                border: 3px solid #d4af37;
                box-shadow: 0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.5);
            `;
            
            this.container.appendChild(wall);
            this.walls.push({ x: config.x, y: config.y, width: config.w, height: config.h });
        });
    }

    createLightRays() {
        // Create slanting light rays from top corners
        const rayConfigs = [
            { x: 0, y: 0, angle: 25, delay: '0s' },
            { x: 100, y: 0, angle: 30, delay: '0.5s' },
            { x: 924, y: 0, angle: -25, delay: '1s' },
            { x: 824, y: 0, angle: -30, delay: '1.5s' },
        ];
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes lightRayShimmer {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);
        
        rayConfigs.forEach((config, i) => {
            const ray = document.createElement('div');
            ray.style.cssText = `
                position: absolute;
                left: ${config.x}px;
                top: ${config.y}px;
                width: 150px;
                height: 600px;
                background: linear-gradient(180deg, 
                    rgba(255, 215, 0, 0.4) 0%, 
                    rgba(255, 215, 0, 0.2) 30%,
                    rgba(255, 215, 0, 0.05) 60%,
                    transparent 100%);
                transform: rotate(${config.angle}deg);
                transform-origin: top center;
                pointer-events: none;
                z-index: 10;
                animation: lightRayShimmer 4s ease-in-out infinite;
                animation-delay: ${config.delay};
                filter: blur(2px);
            `;
            
            this.container.appendChild(ray);
        });
    }

    createFloatingDust() {
        // Add floating dust particles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dustFloat {
                0%, 100% { 
                    transform: translateY(0) translateX(0); 
                    opacity: 0;
                }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                50% { 
                    transform: translateY(-100px) translateX(20px); 
                }
            }
        `;
        document.head.appendChild(style);
        
        // Create 20 dust particles
        for (let i = 0; i < 20; i++) {
            const dust = document.createElement('div');
            const x = Math.random() * 1024;
            const y = Math.random() * 768;
            const delay = Math.random() * 5;
            const duration = 3 + Math.random() * 4;
            
            dust.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${2 + Math.random() * 3}px;
                height: ${2 + Math.random() * 3}px;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 15;
                animation: dustFloat ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
                box-shadow: 0 0 6px rgba(255, 215, 0, 0.8);
            `;
            
            this.container.appendChild(dust);
        }
    }

    createNPCs() {
        // High Priest
        const priest = new HighPriest(512, 180);
        priest.create(this.container);
        this.npcs.push(priest);
        
        console.log('[Level3] High Priest placed');
    }

    createPillar() {
        // Central rotating pillar for the cipher puzzle
        const pillarContainer = document.createElement('div');
        pillarContainer.className = 'ancient-object cipher-pillar';
        pillarContainer.style.cssText = `
            position: absolute;
            left: 412px;
            top: 350px;
            width: 200px;
            height: 280px;
            background: transparent;
            border: none;
            cursor: pointer;
        `;

        // Pillar base
        const pillar = document.createElement('div');
        pillar.style.cssText = `
            width: 180px;
            height: 260px;
            background: linear-gradient(180deg, #f5f5f0 0%, #e8e4d9 50%, #d4d0c4 100%);
            border: 4px solid #d4af37;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 0 40px rgba(255, 215, 0, 0.4),
                inset 0 0 30px rgba(255, 255, 255, 0.5);
            position: relative;
            overflow: hidden;
        `;
        
        // Gold decorative bands
        const band1 = document.createElement('div');
        band1.style.cssText = `
            position: absolute;
            top: 33%;
            width: 100%;
            height: 8px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
        `;
        
        const band2 = document.createElement('div');
        band2.style.cssText = `
            position: absolute;
            top: 66%;
            width: 100%;
            height: 8px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
        `;
        
        // Sun symbol on top
        const sunSymbol = document.createElement('div');
        sunSymbol.style.cssText = `
            font-size: 48px;
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
            margin-bottom: 10px;
        `;
        sunSymbol.textContent = '☀';
        
        pillar.appendChild(sunSymbol);
        pillar.appendChild(band1);
        pillar.appendChild(band2);
        pillarContainer.appendChild(pillar);
        
        pillarContainer.dataset.id = 'cipher_pillar';
        pillarContainer.dataset.type = 'cipher_pillar';

        this.container.appendChild(pillarContainer);
        this.objects.push({
            element: pillarContainer,
            id: 'cipher_pillar',
            type: 'cipher_pillar',
            x: 412,
            y: 350,
            width: 200,
            height: 280,
            centerX: 512,
            centerY: 490
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
            border: 5px solid #d4af37;
            border-bottom: none;
            border-radius: 50px 50px 0 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
            transition: all 0.5s ease;
            background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
        `;
        gate.innerHTML = `
            <span style="color: #d4af37; font-size: 12px; font-family: serif;">🚪</span>
        `;

        gateContainer.appendChild(gate);
        gateContainer.dataset.id = 'gate_level_4';
        gateContainer.dataset.type = 'gate';

        this.container.appendChild(gateContainer);
        this.objects.push({
            element: gateContainer,
            id: 'gate_level_4',
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
        
        console.log('[Level3] Player created at entrance');
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('sun_temple_intro');
        
        DialogueSystem.show(
            'The sacred prayers are being intercepted by the Shadow-Scribe. We must scramble the runes so only those with the Sun-Key can read them. Our ancestors used the Rotating Pillars to hide the truth.',
            'High Priest',
            () => {
                setTimeout(() => {
                    DialogueSystem.show(
                        'Approach the central pillar and align the rings according to the Sun-Key. When the light shines through, the encryption is broken.',
                        'High Priest'
                    );
                }, 500);
            }
        );
    }

    openCipherPuzzle() {
        if (this.puzzleSolved) {
            DialogueSystem.show(
                'The pillar already shines with the light of truth. The encryption has been broken.',
                'High Priest'
            );
            return;
        }

        // Open the rotating cipher puzzle
        CipherPuzzle.show(() => {
            this.puzzleSolved = true;
            GameState.completePuzzle('cipher_solved');
            GameState.addSecurityScore(150);
            
            this.unlockGate();
            
            setTimeout(() => {
                DialogueSystem.show(
                    'The light shines true! You have unlocked the ancient wisdom. Take this Solar Crystal and proceed to the Watchtower.',
                    'High Priest'
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

    transitionToLevel4() {
        if (!this.gateUnlocked) {
            DialogueSystem.show(
                'The gate remains sealed. You must first unlock the secrets of the Rotating Pillar.',
                'Sealed Gate'
            );
            return;
        }

        GameState.unlockLevel(4);
        GameState.setLevel(4);
        
        DialogueSystem.show(
            'The Solar Crystal pulses with light. The gate to the Watchtower opens...',
            'Gate Keeper',
            () => {
                Engine.transitionToLevel(4);
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
            case 'cipher_pillar':
                GameState.isDialogueActive = false;
                this.openCipherPuzzle();
                break;
            case 'gate':
                GameState.isDialogueActive = false;
                this.transitionToLevel4();
                break;
        }
    }

    update(deltaTime, keys) {
        if (!this.player) return;
        
        // Update player with collision detection
        if (!DialogueSystem.isDialogueActive() && !CipherPuzzle.isActive()) {
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
                } else if (nearest.object.type === 'cipher_pillar') {
                    typeLabel = 'Examine Pillar';
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
        console.log('[Level3] Cleaning up...');
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Register the level
Engine.registerLevel(3, Level3);
