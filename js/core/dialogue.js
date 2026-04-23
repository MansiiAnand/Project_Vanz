/**
 * Rune Keeper - Dialogue System
 * Typewriter text animation and conversation management
 */

const DialogueSystem = {
    isActive: false,
    currentText: '',
    displayText: '',
    charIndex: 0,
    typewriterSpeed: 30, // ms per character
    typewriterInterval: null,
    onComplete: null,
    canClose: false,
    closeDelay: 500, // ms before allowing close
    
    // Input debouncing
    lastKeyTime: 0,
    keyCooldown: 300, // ms between valid key presses
    isProcessingKey: false,

    // UI Elements
    container: null,
    textElement: null,
    speakerElement: null,
    continueHint: null,

    /**
     * Initialize the dialogue system
     */
    init() {
        this.createDialogueUI();
        this.setupInputHandler();
        console.log('[DialogueSystem] Initialized');
    },

    /**
     * Create the dialogue UI elements
     */
    createDialogueUI() {
        // Main dialogue container
        this.container = document.createElement('div');
        this.container.id = 'dialogue-system';
        this.container.className = 'dialogue-overlay';
        this.container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 40px 60px 60px;
            z-index: 1000;
            display: none;
            pointer-events: auto;
        `;

        // Dialogue box - Parchment style with gold border
        const dialogueBox = document.createElement('div');
        dialogueBox.className = 'dialogue-box';
        dialogueBox.style.cssText = `
            max-width: 900px;
            margin: 0 auto;
            background: linear-gradient(135deg, #f5f0e1 0%, #e8e0d0 50%, #d4c9b0 100%);
            border: 4px solid var(--sandstone);
            border-radius: 12px;
            padding: 30px 40px;
            box-shadow: 
                0 10px 40px rgba(0, 0, 0, 0.8),
                inset 0 0 100px rgba(139, 119, 101, 0.2),
                0 0 30px rgba(212, 175, 55, 0.3);
            position: relative;
        `;

        // Speaker name
        this.speakerElement = document.createElement('div');
        this.speakerElement.className = 'dialogue-speaker';
        this.speakerElement.style.cssText = `
            color: #6b5b4f;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            display: inline-block;
            font-family: 'Georgia', 'Times New Roman', serif;
            font-weight: bold;
            border-bottom: 2px solid var(--sandstone);
        `;
        this.speakerElement.textContent = '';

        // Text content - Ancient parchment style
        this.textElement = document.createElement('p');
        this.textElement.className = 'dialogue-text';
        this.textElement.style.cssText = `
            color: #3d3229;
            font-size: 19px;
            line-height: 1.8;
            margin: 0;
            min-height: 70px;
            font-family: 'Crimson Text', 'Georgia', 'Times New Roman', serif;
            text-shadow: none;
            letter-spacing: 0.3px;
        `;
        this.textElement.textContent = '';

        // Continue hint
        this.continueHint = document.createElement('div');
        this.continueHint.className = 'continue-hint';
        this.continueHint.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 30px;
            color: #6b5b4f;
            font-size: 13px;
            letter-spacing: 2px;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Georgia', serif;
            font-style: italic;
        `;
        this.continueHint.innerHTML = `
            <span>Press E to continue</span>
            <span style="font-size: 16px; color: var(--sandstone);">›</span>
        `;

        // Decorative corners - Gold ornamental style
        const corners = document.createElement('div');
        corners.style.cssText = `
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            pointer-events: none;
            border: 1px solid transparent;
        `;
        corners.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 25px; height: 25px; border-top: 3px solid var(--sandstone); border-left: 3px solid var(--sandstone); border-radius: 8px 0 0 0;"></div>
            <div style="position: absolute; top: 0; right: 0; width: 25px; height: 25px; border-top: 3px solid var(--sandstone); border-right: 3px solid var(--sandstone); border-radius: 0 8px 0 0;"></div>
            <div style="position: absolute; bottom: 0; left: 0; width: 25px; height: 25px; border-bottom: 3px solid var(--sandstone); border-left: 3px solid var(--sandstone); border-radius: 0 0 0 8px;"></div>
            <div style="position: absolute; bottom: 0; right: 0; width: 25px; height: 25px; border-bottom: 3px solid var(--sandstone); border-right: 3px solid var(--sandstone); border-radius: 0 0 8px 0;"></div>
        `;

        dialogueBox.appendChild(corners);
        dialogueBox.appendChild(this.speakerElement);
        dialogueBox.appendChild(this.textElement);
        dialogueBox.appendChild(this.continueHint);
        this.container.appendChild(dialogueBox);

        document.body.appendChild(this.container);
    },

    /**
     * Setup input handler for dialogue
     */
    setupInputHandler() {
        // Use keydown with capture phase to ensure we get it first
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key.toLowerCase() === 'e') {
                e.preventDefault();
                e.stopPropagation();
                
                // Debounce: prevent rapid key presses
                const now = Date.now();
                if (this.isProcessingKey || (now - this.lastKeyTime) < this.keyCooldown) {
                    return; // Ignore rapid presses
                }
                
                this.isProcessingKey = true;
                this.lastKeyTime = now;
                this.handleContinue();
                
                // Reset processing flag after cooldown
                setTimeout(() => {
                    this.isProcessingKey = false;
                }, this.keyCooldown);
            }
        }, true);
    },

    /**
     * Show dialogue with typewriter effect
     */
    show(text, speaker = '', onComplete = null) {
        this.isActive = true;
        this.currentText = text;
        this.onComplete = onComplete;
        this.canClose = false;
        this.charIndex = 0;
        this.displayText = '';

        // Update speaker
        this.speakerElement.textContent = speaker || 'Unknown';

        // Show container
        this.container.style.display = 'block';
        this.continueHint.style.opacity = '0';

        // Start typewriter
        this.startTypewriter();

        // Set close delay
        setTimeout(() => {
            this.canClose = true;
            this.continueHint.style.opacity = '1';
        }, this.closeDelay);

        console.log(`[DialogueSystem] Showing dialogue from: ${speaker}`);
    },

    /**
     * Start typewriter animation
     */
    startTypewriter() {
        // Clear any existing interval
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }

        this.typewriterInterval = setInterval(() => {
            if (this.charIndex < this.currentText.length) {
                this.displayText += this.currentText[this.charIndex];
                this.textElement.textContent = this.displayText;
                this.charIndex++;
            } else {
                // Typing complete
                clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
                this.canClose = true;
                this.continueHint.style.opacity = '1';
            }
        }, this.typewriterSpeed);
    },

    /**
     * Skip typewriter and show full text
     */
    skipTypewriter() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        this.displayText = this.currentText;
        this.textElement.textContent = this.displayText;
        this.canClose = true;
        this.continueHint.style.opacity = '1';
    },

    /**
     * Handle continue/close action
     */
    handleContinue() {
        if (!this.canClose) {
            // Still typing - skip to end
            this.skipTypewriter();
            return;
        }

        this.close();
    },

    /**
     * Close dialogue
     */
    close() {
        this.isActive = false;
        this.container.style.display = 'none';

        // Clear typewriter
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }

        // Reset text
        this.textElement.textContent = '';
        this.speakerElement.textContent = '';
        
        // Reset debounce state
        this.isProcessingKey = false;
        this.lastKeyTime = 0;

        // Callback
        if (this.onComplete) {
            const callback = this.onComplete;
            this.onComplete = null;
            callback();
        }

        console.log('[DialogueSystem] Dialogue closed');
    },

    /**
     * Check if dialogue is active
     */
    isDialogueActive() {
        return this.isActive;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    DialogueSystem.init();
});
