/**
 * Rune Keeper - Level 5: The Grand Canyon
 * The Ghost Bridge - Secure Transmission / MITM Protection
 */

class Level5 {
    constructor() {
        this.name = 'The Grand Canyon';
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
        console.log('[Level5] Initializing The Grand Canyon...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-5';
        
        // Create the environment
        this.createFloor();
        this.createWalls();
        this.createHeatHaze();
        this.createNPCs();
        this.createBridgeAltar();
        this.createGate();
        this.createPlayer();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('canyon_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level5] Level initialized');
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor canyon-floor';
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 50% 100%, rgba(139, 69, 19, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 20% 30%, rgba(160, 82, 45, 0.2) 0%, transparent 40%),
                radial-gradient(ellipse at 80% 60%, rgba(120, 60, 30, 0.3) 0%, transparent 35%),
                linear-gradient(180deg, #cd853f 0%, #d2691e 30%, #8b4513 70%, #5c3317 100%);
        `;
        
        // Add rocky cliff texture
        const cliffPattern = document.createElement('div');
        cliffPattern.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                repeating-linear-gradient(
                    80deg,
                    transparent 0px,
                    transparent 150px,
                    rgba(60, 30, 15, 0.1) 150px,
                    rgba(60, 30, 15, 0.1) 152px
                ),
                repeating-linear-gradient(
                    -80deg,
                    transparent 0px,
                    transparent 200px,
                    rgba(40, 20, 10, 0.08) 200px,
                    rgba(40, 20, 10, 0.08) 202px
                );
            pointer-events: none;
        `;
        floor.appendChild(cliffPattern);
        
        // The pit/canyon in the middle
        const pit = document.createElement('div');
        pit.style.cssText = `
            position: absolute;
            left: 300px;
            top: 200px;
            width: 424px;
            height: 400px;
            background: radial-gradient(ellipse, 
                rgba(40, 20, 10, 0.8) 0%, 
                rgba(30, 15, 8, 0.9) 50%,
                rgba(20, 10, 5, 1) 100%);
            border-radius: 20%;
            pointer-events: none;
            box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.8);
        `;
        floor.appendChild(pit);
        
        this.container.appendChild(floor);
    }

    createWalls() {
        // Border walls with rocky/cliff look
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
                background: linear-gradient(180deg, #8b4513 0%, #654321 100%);
                border: 3px solid #a0522d;
                box-shadow: 0 0 20px rgba(139, 69, 19, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.3);
            `;
            
            this.container.appendChild(wall);
            this.walls.push({ x: config.x, y: config.y, width: config.w, height: config.h });
        });
    }

    createHeatHaze() {
        // Add heat haze effect at the bottom of the pit
        const style = document.createElement('style');
        style.textContent = `
            @keyframes heatShimmer {
                0%, 100% { 
                    transform: translateY(0) scaleY(1);
                    opacity: 0.3;
                }
                50% { 
                    transform: translateY(-10px) scaleY(1.02);
                    opacity: 0.5;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Create multiple heat haze layers
        for (let i = 0; i < 3; i++) {
            const haze = document.createElement('div');
            haze.style.cssText = `
                position: absolute;
                left: ${320 + i * 20}px;
                top: ${350 + i * 30}px;
                width: ${380 - i * 20}px;
                height: 150px;
                background: linear-gradient(180deg, 
                    transparent 0%,
                    rgba(255, 200, 150, 0.1) 30%,
                    rgba(255, 180, 120, 0.2) 50%,
                    transparent 100%);
                pointer-events: none;
                z-index: 5;
                filter: blur(8px);
                animation: heatShimmer ${2 + i * 0.5}s ease-in-out infinite;
                animation-delay: ${i * 0.3}s;
            `;
            
            this.container.appendChild(haze);
        }
    }

    createNPCs() {
        // Caravan Lead
        const caravanLead = new CaravanLead(150, 400);
        caravanLead.create(this.container);
        this.npcs.push(caravanLead);
        
        console.log('[Level5] Caravan Lead placed');
    }

    createBridgeAltar() {
        // Bridge altar for the Ghost Bridge puzzle
        const altarContainer = document.createElement('div');
        altarContainer.className = 'ancient-object bridge-altar';
        altarContainer.style.cssText = `
            position: absolute;
            left: 450px;
            top: 150px;
            width: 124px;
            height: 100px;
            background: transparent;
            border: none;
            cursor: pointer;
        `;

        // Altar base
        const altar = document.createElement('div');
        altar.style.cssText = `
            width: 100px;
            height: 80px;
            background: linear-gradient(180deg, #8b7355 0%, #6b5344 100%);
            border: 3px solid #a08060;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 30px rgba(139, 69, 19, 0.4);
        `;
        
        // Bridge symbol
        const symbol = document.createElement('div');
        symbol.style.cssText = `
            font-size: 36px;
            filter: drop-shadow(0 0 10px rgba(0, 242, 255, 0.5));
        `;
        symbol.textContent = '🌉';
        
        altar.appendChild(symbol);
        altarContainer.appendChild(altar);
        
        altarContainer.dataset.id = 'bridge_altar';
        altarContainer.dataset.type = 'bridge_altar';

        this.container.appendChild(altarContainer);
        this.objects.push({
            element: altarContainer,
            id: 'bridge_altar',
            type: 'bridge_altar',
            x: 450,
            y: 150,
            width: 124,
            height: 100,
            centerX: 512,
            centerY: 200
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
            border: 5px solid #8b4513;
            border-bottom: none;
            border-radius: 50px 50px 0 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            transition: all 0.5s ease;
            background: linear-gradient(180deg, rgba(139, 69, 19, 0.2) 0%, transparent 100%);
        `;
        gate.innerHTML = `
            <span style="color: #8b4513; font-size: 12px; font-family: serif;">🚪</span>
        `;

        gateContainer.appendChild(gate);
        gateContainer.dataset.id = 'gate_level_6';
        gateContainer.dataset.type = 'gate';

        this.container.appendChild(gateContainer);
        this.objects.push({
            element: gateContainer,
            id: 'gate_level_6',
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
        
        console.log('[Level5] Player created at entrance');
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('canyon_intro');
        
        DialogueSystem.show(
            'Warden! The shadows have sabotaged the bridge. It\'s still there, but it\'s \'invisible.\' We tried to cross, but the Shadow-Harpies are watching. If we step on an unshielded tile, they\'ll intercept our cargo! We need a secure route.',
            'Caravan Lead',
            () => {
                setTimeout(() => {
                    DialogueSystem.show(
                        'The bridge tiles have an Encryption Signature - a faint teal shimmer on the safe path. But beware, the shimmer only lasts moments. You must remember the secure route, or look closely for the recurring pulse. Find the path from entrance to exit!',
                        'Caravan Lead'
                    );
                }, 500);
            }
        );
    }

    openBridgePuzzle() {
        if (this.puzzleSolved) {
            DialogueSystem.show(
                'The Ghost Bridge is secure! The path has been revealed and the Shadow-Harpies cannot intercept us.',
                'Caravan Lead'
            );
            return;
        }

        // Open the Ghost Bridge puzzle
        BridgePuzzle.show(() => {
            this.puzzleSolved = true;
            GameState.completePuzzle('bridge_secured');
            GameState.addSecurityScore(250);
            
            this.unlockGate();
            
            setTimeout(() => {
                DialogueSystem.show(
                    'You found the secure path! The bridge is now fully visible and protected. Take this Caravan Compass - it will guide you through any treacherous route.',
                    'Caravan Lead'
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

    transitionToLevel6() {
        if (!this.gateUnlocked) {
            DialogueSystem.show(
                'The gate is sealed. You must first secure the Ghost Bridge across the canyon.',
                'Sealed Gate'
            );
            return;
        }

        GameState.unlockLevel(6);
        GameState.setLevel(6);
        
        DialogueSystem.show(
            'The Caravan Compass points true. The path to the Marketplace opens...',
            'Gate Keeper',
            () => {
                Engine.transitionToLevel(6);
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
            case 'bridge_altar':
                GameState.isDialogueActive = false;
                this.openBridgePuzzle();
                break;
            case 'gate':
                GameState.isDialogueActive = false;
                this.transitionToLevel6();
                break;
        }
    }

    update(deltaTime, keys) {
        if (!this.player) return;
        
        // Update player with collision detection
        if (!DialogueSystem.isDialogueActive() && !BridgePuzzle.isActive()) {
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
                } else if (nearest.object.type === 'bridge_altar') {
                    typeLabel = 'Activate Bridge';
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
        console.log('[Level5] Cleaning up...');
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Register the level
Engine.registerLevel(5, Level5);
