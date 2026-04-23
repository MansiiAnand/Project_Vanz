/**
 * Rune Keeper - Rotating Cipher Puzzle (Phase 7)
 * Caesar Shift encryption puzzle with rotating stone rings
 */

const CipherPuzzle = {
    _isActive: false,
    container: null,
    rings: [],
    sunKey: 3, // The Caesar shift value
    targetRunes: ['ᚠ', 'ᚢ', 'ᚦ'], // Target runes to match
    currentPositions: [0, 0, 0], // Current rotation of each ring
    onComplete: null,
    
    // All available runes for the rings
    runeSet: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚹ', 'ᚺ', 'ᛟ', 'ᛊ'],
    
    /**
     * Initialize the puzzle
     */
    init() {
        this.createPuzzleUI();
        this.addStyles();
        console.log('[CipherPuzzle] Initialized');
    },

    /**
     * Add required CSS styles
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ringGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 242, 255, 0.3); }
                50% { box-shadow: 0 0 40px rgba(0, 242, 255, 0.6); }
            }
            
            @keyframes lightBeamPulse {
                0%, 100% { opacity: 0.3; width: 4px; }
                50% { opacity: 0.8; width: 8px; }
            }
            
            @keyframes correctFlash {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 242, 255, 0.3); }
                50% { box-shadow: 0 0 60px rgba(0, 242, 255, 1), 0 0 100px rgba(0, 242, 255, 0.5); }
            }
            
            @keyframes screenShake {
                0%, 100% { transform: translate(0, 0); }
                10% { transform: translate(-2px, 1px); }
                20% { transform: translate(2px, -1px); }
                30% { transform: translate(-1px, 2px); }
                40% { transform: translate(1px, -2px); }
                50% { transform: translate(-2px, 0); }
                60% { transform: translate(2px, 1px); }
                70% { transform: translate(-1px, -1px); }
                80% { transform: translate(1px, 1px); }
                90% { transform: translate(0, -1px); }
            }
            
            .ring-correct {
                animation: correctFlash 2s ease-in-out infinite !important;
            }
            
            .light-beam-active {
                animation: lightBeamPulse 3s ease-in-out infinite !important;
                background: linear-gradient(180deg, 
                    rgba(0, 242, 255, 0.9) 0%, 
                    rgba(0, 242, 255, 0.6) 50%,
                    rgba(0, 242, 255, 0.3) 100%) !important;
                box-shadow: 0 0 30px rgba(0, 242, 255, 0.8), 0 0 60px rgba(0, 242, 255, 0.4) !important;
            }
            
            .ring-container {
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .ring-container:hover {
                transform: scale(1.02);
            }
            
            .ring-container:active {
                transform: scale(0.98);
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
        this.container.id = 'cipher-puzzle';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(20, 15, 10, 0.98) 0%, rgba(40, 30, 20, 0.98) 100%);
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
            color: #ffd700;
            font-size: 32px;
            font-family: 'Georgia', serif;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        `;
        title.textContent = '☀ The Solar Cipher';

        // Subtitle
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            color: #d4d0c4;
            font-size: 14px;
            margin-bottom: 30px;
            text-align: center;
        `;
        subtitle.textContent = 'Align the rings according to the Sun-Key to reveal the hidden message';

        // Sun-Key display
        const sunKeyDisplay = document.createElement('div');
        sunKeyDisplay.id = 'sun-key-display';
        sunKeyDisplay.style.cssText = `
            position: absolute;
            right: 50px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.1));
            border: 3px solid #d4af37;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        `;
        sunKeyDisplay.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));">☀</div>
            <div style="color: #ffd700; font-size: 18px; font-weight: bold; margin-bottom: 5px;">SUN-KEY</div>
            <div id="shift-value" style="color: #ff6b35; font-size: 36px; font-weight: bold;">+3</div>
            <div style="color: #aaa; font-size: 12px; margin-top: 10px;">Shift each ring<br>by this amount</div>
        `;

        // Target display
        const targetDisplay = document.createElement('div');
        targetDisplay.id = 'target-display';
        targetDisplay.style.cssText = `
            position: absolute;
            left: 50px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid #4a4a4a;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        `;
        targetDisplay.innerHTML = `
            <div style="color: #888; font-size: 12px; margin-bottom: 10px;">TARGET RUNES</div>
            <div id="target-runes" style="font-size: 36px; letter-spacing: 10px; color: #4ecdc4; text-shadow: 0 0 15px rgba(78, 205, 196, 0.5);">
                ᚠ ᚢ ᚦ
            </div>
        `;

        // Pillar container
        const pillarContainer = document.createElement('div');
        pillarContainer.id = 'pillar-container';
        pillarContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            position: relative;
        `;

        // Light beam (hidden initially)
        this.lightBeam = document.createElement('div');
        this.lightBeam.id = 'light-beam';
        this.lightBeam.style.cssText = `
            position: absolute;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 500px;
            background: linear-gradient(180deg, 
                rgba(0, 242, 255, 0.3) 0%, 
                rgba(0, 242, 255, 0.1) 100%);
            opacity: 0.2;
            pointer-events: none;
            z-index: 0;
            transition: all 0.5s ease;
        `;
        pillarContainer.appendChild(this.lightBeam);

        // Create three rings
        this.createRings(pillarContainer);

        // Instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            color: #888;
            font-size: 13px;
            margin-top: 30px;
            text-align: center;
            max-width: 400px;
            line-height: 1.6;
        `;
        instructions.innerHTML = `
            Click each ring to rotate it.<br>
            Align the runes so they match the Target when shifted by the Sun-Key.<br>
            <span style="color: #ffd700;">Hint: If the key is +3, each rune should be 3 positions ahead.</span>
        `;

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset Rings';
        resetBtn.style.cssText = `
            margin-top: 20px;
            background: transparent;
            border: 2px solid #666;
            color: #888;
            padding: 10px 25px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Georgia', serif;
            transition: all 0.3s ease;
        `;
        resetBtn.addEventListener('click', () => this.resetRings());
        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.borderColor = '#d4af37';
            resetBtn.style.color = '#d4af37';
        });
        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.borderColor = '#666';
            resetBtn.style.color = '#888';
        });

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: 2px solid #d4af37;
            color: #d4af37;
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
            closeBtn.style.background = 'rgba(212, 175, 55, 0.2)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'transparent';
        });

        // Assemble
        this.container.appendChild(closeBtn);
        this.container.appendChild(title);
        this.container.appendChild(subtitle);
        this.container.appendChild(sunKeyDisplay);
        this.container.appendChild(targetDisplay);
        this.container.appendChild(pillarContainer);
        this.container.appendChild(instructions);
        this.container.appendChild(resetBtn);

        document.body.appendChild(this.container);
    },

    /**
     * Create the three rotating rings
     */
    createRings(container) {
        this.rings = [];
        
        const ringConfigs = [
            { size: 200, label: 'Top Ring', color: '#d4af37' },
            { size: 240, label: 'Middle Ring', color: '#c4a030' },
            { size: 280, label: 'Bottom Ring', color: '#b49020' }
        ];

        ringConfigs.forEach((config, index) => {
            const ringWrapper = document.createElement('div');
            ringWrapper.className = 'ring-container';
            ringWrapper.style.cssText = `
                width: ${config.size}px;
                height: ${config.size}px;
                position: relative;
                z-index: ${3 - index};
            `;

            // Ring background
            const ring = document.createElement('div');
            ring.className = 'cipher-ring';
            ring.dataset.index = index;
            ring.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: linear-gradient(135deg, 
                    rgba(212, 175, 55, 0.3) 0%, 
                    rgba(180, 140, 50, 0.2) 50%,
                    rgba(160, 120, 40, 0.3) 100%);
                border: 4px solid ${config.color};
                box-shadow: 
                    0 0 20px rgba(255, 215, 0, 0.2),
                    inset 0 0 30px rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            `;

            // Add runes around the ring
            const runeContainer = document.createElement('div');
            runeContainer.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
            `;

            // Create 8 positions for runes
            for (let i = 0; i < 8; i++) {
                const angle = (i * 45) * (Math.PI / 180);
                const radius = config.size / 2 - 25;
                const x = Math.cos(angle) * radius + config.size / 2;
                const y = Math.sin(angle) * radius + config.size / 2;

                const rune = document.createElement('div');
                rune.className = 'ring-rune';
                rune.dataset.position = i;
                rune.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    transform: translate(-50%, -50%);
                    font-size: 24px;
                    color: #ffd700;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                    font-family: 'Georgia', serif;
                    transition: all 0.3s ease;
                `;
                rune.textContent = this.runeSet[i];
                runeContainer.appendChild(rune);
            }

            // Center indicator
            const centerIndicator = document.createElement('div');
            centerIndicator.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                background: #ff6b35;
                border-radius: 50%;
                box-shadow: 0 0 15px rgba(255, 107, 53, 0.8);
                z-index: 10;
            `;

            ring.appendChild(runeContainer);
            ring.appendChild(centerIndicator);
            ringWrapper.appendChild(ring);
            container.appendChild(ringWrapper);

            // Click to rotate
            ringWrapper.addEventListener('click', () => this.rotateRing(index));

            this.rings.push({
                element: ring,
                wrapper: ringWrapper,
                index: index,
                position: 0, // Current rotation position (0-7)
                runes: Array.from(runeContainer.querySelectorAll('.ring-rune'))
            });
        });
    },

    /**
     * Rotate a ring by one position
     */
    rotateRing(index) {
        const ring = this.rings[index];
        ring.position = (ring.position + 1) % 8;
        
        // Rotate the ring visually
        const rotation = ring.position * 45;
        ring.element.style.transform = `rotate(${rotation}deg)`;
        
        // Counter-rotate the runes to keep them upright
        ring.runes.forEach((rune, i) => {
            rune.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
        });
        
        // Trigger screen shake for physical feel
        this.triggerScreenShake();
        
        // Play click sound effect (visual feedback)
        this.showClickFeedback(ring.wrapper);
        
        // Check if puzzle is solved
        this.checkSolution();
    },

    /**
     * Screen shake effect
     */
    triggerScreenShake() {
        this.container.style.animation = 'screenShake 0.3s ease';
        setTimeout(() => {
            this.container.style.animation = '';
        }, 300);
    },

    /**
     * Show visual feedback for click
     */
    showClickFeedback(element) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 100;
            animation: fadeOut 0.3s ease forwards;
        `;
        element.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    },

    /**
     * Check if the puzzle is solved
     */
    checkSolution() {
        let correctCount = 0;
        
        this.rings.forEach((ring, index) => {
            // Calculate which rune is at the top position (12 o'clock)
            // The top position is at index 6 in our arrangement (270 degrees)
            const topRuneIndex = (6 - ring.position + 8) % 8;
            const currentRune = this.runeSet[topRuneIndex];
            
            // Calculate what rune should be here based on target and shift
            const targetRune = this.targetRunes[index];
            const targetIndex = this.runeSet.indexOf(targetRune);
            const requiredIndex = (targetIndex - this.sunKey + 10) % 10;
            
            // Check if the current rune matches what we need
            if (topRuneIndex === requiredIndex) {
                correctCount++;
                ring.element.classList.add('ring-correct');
            } else {
                ring.element.classList.remove('ring-correct');
            }
        });
        
        // Update light beam based on progress
        const progress = correctCount / 3;
        this.lightBeam.style.opacity = 0.2 + (progress * 0.6);
        
        if (correctCount === 3) {
            this.lightBeam.classList.add('light-beam-active');
            setTimeout(() => this.completePuzzle(), 1500);
        } else {
            this.lightBeam.classList.remove('light-beam-active');
        }
    },

    /**
     * Reset all rings to initial position
     */
    resetRings() {
        this.rings.forEach(ring => {
            ring.position = 0;
            ring.element.style.transform = 'rotate(0deg)';
            ring.runes.forEach(rune => {
                rune.style.transform = 'translate(-50%, -50%) rotate(0deg)';
            });
            ring.element.classList.remove('ring-correct');
        });
        this.lightBeam.style.opacity = 0.2;
        this.lightBeam.classList.remove('light-beam-active');
        this.triggerScreenShake();
    },

    /**
     * Show the puzzle
     */
    show(onComplete = null) {
        this._isActive = true;
        this.onComplete = onComplete;
        
        // Reset rings
        this.resetRings();
        
        // Show the puzzle
        this.container.style.display = 'flex';
        console.log('[CipherPuzzle] Puzzle shown');
    },

    /**
     * Close the puzzle
     */
    close() {
        this._isActive = false;
        this.container.style.display = 'none';
        console.log('[CipherPuzzle] Puzzle closed');
    },

    /**
     * Complete the puzzle
     */
    completePuzzle() {
        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(0, 242, 255, 0.5) 0%, transparent 70%);
            pointer-events: none;
            z-index: 3000;
            animation: fadeOut 1s ease forwards;
        `;
        this.container.appendChild(flash);
        
        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete();
            }
            this.close();
        }, 1000);
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
    CipherPuzzle.init();
});
