/**
 * Rune Keeper - Level 2: The Archives
 * The Forged Scroll - Phishing/Impersonation Detection
 */

class Level2 {
    constructor() {
        this.name = 'The Archives';
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
        console.log('[Level2] Initializing The Archives...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-2';
        
        // Create the environment
        this.createFloor();
        this.createWalls();
        this.createBookshelves();
        this.createLanterns();
        this.createNPCs();
        this.createPuzzleTable();
        this.createGate();
        this.createPlayer();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('archives_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level2] Level initialized');
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor archives-floor';
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                repeating-linear-gradient(
                    90deg,
                    rgba(20, 30, 40, 1) 0px,
                    rgba(20, 30, 40, 1) 60px,
                    rgba(35, 50, 65, 1) 60px,
                    rgba(35, 50, 65, 1) 120px
                ),
                repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, 0.2) 0px,
                    rgba(0, 0, 0, 0.2) 2px,
                    transparent 2px,
                    transparent 60px
                );
            background-blend-mode: multiply;
        `;
        
        // Add scanning line
        const scanLine = document.createElement('div');
        scanLine.className = 'scan-line';
        floor.appendChild(scanLine);
        
        this.container.appendChild(floor);
    }

    createWalls() {
        // Border walls
        this.createWall(0, 0, 1024, 40);
        this.createWall(0, 728, 1024, 40);
        this.createWall(0, 40, 40, 688);
        this.createWall(984, 40, 40, 688);
    }

    createWall(x, y, width, height) {
        const wall = document.createElement('div');
        wall.className = 'wall';
        wall.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            background: linear-gradient(180deg, #2a3a4a 0%, #1a2a3a 100%);
            border: 2px solid #3a5a7a;
        `;
        
        this.container.appendChild(wall);
        this.walls.push({ x, y, width, height });
    }

    createBookshelves() {
        // Create floating bookshelves on the sides
        const positions = [
            { x: 80, y: 120, width: 120, height: 180 },
            { x: 80, y: 360, width: 120, height: 180 },
            { x: 824, y: 120, width: 120, height: 180 },
            { x: 824, y: 360, width: 120, height: 180 },
        ];
        
        positions.forEach((pos, i) => {
            const shelf = document.createElement('div');
            shelf.className = 'bookshelf';
            shelf.style.cssText = `
                position: absolute;
                left: ${pos.x}px;
                top: ${pos.y}px;
                width: ${pos.width}px;
                height: ${pos.height}px;
                background: linear-gradient(180deg, #3a2a1a 0%, #2a1a0a 100%);
                border: 3px solid #4a3a2a;
                border-radius: 4px;
                box-shadow: 0 0 20px rgba(0, 100, 150, 0.3);
            `;
            
            // Add books
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 3; col++) {
                    const book = document.createElement('div');
                    const bookColor = ['#8B4513', '#556B2F', '#4B0082', '#800000'][Math.floor(Math.random() * 4)];
                    book.style.cssText = `
                        position: absolute;
                        left: ${10 + col * 35}px;
                        top: ${15 + row * 40}px;
                        width: 25px;
                        height: 35px;
                        background: ${bookColor};
                        border: 1px solid rgba(0,0,0,0.3);
                        border-radius: 2px;
                    `;
                    shelf.appendChild(book);
                }
            }
            
            this.container.appendChild(shelf);
            this.walls.push({ x: pos.x, y: pos.y, width: pos.width, height: pos.height });
        });
    }

    createLanterns() {
        // Create floating blue lanterns
        const positions = [
            { x: 250, y: 80 },
            { x: 512, y: 60 },
            { x: 774, y: 80 },
            { x: 350, y: 400 },
            { x: 674, y: 400 },
        ];
        
        positions.forEach(pos => {
            const lantern = document.createElement('div');
            lantern.className = 'floating-lantern';
            lantern.style.cssText = `
                position: absolute;
                left: ${pos.x}px;
                top: ${pos.y}px;
                width: 30px;
                height: 50px;
                background: radial-gradient(circle, rgba(0, 200, 255, 0.4) 0%, transparent 70%);
                border: 2px solid rgba(0, 200, 255, 0.6);
                border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                animation: lanternFloat 3s ease-in-out infinite;
                box-shadow: 0 0 30px rgba(0, 200, 255, 0.5);
            `;
            
            this.container.appendChild(lantern);
        });
        
        // Add lantern float animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes lanternFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes bookFloat {
                0%, 100% { transform: translateY(0) rotate(-5deg); }
                50% { transform: translateY(-15px) rotate(5deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Create floating books
        this.createFloatingBooks();
    }

    createFloatingBooks() {
        // Create floating book SVGs in the background
        const bookPositions = [
            { x: 200, y: 250, delay: '0s', duration: '4s' },
            { x: 824, y: 300, delay: '1s', duration: '5s' },
            { x: 150, y: 500, delay: '2s', duration: '4.5s' },
            { x: 874, y: 550, delay: '0.5s', duration: '5.5s' },
            { x: 300, y: 150, delay: '1.5s', duration: '4s' },
            { x: 724, y: 180, delay: '2.5s', duration: '5s' },
        ];
        
        bookPositions.forEach((pos, i) => {
            const book = document.createElement('div');
            const bookColor = ['#4a5a7a', '#3a4a6a', '#5a6a8a', '#2a3a5a'][i % 4];
            book.style.cssText = `
                position: absolute;
                left: ${pos.x}px;
                top: ${pos.y}px;
                width: 40px;
                height: 50px;
                z-index: 5;
                animation: bookFloat ${pos.duration} ease-in-out infinite;
                animation-delay: ${pos.delay};
                pointer-events: none;
            `;
            
            // SVG book with glowing edges
            book.innerHTML = `
                <svg width="40" height="50" viewBox="0 0 40 50">
                    <defs>
                        <filter id="bookGlow${i}" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <!-- Book cover -->
                    <rect x="2" y="2" width="36" height="46" 
                          fill="${bookColor}" 
                          stroke="#00aaff" 
                          stroke-width="1"
                          filter="url(#bookGlow${i})"
                          rx="2"/>
                    <!-- Book spine -->
                    <rect x="2" y="2" width="8" height="46" 
                          fill="#2a3a4a" 
                          rx="1"/>
                    <!-- Pages -->
                    <rect x="12" y="5" width="24" height="40" 
                          fill="#e8d4a8" 
                          opacity="0.8"/>
                    <!-- Glowing rune on cover -->
                    <text x="24" y="28" 
                          text-anchor="middle" 
                          fill="#00f2ff" 
                          font-size="14" 
                          font-family="serif"
                          filter="url(#bookGlow${i})">${['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ'][i % 4]}</text>
                </svg>
            `;
            
            this.container.appendChild(book);
        });
    }

    createNPCs() {
        // Head Archivist
        const archivist = new HeadArchivist(512, 200);
        archivist.create(this.container);
        this.npcs.push(archivist);
        
        console.log('[Level2] Head Archivist placed');
    }

    createPuzzleTable() {
        // Central stone table for the scroll puzzle
        const tableContainer = document.createElement('div');
        tableContainer.className = 'ancient-object puzzle-table';
        tableContainer.style.cssText = `
            position: absolute;
            left: 362px;
            top: 450px;
            width: 300px;
            height: 180px;
            background: transparent;
            border: none;
            cursor: pointer;
        `;

        const table = document.createElement('div');
        table.style.cssText = `
            width: 280px;
            height: 160px;
            background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
            border: 4px solid #5a5a5a;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 40px rgba(0, 150, 200, 0.3);
        `;
        table.innerHTML = `
            <span style="color: var(--cyber-teal); font-size: 48px; filter: drop-shadow(0 0 10px currentColor);">📜</span>
        `;

        tableContainer.appendChild(table);
        tableContainer.dataset.id = 'forgery_puzzle';
        tableContainer.dataset.type = 'forgery_table';

        this.container.appendChild(tableContainer);
        this.objects.push({
            element: tableContainer,
            id: 'forgery_puzzle',
            type: 'forgery_table',
            x: 362,
            y: 450,
            width: 300,
            height: 180,
            centerX: 512,
            centerY: 540
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
            border: 5px solid var(--stone-gray);
            border-bottom: none;
            border-radius: 50px 50px 0 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            transition: all 0.5s ease;
        `;
        gate.innerHTML = `
            <span style="color: var(--stone-gray); font-size: 12px; font-family: serif;">🚪</span>
        `;

        gateContainer.appendChild(gate);
        gateContainer.dataset.id = 'gate_level_3';
        gateContainer.dataset.type = 'gate';

        this.container.appendChild(gateContainer);
        this.objects.push({
            element: gateContainer,
            id: 'gate_level_3',
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
        
        console.log('[Level2] Player created at entrance');
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('archives_intro');
        
        DialogueSystem.show(
            'Welcome to the Archives, Seeker. Forgeries are everywhere - fake messages sent to confuse the King\'s Guard. You must learn to detect the Ink of Deception.',
            'Head Archivist',
            () => {
                setTimeout(() => {
                    DialogueSystem.show(
                        'Approach the stone table and examine the scrolls. Use your Magnifying Lens to find the authentic message. The forgeries will show digital glitches under scrutiny.',
                        'Head Archivist'
                    );
                }, 500);
            }
        );
    }

    openForgeryPuzzle() {
        if (this.puzzleSolved) {
            DialogueSystem.show(
                'You have already proven your skill at detecting forgeries. The authentic scroll has been stamped.',
                'Head Archivist'
            );
            return;
        }

        // Open the forgery detection puzzle
        ForgeryPuzzle.show(() => {
            this.puzzleSolved = true;
            GameState.completePuzzle('forgery_detected');
            GameState.addSecurityScore(100);
            
            this.unlockGate();
            
            setTimeout(() => {
                DialogueSystem.show(
                    'Excellent! You have the eye of a true Warden. Those phishing attempts are now exposed. Take this Archive Seal and proceed to the Chamber.',
                    'Head Archivist'
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

    transitionToLevel3() {
        if (!this.gateUnlocked) {
            DialogueSystem.show(
                'The gate is sealed. You must first prove your skill at detecting forgeries.',
                'Sealed Gate'
            );
            return;
        }

        GameState.unlockLevel(3);
        GameState.setLevel(3);
        
        DialogueSystem.show(
            'The Archive Seal glows with approval. The gate to the Chamber opens...',
            'Gate Keeper',
            () => {
                Engine.transitionToLevel(3);
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
            case 'forgery_table':
                GameState.isDialogueActive = false;
                this.openForgeryPuzzle();
                break;
            case 'gate':
                GameState.isDialogueActive = false;
                this.transitionToLevel3();
                break;
        }
    }

    update(deltaTime, keys) {
        if (!this.player) return;
        
        // Update player with collision detection
        if (!DialogueSystem.isDialogueActive() && !ForgeryPuzzle.isActive()) {
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
                } else if (nearest.object.type === 'forgery_table') {
                    typeLabel = 'Examine Scrolls';
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
        console.log('[Level2] Cleaning up...');
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Register the level
Engine.registerLevel(2, Level2);
