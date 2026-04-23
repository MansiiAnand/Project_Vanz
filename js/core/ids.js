/**
 * Rune Keeper - IDS (Intrusion Detection System) Puzzle (Phase 8)
 * Sentinel's Eye - Monitor Scrying Pool and purge corrupted runes
 */

const IDSPuzzle = {
    _isActive: false,
    container: null,
    gameArea: null,
    runes: [],
    columns: 3,
    score: 0,
    targetScore: 15,
    health: 100,
    spawnRate: 1500, // ms between spawns
    lastSpawn: 0,
    gameLoopId: null,
    onComplete: null,
    
    // Rune set
    runeSet: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚹ', 'ᚺ', 'ᛟ', 'ᛊ', 'ᛒ', 'ᛖ'],
    
    /**
     * Initialize the puzzle
     */
    init() {
        this.createPuzzleUI();
        this.addStyles();
        console.log('[IDSPuzzle] Initialized');
    },

    /**
     * Add required CSS styles
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes runeFall {
                from { transform: translateY(-50px); }
                to { transform: translateY(620px); }
            }
            
            @keyframes corruptedJitter {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                25% { transform: translateX(-3px) rotate(-2deg); }
                50% { transform: translateX(3px) rotate(2deg); }
                75% { transform: translateX(-2px) rotate(-1deg); }
            }
            
            @keyframes corruptedGlow {
                0%, 100% { text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000; }
                50% { text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 60px #ff0000; }
            }
            
            @keyframes normalGlow {
                0%, 100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
                50% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
            }
            
            @keyframes shatter {
                0% { 
                    transform: scale(1);
                    opacity: 1;
                }
                100% { 
                    transform: scale(0) rotate(180deg);
                    opacity: 0;
                }
            }
            
            @keyframes particleBurst {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--tx), var(--ty)) scale(0);
                    opacity: 0;
                }
            }
            
            @keyframes meterPulse {
                0%, 100% { box-shadow: 0 0 10px currentColor; }
                50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
            }
            
            @keyframes poolCalm {
                0%, 100% { 
                    background: radial-gradient(circle, 
                        rgba(0, 200, 255, 0.4) 0%, 
                        rgba(0, 150, 200, 0.3) 40%,
                        rgba(0, 100, 150, 0.4) 70%,
                        rgba(0, 50, 100, 0.6) 100%);
                }
                50% { 
                    background: radial-gradient(circle, 
                        rgba(0, 220, 255, 0.5) 0%, 
                        rgba(0, 170, 220, 0.4) 40%,
                        rgba(0, 120, 170, 0.5) 70%,
                        rgba(0, 70, 120, 0.7) 100%);
                }
            }
            
            .corrupted-rune {
                color: #ff3333 !important;
                animation: corruptedJitter 0.3s infinite, corruptedGlow 0.5s infinite !important;
                font-weight: bold;
            }
            
            .normal-rune {
                color: #e0e0e0 !important;
                animation: normalGlow 3s ease-in-out infinite !important;
            }
            
            .rune-particle {
                position: absolute;
                width: 6px;
                height: 6px;
                background: #ff4444;
                border-radius: 50%;
                pointer-events: none;
                animation: particleBurst 0.6s ease-out forwards;
            }
            
            .detection-bar {
                transition: width 0.3s ease, background-color 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Create the puzzle UI
     */
    createPuzzleUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'ids-puzzle';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(10, 10, 20, 0.98) 0%, rgba(20, 15, 30, 0.98) 100%);
            z-index: 2000;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 40px;
            pointer-events: auto;
        `;

        // Title
        const title = document.createElement('div');
        title.style.cssText = `
            color: #00f2ff;
            font-size: 32px;
            font-family: 'Georgia', serif;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
        `;
        title.textContent = '◈ The Sentinel\'s Eye';

        // Subtitle
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            color: #888;
            font-size: 14px;
            margin-bottom: 20px;
            text-align: center;
        `;
        subtitle.innerHTML = 'Click the <span style="color: #ff4444;">RED CORRUPTED</span> runes before they reach the bottom!<br>Avoid clicking normal (white) runes.';

        // Score and Health display
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            display: flex;
            gap: 40px;
            margin-bottom: 20px;
        `;

        // Purged counter
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.style.cssText = `
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #00f2ff;
            border-radius: 10px;
            padding: 15px 25px;
            text-align: center;
        `;
        this.scoreDisplay.innerHTML = `
            <div style="color: #888; font-size: 12px; margin-bottom: 5px;">CORRUPTION PURGED</div>
            <div id="purge-count" style="color: #00f2ff; font-size: 28px; font-weight: bold;">0 / 15</div>
        `;

        // Detection meter
        const meterContainer = document.createElement('div');
        meterContainer.style.cssText = `
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #444;
            border-radius: 10px;
            padding: 15px 25px;
            text-align: center;
            min-width: 200px;
        `;
        meterContainer.innerHTML = `
            <div style="color: #888; font-size: 12px; margin-bottom: 8px;">SYSTEM INTEGRITY</div>
            <div style="width: 100%; height: 20px; background: #222; border-radius: 10px; overflow: hidden;">
                <div id="detection-bar" class="detection-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #ff3333, #ff6666); border-radius: 10px;"></div>
            </div>
        `;

        statsContainer.appendChild(this.scoreDisplay);
        statsContainer.appendChild(meterContainer);

        // Game area (the scrying pool)
        this.gameArea = document.createElement('div');
        this.gameArea.id = 'scrying-pool-game';
        this.gameArea.style.cssText = `
            width: 400px;
            height: 600px;
            background: radial-gradient(circle, 
                rgba(0, 200, 255, 0.2) 0%, 
                rgba(0, 100, 150, 0.15) 40%,
                rgba(0, 50, 100, 0.2) 70%,
                rgba(0, 30, 60, 0.3) 100%);
            border: 4px solid rgba(0, 200, 255, 0.4);
            border-radius: 50%;
            position: relative;
            overflow: hidden;
            box-shadow: 
                0 0 60px rgba(0, 200, 255, 0.3),
                inset 0 0 40px rgba(0, 200, 255, 0.1);
        `;

        // Column indicators
        for (let i = 0; i < this.columns; i++) {
            const columnLine = document.createElement('div');
            columnLine.style.cssText = `
                position: absolute;
                left: ${(i + 0.5) * (400 / this.columns)}px;
                top: 0;
                width: 2px;
                height: 100%;
                background: linear-gradient(180deg, 
                    transparent 0%,
                    rgba(0, 200, 255, 0.2) 20%,
                    rgba(0, 200, 255, 0.2) 80%,
                    transparent 100%);
                pointer-events: none;
            `;
            this.gameArea.appendChild(columnLine);
        }

        // Bottom warning line
        const dangerLine = document.createElement('div');
        dangerLine.style.cssText = `
            position: absolute;
            bottom: 50px;
            left: 10%;
            width: 80%;
            height: 3px;
            background: linear-gradient(90deg, transparent, #ff4444, transparent);
            opacity: 0.6;
            pointer-events: none;
        `;
        dangerLine.innerHTML = `
            <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); color: #ff4444; font-size: 10px;">DANGER ZONE</span>
        `;
        this.gameArea.appendChild(dangerLine);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: 2px solid #00f2ff;
            color: #00f2ff;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.3s ease;
        `;
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.close());
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(0, 242, 255, 0.2)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'transparent';
        });

        // Assemble
        this.container.appendChild(closeBtn);
        this.container.appendChild(title);
        this.container.appendChild(subtitle);
        this.container.appendChild(statsContainer);
        this.container.appendChild(this.gameArea);

        document.body.appendChild(this.container);
    },

    /**
     * Spawn a new rune
     */
    spawnRune() {
        const column = Math.floor(Math.random() * this.columns);
        const isCorrupted = Math.random() < 0.4; // 40% chance of corrupted
        const runeChar = this.runeSet[Math.floor(Math.random() * this.runeSet.length)];
        
        const rune = document.createElement('div');
        rune.className = isCorrupted ? 'corrupted-rune' : 'normal-rune';
        rune.textContent = runeChar;
        rune.dataset.corrupted = isCorrupted;
        
        // Random speed for corrupted runes (faster and erratic)
        const baseSpeed = 3000 + Math.random() * 2000; // 3-5 seconds
        const speed = isCorrupted ? baseSpeed * 0.7 : baseSpeed;
        
        rune.style.cssText = `
            position: absolute;
            left: ${(column * (400 / this.columns)) + (400 / this.columns / 2) - 15}px;
            top: -50px;
            font-size: 30px;
            cursor: ${isCorrupted ? 'crosshair' : 'default'};
            user-select: none;
            animation: runeFall ${speed}ms linear forwards;
            pointer-events: auto;
            z-index: 10;
        `;
        
        // Click handler
        rune.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clickRune(rune, isCorrupted, e.clientX, e.clientY);
        });
        
        // Animation end handler (reached bottom)
        rune.addEventListener('animationend', () => {
            if (rune.parentNode) {
                if (isCorrupted) {
                    // Corrupted rune reached bottom - damage!
                    this.damageSystem();
                }
                rune.remove();
                this.runes = this.runes.filter(r => r !== rune);
            }
        });
        
        this.gameArea.appendChild(rune);
        this.runes.push(rune);
    },

    /**
     * Handle rune click
     */
    clickRune(rune, isCorrupted, x, y) {
        if (isCorrupted) {
            // Successfully purged corruption!
            this.score++;
            this.updateScoreDisplay();
            this.createShatterEffect(x, y);
            
            // Remove the rune
            rune.remove();
            this.runes = this.runes.filter(r => r !== rune);
            
            // Check win condition
            if (this.score >= this.targetScore) {
                this.completePuzzle();
            }
        } else {
            // Clicked normal rune - penalty!
            this.damageSystem(15);
            
            // Visual feedback for wrong click
            rune.style.transform = 'scale(1.3)';
            rune.style.color = '#ffff00';
            setTimeout(() => {
                if (rune.parentNode) {
                    rune.style.transform = 'scale(1)';
                    rune.style.color = '';
                }
            }, 200);
        }
    },

    /**
     * Create shatter particle effect
     */
    createShatterEffect(x, y) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'rune-particle';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            // Random color for particles (red shades)
            const red = 255;
            const green = Math.floor(Math.random() * 100);
            const blue = Math.floor(Math.random() * 100);
            particle.style.background = `rgb(${red}, ${green}, ${blue})`;
            
            document.body.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => particle.remove(), 600);
        }
    },

    /**
     * Damage the system (corrupted rune reached bottom)
     */
    damageSystem(amount = 20) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthDisplay();
        
        // Screen flash red
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.3);
            pointer-events: none;
            z-index: 3000;
            animation: fadeOut 0.3s ease forwards;
        `;
        this.container.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
        
        // Check game over
        if (this.health <= 0) {
            this.gameOver();
        }
    },

    /**
     * Update score display
     */
    updateScoreDisplay() {
        const countEl = document.getElementById('purge-count');
        if (countEl) {
            countEl.textContent = `${this.score} / ${this.targetScore}`;
        }
    },

    /**
     * Update health display
     */
    updateHealthDisplay() {
        const bar = document.getElementById('detection-bar');
        if (bar) {
            bar.style.width = this.health + '%';
            
            // Change color based on health
            if (this.health > 60) {
                bar.style.background = 'linear-gradient(90deg, #00f2ff, #00ffff)';
                bar.style.animation = 'meterPulse 2s infinite';
            } else if (this.health > 30) {
                bar.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc00)';
                bar.style.animation = 'meterPulse 1s infinite';
            } else {
                bar.style.background = 'linear-gradient(90deg, #ff3333, #ff6666)';
                bar.style.animation = 'meterPulse 0.5s infinite';
            }
        }
    },

    /**
     * Game over - too much corruption
     */
    gameOver() {
        this.stopGameLoop();
        
        // Clear all runes
        this.runes.forEach(r => r.remove());
        this.runes = [];
        
        // Show game over message
        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 3px solid #ff4444;
            border-radius: 15px;
            padding: 30px 50px;
            text-align: center;
            z-index: 100;
        `;
        message.innerHTML = `
            <div style="color: #ff4444; font-size: 28px; margin-bottom: 15px;">⚠ SYSTEM BREACH ⚠</div>
            <div style="color: #888; font-size: 14px; margin-bottom: 20px;">Too much corruption has entered the system!</div>
            <button id="retry-btn" style="
                background: transparent;
                border: 2px solid #00f2ff;
                color: #00f2ff;
                padding: 10px 30px;
                font-size: 16px;
                cursor: pointer;
                border-radius: 5px;
            ">Try Again</button>
        `;
        
        this.gameArea.appendChild(message);
        
        // Retry button
        document.getElementById('retry-btn').addEventListener('click', () => {
            message.remove();
            this.resetGame();
        });
    },

    /**
     * Reset the game
     */
    resetGame() {
        this.score = 0;
        this.health = 100;
        this.lastSpawn = 0;
        this.runes = [];
        this.updateScoreDisplay();
        this.updateHealthDisplay();
        this.startGameLoop();
    },

    /**
     * Game loop
     */
    gameLoop(timestamp) {
        if (!this._isActive) return;
        
        // Spawn new runes
        if (timestamp - this.lastSpawn > this.spawnRate) {
            this.spawnRune();
            this.lastSpawn = timestamp;
            
            // Gradually increase difficulty
            if (this.spawnRate > 800) {
                this.spawnRate -= 10;
            }
        }
        
        this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
    },

    /**
     * Start game loop
     */
    startGameLoop() {
        this.lastSpawn = performance.now();
        this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
    },

    /**
     * Stop game loop
     */
    stopGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    },

    /**
     * Show the puzzle
     */
    show(onComplete = null) {
        this._isActive = true;
        this.onComplete = onComplete;
        
        // Reset game state
        this.score = 0;
        this.health = 100;
        this.spawnRate = 1500;
        this.runes = [];
        this.updateScoreDisplay();
        this.updateHealthDisplay();
        
        // Show the puzzle
        this.container.style.display = 'flex';
        
        // Start game loop
        this.startGameLoop();
        
        console.log('[IDSPuzzle] Puzzle shown');
    },

    /**
     * Close the puzzle
     */
    close() {
        this._isActive = false;
        this.stopGameLoop();
        
        // Clear all runes
        this.runes.forEach(r => r.remove());
        this.runes = [];
        
        this.container.style.display = 'none';
        console.log('[IDSPuzzle] Puzzle closed');
    },

    /**
     * Complete the puzzle
     */
    completePuzzle() {
        this.stopGameLoop();
        
        // Clear remaining runes
        this.runes.forEach(r => r.remove());
        this.runes = [];
        
        // Transform pool to calm state
        this.gameArea.style.animation = 'poolCalm 3s ease-in-out';
        this.gameArea.style.background = 'radial-gradient(circle, rgba(0, 200, 255, 0.5) 0%, rgba(0, 150, 200, 0.4) 40%, rgba(0, 100, 150, 0.5) 70%, rgba(0, 50, 100, 0.7) 100%)';
        this.gameArea.style.borderColor = 'rgba(0, 242, 255, 0.8)';
        
        // Success message
        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 3px solid #00f2ff;
            border-radius: 15px;
            padding: 30px 50px;
            text-align: center;
            z-index: 100;
        `;
        message.innerHTML = `
            <div style="color: #00f2ff; font-size: 28px; margin-bottom: 15px;">✓ SYSTEM SECURED</div>
            <div style="color: #888; font-size: 14px;">The corruption has been purged!</div>
        `;
        
        this.gameArea.appendChild(message);
        
        // Delay completion
        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete();
            }
            this.close();
        }, 2000);
    },

    /**
     * Check if puzzle is active
     */
    isActive() {
        return this._isActive;
    }
};

// Add fadeOut animation
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(fadeStyle);

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    IDSPuzzle.init();
});
