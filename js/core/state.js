/**
 * Rune Keeper - State Management
 * Global state and LocalStorage persistence
 */

const GameState = {
    // Core game state
    currentLevel: 1,
    inventory: [],
    isDialogueActive: false,
    playerPosition: { x: 512, y: 384 },
    
    // Game progress
    unlockedLevels: [1],
    completedPuzzles: [],
    collectedSeals: [],
    securityScore: 0,
    
    // Settings
    textSpeed: 'typewriter', // 'instant' or 'typewriter'
    
    // Session state (not persisted)
    isPaused: false,
    isLoading: false,

    /**
     * Initialize state from LocalStorage or defaults
     */
    init() {
        const saved = this.loadFromLocalStorage();
        if (saved) {
            this.currentLevel = saved.currentLevel || 1;
            this.inventory = saved.inventory || [];
            this.unlockedLevels = saved.unlockedLevels || [1];
            this.completedPuzzles = saved.completedPuzzles || [];
            this.collectedSeals = saved.collectedSeals || [];
            this.playerPosition = saved.playerPosition || { x: 512, y: 384 };
            this.securityScore = saved.securityScore || 0;
            this.textSpeed = saved.textSpeed || 'typewriter';
            console.log('[GameState] Loaded saved game');
        } else {
            console.log('[GameState] No save found, starting fresh');
        }
        return this;
    },

    /**
     * Save current state to LocalStorage
     */
    saveToLocalStorage() {
        const saveData = {
            currentLevel: this.currentLevel,
            inventory: this.inventory,
            unlockedLevels: this.unlockedLevels,
            completedPuzzles: this.completedPuzzles,
            collectedSeals: this.collectedSeals,
            playerPosition: this.playerPosition,
            securityScore: this.securityScore,
            textSpeed: this.textSpeed,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('runeKeeper_save', JSON.stringify(saveData));
            console.log('[GameState] Game saved successfully');
            return true;
        } catch (error) {
            console.error('[GameState] Failed to save game:', error);
            return false;
        }
    },

    /**
     * Load state from LocalStorage
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('runeKeeper_save');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('[GameState] Failed to load save:', error);
        }
        return null;
    },

    /**
     * Clear all saved data
     */
    clearSave() {
        try {
            localStorage.removeItem('runeKeeper_save');
            this.reset();
            console.log('[GameState] Save cleared');
            return true;
        } catch (error) {
            console.error('[GameState] Failed to clear save:', error);
            return false;
        }
    },

    /**
     * Reset to default state
     */
    reset() {
        this.currentLevel = 1;
        this.inventory = [];
        this.isDialogueActive = false;
        this.playerPosition = { x: 512, y: 384 };
        this.unlockedLevels = [1];
        this.completedPuzzles = [];
        this.collectedSeals = [];
        this.isPaused = false;
        this.isLoading = false;
    },

    /**
     * Change current level
     */
    setLevel(levelNum) {
        if (this.unlockedLevels.includes(levelNum)) {
            this.currentLevel = levelNum;
            this.saveToLocalStorage();
            return true;
        }
        console.warn(`[GameState] Level ${levelNum} is locked`);
        return false;
    },

    /**
     * Unlock a new level
     */
    unlockLevel(levelNum) {
        if (!this.unlockedLevels.includes(levelNum)) {
            this.unlockedLevels.push(levelNum);
            this.unlockedLevels.sort((a, b) => a - b);
            this.saveToLocalStorage();
            console.log(`[GameState] Level ${levelNum} unlocked`);
        }
    },

    /**
     * Add item to inventory
     */
    addToInventory(item) {
        // Handle both string and object format
        const itemId = typeof item === 'string' ? item : (item.id || item.name);
        
        // Check if already exists
        const exists = this.inventory.some(invItem => {
            const invId = typeof invItem === 'string' ? invItem : (invItem.id || invItem.name);
            return invId === itemId;
        });
        
        if (!exists) {
            this.inventory.push(item);
            this.saveToLocalStorage();
            this.updateChronicleUI();
            console.log(`[GameState] Added to inventory:`, item);
            return true;
        }
        return false;
    },

    /**
     * Remove item from inventory
     */
    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },

    /**
     * Check if player has item
     */
    hasItem(itemId) {
        return this.inventory.some(invItem => {
            if (typeof invItem === 'string') return invItem === itemId;
            return invItem.id === itemId || invItem.name === itemId;
        });
    },

    /**
     * Mark puzzle as completed
     */
    completePuzzle(puzzleId) {
        if (!this.completedPuzzles.includes(puzzleId)) {
            this.completedPuzzles.push(puzzleId);
            this.saveToLocalStorage();
            console.log(`[GameState] Puzzle completed: ${puzzleId}`);
        }
    },

    /**
     * Check if puzzle is completed
     */
    isPuzzleCompleted(puzzleId) {
        return this.completedPuzzles.includes(puzzleId);
    },

    /**
     * Collect a seal
     */
    collectSeal(sealId) {
        if (!this.collectedSeals.includes(sealId)) {
            this.collectedSeals.push(sealId);
            this.saveToLocalStorage();
            console.log(`[GameState] Seal collected: ${sealId}`);
            return true;
        }
        return false;
    },

    /**
     * Update player position
     */
    setPlayerPosition(x, y) {
        this.playerPosition.x = x;
        this.playerPosition.y = y;
    },

    /**
     * Get current save timestamp
     */
    getSaveTime() {
        const saved = this.loadFromLocalStorage();
        return saved ? saved.timestamp : null;
    },

    /**
     * Add to security score
     */
    addSecurityScore(points) {
        this.securityScore += points;
        this.saveToLocalStorage();
        
        // Update display
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.securityScore;
        }
        
        console.log(`[GameState] Security Score: ${this.securityScore} (+${points})`);
        return this.securityScore;
    },

    /**
     * Set text speed
     */
    setTextSpeed(speed) {
        this.textSpeed = speed;
        this.saveToLocalStorage();
        console.log(`[GameState] Text speed set to: ${speed}`);
    },

    /**
     * Reset all progress
     */
    resetProgress() {
        this.currentLevel = 1;
        this.inventory = [];
        this.unlockedLevels = [1];
        this.completedPuzzles = [];
        this.collectedSeals = [];
        this.playerPosition = { x: 512, y: 384 };
        this.securityScore = 0;
        this.textSpeed = 'typewriter';
        
        localStorage.removeItem('runeKeeper_save');
        console.log('[GameState] Progress reset');
    },

    /**
     * Update Chronicle UI based on inventory
     */
    updateChronicleUI() {
        // Update artifact visibility
        const artifactMap = {
            'royal_key': 'artifact-royal_key',
            'Royal Authorization Key': 'artifact-royal_key',
            'verified_decree': 'artifact-verified_decree',
            'Verified Decree': 'artifact-verified_decree',
            'solar_crystal': 'artifact-solar_crystal',
            'Solar Crystal': 'artifact-solar_crystal',
            'watchman_sigil': 'artifact-watchman_sigil',
            "Watchman's Sigil": 'artifact-watchman_sigil',
            'caravan_compass': 'artifact-caravan_compass',
            'Caravan Compass': 'artifact-caravan_compass',
            'trade_ledger': 'artifact-trade_ledger',
            'Trade Ledger': 'artifact-trade_ledger',
            'oracles_sight': 'artifact-oracles_sight',
            "Oracle's Sight": 'artifact-oracles_sight',
            'master_cipher': 'artifact-master_cipher',
            'Master Cipher': 'artifact-master_cipher'
        };
        
        let collectedCount = 0;
        
        this.inventory.forEach(item => {
            const itemId = typeof item === 'string' ? item : (item.id || item.name);
            const elementId = artifactMap[itemId];
            if (elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.classList.remove('hidden');
                    element.classList.add('collected');
                    collectedCount++;
                }
            }
        });
        
        // Update progress text
        const progressEl = document.getElementById('chronicle-progress');
        if (progressEl) {
            progressEl.textContent = `Artifacts: ${collectedCount}/8`;
        }
        
        // Update rank
        const rankEl = document.getElementById('security-rank');
        if (rankEl) {
            let rank = 'Novice';
            if (collectedCount >= 2) rank = 'Apprentice';
            if (collectedCount >= 4) rank = 'Warden';
            if (collectedCount >= 6) rank = 'Guardian';
            if (collectedCount >= 8) rank = 'Master Cipher Keeper';
            rankEl.textContent = `Rank: ${rank}`;
        }
    },

    /**
     * Update HUD based on current state
     */
    updateHUD() {
        // Update security score
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.securityScore;
        }
        
        // Update sun dial
        const segments = document.querySelectorAll('.sun-dial-segment');
        segments.forEach((seg, i) => {
            const level = i + 1;
            seg.classList.remove('active', 'completed');
            if (level === this.currentLevel) {
                seg.classList.add('active');
            } else if (this.unlockedLevels.includes(level)) {
                seg.classList.add('completed');
            }
        });
        
        // Update zone title
        const zoneTitle = document.getElementById('zone-title');
        if (zoneTitle) {
            const zoneNames = {
                1: 'Zone 1: The Throne Room',
                2: 'Zone 2: The Grand Archives',
                3: 'Zone 3: The Sun Temple',
                4: 'Zone 4: The Watchtower',
                5: 'Zone 5: The Grand Canyon',
                6: 'Zone 6: The Marketplace',
                7: 'Zone 7: The Inner Sanctum',
                8: 'Zone 8: The Core'
            };
            zoneTitle.textContent = zoneNames[this.currentLevel] || `Zone ${this.currentLevel}`;
        }
        
        // Update chronicle
        this.updateChronicleUI();
    }
};

// Auto-initialize on load
GameState.init();
