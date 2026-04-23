/**
 * Rune Keeper - Royal Vault Puzzle System
 * Password Strength Puzzle with Drag & Drop Runes
 */

const VaultPuzzle = {
    _isActive: false,
    container: null,
    sealElement: null,
    trayElement: null,
    strengthMeter: null,
    strengthValue: 0,
    maxStrength: 100,
    placedRunes: [],
    onComplete: null,
    
    // Rune types
    runeTypes: {
        common: 'abcdefghijklmnopqrstuvwxyz'.split(''),
        noble: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        mystic: '0123456789'.split(''),
        ancient: '!@#$%^&*()_+-=[]{}|;:,.<>?'.split('')
    },
    
    // Track which types have been used
    usedTypes: {
        common: false,
        noble: false,
        mystic: false,
        ancient: false
    },

    /**
     * Initialize the puzzle
     */
    init() {
        this.createPuzzleUI();
        console.log('[VaultPuzzle] Initialized');
    },

    /**
     * Create the puzzle UI overlay
     */
    createPuzzleUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'vault-puzzle';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(26, 26, 26, 0.95);
            z-index: 2000;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
        `;

        // Title
        const title = document.createElement('div');
        title.style.cssText = `
            color: var(--sandstone);
            font-size: 24px;
            font-family: 'Georgia', serif;
            margin-bottom: 20px;
            text-align: center;
        `;
        title.innerHTML = `
            <div style="font-size: 28px; margin-bottom: 10px;">🔒 The Royal Vault</div>
            <div style="font-size: 14px; color: var(--cyber-teal);">Fortify the Seal with Ancient Runes</div>
        `;

        // Main Seal Circle (Drop Zone)
        this.sealElement = document.createElement('div');
        this.sealElement.id = 'seal-drop-zone';
        this.sealElement.style.cssText = `
            width: 280px;
            height: 280px;
            border-radius: 50%;
            background: radial-gradient(circle, #1a1a1a 30%, #2a2a2a 70%, var(--sandstone) 100%);
            border: 6px solid var(--sandstone);
            box-shadow: 
                0 0 50px rgba(212, 175, 55, 0.3),
                inset 0 0 60px rgba(0, 0, 0, 0.5);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
        `;

        // Seal inner text
        this.sealElement.innerHTML = `
            <div id="seal-text" style="
                color: var(--sandstone);
                font-size: 16px;
                font-family: 'Georgia', serif;
                text-align: center;
                opacity: 0.6;
            ">
                <div style="font-size: 48px; margin-bottom: 10px;">ᚱ</div>
                <div>Drag runes here</div>
            </div>
        `;

        // Set up drop zone
        this.sealElement.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.sealElement.addEventListener('drop', (e) => this.handleDrop(e));
        this.sealElement.addEventListener('dragleave', () => this.handleDragLeave());

        // Strength Meter
        const meterContainer = document.createElement('div');
        meterContainer.style.cssText = `
            width: 300px;
            margin-bottom: 30px;
        `;
        
        const meterLabel = document.createElement('div');
        meterLabel.style.cssText = `
            color: var(--sandstone);
            font-size: 14px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            font-family: 'Georgia', serif;
        `;
        meterLabel.innerHTML = `
            <span>Seal Strength</span>
            <span id="strength-percent">0%</span>
        `;

        const meterBar = document.createElement('div');
        meterBar.style.cssText = `
            width: 100%;
            height: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid var(--sandstone);
            border-radius: 10px;
            overflow: hidden;
        `;

        this.strengthMeter = document.createElement('div');
        this.strengthMeter.id = 'strength-fill';
        this.strengthMeter.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #ff4d4d, var(--sandstone), var(--cyber-teal));
            transition: width 0.5s ease;
        `;

        meterBar.appendChild(this.strengthMeter);
        meterContainer.appendChild(meterLabel);
        meterContainer.appendChild(meterBar);

        // Complexity indicator
        const complexityDiv = document.createElement('div');
        complexityDiv.id = 'complexity-indicator';
        complexityDiv.style.cssText = `
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            color: var(--stone-gray);
            font-size: 12px;
            font-family: 'Georgia', serif;
        `;
        complexityDiv.innerHTML = `
            <span id="type-common">○ Common</span>
            <span id="type-noble">○ Noble</span>
            <span id="type-mystic">○ Mystic</span>
            <span id="type-ancient">○ Ancient</span>
        `;

        // Complete button (hidden initially)
        this.completeButton = document.createElement('button');
        this.completeButton.id = 'seal-complete-btn';
        this.completeButton.style.cssText = `
            background: var(--cyber-teal);
            color: var(--obsidian);
            border: none;
            padding: 15px 40px;
            font-size: 18px;
            font-family: 'Georgia', serif;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            display: none;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
            transition: all 0.3s ease;
        `;
        this.completeButton.textContent = '✓ Fortify Seal';
        this.completeButton.addEventListener('click', () => this.completePuzzle());

        // Rune Tray
        this.trayElement = document.createElement('div');
        this.trayElement.id = 'rune-tray';
        this.trayElement.style.cssText = `
            display: flex;
            gap: 10px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid var(--stone-gray);
            border-radius: 12px;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 800px;
            max-height: 150px;
            overflow-y: auto;
        `;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: 2px solid var(--sandstone);
            color: var(--sandstone);
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            border-radius: 50%;
        `;
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.close());

        // Assemble
        this.container.appendChild(closeBtn);
        this.container.appendChild(title);
        this.container.appendChild(this.sealElement);
        this.container.appendChild(meterContainer);
        this.container.appendChild(complexityDiv);
        this.container.appendChild(this.completeButton);
        this.container.appendChild(this.trayElement);

        document.body.appendChild(this.container);
    },

    /**
     * Show the puzzle
     */
    show(onComplete = null) {
        this._isActive = true;
        this.onComplete = onComplete;
        this.placedRunes = [];
        this.strengthValue = 0;
        this.usedTypes = { common: false, noble: false, mystic: false, ancient: false };
        
        this.container.style.display = 'flex';
        this.updateStrengthMeter();
        this.updateComplexityIndicator();
        this.generateRunes();
        this.updateSealText();
        
        console.log('[VaultPuzzle] Puzzle shown');
    },

    /**
     * Close the puzzle
     */
    close() {
        this._isActive = false;
        this.container.style.display = 'none';
        this.clearRunes();
        console.log('[VaultPuzzle] Puzzle closed');
    },

    /**
     * Generate runes for the tray
     */
    generateRunes() {
        this.clearRunes();
        
        const allRunes = [
            ...this.runeTypes.common.slice(0, 6).map(r => ({ char: r, type: 'common' })),
            ...this.runeTypes.noble.slice(0, 4).map(r => ({ char: r, type: 'noble' })),
            ...this.runeTypes.mystic.slice(0, 4).map(r => ({ char: r, type: 'mystic' })),
            ...this.runeTypes.ancient.slice(0, 4).map(r => ({ char: r, type: 'ancient' }))
        ];

        // Shuffle
        allRunes.sort(() => Math.random() - 0.5);

        allRunes.forEach(rune => {
            const runeEl = this.createRuneElement(rune);
            this.trayElement.appendChild(runeEl);
        });
    },

    /**
     * Create a draggable rune element
     */
    createRuneElement(rune) {
        const el = document.createElement('div');
        el.className = `rune rune-${rune.type}`;
        el.draggable = true;
        el.dataset.char = rune.char;
        el.dataset.type = rune.type;
        
        // Style based on type
        const styles = {
            common: `
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #6b6b6b, #4a4a4a);
                border: 1px solid #888;
                color: #ccc;
                font-size: 14px;
            `,
            noble: `
                width: 42px;
                height: 42px;
                background: linear-gradient(135deg, #d4af37, #8b6914);
                border: 2px solid var(--sandstone);
                color: #fff;
                font-size: 16px;
            `,
            mystic: `
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #1a3a3a, #0d2d2d);
                border: 2px solid var(--cyber-teal);
                color: var(--cyber-teal);
                font-size: 16px;
                box-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
            `,
            ancient: `
                width: 38px;
                height: 38px;
                background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
                border: 2px solid #444;
                color: #ff6b6b;
                font-size: 18px;
                clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
            `
        };

        el.style.cssText = `
            ${styles[rune.type]}
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            border-radius: ${rune.type === 'ancient' ? '0' : '6px'};
            font-family: 'Crimson Text', serif;
            font-weight: bold;
            user-select: none;
            transition: transform 0.2s ease;
        `;
        el.textContent = rune.char;

        // Drag events
        el.addEventListener('dragstart', (e) => this.handleDragStart(e, rune));
        el.addEventListener('dragend', () => this.handleDragEnd(el));

        return el;
    },

    /**
     * Handle drag start
     */
    handleDragStart(e, rune) {
        e.dataTransfer.setData('text/plain', JSON.stringify(rune));
        e.dataTransfer.effectAllowed = 'copy';
        e.target.style.opacity = '0.5';
    },

    /**
     * Handle drag end
     */
    handleDragEnd(el) {
        el.style.opacity = '1';
    },

    /**
     * Handle drag over seal
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.sealElement.style.boxShadow = `
            0 0 80px rgba(0, 242, 255, 0.5),
            inset 0 0 60px rgba(0, 0, 0, 0.5)
        `;
    },

    /**
     * Handle drag leave
     */
    handleDragLeave() {
        this.sealElement.style.boxShadow = `
            0 0 50px rgba(212, 175, 55, 0.3),
            inset 0 0 60px rgba(0, 0, 0, 0.5)
        `;
    },

    /**
     * Handle drop on seal
     */
    handleDrop(e) {
        e.preventDefault();
        this.handleDragLeave();
        
        const data = e.dataTransfer.getData('text/plain');
        if (!data) return;
        
        const rune = JSON.parse(data);
        this.addRuneToSeal(rune);
    },

    /**
     * Add a rune to the seal
     */
    addRuneToSeal(rune) {
        // Check if we already have 12 runes
        if (this.placedRunes.length >= 12) {
            return;
        }

        this.placedRunes.push(rune);
        this.usedTypes[rune.type] = true;
        
        // Trigger screen shake for "weak" runes (common type)
        if (rune.type === 'common') {
            this.triggerScreenShake();
        }
        
        // Calculate strength
        this.calculateStrength();
        
        // Update visual
        this.updateSealText();
        this.updateStrengthMeter();
        this.updateComplexityIndicator();
        
        // Check completion
        if (this.strengthValue >= this.maxStrength) {
            this.completeButton.style.display = 'block';
        }
    },

    /**
     * Calculate seal strength
     */
    calculateStrength() {
        // Base: 8 points per rune, max 12 runes = 96
        let baseStrength = this.placedRunes.length * 8;
        
        // Complexity bonus: +4 for each unique type used
        const uniqueTypes = Object.values(this.usedTypes).filter(v => v).length;
        const bonus = uniqueTypes * 4;
        
        this.strengthValue = Math.min(baseStrength + bonus, this.maxStrength);
    },

    /**
     * Update strength meter UI
     */
    updateStrengthMeter() {
        const percent = this.strengthValue;
        this.strengthMeter.style.width = `${percent}%`;
        
        const percentLabel = document.getElementById('strength-percent');
        if (percentLabel) {
            percentLabel.textContent = `${percent}%`;
        }
        
        // Color based on strength
        if (percent < 30) {
            this.strengthMeter.style.background = '#ff4d4d';
        } else if (percent < 70) {
            this.strengthMeter.style.background = 'linear-gradient(90deg, #ff4d4d, var(--sandstone))';
        } else if (percent < 100) {
            this.strengthMeter.style.background = 'linear-gradient(90deg, #ff4d4d, var(--sandstone), var(--cyber-teal))';
        } else {
            this.strengthMeter.style.background = 'var(--cyber-teal)';
        }
    },

    /**
     * Update complexity indicator
     */
    updateComplexityIndicator() {
        const types = ['common', 'noble', 'mystic', 'ancient'];
        types.forEach(type => {
            const el = document.getElementById(`type-${type}`);
            if (el) {
                if (this.usedTypes[type]) {
                    el.textContent = el.textContent.replace('○', '●');
                    el.style.color = 'var(--cyber-teal)';
                } else {
                    el.textContent = el.textContent.replace('●', '○');
                    el.style.color = 'var(--stone-gray)';
                }
            }
        });
    },

    /**
     * Update seal text display
     */
    updateSealText() {
        const sealText = document.getElementById('seal-text');
        if (sealText) {
            if (this.placedRunes.length === 0) {
                sealText.innerHTML = `
                    <div style="font-size: 48px; margin-bottom: 10px;">ᚱ</div>
                    <div>Drag runes here</div>
                `;
            } else {
                // Show placed runes in a circle
                const runesHtml = this.placedRunes.slice(0, 8).map((r, i) => {
                    const angle = (i / Math.min(this.placedRunes.length, 8)) * 2 * Math.PI;
                    const x = Math.cos(angle) * 80;
                    const y = Math.sin(angle) * 80;
                    return `<div style="
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
                        color: var(--cyber-teal);
                        font-size: 20px;
                        text-shadow: 0 0 10px currentColor;
                    ">${r.char}</div>`;
                }).join('');
                
                sealText.innerHTML = `
                    <div style="position: relative; width: 100%; height: 100%;">
                        <div style="font-size: 24px; color: var(--sandstone); margin-bottom: 5px;">
                            ${this.placedRunes.length} Runes
                        </div>
                        ${runesHtml}
                    </div>
                `;
            }
        }
    },

    /**
     * Clear all runes
     */
    clearRunes() {
        if (this.trayElement) {
            this.trayElement.innerHTML = '';
        }
    },

    /**
     * Complete the puzzle
     */
    completePuzzle() {
        // Add security score based on strength (100 max)
        const scorePoints = this.strengthValue;
        GameState.addSecurityScore(scorePoints);
        
        // Create gold dust particles
        this.createGoldDust();
        
        if (this.onComplete) {
            this.onComplete();
        }
        this.close();
    },

    /**
     * Check if puzzle is active
     */
    isActive() {
        return this._isActive;
    },

    /**
     * Trigger screen shake effect
     */
    triggerScreenShake() {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.add('screen-shake');
            setTimeout(() => {
                gameContainer.classList.remove('screen-shake');
            }, 500);
        }
    },

    /**
     * Create gold dust particles on completion
     */
    createGoldDust() {
        const screenEffects = document.getElementById('screen-effects');
        if (!screenEffects) return;
        
        // Create 50 gold dust particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'gold-dust';
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = '-10px';
                particle.style.animationDelay = `${Math.random() * 0.5}s`;
                
                screenEffects.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }, i * 50);
        }
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    VaultPuzzle.init();
});
