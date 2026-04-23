/**
 * Rune Keeper - Level 7: The Inner Sanctum
 * The Dual Seal - Multi-Factor Authentication (MFA)
 */

class Level7 {
    constructor() {
        this.name = 'The Inner Sanctum';
        this.width = 1024;
        this.height = 768;
        this.objects = [];
        this.walls = [];
        this.player = null;
        this.npcs = [];
        this.hasIntroPlayed = false;
        this.puzzleSolved = false;
        this.gateUnlocked = false;
        
        // MFA State
        this.pedestalStates = {
            possession: false,
            knowledge: false,
            action: false
        };
        this.mfaStartTime = null;
        this.mfaTimeout = 20000; // 20 seconds
        this.mfaTimerInterval = null;
    }

    init() {
        console.log('[Level7] Initializing The Inner Sanctum...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-7';
        
        // Add floating animation styles
        this.addFloatingStyles();
        
        // Create the environment
        this.createFloor();
        this.createWalls();
        this.createCircuitryLines();
        this.createNPCs();
        this.createPedestals();
        this.createGreatDoor();
        this.createGate();
        this.createPlayer();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('sanctum_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level7] Level initialized');
    }

    addFloatingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
            }
            
            @keyframes pulseHalo {
                0%, 100% { 
                    box-shadow: 0 0 30px rgba(0, 242, 255, 0.4), 0 0 60px rgba(0, 242, 255, 0.2);
                    opacity: 0.7;
                }
                50% { 
                    box-shadow: 0 0 50px rgba(0, 242, 255, 0.6), 0 0 100px rgba(0, 242, 255, 0.4);
                    opacity: 0.9;
                }
            }
            
            @keyframes circuitryPulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
            }
            
            @keyframes doorGlow {
                0%, 100% { box-shadow: 0 0 30px rgba(0, 242, 255, 0.3); }
                50% { box-shadow: 0 0 60px rgba(0, 242, 255, 0.6); }
            }
            
            @keyframes pedestalActive {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(0, 242, 255, 0.6), inset 0 0 20px rgba(0, 242, 255, 0.3);
                    border-color: rgba(0, 242, 255, 0.9);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(0, 242, 255, 0.9), inset 0 0 30px rgba(0, 242, 255, 0.5);
                    border-color: rgba(0, 242, 255, 1);
                }
            }
            
            .floating {
                animation: float 4s ease-in-out infinite;
            }
            
            .oracle-halo {
                animation: pulseHalo 3s ease-in-out infinite;
            }
            
            .circuitry-line {
                animation: circuitryPulse 3s ease-in-out infinite;
            }
            
            .great-door {
                animation: doorGlow 4s ease-in-out infinite;
            }
            
            .pedestal-active {
                animation: pedestalActive 2s ease-in-out infinite !important;
            }
        `;
        document.head.appendChild(style);
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor sanctum-floor';
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 50% 50%, rgba(0, 242, 255, 0.1) 0%, transparent 60%),
                radial-gradient(ellipse at 30% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 40%),
                radial-gradient(ellipse at 70% 70%, rgba(240, 248, 255, 0.6) 0%, transparent 40%),
                linear-gradient(180deg, #f8f8ff 0%, #f0f0f5 50%, #e8e8ed 100%);
        `;
        
        this.container.appendChild(floor);
    }

    createWalls() {
        // Border walls with ethereal silver look
        const wallConfigs = [
            { x: 0, y: 0, w: 1024, h: 40 },
            { x: 0, y: 728, w: 1024, h: 40 },
            { x: 0, y: 40, w: 40, h: 688 },
            { x: 984, y: 40, w: 40, h: 688 }
        ];
        
        wallConfigs.forEach(config => {
            const wall = document.createElement('div');
            wall.className = 'wall floating';
            wall.style.cssText = `
                position: absolute;
                left: ${config.x}px;
                top: ${config.y}px;
                width: ${config.w}px;
                height: ${config.h}px;
                background: linear-gradient(180deg, #c0c0c8 0%, #a0a0a8 100%);
                border: 3px solid #d0d0d8;
                box-shadow: 0 0 30px rgba(0, 200, 255, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.5);
            `;
            
            this.container.appendChild(wall);
            this.walls.push({ x: config.x, y: config.y, width: config.w, height: config.h });
        });
    }

    createCircuitryLines() {
        // Create glowing cyan circuitry lines
        const lineConfigs = [
            { x1: 100, y1: 100, x2: 400, y2: 350, delay: '0s' },
            { x1: 924, y1: 100, x2: 624, y2: 350, delay: '0.5s' },
            { x1: 512, y1: 700, x2: 512, y2: 450, delay: '1s' },
            { x1: 200, y1: 600, x2: 350, y2: 450, delay: '1.5s' },
            { x1: 824, y1: 600, x2: 674, y2: 450, delay: '2s' },
        ];
        
        lineConfigs.forEach((line, i) => {
            const length = Math.sqrt(Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2));
            const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * 180 / Math.PI;
            
            const circuitry = document.createElement('div');
            circuitry.className = 'circuitry-line';
            circuitry.style.cssText = `
                position: absolute;
                left: ${line.x1}px;
                top: ${line.y1}px;
                width: ${length}px;
                height: 3px;
                background: linear-gradient(90deg, transparent, rgba(0, 242, 255, 0.6), transparent);
                transform: rotate(${angle}deg);
                transform-origin: left center;
                pointer-events: none;
                z-index: 5;
                animation-delay: ${line.delay};
            `;
            
            this.container.appendChild(circuitry);
        });
    }

    createNPCs() {
        // The Oracle (semi-transparent with halo)
        const oracle = new Oracle(512, 384);
        oracle.create(this.container);
        this.npcs.push(oracle);
        
        console.log('[Level7] The Oracle placed');
    }

    createPedestals() {
        // Create three pedestals in a triangle around the center
        const pedestalConfigs = [
            { 
                x: 312, y: 384, 
                type: 'possession', 
                label: 'Possession',
                icon: '🔑',
                color: '#ffd700'
            },
            { 
                x: 512, y: 200, 
                type: 'knowledge', 
                label: 'Knowledge',
                icon: '🧠',
                color: '#00f2ff'
            },
            { 
                x: 712, y: 384, 
                type: 'action', 
                label: 'Action',
                icon: '⚡',
                color: '#ff6b35'
            },
        ];
        
        pedestalConfigs.forEach((config, i) => {
            const pedestalContainer = document.createElement('div');
            pedestalContainer.className = 'ancient-object pedestal floating';
            pedestalContainer.id = `pedestal-${config.type}`;
            pedestalContainer.style.cssText = `
                position: absolute;
                left: ${config.x - 40}px;
                top: ${config.y - 60}px;
                width: 80px;
                height: 120px;
                background: transparent;
                border: none;
                cursor: pointer;
                animation-delay: ${i * 0.5}s;
            `;
            
            // Pedestal base
            const pedestal = document.createElement('div');
            pedestal.className = 'pedestal-base';
            pedestal.style.cssText = `
                width: 60px;
                height: 80px;
                background: linear-gradient(180deg, rgba(200, 200, 210, 0.9) 0%, rgba(180, 180, 190, 0.9) 100%);
                border: 3px solid rgba(0, 242, 255, 0.4);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 20px rgba(0, 200, 255, 0.2);
                transition: all 0.3s ease;
            `;
            
            // Icon
            const icon = document.createElement('div');
            icon.style.cssText = `
                font-size: 28px;
                margin-bottom: 5px;
                filter: drop-shadow(0 0 5px ${config.color});
            `;
            icon.textContent = config.icon;
            
            // Label
            const label = document.createElement('div');
            label.style.cssText = `
                font-size: 10px;
                color: #666;
                text-align: center;
                font-family: 'Georgia', serif;
            `;
            label.textContent = config.label;
            
            pedestal.appendChild(icon);
            pedestal.appendChild(label);
            pedestalContainer.appendChild(pedestal);
            
            pedestalContainer.dataset.id = `pedestal_${config.type}`;
            pedestalContainer.dataset.type = `pedestal_${config.type}`;
            
            this.container.appendChild(pedestalContainer);
            this.objects.push({
                element: pedestalContainer,
                id: `pedestal_${config.type}`,
                type: `pedestal_${config.type}`,
                x: config.x - 40,
                y: config.y - 60,
                width: 80,
                height: 120,
                centerX: config.x,
                centerY: config.y,
                pedestalType: config.type,
                pedestalElement: pedestal
            });
        });
    }

    createGreatDoor() {
        // Central Great Door
        const doorContainer = document.createElement('div');
        doorContainer.id = 'great-door-container';
        doorContainer.className = 'ancient-object great-door floating';
        doorContainer.style.cssText = `
            position: absolute;
            left: 462px;
            top: 350px;
            width: 100px;
            height: 140px;
            background: transparent;
            border: none;
            z-index: 10;
        `;

        const door = document.createElement('div');
        door.id = 'great-door';
        door.style.cssText = `
            width: 100px;
            height: 140px;
            background: linear-gradient(180deg, 
                rgba(200, 200, 210, 0.95) 0%, 
                rgba(180, 180, 190, 0.95) 50%,
                rgba(160, 160, 170, 0.95) 100%);
            border: 4px solid rgba(0, 242, 255, 0.5);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 30px rgba(0, 200, 255, 0.3);
            position: relative;
            overflow: hidden;
        `;
        
        // Door symbol
        const symbol = document.createElement('div');
        symbol.id = 'door-symbol';
        symbol.style.cssText = `
            font-size: 48px;
            filter: drop-shadow(0 0 10px rgba(0, 242, 255, 0.5));
            opacity: 0.5;
        `;
        symbol.textContent = '🔒';
        
        // Status indicator
        const status = document.createElement('div');
        status.id = 'door-status';
        status.style.cssText = `
            position: absolute;
            bottom: 10px;
            font-size: 10px;
            color: #888;
            text-align: center;
            width: 100%;
        `;
        status.textContent = 'LOCKED';
        
        door.appendChild(symbol);
        door.appendChild(status);
        doorContainer.appendChild(door);
        
        doorContainer.dataset.id = 'great_door';
        doorContainer.dataset.type = 'great_door';

        this.container.appendChild(doorContainer);
        this.objects.push({
            element: doorContainer,
            id: 'great_door',
            type: 'great_door',
            x: 462,
            y: 350,
            width: 100,
            height: 140,
            centerX: 512,
            centerY: 420
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
            display: none;
            align-items: center;
            justify-content: center;
        `;

        const gate = document.createElement('div');
        gate.className = 'gate';
        gate.style.cssText = `
            width: 100px;
            height: 70px;
            border: 5px solid #c0c0c8;
            border-bottom: none;
            border-radius: 50px 50px 0 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
            box-shadow: 0 0 20px rgba(0, 200, 255, 0.3);
            transition: all 0.5s ease;
            background: linear-gradient(180deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);
        `;
        gate.innerHTML = `
            <span style="color: #c0c0c8; font-size: 12px; font-family: serif;">🚪</span>
        `;

        gateContainer.appendChild(gate);
        gateContainer.dataset.id = 'gate_level_8';
        gateContainer.dataset.type = 'gate';

        this.container.appendChild(gateContainer);
        this.objects.push({
            element: gateContainer,
            id: 'gate_level_8',
            type: 'gate',
            x: 452,
            y: 60,
            width: 120,
            height: 80,
            centerX: 512,
            centerY: 100,
            hidden: true
        });
    }

    createPlayer() {
        const startX = 512;
        const startY = 650;
        
        this.player = new Player(startX, startY);
        this.player.create(this.container);
        
        GameState.setPlayerPosition(startX, startY);
        
        console.log('[Level7] Player created at entrance');
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('sanctum_intro');
        
        DialogueSystem.show(
            'Warden, you seek the final Core? The Sanctum requires the Dual-Factor protocol. A single key is a single point of failure. You must prove your identity through the three Sacred Pillars of Truth.',
            'The Oracle',
            () => {
                setTimeout(() => {
                    DialogueSystem.show(
                        'Activate all three pedestals: Something you HAVE, something you KNOW, and something you DO. But be swift - the ritual has a time limit. If you take too long, the first seal will break.',
                        'The Oracle'
                    );
                }, 500);
            }
        );
    }

    // Pedestal 1: Possession Factor - Check inventory
    checkPossessionFactor() {
        const hasKey = GameState.inventory && GameState.inventory.some(item => 
            item.id === 'royal_key' || item.name === 'Royal Authorization Key'
        );
        
        if (hasKey) {
            this.activatePedestal('possession');
            DialogueSystem.show(
                '✓ Something you HAVE verified. The Royal Authorization Key is recognized.',
                'Possession Pedestal'
            );
        } else {
            DialogueSystem.show(
                '✗ Verification failed. You lack the Royal Authorization Key from the Vault. Return to Level 1 to obtain it.',
                'Possession Pedestal'
            );
        }
    }

    // Pedestal 2: Knowledge Factor - Simon Says
    startKnowledgePuzzle() {
        if (this.pedestalStates.knowledge) {
            DialogueSystem.show('The Knowledge Factor is already verified.', 'Knowledge Pedestal');
            return;
        }
        
        // Create Simon Says overlay
        const overlay = document.createElement('div');
        overlay.id = 'simon-says-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const title = document.createElement('div');
        title.style.cssText = `
            color: #00f2ff;
            font-size: 24px;
            margin-bottom: 20px;
            font-family: 'Georgia', serif;
        `;
        title.textContent = '🧠 Knowledge Factor: Simon Says';
        
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            color: #888;
            font-size: 14px;
            margin-bottom: 30px;
            text-align: center;
        `;
        instructions.textContent = 'Watch the sequence, then repeat it by clicking the runes.';
        
        const runeContainer = document.createElement('div');
        runeContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 100px);
            grid-template-rows: repeat(2, 100px);
            gap: 15px;
        `;
        
        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ'];
        const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#6c5ce7'];
        const runeElements = [];
        
        runes.forEach((rune, i) => {
            const runeDiv = document.createElement('div');
            runeDiv.style.cssText = `
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                border: 3px solid ${colors[i]};
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                color: ${colors[i]};
                cursor: pointer;
                transition: all 0.2s ease;
                user-select: none;
            `;
            runeDiv.textContent = rune;
            runeDiv.dataset.index = i;
            runeElements.push(runeDiv);
            runeContainer.appendChild(runeDiv);
        });
        
        const status = document.createElement('div');
        status.id = 'simon-status';
        status.style.cssText = `
            color: #888;
            font-size: 16px;
            margin-top: 20px;
            height: 24px;
        `;
        status.textContent = 'Watch the sequence...';
        
        overlay.appendChild(title);
        overlay.appendChild(instructions);
        overlay.appendChild(runeContainer);
        overlay.appendChild(status);
        document.body.appendChild(overlay);
        
        // Generate sequence
        const sequence = [];
        for (let i = 0; i < 4; i++) {
            sequence.push(Math.floor(Math.random() * 4));
        }
        
        let playerIndex = 0;
        
        // Flash sequence
        const flashSequence = async () => {
            for (let i = 0; i < sequence.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 600));
                const idx = sequence[i];
                const el = runeElements[idx];
                el.style.background = `linear-gradient(135deg, ${colors[idx]}, ${colors[idx]}88)`;
                el.style.transform = 'scale(1.1)';
                el.style.boxShadow = `0 0 30px ${colors[idx]}`;
                
                await new Promise(resolve => setTimeout(resolve, 400));
                el.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
                el.style.transform = 'scale(1)';
                el.style.boxShadow = 'none';
            }
            
            status.textContent = 'Your turn! Click the runes in order.';
            status.style.color = '#00f2ff';
            
            // Enable clicking
            runeElements.forEach((el, i) => {
                el.addEventListener('click', () => {
                    if (playerIndex >= sequence.length) return;
                    
                    // Visual feedback
                    el.style.background = `linear-gradient(135deg, ${colors[i]}, ${colors[i]}88)`;
                    setTimeout(() => {
                        el.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
                    }, 200);
                    
                    if (i === sequence[playerIndex]) {
                        playerIndex++;
                        if (playerIndex === sequence.length) {
                            status.textContent = '✓ Sequence complete!';
                            status.style.color = '#00ff00';
                            setTimeout(() => {
                                overlay.remove();
                                this.activatePedestal('knowledge');
                                DialogueSystem.show(
                                    '✓ Something you KNOW verified. Your memory is proven.',
                                    'Knowledge Pedestal'
                                );
                            }, 1000);
                        }
                    } else {
                        status.textContent = '✗ Wrong! Try again.';
                        status.style.color = '#ff4444';
                        playerIndex = 0;
                        setTimeout(() => {
                            status.textContent = 'Watch the sequence...';
                            status.style.color = '#888';
                            flashSequence();
                        }, 1500);
                    }
                });
            });
        };
        
        setTimeout(flashSequence, 1000);
    }

    // Pedestal 3: Action Factor - Timed alignment
    startActionPuzzle() {
        if (this.pedestalStates.action) {
            DialogueSystem.show('The Action Factor is already verified.', 'Action Pedestal');
            return;
        }
        
        // Create timed alignment overlay
        const overlay = document.createElement('div');
        overlay.id = 'action-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const title = document.createElement('div');
        title.style.cssText = `
            color: #ff6b35;
            font-size: 24px;
            margin-bottom: 20px;
            font-family: 'Georgia', serif;
        `;
        title.textContent = '⚡ Action Factor: Timed Alignment';
        
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            color: #888;
            font-size: 14px;
            margin-bottom: 30px;
            text-align: center;
        `;
        instructions.textContent = 'Press SPACE when the pointer is in the TEAL zone!';
        
        // Bar container
        const barContainer = document.createElement('div');
        barContainer.style.cssText = `
            width: 400px;
            height: 60px;
            background: linear-gradient(90deg, 
                #333 0%, 
                #333 35%, 
                #00f2ff 35%, 
                #00f2ff 65%, 
                #333 65%, 
                #333 100%);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            border: 3px solid #555;
        `;
        
        // Target zone label
        const targetLabel = document.createElement('div');
        targetLabel.style.cssText = `
            position: absolute;
            left: 35%;
            width: 30%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.3);
            font-size: 12px;
        `;
        targetLabel.textContent = 'TARGET';
        barContainer.appendChild(targetLabel);
        
        // Pointer
        const pointer = document.createElement('div');
        pointer.id = 'alignment-pointer';
        pointer.style.cssText = `
            position: absolute;
            top: 0;
            width: 4px;
            height: 100%;
            background: #ff6b35;
            box-shadow: 0 0 10px #ff6b35;
            left: 0%;
        `;
        barContainer.appendChild(pointer);
        
        const status = document.createElement('div');
        status.id = 'action-status';
        status.style.cssText = `
            color: #888;
            font-size: 16px;
            margin-top: 20px;
            height: 24px;
        `;
        status.textContent = 'Press SPACE to stop!';
        
        overlay.appendChild(title);
        overlay.appendChild(instructions);
        overlay.appendChild(barContainer);
        overlay.appendChild(status);
        document.body.appendChild(overlay);
        
        // Animation
        let position = 0;
        let direction = 1;
        const speed = 2;
        let isRunning = true;
        
        const animate = () => {
            if (!isRunning) return;
            
            position += speed * direction;
            if (position >= 100 || position <= 0) {
                direction *= -1;
            }
            
            pointer.style.left = position + '%';
            requestAnimationFrame(animate);
        };
        
        const checkAlignment = () => {
            if (!isRunning) return;
            
            isRunning = false;
            
            // Check if in target zone (35% - 65%)
            if (position >= 35 && position <= 65) {
                status.textContent = '✓ Perfect alignment!';
                status.style.color = '#00ff00';
                pointer.style.background = '#00ff00';
                pointer.style.boxShadow = '0 0 20px #00ff00';
                
                setTimeout(() => {
                    overlay.remove();
                    this.activatePedestal('action');
                    DialogueSystem.show(
                        '✓ Something you DO verified. Your timing is proven.',
                        'Action Pedestal'
                    );
                }, 1000);
            } else {
                status.textContent = '✗ Missed! Try again.';
                status.style.color = '#ff4444';
                
                setTimeout(() => {
                    isRunning = true;
                    status.textContent = 'Press SPACE to stop!';
                    status.style.color = '#888';
                    animate();
                }, 1500);
            }
        };
        
        // Key listener
        const keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                checkAlignment();
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        
        // Cleanup on overlay removal
        overlay.addEventListener('remove', () => {
            document.removeEventListener('keydown', keyHandler);
        });
        
        animate();
    }

    activatePedestal(type) {
        this.pedestalStates[type] = true;
        
        // Start MFA timer on first activation
        if (!this.mfaStartTime) {
            this.mfaStartTime = Date.now();
            this.startMFATimer();
        }
        
        // Update visual
        const pedestalObj = this.objects.find(obj => obj.pedestalType === type);
        if (pedestalObj) {
            pedestalObj.pedestalElement.classList.add('pedestal-active');
        }
        
        // Check if all are active
        this.checkAllPedestals();
    }

    startMFATimer() {
        this.mfaTimerInterval = setInterval(() => {
            const elapsed = Date.now() - this.mfaStartTime;
            const remaining = this.mfaTimeout - elapsed;
            
            if (remaining <= 0) {
                // Timeout - reset first activated pedestal
                this.resetFirstPedestal();
            } else if (remaining <= 5000) {
                // Warning when less than 5 seconds
                const doorStatus = document.getElementById('door-status');
                if (doorStatus) {
                    doorStatus.textContent = `TIMEOUT IN ${Math.ceil(remaining / 1000)}s`;
                    doorStatus.style.color = '#ff4444';
                }
            }
        }, 1000);
    }

    resetFirstPedestal() {
        // Find first activated pedestal
        const order = ['possession', 'knowledge', 'action'];
        for (const type of order) {
            if (this.pedestalStates[type]) {
                this.pedestalStates[type] = false;
                
                const pedestalObj = this.objects.find(obj => obj.pedestalType === type);
                if (pedestalObj) {
                    pedestalObj.pedestalElement.classList.remove('pedestal-active');
                }
                
                DialogueSystem.show(
                    `⚠ TIMEOUT! The ${type.toUpperCase()} factor has expired. You must reactivate it.`,
                    'The Oracle'
                );
                
                // Reset timer
                this.mfaStartTime = Date.now();
                break;
            }
        }
    }

    checkAllPedestals() {
        const allActive = this.pedestalStates.possession && 
                         this.pedestalStates.knowledge && 
                         this.pedestalStates.action;
        
        if (allActive) {
            // Clear timer
            if (this.mfaTimerInterval) {
                clearInterval(this.mfaTimerInterval);
                this.mfaTimerInterval = null;
            }
            
            this.completeMFA();
        } else {
            // Update door status
            const doorStatus = document.getElementById('door-status');
            const activeCount = Object.values(this.pedestalStates).filter(v => v).length;
            if (doorStatus) {
                doorStatus.textContent = `${activeCount}/3 FACTORS`;
                doorStatus.style.color = activeCount === 2 ? '#ffaa00' : '#00f2ff';
            }
        }
    }

    completeMFA() {
        this.puzzleSolved = true;
        GameState.completePuzzle('mfa_complete');
        GameState.addSecurityScore(500);
        
        // Transform door
        const door = document.getElementById('great-door');
        const doorSymbol = document.getElementById('door-symbol');
        const doorStatus = document.getElementById('door-status');
        
        if (door) {
            door.style.transition = 'all 1s ease';
            door.style.background = 'linear-gradient(180deg, rgba(0, 242, 255, 0.3), rgba(0, 200, 255, 0.2))';
            door.style.borderColor = 'rgba(0, 242, 255, 0.9)';
            door.style.boxShadow = '0 0 60px rgba(0, 242, 255, 0.8)';
        }
        
        if (doorSymbol) {
            doorSymbol.textContent = '🔓';
            doorSymbol.style.opacity = '1';
            doorSymbol.style.filter = 'drop-shadow(0 0 20px rgba(0, 242, 255, 1))';
        }
        
        if (doorStatus) {
            doorStatus.textContent = 'UNLOCKED';
            doorStatus.style.color = '#00ff00';
        }
        
        // Show gate
        const gateObj = this.objects.find(obj => obj.id === 'gate_level_8');
        if (gateObj) {
            gateObj.element.style.display = 'flex';
            gateObj.hidden = false;
        }
        
        this.unlockGate();
        
        setTimeout(() => {
            DialogueSystem.show(
                'All three factors verified! The Sanctum recognizes your complete identity. Take this Oracle\'s Sight - it will guide you to the Core.',
                'The Oracle',
                () => {
                    // Add Oracle's Sight to inventory
                    if (typeof GameState !== 'undefined' && GameState.addToInventory) {
                        GameState.addToInventory({
                            id: 'oracles_sight',
                            name: 'Oracle\'s Sight',
                            description: 'A blessing from the Oracle that reveals hidden truths',
                            icon: '👁'
                        });
                    }
                }
            );
        }, 1500);
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

    transitionToLevel8() {
        if (!this.gateUnlocked) {
            DialogueSystem.show(
                'The Great Door remains sealed. You must complete the Dual-Factor ritual.',
                'The Oracle'
            );
            return;
        }

        GameState.unlockLevel(8);
        GameState.setLevel(8);
        
        DialogueSystem.show(
            'The Oracle\'s Sight reveals the path. The Core awaits...',
            'Gate Keeper',
            () => {
                Engine.transitionToLevel(8);
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
            if (obj.hidden) return;
            
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
            case 'pedestal_possession':
                GameState.isDialogueActive = false;
                this.checkPossessionFactor();
                break;
            case 'pedestal_knowledge':
                GameState.isDialogueActive = false;
                this.startKnowledgePuzzle();
                break;
            case 'pedestal_action':
                GameState.isDialogueActive = false;
                this.startActionPuzzle();
                break;
            case 'gate':
                GameState.isDialogueActive = false;
                this.transitionToLevel8();
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
                } else if (nearest.object.type === 'pedestal_possession') {
                    typeLabel = 'Possession Pedestal';
                } else if (nearest.object.type === 'pedestal_knowledge') {
                    typeLabel = 'Knowledge Pedestal';
                } else if (nearest.object.type === 'pedestal_action') {
                    typeLabel = 'Action Pedestal';
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
        console.log('[Level7] Cleaning up...');
        if (this.mfaTimerInterval) {
            clearInterval(this.mfaTimerInterval);
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Register the level
Engine.registerLevel(7, Level7);
