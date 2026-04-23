/**
 * Rune Keeper - Level 8: The Core
 * The Final Breach - Incident Response Capstone
 */

class Level8 {
    constructor() {
        this.name = 'The Core';
        this.width = 1024;
        this.height = 768;
        this.objects = [];
        this.walls = [];
        this.player = null;
        this.npcs = [];
        this.hasIntroPlayed = false;
        this.puzzleSolved = false;
        this.breachActive = false;
        
        // Breach timer
        this.breachTime = 180; // 180 seconds
        this.breachTimerInterval = null;
        this.alarmInterval = null;
        
        // Pillar states
        this.pillarStates = {
            password: false,
            phishing: false,
            ids: false,
            mfa: false
        };
        
        // Current active pillar
        this.currentPillar = null;
    }

    init() {
        console.log('[Level8] Initializing The Core...');
        
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        this.container = document.createElement('div');
        this.container.className = 'level-container';
        this.container.id = 'level-8';
        
        // Add glitch styles
        this.addGlitchStyles();
        
        // Create the environment
        this.createFloor();
        this.createWalls();
        this.createAncientCore();
        this.createNPCs();
        this.createPillars();
        this.createBreachTimer();
        this.createPlayer();
        
        viewport.appendChild(this.container);
        
        // Update HUD
        GameState.updateHUD();
        
        // Start alarm effect
        this.startAlarmEffect();
        
        if (!this.hasIntroPlayed && !GameState.isPuzzleCompleted('core_intro')) {
            setTimeout(() => this.playIntro(), 500);
        }
        
        console.log('[Level8] Level initialized');
    }

    addGlitchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes screenShake {
                0%, 100% { transform: translate(0, 0); }
                10% { transform: translate(-2px, 2px); }
                20% { transform: translate(2px, -2px); }
                30% { transform: translate(-2px, -2px); }
                40% { transform: translate(2px, 2px); }
                50% { transform: translate(-1px, 1px); }
                60% { transform: translate(1px, -1px); }
                70% { transform: translate(-1px, -1px); }
                80% { transform: translate(1px, 1px); }
                90% { transform: translate(0, 0); }
            }
            
            @keyframes redPulse {
                0%, 100% { background: rgba(139, 0, 0, 0.1); }
                50% { background: rgba(200, 0, 0, 0.3); }
            }
            
            @keyframes coreGlitch {
                0%, 100% { 
                    transform: translate(0, 0) scale(1);
                    filter: hue-rotate(0deg);
                }
                20% { 
                    transform: translate(2px, -2px) scale(1.02);
                    filter: hue-rotate(90deg);
                }
                40% { 
                    transform: translate(-3px, 1px) scale(0.98);
                    filter: hue-rotate(-90deg);
                }
                60% { 
                    transform: translate(1px, 3px) scale(1.01);
                    filter: hue-rotate(45deg);
                }
                80% { 
                    transform: translate(-2px, -1px) scale(0.99);
                    filter: hue-rotate(-45deg);
                }
            }
            
            @keyframes shardFloat {
                0%, 100% { 
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0.8;
                }
                50% { 
                    transform: translate(5px, -10px) rotate(5deg);
                    opacity: 1;
                }
            }
            
            @keyframes alarmFlash {
                0%, 90%, 100% { opacity: 0; }
                95% { opacity: 0.3; }
            }
            
            @keyframes timerWarning {
                0%, 100% { color: #ff4444; }
                50% { color: #ff8888; }
            }
            
            .screen-shake {
                animation: screenShake 0.5s ease-in-out;
            }
            
            .core-glitch {
                animation: coreGlitch 2s ease-in-out infinite;
            }
            
            .shard-float {
                animation: shardFloat 3s ease-in-out infinite;
            }
            
            .alarm-active {
                animation: alarmFlash 10s ease-in-out infinite;
            }
            
            .timer-warning {
                animation: timerWarning 1s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }

    createFloor() {
        const floor = document.createElement('div');
        floor.id = 'core-floor';
        floor.className = 'floor core-floor';
        floor.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 50% 50%, rgba(139, 0, 0, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 30% 30%, rgba(60, 0, 0, 0.6) 0%, transparent 40%),
                radial-gradient(ellipse at 70% 70%, rgba(80, 0, 0, 0.5) 0%, transparent 35%),
                linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #000000 100%);
            animation: redPulse 3s ease-in-out infinite;
        `;
        
        this.container.appendChild(floor);
    }

    createWalls() {
        // Border walls with obsidian look
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
                background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
                border: 3px solid #3a3a3a;
                box-shadow: 0 0 30px rgba(139, 0, 0, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5);
            `;
            
            this.container.appendChild(wall);
            this.walls.push({ x: config.x, y: config.y, width: config.w, height: config.h });
        });
    }

    createAncientCore() {
        // Ancient Core container
        const coreContainer = document.createElement('div');
        coreContainer.id = 'ancient-core';
        coreContainer.className = 'ancient-object core-glitch';
        coreContainer.style.cssText = `
            position: absolute;
            left: 437px;
            top: 300px;
            width: 150px;
            height: 150px;
            z-index: 10;
        `;
        
        // Main crystal
        const crystal = document.createElement('div');
        crystal.id = 'crystal-main';
        crystal.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, 
                rgba(200, 0, 0, 0.8) 0%, 
                rgba(139, 0, 0, 0.9) 50%,
                rgba(100, 0, 0, 1) 100%);
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            box-shadow: 0 0 60px rgba(255, 0, 0, 0.6), inset 0 0 40px rgba(255, 100, 100, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
            transition: all 1s ease;
        `;
        crystal.textContent = '💎';
        
        // Floating shards
        const shardPositions = [
            { x: -30, y: -20, delay: '0s' },
            { x: 160, y: -10, delay: '0.5s' },
            { x: -20, y: 140, delay: '1s' },
            { x: 150, y: 130, delay: '1.5s' },
            { x: 170, y: 50, delay: '2s' },
            { x: -40, y: 60, delay: '2.5s' },
        ];
        
        shardPositions.forEach((pos, i) => {
            const shard = document.createElement('div');
            shard.className = 'shard-float';
            shard.style.cssText = `
                position: absolute;
                left: ${pos.x}px;
                top: ${pos.y}px;
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, rgba(255, 0, 0, 0.8), rgba(139, 0, 0, 0.9));
                clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                animation-delay: ${pos.delay};
                box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
            `;
            coreContainer.appendChild(shard);
        });
        
        coreContainer.appendChild(crystal);
        this.container.appendChild(coreContainer);
    }

    createNPCs() {
        // The King
        const king = new TheKing(512, 150);
        king.create(this.container);
        this.npcs.push(king);
        
        console.log('[Level8] The King placed');
    }

    createPillars() {
        // Create 4 terminal pillars around the core
        const pillarConfigs = [
            { x: 250, y: 200, type: 'password', label: 'Password', icon: '🔐', color: '#ffd700' },
            { x: 774, y: 200, type: 'phishing', label: 'Phishing', icon: '📜', color: '#00f2ff' },
            { x: 250, y: 500, type: 'ids', label: 'IDS Purge', icon: '🛡', color: '#ff6b35' },
            { x: 774, y: 500, type: 'mfa', label: 'MFA Override', icon: '🔢', color: '#9b59b6' },
        ];
        
        pillarConfigs.forEach((config, i) => {
            const pillarContainer = document.createElement('div');
            pillarContainer.className = 'ancient-object terminal-pillar';
            pillarContainer.id = `pillar-${config.type}`;
            pillarContainer.style.cssText = `
                position: absolute;
                left: ${config.x - 50}px;
                top: ${config.y - 60}px;
                width: 100px;
                height: 120px;
                background: transparent;
                border: none;
                cursor: pointer;
            `;
            
            // Pillar base
            const pillar = document.createElement('div');
            pillar.className = 'pillar-base';
            pillar.style.cssText = `
                width: 80px;
                height: 100px;
                background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
                border: 3px solid ${config.color};
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 20px ${config.color}40;
                transition: all 0.3s ease;
            `;
            
            // Status light
            const status = document.createElement('div');
            status.id = `pillar-status-${config.type}`;
            status.style.cssText = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ff4444;
                margin-bottom: 10px;
                box-shadow: 0 0 10px #ff4444;
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
                font-size: 9px;
                color: #888;
                text-align: center;
                font-family: 'Georgia', serif;
            `;
            label.textContent = config.label;
            
            pillar.appendChild(status);
            pillar.appendChild(icon);
            pillar.appendChild(label);
            pillarContainer.appendChild(pillar);
            
            pillarContainer.dataset.id = `pillar_${config.type}`;
            pillarContainer.dataset.type = `pillar_${config.type}`;
            
            this.container.appendChild(pillarContainer);
            this.objects.push({
                element: pillarContainer,
                id: `pillar_${config.type}`,
                type: `pillar_${config.type}`,
                x: config.x - 50,
                y: config.y - 60,
                width: 100,
                height: 120,
                centerX: config.x,
                centerY: config.y,
                pillarType: config.type,
                pillarElement: pillar,
                statusElement: status
            });
        });
    }

    createBreachTimer() {
        // Create breach timer display
        const timerContainer = document.createElement('div');
        timerContainer.id = 'breach-timer';
        timerContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ff4444;
            border-radius: 10px;
            padding: 15px 30px;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
        `;
        
        const title = document.createElement('div');
        title.style.cssText = `
            color: #ff4444;
            font-size: 14px;
            margin-bottom: 5px;
            font-family: 'Georgia', serif;
        `;
        title.textContent = '⚠ BREACH TIMER';
        
        const time = document.createElement('div');
        time.id = 'breach-time-display';
        time.style.cssText = `
            color: #ff4444;
            font-size: 32px;
            font-weight: bold;
            font-family: monospace;
        `;
        time.textContent = '03:00';
        
        timerContainer.appendChild(title);
        timerContainer.appendChild(time);
        document.body.appendChild(timerContainer);
    }

    startBreachTimer() {
        this.breachActive = true;
        
        this.breachTimerInterval = setInterval(() => {
            this.breachTime--;
            
            // Update display
            const display = document.getElementById('breach-time-display');
            if (display) {
                const minutes = Math.floor(this.breachTime / 60);
                const seconds = this.breachTime % 60;
                display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                // Warning at 30 seconds
                if (this.breachTime <= 30) {
                    display.classList.add('timer-warning');
                }
            }
            
            // Trigger screen shake every 10 seconds
            if (this.breachTime % 10 === 0 && this.breachTime > 0) {
                this.triggerScreenShake();
            }
            
            // Game over
            if (this.breachTime <= 0) {
                this.triggerGameOver();
            }
        }, 1000);
    }

    startAlarmEffect() {
        // Add alarm flash overlay
        const alarm = document.createElement('div');
        alarm.id = 'alarm-overlay';
        alarm.className = 'alarm-active';
        alarm.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, rgba(255, 0, 0, 0.2) 0%, transparent 20%, transparent 80%, rgba(255, 0, 0, 0.2) 100%);
            pointer-events: none;
            z-index: 999;
        `;
        document.body.appendChild(alarm);
    }

    triggerScreenShake() {
        this.container.classList.add('screen-shake');
        setTimeout(() => {
            this.container.classList.remove('screen-shake');
        }, 500);
    }

    triggerGameOver() {
        clearInterval(this.breachTimerInterval);
        clearInterval(this.alarmInterval);
        
        // Create game over screen
        const gameOver = document.createElement('div');
        gameOver.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const text = document.createElement('div');
        text.style.cssText = `
            color: #ff4444;
            font-size: 48px;
            font-family: 'Georgia', serif;
            margin-bottom: 20px;
            text-align: center;
        `;
        text.textContent = 'System Deleted.';
        
        const subtext = document.createElement('div');
        subtext.style.cssText = `
            color: #666;
            font-size: 24px;
            margin-bottom: 40px;
            text-align: center;
        `;
        subtext.textContent = 'History Rewritten.';
        
        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Restart Level';
        restartBtn.style.cssText = `
            background: transparent;
            border: 2px solid #ff4444;
            color: #ff4444;
            padding: 15px 40px;
            font-size: 18px;
            cursor: pointer;
            font-family: 'Georgia', serif;
            transition: all 0.3s ease;
        `;
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
        restartBtn.addEventListener('mouseenter', () => {
            restartBtn.style.background = 'rgba(255, 68, 68, 0.2)';
        });
        restartBtn.addEventListener('mouseleave', () => {
            restartBtn.style.background = 'transparent';
        });
        
        gameOver.appendChild(text);
        gameOver.appendChild(subtext);
        gameOver.appendChild(restartBtn);
        document.body.appendChild(gameOver);
    }

    playIntro() {
        this.hasIntroPlayed = true;
        GameState.completePuzzle('core_intro');
        
        DialogueSystem.show(
            'Warden! The Shadow-Scribe has bypassed the outer wards! The system is in a state of \'Total Breach.\' We don\'t have time to build new walls—you must patch the holes as they appear! Move fast, or our history is deleted!',
            'The King',
            () => {
                // Start the breach timer after intro
                this.startBreachTimer();
            }
        );
    }

    // Pillar 1: Password Patch - Drag 3 glyphs
    startPasswordPuzzle() {
        if (this.pillarStates.password) {
            DialogueSystem.show('Password Pillar already stabilized.', 'System');
            return;
        }
        
        if (this.currentPillar) return;
        this.currentPillar = 'password';
        
        const overlay = document.createElement('div');
        overlay.id = 'password-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const timer = document.createElement('div');
        timer.id = 'password-timer';
        timer.style.cssText = `
            color: #ff4444;
            font-size: 24px;
            margin-bottom: 20px;
        `;
        timer.textContent = '10';
        
        const title = document.createElement('div');
        title.style.cssText = `
            color: #ffd700;
            font-size: 24px;
            margin-bottom: 20px;
        `;
        title.textContent = '🔐 Password Patch: Drag glyphs to the seal!';
        
        // Seal (drop zone)
        const seal = document.createElement('div');
        seal.id = 'password-seal';
        seal.style.cssText = `
            width: 200px;
            height: 80px;
            border: 3px dashed #ffd700;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            background: rgba(255, 215, 0, 0.1);
        `;
        seal.innerHTML = '<span style="color: #ffd700; opacity: 0.5;">Drop 3 glyphs here</span>';
        
        // Glyphs container
        const glyphsContainer = document.createElement('div');
        glyphsContainer.style.cssText = `
            display: flex;
            gap: 20px;
        `;
        
        const glyphs = ['ᚠ', 'ᚢ', 'ᚦ'];
        let draggedGlyph = null;
        let placedCount = 0;
        
        glyphs.forEach((glyph, i) => {
            const glyphDiv = document.createElement('div');
            glyphDiv.className = 'draggable-glyph';
            glyphDiv.draggable = true;
            glyphDiv.style.cssText = `
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #ffd700, #ffaa00);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: #000;
                cursor: grab;
                user-select: none;
            `;
            glyphDiv.textContent = glyph;
            
            glyphDiv.addEventListener('dragstart', (e) => {
                draggedGlyph = glyphDiv;
                glyphDiv.style.opacity = '0.5';
            });
            
            glyphDiv.addEventListener('dragend', () => {
                glyphDiv.style.opacity = '1';
            });
            
            glyphsContainer.appendChild(glyphDiv);
        });
        
        // Drop zone events
        seal.addEventListener('dragover', (e) => {
            e.preventDefault();
            seal.style.background = 'rgba(255, 215, 0, 0.3)';
        });
        
        seal.addEventListener('dragleave', () => {
            seal.style.background = 'rgba(255, 215, 0, 0.1)';
        });
        
        seal.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedGlyph && !draggedGlyph.classList.contains('placed')) {
                draggedGlyph.classList.add('placed');
                draggedGlyph.style.position = 'absolute';
                draggedGlyph.style.left = `${20 + placedCount * 60}px`;
                draggedGlyph.style.top = '10px';
                seal.appendChild(draggedGlyph);
                placedCount++;
                
                if (placedCount === 3) {
                    clearInterval(puzzleTimer);
                    setTimeout(() => {
                        overlay.remove();
                        this.completePillar('password');
                    }, 500);
                }
            }
            seal.style.background = 'rgba(255, 215, 0, 0.1)';
        });
        
        overlay.appendChild(timer);
        overlay.appendChild(title);
        overlay.appendChild(seal);
        overlay.appendChild(glyphsContainer);
        document.body.appendChild(overlay);
        
        // 10 second timer
        let timeLeft = 10;
        const puzzleTimer = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(puzzleTimer);
                overlay.remove();
                this.currentPillar = null;
                DialogueSystem.show('Password Patch failed! Try again.', 'System');
            }
        }, 1000);
    }

    // Pillar 2: Phishing Filter - Identify authentic
    startPhishingPuzzle() {
        if (this.pillarStates.phishing) {
            DialogueSystem.show('Phishing Filter already stabilized.', 'System');
            return;
        }
        
        if (this.currentPillar) return;
        this.currentPillar = 'phishing';
        
        const overlay = document.createElement('div');
        overlay.id = 'phishing-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
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
        `;
        title.textContent = '📜 Phishing Filter: Identify the authentic scroll!';
        
        const instruction = document.createElement('div');
        instruction.style.cssText = `
            color: #888;
            font-size: 14px;
            margin-bottom: 30px;
            text-align: center;
        `;
        instruction.textContent = 'One is genuine. One is a forgery. Click the authentic scroll.';
        
        const scrollsContainer = document.createElement('div');
        scrollsContainer.style.cssText = `
            display: flex;
            gap: 50px;
        `;
        
        // Create two scrolls - one authentic, one fake
        const isLeftAuthentic = Math.random() < 0.5;
        
        const createScroll = (isAuthentic, isLeft) => {
            const scroll = document.createElement('div');
            scroll.style.cssText = `
                width: 150px;
                height: 200px;
                background: linear-gradient(180deg, ${isAuthentic ? '#f5f5dc' : '#e8e8d0'} 0%, ${isAuthentic ? '#f0e68c' : '#d4d4a0'} 100%);
                border: 3px solid ${isAuthentic ? '#8b4513' : '#a0522d'};
                border-radius: 5px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                padding: 15px;
                transition: all 0.3s ease;
                position: relative;
            `;
            
            // Visual differences
            const seal = document.createElement('div');
            seal.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${isAuthentic ? '#ffd700' : '#daa520'};
                border: 2px solid ${isAuthentic ? '#b8860b' : '#8b6914'};
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            `;
            seal.textContent = isAuthentic ? '✓' : '?';
            
            const text = document.createElement('div');
            text.style.cssText = `
                font-size: 10px;
                color: #333;
                text-align: center;
                font-family: 'Georgia', serif;
            `;
            text.innerHTML = isAuthentic 
                ? 'Royal Decree<br><span style="color: #006400;">Verified</span>'
                : 'Royal Decree<br><span style="color: #8b0000;">Urgent!</span>';
            
            scroll.appendChild(seal);
            scroll.appendChild(text);
            
            scroll.addEventListener('mouseenter', () => {
                scroll.style.transform = 'scale(1.05)';
                scroll.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
            });
            
            scroll.addEventListener('mouseleave', () => {
                scroll.style.transform = 'scale(1)';
                scroll.style.boxShadow = 'none';
            });
            
            scroll.addEventListener('click', () => {
                if (isAuthentic) {
                    overlay.remove();
                    this.completePillar('phishing');
                } else {
                    scroll.style.borderColor = '#ff4444';
                    scroll.style.animation = 'shake 0.5s ease';
                    setTimeout(() => {
                        DialogueSystem.show('That was a forgery! Look for the verified seal.', 'System');
                    }, 500);
                }
            });
            
            return scroll;
        };
        
        const leftScroll = createScroll(isLeftAuthentic, true);
        const rightScroll = createScroll(!isLeftAuthentic, false);
        
        scrollsContainer.appendChild(leftScroll);
        scrollsContainer.appendChild(rightScroll);
        
        overlay.appendChild(title);
        overlay.appendChild(instruction);
        overlay.appendChild(scrollsContainer);
        document.body.appendChild(overlay);
    }

    // Pillar 3: IDS Purge - Click 5 red runes
    startIDSPuzzle() {
        if (this.pillarStates.ids) {
            DialogueSystem.show('IDS Purge already stabilized.', 'System');
            return;
        }
        
        if (this.currentPillar) return;
        this.currentPillar = 'ids';
        
        const overlay = document.createElement('div');
        overlay.id = 'ids-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const timer = document.createElement('div');
        timer.id = 'ids-timer';
        timer.style.cssText = `
            color: #ff4444;
            font-size: 24px;
            margin-bottom: 20px;
        `;
        timer.textContent = '15';
        
        const title = document.createElement('div');
        title.style.cssText = `
            color: #ff6b35;
            font-size: 24px;
            margin-bottom: 10px;
        `;
        title.textContent = '🛡 IDS Purge: Click 5 corrupted (RED) runes!';
        
        const progress = document.createElement('div');
        progress.id = 'ids-progress';
        progress.style.cssText = `
            color: #ff6b35;
            font-size: 18px;
            margin-bottom: 20px;
        `;
        progress.textContent = 'Purged: 0/5';
        
        const pool = document.createElement('div');
        pool.style.cssText = `
            width: 400px;
            height: 300px;
            background: radial-gradient(ellipse, rgba(0, 50, 100, 0.3) 0%, rgba(0, 20, 40, 0.8) 100%);
            border: 3px solid #00f2ff;
            border-radius: 50%;
            position: relative;
            overflow: hidden;
        `;
        
        let purgedCount = 0;
        const runes = [];
        const runeChars = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚹ', 'ᚺ', 'ᛟ', 'ᛊ'];
        
        // Spawn runes
        const spawnRune = () => {
            const rune = document.createElement('div');
            const isCorrupted = Math.random() < 0.3; // 30% chance of corrupted
            const char = runeChars[Math.floor(Math.random() * runeChars.length)];
            
            rune.style.cssText = `
                position: absolute;
                font-size: 24px;
                cursor: pointer;
                user-select: none;
                transition: transform 0.2s ease;
                left: ${Math.random() * 350}px;
                top: ${Math.random() * 250}px;
            `;
            rune.textContent = char;
            
            if (isCorrupted) {
                rune.style.color = '#ff4444';
                rune.style.textShadow = '0 0 10px #ff4444';
                rune.dataset.corrupted = 'true';
            } else {
                rune.style.color = '#00f2ff';
                rune.style.textShadow = '0 0 5px #00f2ff';
                rune.dataset.corrupted = 'false';
            }
            
            rune.addEventListener('mouseenter', () => {
                rune.style.transform = 'scale(1.3)';
            });
            
            rune.addEventListener('mouseleave', () => {
                rune.style.transform = 'scale(1)';
            });
            
            rune.addEventListener('click', () => {
                if (rune.dataset.corrupted === 'true' && !rune.classList.contains('purged')) {
                    rune.classList.add('purged');
                    rune.style.transform = 'scale(0)';
                    rune.style.opacity = '0';
                    purgedCount++;
                    progress.textContent = `Purged: ${purgedCount}/5`;
                    
                    if (purgedCount >= 5) {
                        clearInterval(puzzleTimer);
                        clearInterval(spawnInterval);
                        setTimeout(() => {
                            overlay.remove();
                            this.completePillar('ids');
                        }, 500);
                    }
                }
            });
            
            pool.appendChild(rune);
            runes.push(rune);
            
            // Remove old runes
            if (runes.length > 15) {
                const old = runes.shift();
                if (old.parentNode) old.parentNode.removeChild(old);
            }
        };
        
        // Initial spawn
        for (let i = 0; i < 8; i++) spawnRune();
        
        // Continuous spawn
        const spawnInterval = setInterval(spawnRune, 800);
        
        overlay.appendChild(timer);
        overlay.appendChild(title);
        overlay.appendChild(progress);
        overlay.appendChild(pool);
        document.body.appendChild(overlay);
        
        // 15 second timer
        let timeLeft = 15;
        const puzzleTimer = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(puzzleTimer);
                clearInterval(spawnInterval);
                overlay.remove();
                this.currentPillar = null;
                DialogueSystem.show('IDS Purge failed! Try again.', 'System');
            }
        }, 1000);
    }

    // Pillar 4: MFA Override - Type 4-digit code
    startMFAPuzzle() {
        if (this.pillarStates.mfa) {
            DialogueSystem.show('MFA Override already stabilized.', 'System');
            return;
        }
        
        if (this.currentPillar) return;
        this.currentPillar = 'mfa';
        
        const overlay = document.createElement('div');
        overlay.id = 'mfa-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        // Generate random 4-digit code
        const code = String(Math.floor(1000 + Math.random() * 9000));
        
        const title = document.createElement('div');
        title.style.cssText = `
            color: #9b59b6;
            font-size: 24px;
            margin-bottom: 20px;
        `;
        title.textContent = '🔢 MFA Override: Enter the security code!';
        
        const codeDisplay = document.createElement('div');
        codeDisplay.style.cssText = `
            color: #00f2ff;
            font-size: 48px;
            font-family: monospace;
            margin-bottom: 30px;
            padding: 20px 40px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #00f2ff;
            border-radius: 10px;
            letter-spacing: 10px;
        `;
        codeDisplay.textContent = code;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 4;
        input.style.cssText = `
            font-size: 36px;
            width: 200px;
            text-align: center;
            padding: 10px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #9b59b6;
            color: #fff;
            border-radius: 5px;
            font-family: monospace;
            letter-spacing: 5px;
        `;
        input.placeholder = '----';
        
        const status = document.createElement('div');
        status.id = 'mfa-status';
        status.style.cssText = `
            color: #888;
            font-size: 14px;
            margin-top: 20px;
            height: 20px;
        `;
        status.textContent = 'Type the 4-digit code above';
        
        input.addEventListener('input', (e) => {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            if (e.target.value === code) {
                status.textContent = '✓ Code accepted!';
                status.style.color = '#00ff00';
                setTimeout(() => {
                    overlay.remove();
                    this.completePillar('mfa');
                }, 500);
            } else if (e.target.value.length === 4) {
                status.textContent = '✗ Incorrect code. Try again.';
                status.style.color = '#ff4444';
                setTimeout(() => {
                    e.target.value = '';
                    status.textContent = 'Type the 4-digit code above';
                    status.style.color = '#888';
                }, 1000);
            }
        });
        
        overlay.appendChild(title);
        overlay.appendChild(codeDisplay);
        overlay.appendChild(input);
        overlay.appendChild(status);
        document.body.appendChild(overlay);
        
        // Focus input
        setTimeout(() => input.focus(), 100);
    }

    completePillar(type) {
        this.pillarStates[type] = true;
        this.currentPillar = null;
        
        // Update pillar visual
        const pillar = this.objects.find(obj => obj.pillarType === type);
        if (pillar) {
            pillar.statusElement.style.background = '#00ff00';
            pillar.statusElement.style.boxShadow = '0 0 10px #00ff00';
            pillar.pillarElement.style.borderColor = '#00ff00';
            pillar.pillarElement.style.boxShadow = '0 0 30px #00ff0040';
        }
        
        DialogueSystem.show(`${type.toUpperCase()} Pillar stabilized!`, 'System');
        
        // Check if all pillars complete
        this.checkAllPillars();
    }

    checkAllPillars() {
        const allComplete = Object.values(this.pillarStates).every(v => v);
        
        if (allComplete) {
            this.completeBreach();
        }
    }

    completeBreach() {
        this.puzzleSolved = true;
        GameState.completePuzzle('final_breach');
        GameState.addSecurityScore(1000);
        
        // Stop timer
        clearInterval(this.breachTimerInterval);
        
        // Transform core
        const crystal = document.getElementById('crystal-main');
        const coreContainer = document.getElementById('ancient-core');
        
        if (crystal) {
            crystal.style.background = 'linear-gradient(135deg, rgba(0, 242, 255, 0.8), rgba(0, 200, 255, 0.9), rgba(0, 180, 255, 1))';
            crystal.style.boxShadow = '0 0 80px rgba(0, 242, 255, 0.8), inset 0 0 50px rgba(0, 242, 255, 0.4)';
        }
        
        if (coreContainer) {
            coreContainer.classList.remove('core-glitch');
        }
        
        // Stop alarm
        const alarm = document.getElementById('alarm-overlay');
        if (alarm) alarm.remove();
        
        // Hide timer
        const timer = document.getElementById('breach-timer');
        if (timer) timer.remove();
        
        // Floor returns to normal
        const floor = document.getElementById('core-floor');
        if (floor) {
            floor.style.animation = 'none';
            floor.style.background = `
                radial-gradient(ellipse at 50% 50%, rgba(0, 242, 255, 0.3) 0%, transparent 50%),
                linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #000000 100%)
            `;
        }
        
        setTimeout(() => {
            DialogueSystem.show(
                'Outstanding work, Warden! The breach is contained. The Core is stabilized!',
                'The King',
                () => {
                    // Add Master Cipher
                    if (typeof GameState !== 'undefined' && GameState.addToInventory) {
                        GameState.addToInventory({
                            id: 'master_cipher',
                            name: 'Master Cipher',
                            description: 'The ultimate decryption key, earned by stopping the Final Breach',
                            icon: '🗝'
                        });
                    }
                    
                    setTimeout(() => {
                        this.triggerGrandFinale();
                    }, 1000);
                }
            );
        }, 1500);
    }

    triggerGrandFinale() {
        // Calculate rank based on score
        let rank = 'Novice';
        let rankIcon = '🌱';
        if (GameState.securityScore >= 500) { rank = 'Apprentice'; rankIcon = '📜'; }
        if (GameState.securityScore >= 1000) { rank = 'Warden'; rankIcon = '🛡️'; }
        if (GameState.securityScore >= 1500) { rank = 'Guardian'; rankIcon = '⚔️'; }
        if (GameState.securityScore >= 2000) { rank = 'Master Cipher Keeper'; rankIcon = '👑'; }
        
        // Count collected artifacts
        const artifactCount = GameState.inventory.length;
        
        // Grand finale cutscene
        const finale = document.createElement('div');
        finale.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #000 0%, #001a33 30%, #0a2a4a 50%, #001a33 70%, #000 100%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const title = document.createElement('div');
        title.style.cssText = `
            color: #ffd700;
            font-size: 52px;
            font-family: 'Georgia', serif;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
            animation: victoryPulse 2s ease-in-out infinite;
        `;
        title.innerHTML = '🏆 VICTORY! 🏆';
        
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            color: #00f2ff;
            font-size: 28px;
            font-family: 'Georgia', serif;
            margin-bottom: 30px;
            text-align: center;
        `;
        subtitle.textContent = 'The Shadow-Scribe is Defeated!';
        
        // Stats container
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid var(--sandstone);
            border-radius: 15px;
            padding: 30px 50px;
            margin-bottom: 30px;
            text-align: center;
        `;
        
        statsContainer.innerHTML = `
            <div style="margin-bottom: 20px;">
                <span style="color: #888; font-size: 14px;">FINAL SCORE</span><br>
                <span style="color: #ffd700; font-size: 48px; font-weight: bold;">${GameState.securityScore}</span>
            </div>
            <div style="margin-bottom: 20px;">
                <span style="color: #888; font-size: 14px;">ARTIFACTS COLLECTED</span><br>
                <span style="color: #00f2ff; font-size: 32px;">${artifactCount}/8</span>
            </div>
            <div>
                <span style="color: #888; font-size: 14px;">RANK ACHIEVED</span><br>
                <span style="color: #ffd700; font-size: 36px;">${rankIcon} ${rank}</span>
            </div>
        `;
        
        const message = document.createElement('div');
        message.style.cssText = `
            color: #aaa;
            font-size: 18px;
            text-align: center;
            max-width: 700px;
            line-height: 1.8;
            margin-bottom: 30px;
        `;
        message.innerHTML = `
            You have mastered all the secrets of cybersecurity and protected the realm!<br>
            <span style="color: #666; font-size: 14px;">
            Password Security • Phishing Detection • Encryption • Intrusion Detection<br>
            MITM Protection • Social Engineering • Multi-Factor Authentication • Incident Response
            </span>
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 20px;
        `;
        
        const playAgain = document.createElement('button');
        playAgain.textContent = '🎮 Play Again';
        playAgain.style.cssText = `
            background: transparent;
            border: 2px solid #00f2ff;
            color: #00f2ff;
            padding: 15px 40px;
            font-size: 18px;
            cursor: pointer;
            font-family: 'Georgia', serif;
            transition: all 0.3s ease;
            border-radius: 5px;
        `;
        playAgain.addEventListener('mouseenter', () => {
            playAgain.style.background = 'rgba(0, 242, 255, 0.2)';
        });
        playAgain.addEventListener('mouseleave', () => {
            playAgain.style.background = 'transparent';
        });
        playAgain.addEventListener('click', () => {
            location.reload();
        });
        
        const viewChronicle = document.createElement('button');
        viewChronicle.textContent = '📜 View Chronicle';
        viewChronicle.style.cssText = `
            background: transparent;
            border: 2px solid #ffd700;
            color: #ffd700;
            padding: 15px 40px;
            font-size: 18px;
            cursor: pointer;
            font-family: 'Georgia', serif;
            transition: all 0.3s ease;
            border-radius: 5px;
        `;
        viewChronicle.addEventListener('mouseenter', () => {
            viewChronicle.style.background = 'rgba(255, 215, 0, 0.2)';
        });
        viewChronicle.addEventListener('mouseleave', () => {
            viewChronicle.style.background = 'transparent';
        });
        viewChronicle.addEventListener('click', () => {
            Engine.toggleChronicle();
        });
        
        buttonContainer.appendChild(playAgain);
        buttonContainer.appendChild(viewChronicle);
        
        finale.appendChild(title);
        finale.appendChild(subtitle);
        finale.appendChild(statsContainer);
        finale.appendChild(message);
        finale.appendChild(buttonContainer);
        document.body.appendChild(finale);
        
        // Add victory animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes victoryPulse {
                0%, 100% { transform: scale(1); text-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
                50% { transform: scale(1.05); text-shadow: 0 0 60px rgba(255, 215, 0, 0.8); }
            }
        `;
        document.head.appendChild(style);
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
            case 'pillar_password':
                GameState.isDialogueActive = false;
                this.startPasswordPuzzle();
                break;
            case 'pillar_phishing':
                GameState.isDialogueActive = false;
                this.startPhishingPuzzle();
                break;
            case 'pillar_ids':
                GameState.isDialogueActive = false;
                this.startIDSPuzzle();
                break;
            case 'pillar_mfa':
                GameState.isDialogueActive = false;
                this.startMFAPuzzle();
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
                } else if (nearest.object.type && nearest.object.type.startsWith('pillar_')) {
                    const type = nearest.object.type.replace('pillar_', '');
                    typeLabel = `${type.charAt(0).toUpperCase() + type.slice(1)} Pillar`;
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
        console.log('[Level8] Cleaning up...');
        if (this.breachTimerInterval) {
            clearInterval(this.breachTimerInterval);
        }
        if (this.alarmInterval) {
            clearInterval(this.alarmInterval);
        }
        
        // Remove overlays
        const alarm = document.getElementById('alarm-overlay');
        if (alarm) alarm.remove();
        const timer = document.getElementById('breach-timer');
        if (timer) timer.remove();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Register the level
Engine.registerLevel(8, Level8);
