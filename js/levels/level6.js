/**
 * Rune Keeper - Level 6: The Marketplace
 * The Mirror Masquerade - Social Engineering / Identity Spoofing
 */

class Level6 {
    constructor() {
        this.name = 'The Marketplace';
        this.width = 1024;
        this.height = 768;
        this.objects = [];
        this.walls = [];
        this.player = null;
        this.npcs = [];
        this.hasIntroPlayed = false;
        this.puzzleSolved = false;
        this.gateUnlocked = false;
        this.spokenToMiriA = false;
        this.spokenToMiriB = false;
        this.spokenToMiriC = false;
    }

    init() {
        console.log('[Level6] Initializing The Marketplace...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-6';
        
        // Create the environment
        this.createFloor();
        this.createWalls();
        this.createMarketStalls();
        this.createGlimmerParticles();
        this.createNPCs();
        this.createGate();
        this.createPlayer();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('marketplace_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level6] Level initialized');
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor marketplace-floor';
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 30% 20%, rgba(255, 105, 180, 0.2) 0%, transparent 40%),
                radial-gradient(ellipse at 70% 60%, rgba(255, 215, 0, 0.15) 0%, transparent 35%),
                radial-gradient(ellipse at 50% 80%, rgba(138, 43, 226, 0.2) 0%, transparent 40%),
                linear-gradient(180deg, #fff8dc 0%, #faf0e6 50%, #f5e6d3 100%);
        `;
        
        // Add carpet patterns
        const carpets = [
            { x: 100, y: 200, w: 200, h: 300, color1: '#ff69b4', color2: '#dda0dd' },
            { x: 724, y: 250, w: 200, h: 250, color1: '#ffd700', color2: '#ffa500' },
            { x: 412, y: 500, w: 200, h: 180, color1: '#9370db', color2: '#ba55d3' },
        ];
        
        carpets.forEach(carpet => {
            const rug = document.createElement('div');
            rug.style.cssText = `
                position: absolute;
                left: ${carpet.x}px;
                top: ${carpet.y}px;
                width: ${carpet.w}px;
                height: ${carpet.h}px;
                background: repeating-linear-gradient(
                    45deg,
                    ${carpet.color1} 0px,
                    ${carpet.color1} 20px,
                    ${carpet.color2} 20px,
                    ${carpet.color2} 40px
                );
                border: 3px solid #8b4513;
                border-radius: 5px;
                opacity: 0.7;
                pointer-events: none;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            `;
            floor.appendChild(rug);
        });
        
        this.container.appendChild(floor);
    }

    createWalls() {
        // Border walls with market fence look
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

    createMarketStalls() {
        // Create market stalls with striped awnings
        const stallConfigs = [
            { x: 80, y: 80, color1: '#ff69b4', color2: '#ff1493', items: ['🏺', '📿', '🕯'] },
            { x: 774, y: 100, color1: '#ffd700', color2: '#ff8c00', items: ['⚱', '🔮', '📜'] },
            { x: 150, y: 550, color1: '#9370db', color2: '#8a2be2', items: ['🏺', '💎', '⚖'] },
            { x: 824, y: 520, color1: '#00ced1', color2: '#20b2aa', items: ['📿', '🕯', '🏺'] },
        ];
        
        stallConfigs.forEach((stall, i) => {
            const stallContainer = document.createElement('div');
            stallContainer.style.cssText = `
                position: absolute;
                left: ${stall.x}px;
                top: ${stall.y}px;
                width: 120px;
                height: 140px;
                z-index: 10;
            `;
            
            // Stall base
            const base = document.createElement('div');
            base.style.cssText = `
                position: absolute;
                bottom: 0;
                width: 100%;
                height: 80px;
                background: linear-gradient(180deg, #8b4513 0%, #654321 100%);
                border: 2px solid #a0522d;
            `;
            
            // Awning (striped)
            const awning = document.createElement('div');
            awning.style.cssText = `
                position: absolute;
                top: 0;
                width: 100%;
                height: 50px;
                background: repeating-linear-gradient(
                    90deg,
                    ${stall.color1} 0px,
                    ${stall.color1} 15px,
                    ${stall.color2} 15px,
                    ${stall.color2} 30px
                );
                border: 2px solid #654321;
                border-radius: 5px 5px 0 0;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
            `;
            
            // Items on display
            stall.items.forEach((item, j) => {
                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = `
                    position: absolute;
                    left: ${15 + j * 35}px;
                    bottom: ${20 + Math.random() * 20}px;
                    font-size: 24px;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                `;
                itemDiv.textContent = item;
                base.appendChild(itemDiv);
            });
            
            stallContainer.appendChild(base);
            stallContainer.appendChild(awning);
            this.container.appendChild(stallContainer);
        });
    }

    createGlimmerParticles() {
        // Add animated glimmer particles around stalls
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glimmer {
                0%, 100% { 
                    opacity: 0;
                    transform: scale(0) rotate(0deg);
                }
                50% { 
                    opacity: 1;
                    transform: scale(1) rotate(180deg);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Create glimmer particles near stalls
        const glimmerPositions = [
            { x: 100, y: 100 }, { x: 140, y: 130 }, { x: 180, y: 90 },
            { x: 800, y: 120 }, { x: 840, y: 150 }, { x: 880, y: 110 },
            { x: 170, y: 570 }, { x: 210, y: 600 }, { x: 250, y: 550 },
            { x: 850, y: 540 }, { x: 890, y: 570 }, { x: 930, y: 520 },
        ];
        
        glimmerPositions.forEach((pos, i) => {
            const glimmer = document.createElement('div');
            const size = 4 + Math.random() * 4;
            const delay = Math.random() * 3;
            const duration = 2 + Math.random() * 2;
            
            glimmer.style.cssText = `
                position: absolute;
                left: ${pos.x}px;
                top: ${pos.y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${['#ffd700', '#ff69b4', '#00f2ff', '#ff1493'][i % 4]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 15;
                animation: glimmer ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
                box-shadow: 0 0 10px currentColor;
            `;
            
            // Add sparkle shape (4-point star)
            glimmer.innerHTML = `
                <svg width="100%" height="100%" viewBox="0 0 10 10">
                    <path d="M 5 0 L 6 4 L 10 5 L 6 6 L 5 10 L 4 6 L 0 5 L 4 4 Z" 
                          fill="white" opacity="0.8"/>
                </svg>
            `;
            
            this.container.appendChild(glimmer);
        });
    }

    createNPCs() {
        // Create three Merchant Miris in a triangle formation
        const miriPositions = [
            { x: 350, y: 300 }, // Miri A (The Phisher) - left
            { x: 512, y: 250 }, // Miri B (The Imposter) - center top
            { x: 674, y: 300 }, // Miri C (The Real Miri) - right
        ];
        
        // Miri A - The Phisher
        const miriA = new MerchantMiriA(miriPositions[0].x, miriPositions[0].y);
        miriA.create(this.container);
        this.npcs.push(miriA);
        
        // Miri B - The Imposter
        const miriB = new MerchantMiriB(miriPositions[1].x, miriPositions[1].y);
        miriB.create(this.container);
        this.npcs.push(miriB);
        
        // Miri C - The Real Miri
        const miriC = new MerchantMiriC(miriPositions[2].x, miriPositions[2].y);
        miriC.create(this.container);
        this.npcs.push(miriC);
        
        console.log('[Level6] Three Merchant Miris placed');
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
            border: 5px solid #9370db;
            border-bottom: none;
            border-radius: 50px 50px 0 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            transition: all 0.5s ease;
            background: linear-gradient(180deg, rgba(147, 112, 219, 0.2) 0%, transparent 100%);
        `;
        gate.innerHTML = `
            <span style="color: #9370db; font-size: 12px; font-family: serif;">🚪</span>
        `;

        gateContainer.appendChild(gate);
        gateContainer.dataset.id = 'gate_level_7';
        gateContainer.dataset.type = 'gate';

        this.container.appendChild(gateContainer);
        this.objects.push({
            element: gateContainer,
            id: 'gate_level_7',
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
        
        console.log('[Level6] Player created at entrance');
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('marketplace_intro');
        
        DialogueSystem.show(
            'Warden! I\'m the real Miri!',
            'Merchant Miri (?)',
            () => {
                setTimeout(() => {
                    DialogueSystem.show(
                        'Wait... no, SHE\'S a shape-shifter! I\'m Miri!',
                        'Merchant Miri (?)',
                        () => {
                            setTimeout(() => {
                                DialogueSystem.show(
                                    'Don\'t listen to them! I am the true Merchant Miri! You must figure out which of us is real!',
                                    'Merchant Miri (?)'
                                );
                            }, 500);
                        }
                    );
                }, 500);
            }
        );
    }

    markSpokenTo(npcType) {
        if (npcType === 'MiriA') this.spokenToMiriA = true;
        if (npcType === 'MiriB') this.spokenToMiriB = true;
        if (npcType === 'MiriC') this.spokenToMiriC = true;
        
        // Check if all three have been spoken to
        if (this.spokenToMiriA && this.spokenToMiriB && this.spokenToMiriC) {
            // Update dialogues to show accusation options
            this.npcs.forEach(npc => {
                if (npc.enableAccusation) {
                    npc.enableAccusation();
                }
            });
        }
    }

    verifyRealMiri() {
        // Check if player has Caravan Compass
        const hasCompass = GameState.inventory && GameState.inventory.some(item => 
            item.id === 'caravan_compass' || item.name === 'Caravan Compass'
        );
        
        if (hasCompass) {
            this.puzzleSolved = true;
            GameState.completePuzzle('mirror_masquerade');
            GameState.addSecurityScore(300);
            
            // Remove the fake Miris
            this.npcs.forEach(npc => {
                if (npc.npcType !== 'MiriC') {
                    npc.element.style.transition = 'opacity 1s ease, transform 1s ease';
                    npc.element.style.opacity = '0';
                    npc.element.style.transform = 'scale(0)';
                    setTimeout(() => {
                        if (npc.element && npc.element.parentNode) {
                            npc.element.parentNode.removeChild(npc.element);
                        }
                    }, 1000);
                }
            });
            
            // Keep only the real Miri
            this.npcs = this.npcs.filter(npc => npc.npcType === 'MiriC');
            
            this.unlockGate();
            
            setTimeout(() => {
                DialogueSystem.show(
                    'You saw through our deception! Thank you, Warden. The shape-shifters are gone. Take this Trade Ledger—it contains the cipher keys for all merchant routes.',
                    'Merchant Miri'
                );
                
                // Add Trade Ledger to inventory
                if (typeof GameState !== 'undefined' && GameState.addToInventory) {
                    GameState.addToInventory({
                        id: 'trade_ledger',
                        name: 'Trade Ledger',
                        description: 'Cipher keys for all merchant routes, given by the real Merchant Miri',
                        icon: '📘'
                    });
                }
            }, 1500);
        } else {
            DialogueSystem.show(
                'You claim to be the Warden, but you don\'t have the Caravan Compass! The real Warden would have received it from the Caravan Lead in the Grand Canyon!',
                'Merchant Miri'
            );
        }
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

    transitionToLevel7() {
        if (!this.gateUnlocked) {
            DialogueSystem.show(
                'The gate is sealed. You must first identify the real Merchant Miri among the imposters.',
                'Sealed Gate'
            );
            return;
        }

        GameState.unlockLevel(7);
        GameState.setLevel(7);
        
        DialogueSystem.show(
            'The Trade Ledger glows with merchant seals. The path to the Inner Sanctum opens...',
            'Gate Keeper',
            () => {
                Engine.transitionToLevel(7);
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
                    
                    // Mark as spoken to
                    if (obj.npc.npcType) {
                        this.markSpokenTo(obj.npc.npcType);
                    }
                }
                break;
            case 'gate':
                GameState.isDialogueActive = false;
                this.transitionToLevel7();
                break;
        }
    }

    update(deltaTime, keys) {
        if (!this.player) return;
        
        // Update player with collision detection
        if (!DialogueSystem.isDialogueActive()) {
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
        console.log('[Level6] Cleaning up...');
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Register the level
Engine.registerLevel(6, Level6);
