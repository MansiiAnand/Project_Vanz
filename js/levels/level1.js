/**
 * Rune Keeper - Level 1: The Royal Court
 * Initial zone - Tutorial and introduction
 */

class Level1 {
    constructor() {
        this.name = 'The Royal Court';
        this.width = 1024;
        this.height = 768;
        this.objects = [];
        this.walls = [];
        this.player = null;
        this.npcs = [];
        this.hasIntroPlayed = false;
        this.vaultSolved = false;
        this.gateUnlocked = false;
    }

    init() {
        console.log('[Level1] Initializing The Royal Court...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-1';
        
        this.createFloor();
        this.createWalls();
        this.createAncientObjects();
        this.createPlayer();
        this.createNPCs();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('level1_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level1] Level initialized');
    }

    /**
     * Create NPCs
     */
    createNPCs() {
        // Elder Scribe near the left pillar
        const scribe = new ElderScribe(180, 280);
        scribe.create(this.container);
        this.npcs.push(scribe);
        
        console.log('[Level1] Elder Scribe placed');
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor';
        
        // Obsidian stone texture
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                repeating-linear-gradient(
                    0deg,
                    rgba(26, 26, 26, 1) 0px,
                    rgba(26, 26, 26, 1) 40px,
                    rgba(45, 45, 45, 1) 40px,
                    rgba(45, 45, 45, 1) 80px
                ),
                repeating-linear-gradient(
                    90deg,
                    rgba(0, 0, 0, 0.1) 0px,
                    rgba(0, 0, 0, 0.1) 2px,
                    transparent 2px,
                    transparent 40px
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
        this.createWall(0, 0, 1024, 40);
        this.createWall(0, 728, 1024, 40);
        this.createWall(0, 40, 40, 688);
        this.createWall(984, 40, 40, 688);
        
        this.createWall(150, 150, 40, 100, true);
        this.createWall(834, 150, 40, 100, true);
        this.createWall(150, 518, 40, 100, true);
        this.createWall(834, 518, 40, 100, true);
    }

    createWall(x, y, width, height, isPillar = false) {
        const wall = document.createElement('div');
        wall.className = 'wall';
        wall.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            ${isPillar ? 'background: linear-gradient(180deg, var(--sandstone) 0%, var(--stone-gray) 100%);' : ''}
        `;
        
        if (isPillar) {
            const capital = document.createElement('div');
            capital.style.cssText = `
                position: absolute;
                top: -10px;
                left: -5px;
                width: ${width + 10}px;
                height: 20px;
                background: var(--sandstone);
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
            `;
            wall.appendChild(capital);
        }
        
        this.container.appendChild(wall);
        this.walls.push({ x, y, width, height });
    }

    createAncientObjects() {
        // Vault at bottom center (the XX area)
        this.createVault(512, 680);
        
        this.createTablet(200, 384, 'ancient_welcome');
        this.createForgedScroll(824, 384, 'corrupted_1');
        
        // Gate at top center for level transition
        this.createGate(512, 60);
    }

    createSeal(x, y, id, isLocked = true) {
        // Sun-Disk on floor - invisible container, visible seal
        const sealContainer = document.createElement('div');
        sealContainer.className = 'ancient-object seal-container';
        sealContainer.style.cssText = `
            position: absolute;
            left: ${x - 40}px;
            top: ${y - 40}px;
            width: 80px;
            height: 80px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // The seal - Sun Disk style on floor
        const seal = document.createElement('div');
        seal.className = 'seal sun-disk';
        seal.style.cssText = `
            width: 56px;
            height: 56px;
            background: radial-gradient(circle, var(--obsidian) 20%, var(--sandstone) 60%, rgba(212, 175, 55, 0.3) 100%);
            border: 3px solid ${isLocked ? 'var(--stone-gray)' : 'var(--cyber-teal)'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${isLocked ? '0 0 15px rgba(0,0,0,0.5)' : '0 0 25px rgba(0, 242, 255, 0.6), 0 0 40px rgba(0, 242, 255, 0.3)'};
            transition: all 0.3s ease;
        `;
        seal.innerHTML = '<span style="color: ' + (isLocked ? 'var(--stone-gray)' : 'var(--cyber-teal)') + '; font-size: 22px; font-family: serif; text-shadow: 0 0 10px currentColor;">ᚷ</span>';
        
        sealContainer.appendChild(seal);
        sealContainer.dataset.id = id;
        sealContainer.dataset.type = 'seal';
        sealContainer.dataset.locked = isLocked;
        
        if (!isLocked) {
            sealContainer.classList.add('glow-pulse');
        }
        
        this.container.appendChild(sealContainer);
        this.objects.push({
            element: sealContainer,
            id,
            type: 'seal',
            x: x - 40,
            y: y - 40,
            width: 80,
            height: 80,
            locked: isLocked,
            centerX: x,
            centerY: y
        });
    }

    createTablet(x, y, messageId) {
        // Invisible container
        const tabletContainer = document.createElement('div');
        tabletContainer.className = 'ancient-object tablet-container';
        tabletContainer.style.cssText = `
            position: absolute;
            left: ${x - 35}px;
            top: ${y - 50}px;
            width: 70px;
            height: 100px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // The tablet - standing stone
        const tablet = document.createElement('div');
        tablet.style.cssText = `
            width: 60px;
            height: 90px;
            background: linear-gradient(180deg, #6b5b4f 0%, #4a3f35 100%);
            border: 3px solid var(--stone-gray);
            border-radius: 4px 4px 8px 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.5);
        `;
        tablet.innerHTML = '<span style="color: var(--sandstone); font-size: 26px; font-family: serif;">ᛏ</span>';
        
        tabletContainer.appendChild(tablet);
        tabletContainer.dataset.id = messageId;
        tabletContainer.dataset.type = 'tablet';
        
        this.container.appendChild(tabletContainer);
        this.objects.push({
            element: tabletContainer,
            id: messageId,
            type: 'tablet',
            x: x - 35,
            y: y - 50,
            width: 70,
            height: 100,
            message: this.getTabletMessage(messageId),
            centerX: x,
            centerY: y
        });
    }

    createForgedScroll(x, y, id) {
        // Invisible container
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'ancient-object scroll-container';
        scrollContainer.style.cssText = `
            position: absolute;
            left: ${x - 25}px;
            top: ${y - 35}px;
            width: 50px;
            height: 70px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // The forged scroll
        const scroll = document.createElement('div');
        scroll.className = 'forged-scroll';
        scroll.style.cssText = `
            width: 44px;
            height: 64px;
            background: linear-gradient(180deg, var(--parchment) 0%, #c9b896 100%);
            border: 2px solid var(--corrupted-red);
            border-radius: 3px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.9;
            box-shadow: 0 4px 10px rgba(255, 77, 77, 0.4);
        `;
        scroll.innerHTML = '<span style="font-size: 22px;">✋</span>';
        
        scrollContainer.appendChild(scroll);
        scrollContainer.dataset.id = id;
        scrollContainer.dataset.type = 'forged_scroll';
        scrollContainer.dataset.corrupted = 'true';
        
        this.container.appendChild(scrollContainer);
        this.objects.push({
            element: scrollContainer,
            id,
            type: 'forged_scroll',
            x: x - 25,
            y: y - 35,
            width: 50,
            height: 70,
            corrupted: true,
            centerX: x,
            centerY: y
        });
    }

    getTabletMessage(messageId) {
        const messages = {
            'ancient_welcome': 'Welcome, Seeker. I am the Keeper of the Royal Archives. In this ancient realm, we protect knowledge using Seals - magical bindings that guard our most precious secrets. Approach the glowing Seal to begin your training.',
            'tutorial_complete': 'You have learned the basics of Seals. Remember: a true Seal glows with the teal light of authenticity. Be wary of corrupted scrolls that seek to deceive.'
        };
        return messages[messageId] || 'Ancient text, faded with time...';
    }

    /**
     * Create the Royal Vault - triggers puzzle when interacted
     */
    createVault(x, y) {
        const vaultContainer = document.createElement('div');
        vaultContainer.className = 'ancient-object vault-container';
        vaultContainer.style.cssText = `
            position: absolute;
            left: ${x - 50}px;
            top: ${y - 50}px;
            width: 100px;
            height: 100px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;

        // The vault seal - XX mark
        const vault = document.createElement('div');
        vault.className = 'vault-seal';
        vault.style.cssText = `
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.8) 100%);
            border: 4px solid var(--corrupted-red);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 30px rgba(255, 77, 77, 0.4);
            transition: all 0.3s ease;
        `;
        vault.innerHTML = `
            <span style="color: var(--corrupted-red); font-size: 32px; font-family: serif; font-weight: bold;">XX</span>
        `;

        vaultContainer.appendChild(vault);
        vaultContainer.dataset.id = 'royal_vault';
        vaultContainer.dataset.type = 'vault';

        this.container.appendChild(vaultContainer);
        this.objects.push({
            element: vaultContainer,
            id: 'royal_vault',
            type: 'vault',
            x: x - 50,
            y: y - 50,
            width: 100,
            height: 100,
            centerX: x,
            centerY: y
        });
    }

    /**
     * Create the Gate for level transition
     */
    createGate(x, y) {
        const gateContainer = document.createElement('div');
        gateContainer.className = 'ancient-object gate-container';
        gateContainer.id = 'level-gate';
        gateContainer.style.cssText = `
            position: absolute;
            left: ${x - 60}px;
            top: ${y - 40}px;
            width: 120px;
            height: 80px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // The gate - archway
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
        gateContainer.dataset.id = 'gate_level_2';
        gateContainer.dataset.type = 'gate';

        this.container.appendChild(gateContainer);
        this.objects.push({
            element: gateContainer,
            id: 'gate_level_2',
            type: 'gate',
            x: x - 60,
            y: y - 40,
            width: 120,
            height: 80,
            centerX: x,
            centerY: y
        });
    }

    /**
     * Open the vault puzzle
     */
    openVaultPuzzle() {
        if (this.vaultSolved) {
            DialogueSystem.show(
                'The Royal Vault has already been secured. The complex Seal you created protects it from any shadow attack.',
                'Royal Vault'
            );
            return;
        }

        VaultPuzzle.show(() => {
            // On puzzle completion
            this.vaultSolved = true;
            GameState.completePuzzle('vault_fortified');
            GameState.addToInventory('Royal Authorization Key');
            
            // Change vault appearance
            this.updateVaultAppearance();
            
            // Unlock gate
            this.unlockGate();
            
            // Elder Scribe congratulates
            setTimeout(() => {
                DialogueSystem.show(
                    "Incredible! That seal will hold against any brute-force shadow attack. The complexity of your runic combination is mathematically unbreakable. Proceed to the Archives through the gate, Seeker. Your Royal Authorization Key will grant you passage.",
                    'Elder Scribe'
                );
            }, 500);
        });
    }

    /**
     * Update vault appearance after solving
     */
    updateVaultAppearance() {
        const vault = this.container.querySelector('.vault-seal');
        if (vault) {
            vault.style.borderColor = 'var(--cyber-teal)';
            vault.style.boxShadow = '0 0 40px rgba(0, 242, 255, 0.6)';
            vault.innerHTML = `
                <span style="color: var(--cyber-teal); font-size: 32px; font-family: serif; text-shadow: 0 0 15px currentColor;">✓</span>
            `;
        }
    }

    /**
     * Unlock and glow the gate
     */
    unlockGate() {
        this.gateUnlocked = true;
        const gate = this.container.querySelector('.gate');
        const gateContainer = document.getElementById('level-gate');
        
        if (gate) {
            gate.style.borderColor = 'var(--cyber-teal)';
            gate.style.boxShadow = '0 0 40px rgba(0, 242, 255, 0.6), inset 0 0 30px rgba(0, 242, 255, 0.2)';
            gate.innerHTML = `
                <span style="color: var(--cyber-teal); font-size: 24px; filter: drop-shadow(0 0 10px currentColor);">⇧</span>
            `;
        }
        
        if (gateContainer) {
            gateContainer.classList.add('gate-unlocked');
        }
    }

    /**
     * Transition to Level 2
     */
    transitionToLevel2() {
        if (!this.gateUnlocked) {
            DialogueSystem.show(
                'The gate is sealed. You must first fortify the Royal Vault before proceeding to the Archives.',
                'Sealed Gate'
            );
            return;
        }

        // Save progress and transition
        GameState.unlockLevel(2);
        GameState.setLevel(2);
        
        DialogueSystem.show(
            'The Royal Authorization Key pulses with energy. The gate to the Archives opens...',
            'Gate Keeper',
            () => {
                Engine.transitionToLevel(2);
            }
        );
    }

    createPlayer() {
        // Start at top right of the level
        const startX = 900;
        const startY = 100;
        
        // Create player at starting position
        this.player = new Player(startX, startY);
        this.player.create(this.container);
        
        // Save this position
        GameState.setPlayerPosition(startX, startY);
        
        console.log('[Level1] Player created at top right');
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('level1_intro');
        
        DialogueSystem.show(
            'Welcome, Seeker, to the Royal Court of the Ancient Kingdom. I am the Keeper of Seals. Our realm faces a new threat - forged scrolls that mimic the appearance of truth. You must learn to distinguish the authentic from the corrupted.',
            'Keeper of Seals',
            () => {
                setTimeout(() => {
                    DialogueSystem.show(
                        'Approach the glowing Seal (press E) to learn the art of authentication. The teal glow marks true knowledge. Speak with the Elder Scribe by the pillar for guidance.',
                        'Keeper of Seals'
                    );
                }, 500);
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
        
        // Check regular objects
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
        
        // Check NPCs
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
        // Prevent multiple interactions while dialogue is active
        if (DialogueSystem.isDialogueActive()) return;
        
        // Set dialogue active state
        GameState.isDialogueActive = true;
        
        const onDialogueClose = () => {
            GameState.isDialogueActive = false;
            console.log('[Level1] Dialogue closed, movement resumed');
        };
        
        switch (obj.type) {
            case 'seal':
                if (!obj.locked) {
                    GameState.collectSeal(obj.id);
                    DialogueSystem.show(
                        "You have authenticated the Seal of Beginning. This Seal represents the first principle: always verify the source. True knowledge carries the teal glow of authenticity.",
                        "Seal of Beginning",
                        onDialogueClose
                    );
                }
                break;
            case 'tablet':
                DialogueSystem.show(obj.message, "Ancient Tablet", onDialogueClose);
                break;
            case 'forged_scroll':
                DialogueSystem.show(
                    'WARNING: This scroll bears the mark of corruption! Its red taint reveals a forgery. In our realm, such deceptions are known as "phishing" - attempts to steal your trust. Always verify the Seal.',
                    "Corrupted Scroll",
                    onDialogueClose
                );
                break;
            case 'npc':
                const dialogue = obj.npc.getNextDialogue();
                if (dialogue) {
                    DialogueSystem.show(dialogue.text, dialogue.speaker, onDialogueClose);
                }
                break;
            case 'vault':
                GameState.isDialogueActive = false; // Puzzle handles its own state
                this.openVaultPuzzle();
                break;
            case 'gate':
                GameState.isDialogueActive = false; // Gate handles its own transition
                this.transitionToLevel2();
                break;
        }
    }

    update(deltaTime, keys) {
        if (!this.player) return;
        
        // Update player with collision detection (pass keys if dialogue or puzzle not active)
        if (!DialogueSystem.isDialogueActive() && !VaultPuzzle.isActive()) {
            this.player.update(deltaTime, keys, this.walls);
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
        
        // Update NPC interaction indicators
        this.updateNPCIndicators();
        
        // Check for nearby interactables and update UI hint
        this.updateInteractionHint();
    }

    /**
     * Update NPC interaction indicators based on proximity
     */
    updateNPCIndicators() {
        const playerPos = this.player.getPosition();
        
        this.npcs.forEach(npc => {
            if (npc.canInteract(playerPos.x, playerPos.y)) {
                npc.showInteractionIndicator();
            } else {
                npc.hideInteractionIndicator();
            }
        });
    }

    /**
     * Update the "Press E to Interact" hint based on proximity
     */
    updateInteractionHint() {
        const nearest = this.getNearestObject();
        const hint = document.getElementById('inventory-toggle');
        
        if (hint && nearest) {
            if (nearest.distance < 50) {
                hint.classList.add('near-interactive');
                let typeLabel;
                if (nearest.object.type === 'npc') {
                    typeLabel = nearest.object.id;
                } else if (nearest.object.type === 'vault') {
                    typeLabel = 'Royal Vault';
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
        if (this.player) {
            this.player.cleanup();
        }
        this.npcs.forEach(npc => npc.cleanup());
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.objects = [];
        this.walls = [];
        this.npcs = [];
        this.player = null;
    }
}

// Register level with engine
document.addEventListener('DOMContentLoaded', () => {
    Engine.registerLevel(1, Level1);
});
