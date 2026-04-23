/**
 * Rune Keeper - Forgery Detection Puzzle (Phase 6)
 * Magnifying Lens mechanic for detecting phishing/forgeries
 * Lens follows mouse, scrolls show glitches under scrutiny
 */

const ForgeryPuzzle = {
    _isActive: false,
    container: null,
    lens: null,
    scrolls: [],
    authenticScrollIndex: 1, // Index of authentic scroll (will be shuffled)
    mouseX: 0,
    mouseY: 0,
    onComplete: null,
    attemptCount: 0,
    
    /**
     * Initialize the puzzle
     */
    init() {
        this.createPuzzleUI();
        this.setupMouseTracking();
        console.log('[ForgeryPuzzle] Initialized');
    },

    /**
     * Create the puzzle UI
     */
    createPuzzleUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'forgery-puzzle';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 25, 35, 0.98);
            z-index: 2000;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            overflow: hidden;
        `;

        // Title
        const title = document.createElement('div');
        title.id = 'puzzle-title';
        title.style.cssText = `
            color: var(--cyber-teal);
            font-size: 32px;
            font-family: 'Georgia', serif;
            margin-bottom: 15px;
            text-align: center;
            text-shadow: 0 0 20px var(--cyber-teal);
        `;
        title.textContent = '🔍 The Ink of Deception';

        // Instructions
        const instructions = document.createElement('div');
        instructions.id = 'puzzle-instructions';
        instructions.style.cssText = `
            color: var(--parchment);
            font-size: 14px;
            margin-bottom: 30px;
            text-align: center;
            max-width: 600px;
            line-height: 1.6;
        `;
        instructions.innerHTML = `
            Move your <span style="color: var(--cyber-teal);">Lens of Truth</span> over each scroll.<br>
            Look for <span style="color: #ff4444;">digital glitches</span> - flickering runes, corrupted colors.<br>
            The <span style="color: #ffd700;">authentic scroll</span> remains steady with a pure glow.<br>
            <span style="color: #888; font-size: 12px;">Click a scroll to verify it.</span>
        `;

        // Scrolls container
        const scrollsContainer = document.createElement('div');
        scrollsContainer.id = 'scrolls-container';
        scrollsContainer.style.cssText = `
            display: flex;
            gap: 50px;
            margin-bottom: 40px;
            position: relative;
            padding: 40px;
        `;

        // Create three scrolls
        this.scrollsData = [
            { id: 'scroll-a', title: 'Royal Decree', runes: 'ᚠᚢᚦ' },
            { id: 'scroll-b', title: 'King\'s Order', runes: 'ᚨᚱᚲ' },
            { id: 'scroll-c', title: 'Official Seal', runes: 'ᚹᚺᛟ' }
        ];
        this.createScrolls(scrollsContainer);

        // Magnifying Lens (follows mouse)
        this.lens = document.createElement('div');
        this.lens.id = 'magnifying-lens';
        this.lens.style.cssText = `
            position: fixed;
            width: 140px;
            height: 140px;
            border: 3px solid var(--cyber-teal);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0, 242, 255, 0.15) 0%, transparent 60%);
            box-shadow: 0 0 40px var(--cyber-teal), inset 0 0 30px rgba(0, 242, 255, 0.2);
            pointer-events: none;
            z-index: 1000;
            display: none;
            transform: translate(-50%, -50%);
        `;
        
        // Inner lens detail
        this.lens.innerHTML = `
            <div style="
                position: absolute;
                top: 10px;
                left: 10px;
                right: 10px;
                bottom: 10px;
                border: 2px solid rgba(0, 242, 255, 0.4);
                border-radius: 50%;
                background: transparent;
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 4px;
                background: var(--cyber-teal);
                opacity: 0.5;
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(90deg);
                width: 20px;
                height: 4px;
                background: var(--cyber-teal);
                opacity: 0.5;
            "></div>
        `;

        // Failure flash overlay
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.id = 'failure-flash';
        this.flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0);
            pointer-events: none;
            z-index: 3000;
            transition: background 0.2s ease;
        `;

        // Message area for success/failure
        this.messageArea = document.createElement('div');
        this.messageArea.id = 'puzzle-message';
        this.messageArea.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 18px;
            font-family: 'Georgia', serif;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            padding: 10px 30px;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.7);
        `;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.id = 'close-puzzle-btn';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: 2px solid var(--parchment);
            color: var(--parchment);
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
            closeBtn.style.borderColor = 'var(--cyber-teal)';
            closeBtn.style.color = 'var(--cyber-teal)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.borderColor = 'var(--parchment)';
            closeBtn.style.color = 'var(--parchment)';
        });

        // Assemble
        this.container.appendChild(closeBtn);
        this.container.appendChild(title);
        this.container.appendChild(instructions);
        this.container.appendChild(scrollsContainer);
        this.container.appendChild(this.messageArea);
        this.container.appendChild(this.flashOverlay);
        document.body.appendChild(this.container);
        document.body.appendChild(this.lens);

        // Add CSS animations for glitch effects
        this.addGlitchStyles();
    },

    /**
     * Add glitch animation styles
     */
    addGlitchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes runeFlicker {
                0%, 100% { opacity: 1; color: #b8860b; }
                25% { opacity: 0.3; color: #ff4444; }
                50% { opacity: 0.8; color: #8b0000; }
                75% { opacity: 0.2; color: #ff0000; }
            }
            
            @keyframes runeJitter {
                0%, 100% { transform: translate(0, 0); }
                20% { transform: translate(-2px, 1px); }
                40% { transform: translate(2px, -1px); }
                60% { transform: translate(-1px, 2px); }
                80% { transform: translate(1px, -2px); }
            }
            
            @keyframes ancientStatic {
                0%, 100% { opacity: 0; }
                10% { opacity: 0.8; }
                20% { opacity: 0; }
                30% { opacity: 0.5; }
                40% { opacity: 0; }
                70% { opacity: 0.6; }
                80% { opacity: 0; }
            }
            
            @keyframes steadyGlow {
                0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2); }
                50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.3); }
            }
            
            @keyframes goldShimmer {
                0%, 100% { color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                50% { color: #fff8dc; text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
            }
            
            .glitch-active .scroll-runes {
                animation: runeFlicker 0.3s infinite, runeJitter 0.2s infinite !important;
            }
            
            .glitch-active .static-lines {
                animation: ancientStatic 2s infinite !important;
            }
            
            .authentic-glow {
                animation: steadyGlow 3s ease-in-out infinite !important;
            }
            
            .authentic-runes {
                animation: goldShimmer 4s ease-in-out infinite !important;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Create the three scrolls with enhanced visuals
     */
    createScrolls(container) {
        this.scrolls = [];
        
        this.scrollsData.forEach((data, index) => {
            const scroll = document.createElement('div');
            scroll.className = 'scroll-item';
            scroll.dataset.index = index;
            scroll.style.cssText = `
                width: 200px;
                height: 280px;
                background: linear-gradient(180deg, #f4e4c1 0%, #e8d4a8 50%, #d4c494 100%);
                border: 4px solid #8b7355;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 25px 15px;
                position: relative;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.3);
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            `;

            // Static lines for forgeries (SVG jagged lines)
            const staticLines = document.createElement('div');
            staticLines.className = 'static-lines';
            staticLines.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: 0;
                pointer-events: none;
                overflow: hidden;
                border-radius: 4px;
            `;
            staticLines.innerHTML = `
                <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
                    <path d="M 10 50 L 30 30 L 50 60 L 70 20 L 90 70" stroke="#ff4444" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 150 80 L 170 60 L 190 90" stroke="#ff4444" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 20 150 L 40 130 L 60 160 L 80 120" stroke="#ff4444" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 120 180 L 140 160 L 160 190 L 180 150" stroke="#ff4444" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 50 220 L 70 200 L 90 230" stroke="#ff4444" stroke-width="2" fill="none" opacity="0.6"/>
                </svg>
            `;

            // Scroll content
            const sealIcon = document.createElement('div');
            sealIcon.style.cssText = `
                font-size: 36px;
                margin-bottom: 15px;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            `;
            sealIcon.textContent = '👑';

            const title = document.createElement('div');
            title.style.cssText = `
                font-size: 16px;
                font-weight: bold;
                color: #4a3728;
                margin-bottom: 20px;
                font-family: 'Georgia', serif;
                text-align: center;
            `;
            title.textContent = data.title;

            // Runes display
            const runes = document.createElement('div');
            runes.className = 'scroll-runes';
            runes.style.cssText = `
                font-size: 28px;
                color: #b8860b;
                letter-spacing: 8px;
                margin-bottom: 15px;
                font-family: 'Georgia', serif;
                transition: all 0.1s;
            `;
            runes.textContent = data.runes;

            const seal = document.createElement('div');
            seal.style.cssText = `
                width: 50px;
                height: 50px;
                border: 3px solid #8b0000;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                margin-top: auto;
                background: radial-gradient(circle, rgba(139, 0, 0, 0.1) 0%, transparent 70%);
            `;
            seal.textContent = '✦';

            // Glow overlay for authentic
            const glowOverlay = document.createElement('div');
            glowOverlay.className = 'glow-overlay';
            glowOverlay.style.cssText = `
                position: absolute;
                top: -15px;
                left: -15px;
                right: -15px;
                bottom: -15px;
                border: 4px solid transparent;
                border-radius: 15px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            `;

            scroll.appendChild(staticLines);
            scroll.appendChild(sealIcon);
            scroll.appendChild(title);
            scroll.appendChild(runes);
            scroll.appendChild(seal);
            scroll.appendChild(glowOverlay);
            container.appendChild(scroll);

            // Click to verify
            scroll.addEventListener('click', () => this.verifyScroll(index));

            this.scrolls.push({
                element: scroll,
                index: index,
                isAuthentic: false, // Will be set when shuffled
                staticLines: staticLines,
                runes: runes,
                glowOverlay: glowOverlay
            });
        });
    },

    /**
     * Setup mouse tracking for lens
     */
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            if (this._isActive) {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.updateLensPosition();
                this.checkLensOverScrolls();
            }
        });
    },

    /**
     * Update lens position
     */
    updateLensPosition() {
        if (this.lens) {
            this.lens.style.left = this.mouseX + 'px';
            this.lens.style.top = this.mouseY + 'px';
        }
    },

    /**
     * Check if lens is over any scroll and apply effects
     */
    checkLensOverScrolls() {
        this.scrolls.forEach(scroll => {
            const rect = scroll.element.getBoundingClientRect();
            const scrollCenterX = rect.left + rect.width / 2;
            const scrollCenterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(this.mouseX - scrollCenterX, 2) + 
                Math.pow(this.mouseY - scrollCenterY, 2)
            );

            if (distance < 100) {
                // Lens is over this scroll
                if (scroll.isAuthentic) {
                    // Authentic: Steady gold glow, calm runes
                    scroll.element.classList.add('authentic-glow');
                    scroll.runes.classList.add('authentic-runes');
                    scroll.glowOverlay.style.borderColor = '#ffd700';
                    scroll.glowOverlay.style.opacity = '1';
                    scroll.glowOverlay.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2)';
                } else {
                    // Forgery: Glitch effects
                    scroll.element.classList.add('glitch-active');
                    scroll.staticLines.style.opacity = '1';
                }
            } else {
                // Lens not over scroll - remove all effects
                scroll.element.classList.remove('glitch-active', 'authentic-glow');
                scroll.runes.classList.remove('authentic-runes');
                scroll.staticLines.style.opacity = '0';
                scroll.glowOverlay.style.opacity = '0';
            }
        });
    },

    /**
     * Shuffle scrolls and set authentic
     */
    shuffleScrolls() {
        // Randomly choose which scroll is authentic
        this.authenticScrollIndex = Math.floor(Math.random() * 3);
        
        this.scrolls.forEach((scroll, index) => {
            scroll.isAuthentic = (index === this.authenticScrollIndex);
            scroll.element.classList.remove('glitch-active', 'authentic-glow');
            scroll.runes.classList.remove('authentic-runes');
            scroll.staticLines.style.opacity = '0';
            scroll.glowOverlay.style.opacity = '0';
        });
        
        console.log(`[ForgeryPuzzle] Authentic scroll: ${this.authenticScrollIndex}`);
    },

    /**
     * Verify a scroll selection
     */
    verifyScroll(index) {
        const scroll = this.scrolls[index];
        
        if (scroll.isAuthentic) {
            // Success!
            this.showMessage('✓ Authentic! The Verified Decree is added to your Chronicle.', 'success');
            
            // Add to inventory
            if (typeof GameState !== 'undefined' && GameState.addToInventory) {
                GameState.addToInventory({
                    id: 'verified_decree',
                    name: 'Verified Decree',
                    description: 'The true King\'s order, authenticated by the Rune Keeper',
                    icon: '📜'
                });
            }
            
            // Delay completion
            setTimeout(() => {
                if (this.onComplete) {
                    this.onComplete();
                }
                this.close();
            }, 2000);
        } else {
            // Failure
            this.attemptCount++;
            this.showMessage('✗ Forgery detected! The scroll shows corruption under scrutiny.', 'failure');
            this.flashRed();
            
            // Shuffle after a brief delay
            setTimeout(() => {
                this.shuffleScrolls();
                this.showMessage('The forger has rearranged the scrolls... Look again!', 'warning');
            }, 1500);
        }
    },

    /**
     * Show message
     */
    showMessage(text, type) {
        this.messageArea.textContent = text;
        this.messageArea.style.opacity = '1';
        
        if (type === 'success') {
            this.messageArea.style.color = '#4ecdc4';
            this.messageArea.style.border = '2px solid #4ecdc4';
        } else if (type === 'failure') {
            this.messageArea.style.color = '#ff4444';
            this.messageArea.style.border = '2px solid #ff4444';
        } else if (type === 'warning') {
            this.messageArea.style.color = '#ffd700';
            this.messageArea.style.border = '2px solid #ffd700';
        }
        
        setTimeout(() => {
            this.messageArea.style.opacity = '0';
        }, 2500);
    },

    /**
     * Flash screen red on failure
     */
    flashRed() {
        this.flashOverlay.style.background = 'rgba(255, 0, 0, 0.4)';
        setTimeout(() => {
            this.flashOverlay.style.background = 'rgba(255, 0, 0, 0)';
        }, 300);
    },

    /**
     * Show the puzzle
     */
    show(onComplete = null) {
        this._isActive = true;
        this.onComplete = onComplete;
        this.attemptCount = 0;
        
        // Shuffle scrolls
        this.shuffleScrolls();
        
        // Show elements
        this.container.style.display = 'flex';
        this.lens.style.display = 'block';
        
        console.log('[ForgeryPuzzle] Puzzle shown');
    },

    /**
     * Close the puzzle
     */
    close() {
        this._isActive = false;
        this.container.style.display = 'none';
        this.lens.style.display = 'none';
        console.log('[ForgeryPuzzle] Puzzle closed');
    },

    /**
     * Check if puzzle is active
     */
    isActive() {
        return this._isActive;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    ForgeryPuzzle.init();
});
