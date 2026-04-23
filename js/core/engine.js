/**
 * Rune Keeper - Game Engine
 * Main game loop and level management
 */

const Engine = {
    // Core properties
    isRunning: false,
    lastTime: 0,
    animationFrameId: null,
    
    // Screen elements
    screens: {},
    currentScreen: 'loading',
    
    // Level management
    levels: {},
    currentLevelInstance: null,
    
    // Input state
    keys: {},
    
    /**
     * Initialize the engine
     */
    init() {
        console.log('[Engine] Initializing...');
        
        // Cache screen elements
        this.screens = {
            loading: document.getElementById('loading-screen'),
            intro: document.getElementById('intro-screen'),
            game: document.getElementById('game-screen'),
            dialogue: document.getElementById('dialogue-screen')
        };
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Set up UI listeners (chronicle, etc.)
        this.setupChronicleListeners();
        
        // Start loading sequence
        this.showScreen('loading');
        
        // Simulate loading and check for intro
        setTimeout(() => {
            this.checkAndShowIntro();
        }, 2500);
        
        console.log('[Engine] Initialization complete');
        return this;
    },

    /**
     * Set up keyboard input handlers
     */
    setupInputHandlers() {
        // Key down handler
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
            
            // Handle special keys
            const puzzleActive = (VaultPuzzle && VaultPuzzle.isActive()) || 
                                (ForgeryPuzzle && ForgeryPuzzle.isActive()) ||
                                (CipherPuzzle && CipherPuzzle.isActive()) ||
                                (IDSPuzzle && IDSPuzzle.isActive()) ||
                                (BridgePuzzle && BridgePuzzle.isActive());
            if (e.key.toLowerCase() === 'e' && !GameState.isDialogueActive && !puzzleActive && !this.isIntroActive) {
                this.handleInteraction();
            }
            
            // Chronicle toggle (C key)
            if (e.key.toLowerCase() === 'c') {
                this.toggleChronicle();
            }
            
            // Settings toggle (Esc key)
            if (e.key === 'Escape') {
                e.preventDefault();
                this.toggleSettings();
            }
            
            // Prevent default for game keys
            if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });
        
        // Key up handler
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
        
        console.log('[Engine] Input handlers registered');
    },

    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    },

    /**
     * Register a level
     */
    registerLevel(levelNum, levelClass) {
        this.levels[levelNum] = levelClass;
        console.log(`[Engine] Registered level ${levelNum}`);
    },

    /**
     * Transition to a level with dissolve effect
     */
    transitionToLevel(levelNum) {
        console.log(`[Engine] Transitioning to level ${levelNum}`);
        
        // Create transition overlay
        this.createLevelTransition(() => {
            // Save current level
            GameState.setLevel(levelNum);
            
            // Update level indicator
            const levelIndicator = document.getElementById('current-level');
            if (levelIndicator) {
                levelIndicator.textContent = levelNum;
            }
            
            // Clean up current level
            if (this.currentLevelInstance && this.currentLevelInstance.cleanup) {
                this.currentLevelInstance.cleanup();
            }
            
            // Clear viewport
            const viewport = document.getElementById('game-viewport');
            if (viewport) {
                viewport.innerHTML = '';
            }
            
            // Create new level instance
            const LevelClass = this.levels[levelNum];
            if (LevelClass) {
                this.currentLevelInstance = new LevelClass();
                this.currentLevelInstance.init();
            } else {
                console.warn(`[Engine] Level ${levelNum} not found`);
                // Create fallback level
                this.createFallbackLevel(levelNum);
            }
            
            // Show game screen
            this.showScreen('game');
            
            // Start game loop if not running
            if (!this.isRunning) {
                this.start();
            }
        }); // End of createLevelTransition callback
    },

    /**
     * Create fallback level when level class not found
     */
    createFallbackLevel(levelNum) {
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        const levelContainer = document.createElement('div');
        levelContainer.className = 'level-container';
        levelContainer.id = `level-${levelNum}`;
        
        // Basic floor
        const floor = document.createElement('div');
        floor.className = 'floor';
        levelContainer.appendChild(floor);
        
        // Level label
        const label = document.createElement('div');
        label.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: var(--sandstone);
            font-size: 32px;
            text-align: center;
        `;
        label.innerHTML = `
            <div>Level ${levelNum}</div>
            <div style="font-size: 16px; margin-top: 20px; color: var(--cyber-teal);">
                The Royal Court
            </div>
        `;
        levelContainer.appendChild(label);
        
        viewport.appendChild(levelContainer);
    },

    /**
     * Create level transition dissolve effect
     */
    createLevelTransition(onComplete) {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            onComplete();
            return;
        }
        
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'level-transition dissolve-out';
        gameContainer.appendChild(overlay);
        
        // Create sand particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'sand-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            overlay.appendChild(particle);
        }
        
        // Wait for dissolve out, then complete and remove
        setTimeout(() => {
            onComplete();
            
            // Switch to dissolve in
            overlay.classList.remove('dissolve-out');
            overlay.classList.add('dissolve-in');
            
            // Remove after animation
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 1000);
        }, 1000);
    },

    /**
     * Handle interaction key
     */
    handleInteraction() {
        if (this.currentLevelInstance && this.currentLevelInstance.onInteract) {
            this.currentLevelInstance.onInteract();
        }
    },

    /**
     * Toggle Chronicle drawer
     */
    toggleChronicle() {
        const drawer = document.getElementById('chronicle-drawer');
        if (drawer) {
            drawer.classList.toggle('hidden');
            GameState.updateHUD();
        }
    },

    /**
     * Toggle Settings menu
     */
    toggleSettings() {
        const settingsMenu = document.getElementById('settings-menu');
        if (settingsMenu) {
            settingsMenu.classList.toggle('hidden');
            
            // Pause/unpause game when settings is open
            if (!settingsMenu.classList.contains('hidden')) {
                this.pause();
                this.setupSettingsMenu();
            } else {
                this.resume();
            }
        }
    },

    /**
     * Check if we should show the intro (first time only)
     */
    checkAndShowIntro() {
        const hasSeenIntro = localStorage.getItem('runeKeeper_introSeen');
        
        if (!hasSeenIntro) {
            // Show intro screen
            this.showScreen('intro');
            this.isIntroActive = true;
            
            // Set up intro button
            const startBtn = document.querySelector('.intro-start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    localStorage.setItem('runeKeeper_introSeen', 'true');
                    this.isIntroActive = false;
                    this.showScreen('game');
                    this.transitionToLevel(GameState.currentLevel);
                });
            }
        } else {
            // Skip intro, go directly to game
            this.showScreen('game');
            this.transitionToLevel(GameState.currentLevel);
        }
    },

    /**
     * Setup Chronicle listeners (called during init)
     */
    setupChronicleListeners() {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            // Close chronicle button
            const closeChronicle = document.getElementById('close-chronicle');
            if (closeChronicle) {
                closeChronicle.onclick = () => this.toggleChronicle();
            }
            
            // Chronicle button click
            const chronicleBtn = document.getElementById('chronicle-btn');
            if (chronicleBtn) {
                chronicleBtn.onclick = () => this.toggleChronicle();
            }
            
            console.log('[Engine] Chronicle listeners set up');
        }, 100);
    },

    /**
     * Setup Settings menu event listeners
     */
    setupSettingsMenu() {
        // Text speed toggle
        const textInstant = document.getElementById('text-instant');
        const textTypewriter = document.getElementById('text-typewriter');
        
        if (textInstant && textTypewriter) {
            // Set initial state
            if (GameState.textSpeed === 'instant') {
                textInstant.classList.add('active');
                textTypewriter.classList.remove('active');
            } else {
                textInstant.classList.remove('active');
                textTypewriter.classList.add('active');
            }
            
            textInstant.onclick = () => {
                GameState.setTextSpeed('instant');
                textInstant.classList.add('active');
                textTypewriter.classList.remove('active');
            };
            
            textTypewriter.onclick = () => {
                GameState.setTextSpeed('typewriter');
                textTypewriter.classList.add('active');
                textInstant.classList.remove('active');
            };
        }
        
        // Reset progress button
        const resetBtn = document.getElementById('reset-progress');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                    GameState.resetProgress();
                    location.reload();
                }
            };
        }
        
        // Close settings button
        const closeSettings = document.getElementById('close-settings');
        if (closeSettings) {
            closeSettings.onclick = () => this.toggleSettings();
        }
        
        // Close chronicle button
        const closeChronicle = document.getElementById('close-chronicle');
        if (closeChronicle) {
            closeChronicle.onclick = () => this.toggleChronicle();
        }
        
        // Chronicle button click
        const chronicleBtn = document.getElementById('chronicle-btn');
        if (chronicleBtn) {
            chronicleBtn.onclick = () => this.toggleChronicle();
        }
    },

    /**
     * Start game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
        
        console.log('[Engine] Game loop started');
    },

    /**
     * Stop game loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        console.log('[Engine] Game loop stopped');
    },

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update current level
        if (this.currentLevelInstance && this.currentLevelInstance.update) {
            this.currentLevelInstance.update(deltaTime, this.keys);
        }
        
        // Continue loop
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    },

    /**
     * Pause game
     */
    pause() {
        GameState.isPaused = true;
        this.stop();
    },

    /**
     * Resume game
     */
    resume() {
        GameState.isPaused = false;
        this.start();
    },

    /**
     * Show dialogue
     */
    showDialogue(text, onComplete = null) {
        GameState.isDialogueActive = true;
        
        const dialogueText = document.getElementById('dialogue-text');
        const continueBtn = document.getElementById('dialogue-continue');
        
        if (dialogueText) {
            dialogueText.textContent = text;
        }
        
        // Handle continue button
        const handleContinue = () => {
            GameState.isDialogueActive = false;
            this.showScreen('game');
            if (onComplete) onComplete();
            continueBtn.removeEventListener('click', handleContinue);
        };
        
        if (continueBtn) {
            continueBtn.addEventListener('click', handleContinue);
        }
        
        this.showScreen('dialogue');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Engine.init();
});
