/**
 * Rune Keeper - Ghost Bridge Puzzle (Phase 9)
 * Secure Transmission / MITM Protection - Navigate encrypted path
 */

const BridgePuzzle = {
    _isActive: false,
    container: null,
    grid: [],
    gridSize: 5,
    selectedPath: [],
    securePath: [],
    onComplete: null,
    gameState: 'showing', // 'showing', 'playing', 'won', 'lost'
    
    /**
     * Initialize the puzzle
     */
    init() {
        this.createPuzzleUI();
        this.addStyles();
        console.log('[BridgePuzzle] Initialized');
    },

    /**
     * Add required CSS styles
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes tileShimmer {
                0%, 100% { 
                    box-shadow: 0 0 10px rgba(0, 242, 255, 0.3), inset 0 0 20px rgba(0, 242, 255, 0.1);
                    border-color: rgba(0, 242, 255, 0.5);
                }
                50% { 
                    box-shadow: 0 0 25px rgba(0, 242, 255, 0.6), inset 0 0 30px rgba(0, 242, 255, 0.2);
                    border-color: rgba(0, 242, 255, 0.8);
                }
            }
            
            @keyframes subtlePulse {
                0%, 100% { 
                    box-shadow: 0 0 5px rgba(0, 242, 255, 0.1);
                    border-color: rgba(0, 242, 255, 0.2);
                }
                50% { 
                    box-shadow: 0 0 8px rgba(0, 242, 255, 0.2);
                    border-color: rgba(0, 242, 255, 0.3);
                }
            }
            
            @keyframes harpyGlow {
                0%, 100% { 
                    filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.5));
                    transform: scale(1);
                }
                50% { 
                    filter: drop-shadow(0 0 15px rgba(255, 0, 0, 0.8));
                    transform: scale(1.05);
                }
            }
            
            @keyframes harpyScreech {
                0% { transform: scale(1); filter: drop-shadow(0 0 5px #ff0000); }
                25% { transform: scale(1.2) rotate(-5deg); filter: drop-shadow(0 0 20px #ff0000); }
                50% { transform: scale(1.3) rotate(5deg); filter: drop-shadow(0 0 30px #ff0000); }
                75% { transform: scale(1.2) rotate(-5deg); filter: drop-shadow(0 0 20px #ff0000); }
                100% { transform: scale(1); filter: drop-shadow(0 0 5px #ff0000); }
            }
            
            @keyframes selectedTile {
                0%, 100% { 
                    background: linear-gradient(135deg, rgba(0, 200, 255, 0.4), rgba(0, 150, 200, 0.3));
                    box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
                }
                50% { 
                    background: linear-gradient(135deg, rgba(0, 242, 255, 0.5), rgba(0, 200, 255, 0.4));
                    box-shadow: 0 0 30px rgba(0, 242, 255, 0.7);
                }
            }
            
            @keyframes fadeOutShimmer {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            @keyframes flashRed {
                0%, 100% { background: rgba(255, 0, 0, 0); }
                50% { background: rgba(255, 0, 0, 0.4); }
            }
            
            .secure-tile-visible {
                animation: tileShimmer 2s ease-in-out infinite !important;
            }
            
            .secure-tile-hidden {
                animation: subtlePulse 4s ease-in-out infinite !important;
                opacity: 0.7;
            }
            
            .insecure-tile {
                background: linear-gradient(135deg, rgba(100, 80, 60, 0.3), rgba(80, 60, 40, 0.2)) !important;
                border-color: rgba(139, 69, 19, 0.4) !important;
            }
            
            .tile-selected {
                animation: selectedTile 2s ease-in-out infinite !important;
            }
            
            .tile-start {
                background: linear-gradient(135deg, rgba(0, 255, 0, 0.3), rgba(0, 200, 0, 0.2)) !important;
                border-color: rgba(0, 255, 0, 0.6) !important;
            }
            
            .tile-end {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 180, 0, 0.2)) !important;
                border-color: rgba(255, 215, 0, 0.6) !important;
            }
            
            .harpy-active {
                animation: harpyGlow 3s ease-in-out infinite !important;
            }
            
            .harpy-screech {
                animation: harpyScreech 0.5s ease-out !important;
            }
            
            .red-flash {
                animation: flashRed 0.5s ease-out !important;
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
        this.container.id = 'bridge-puzzle';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(40, 25, 15, 0.98) 0%, rgba(60, 35, 20, 0.98) 100%);
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
            color: #daa520;
            font-size: 32px;
            font-family: 'Georgia', serif;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 0 0 20px rgba(218, 165, 32, 0.5);
        `;
        title.textContent = '⌘ The Ghost Bridge';

        // Subtitle
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            color: #aaa;
            font-size: 14px;
            margin-bottom: 20px;
            text-align: center;
            max-width: 500px;
        `;
        subtitle.innerHTML = 'Watch for the <span style="color: #00f2ff;">TEAL SHIMMER</span> - these are the Encrypted tiles.<br>Find a continuous path from <span style="color: #00ff00;">START</span> to <span style="color: #ffd700;">END</span>.';

        // Status message
        this.statusMessage = document.createElement('div');
        this.statusMessage.style.cssText = `
            color: #00f2ff;
            font-size: 16px;
            margin-bottom: 15px;
            height: 24px;
            text-align: center;
            font-weight: bold;
        `;
        this.statusMessage.textContent = 'Remember the secure path...';

        // Shadow Harpies container (left and right)
        this.harpiesContainer = document.createElement('div');
        this.harpiesContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 30px;
        `;

        // Left Harpies
        this.leftHarpies = document.createElement('div');
        this.leftHarpies.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 40px;
        `;
        
        // Right Harpies
        this.rightHarpies = document.createElement('div');
        this.rightHarpies.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 40px;
        `;

        // Create harpy eyes
        this.createHarpies();

        // Grid container
        this.gridContainer = document.createElement('div');
        this.gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 70px);
            grid-template-rows: repeat(5, 70px);
            gap: 8px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            border: 2px solid rgba(139, 69, 19, 0.5);
        `;

        // Assemble harpies and grid
        this.harpiesContainer.appendChild(this.leftHarpies);
        this.harpiesContainer.appendChild(this.gridContainer);
        this.harpiesContainer.appendChild(this.rightHarpies);

        // Timer display
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.style.cssText = `
            color: #888;
            font-size: 14px;
            margin-top: 15px;
            text-align: center;
        `;
        this.timerDisplay.textContent = 'Memorize the path!';

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset Path';
        resetBtn.style.cssText = `
            margin-top: 15px;
            background: transparent;
            border: 2px solid #8b4513;
            color: #daa520;
            padding: 10px 25px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Georgia', serif;
            transition: all 0.3s ease;
        `;
        resetBtn.addEventListener('click', () => this.resetPath());
        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.borderColor = '#daa520';
            resetBtn.style.color = '#ffd700';
        });
        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.borderColor = '#8b4513';
            resetBtn.style.color = '#daa520';
        });

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: 2px solid #daa520;
            color: #daa520;
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
            closeBtn.style.background = 'rgba(218, 165, 32, 0.2)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'transparent';
        });

        // Assemble
        this.container.appendChild(closeBtn);
        this.container.appendChild(title);
        this.container.appendChild(subtitle);
        this.container.appendChild(this.statusMessage);
        this.container.appendChild(this.harpiesContainer);
        this.container.appendChild(this.timerDisplay);
        this.container.appendChild(resetBtn);

        document.body.appendChild(this.container);
    },

    /**
     * Create Shadow Harpy eyes
     */
    createHarpies() {
        // Create 5 harpies on each side
        for (let i = 0; i < 5; i++) {
            // Left harpy
            const leftHarpy = document.createElement('div');
            leftHarpy.className = 'harpy-eye harpy-active';
            leftHarpy.innerHTML = `
                <svg width="40" height="30" viewBox="0 0 40 30">
                    <ellipse cx="20" cy="15" rx="18" ry="12" fill="#1a1a1a" stroke="#330000" stroke-width="2"/>
                    <ellipse cx="20" cy="15" rx="12" ry="8" fill="#330000"/>
                    <ellipse cx="20" cy="15" rx="6" ry="4" fill="#ff0000"/>
                    <ellipse cx="20" cy="15" rx="2" ry="1.5" fill="#ff6666"/>
                </svg>
            `;
            this.leftHarpies.appendChild(leftHarpy);

            // Right harpy
            const rightHarpy = document.createElement('div');
            rightHarpy.className = 'harpy-eye harpy-active';
            rightHarpy.innerHTML = `
                <svg width="40" height="30" viewBox="0 0 40 30">
                    <ellipse cx="20" cy="15" rx="18" ry="12" fill="#1a1a1a" stroke="#330000" stroke-width="2"/>
                    <ellipse cx="20" cy="15" rx="12" ry="8" fill="#330000"/>
                    <ellipse cx="20" cy="15" rx="6" ry="4" fill="#ff0000"/>
                    <ellipse cx="20" cy="15" rx="2" ry="1.5" fill="#ff6666"/>
                </svg>
            `;
            this.rightHarpies.appendChild(rightHarpy);
        }
    },

    /**
     * Generate a secure path from start to end
     */
    generateSecurePath() {
        // Start at (0, 0), end at (4, 4)
        // Generate a random path with exactly 9 moves (10 tiles including start)
        const path = [{ row: 0, col: 0 }];
        let current = { row: 0, col: 0 };
        
        while (current.row < 4 || current.col < 4) {
            const moves = [];
            
            // Can move right?
            if (current.col < 4) {
                moves.push({ row: current.row, col: current.col + 1 });
            }
            // Can move down?
            if (current.row < 4) {
                moves.push({ row: current.row + 1, col: current.col });
            }
            // Can move down-right diagonal?
            if (current.row < 4 && current.col < 4) {
                moves.push({ row: current.row + 1, col: current.col + 1 });
            }
            
            // Pick random move
            const next = moves[Math.floor(Math.random() * moves.length)];
            path.push(next);
            current = next;
        }
        
        return path;
    },

    /**
     * Create the tile grid
     */
    createGrid() {
        this.gridContainer.innerHTML = '';
        this.grid = [];
        this.selectedPath = [];
        
        // Generate secure path
        this.securePath = this.generateSecurePath();
        
        // Create tiles
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const isSecure = this.securePath.some(p => p.row === row && p.col === col);
                const isStart = row === 0 && col === 0;
                const isEnd = row === 4 && col === 4;
                
                const tile = document.createElement('div');
                tile.className = 'bridge-tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                tile.dataset.secure = isSecure;
                
                // Base styling
                tile.style.cssText = `
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, rgba(139, 69, 19, 0.3), rgba(100, 50, 20, 0.2));
                    border: 2px solid rgba(139, 69, 19, 0.4);
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    transition: all 0.3s ease;
                    position: relative;
                `;
                
                // Mark start and end
                if (isStart) {
                    tile.classList.add('tile-start');
                    tile.innerHTML = '<span style="color: #00ff00; font-size: 20px;">▶</span>';
                } else if (isEnd) {
                    tile.classList.add('tile-end');
                    tile.innerHTML = '<span style="color: #ffd700; font-size: 20px;">⚑</span>';
                }
                
                // Add shimmer class for secure tiles (initially visible)
                if (isSecure && !isStart && !isEnd) {
                    tile.classList.add('secure-tile-visible');
                }
                
                // Click handler
                tile.addEventListener('click', () => this.clickTile(row, col));
                
                this.gridContainer.appendChild(tile);
                this.grid[row][col] = {
                    element: tile,
                    row: row,
                    col: col,
                    isSecure: isSecure,
                    isSelected: false
                };
            }
        }
    },

    /**
     * Start the memory phase (show shimmer then hide)
     */
    startMemoryPhase() {
        this.gameState = 'showing';
        this.statusMessage.textContent = 'Remember the secure path...';
        this.statusMessage.style.color = '#00f2ff';
        
        let countdown = 3;
        this.timerDisplay.textContent = `Path visible for: ${countdown}s`;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                this.timerDisplay.textContent = `Path visible for: ${countdown}s`;
            } else {
                clearInterval(countdownInterval);
                this.hideSecureTiles();
            }
        }, 1000);
    },

    /**
     * Hide the secure tile shimmer
     */
    hideSecureTiles() {
        this.gameState = 'playing';
        this.statusMessage.textContent = 'Find the secure path!';
        this.statusMessage.style.color = '#daa520';
        this.timerDisplay.textContent = 'Look for the subtle pulse on secure tiles';
        
        // Change shimmer to subtle pulse
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const tile = this.grid[row][col];
                if (tile.isSecure && !(row === 0 && col === 0) && !(row === 4 && col === 4)) {
                    tile.element.classList.remove('secure-tile-visible');
                    tile.element.classList.add('secure-tile-hidden');
                }
            }
        }
    },

    /**
     * Handle tile click
     */
    clickTile(row, col) {
        if (this.gameState !== 'playing') return;
        
        const tile = this.grid[row][col];
        
        // Check if already selected
        if (tile.isSelected) {
            // Deselect this and all subsequent tiles
            this.deselectFrom(tile);
            return;
        }
        
        // Check if clicking insecure tile
        if (!tile.isSecure) {
            this.triggerHarpyScreech();
            return;
        }
        
        // Check if this is a valid next step (adjacent to last selected)
        if (this.selectedPath.length > 0) {
            const last = this.selectedPath[this.selectedPath.length - 1];
            const isAdjacent = Math.abs(last.row - row) <= 1 && Math.abs(last.col - col) <= 1;
            const isNotSame = !(last.row === row && last.col === col);
            
            if (!isAdjacent || !isNotSame) {
                // Not adjacent - can't jump
                this.statusMessage.textContent = 'Path must be continuous!';
                this.statusMessage.style.color = '#ff4444';
                setTimeout(() => {
                    this.statusMessage.textContent = 'Find the secure path!';
                    this.statusMessage.style.color = '#daa520';
                }, 1500);
                return;
            }
        } else {
            // First tile must be start
            if (row !== 0 || col !== 0) {
                this.statusMessage.textContent = 'Start from the green tile!';
                this.statusMessage.style.color = '#ff4444';
                setTimeout(() => {
                    this.statusMessage.textContent = 'Find the secure path!';
                    this.statusMessage.style.color = '#daa520';
                }, 1500);
                return;
            }
        }
        
        // Select this tile
        this.selectTile(tile);
        
        // Check if reached end
        if (row === 4 && col === 4) {
            this.completePuzzle();
        }
    },

    /**
     * Select a tile
     */
    selectTile(tile) {
        tile.isSelected = true;
        tile.element.classList.add('tile-selected');
        tile.element.classList.remove('secure-tile-hidden');
        this.selectedPath.push(tile);
        
        // Show rune symbol on selected tile
        if (!tile.element.querySelector('.rune')) {
            const rune = document.createElement('span');
            rune.className = 'rune';
            rune.style.cssText = `
                color: #00f2ff;
                font-size: 28px;
                text-shadow: 0 0 10px rgba(0, 242, 255, 0.8);
            `;
            rune.textContent = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚹ', 'ᚺ', 'ᛟ', 'ᛊ'][this.selectedPath.length - 1] || 'ᛊ';
            tile.element.appendChild(rune);
        }
    },

    /**
     * Deselect tiles from a certain point
     */
    deselectFrom(fromTile) {
        const index = this.selectedPath.indexOf(fromTile);
        if (index === -1) return;
        
        // Remove all tiles from this point onward
        for (let i = this.selectedPath.length - 1; i >= index; i--) {
            const tile = this.selectedPath[i];
            tile.isSelected = false;
            tile.element.classList.remove('tile-selected');
            
            // Remove rune
            const rune = tile.element.querySelector('.rune');
            if (rune) rune.remove();
            
            // Restore subtle pulse if it was a secure tile
            if (tile.isSecure && !(tile.row === 0 && tile.col === 0) && !(tile.row === 4 && tile.col === 4)) {
                tile.element.classList.add('secure-tile-hidden');
            }
        }
        
        this.selectedPath = this.selectedPath.slice(0, index);
    },

    /**
     * Trigger harpy screech (clicked insecure tile)
     */
    triggerHarpyScreech() {
        // Red flash
        this.container.classList.add('red-flash');
        setTimeout(() => {
            this.container.classList.remove('red-flash');
        }, 500);
        
        // Harpy screech animation
        const allHarpies = this.container.querySelectorAll('.harpy-eye');
        allHarpies.forEach(harpy => {
            harpy.classList.add('harpy-screech');
            setTimeout(() => {
                harpy.classList.remove('harpy-screech');
            }, 500);
        });
        
        // Status message
        this.statusMessage.textContent = '❌ INSECURE TILE! Shadow Harpies detected you!';
        this.statusMessage.style.color = '#ff4444';
        
        // Reset after delay
        setTimeout(() => {
            this.resetPath();
            this.statusMessage.textContent = 'Find the secure path!';
            this.statusMessage.style.color = '#daa520';
        }, 1500);
    },

    /**
     * Reset the selected path
     */
    resetPath() {
        // Deselect all
        for (let i = this.selectedPath.length - 1; i >= 0; i--) {
            const tile = this.selectedPath[i];
            tile.isSelected = false;
            tile.element.classList.remove('tile-selected');
            
            // Remove rune
            const rune = tile.element.querySelector('.rune');
            if (rune) rune.remove();
            
            // Restore subtle pulse if secure
            if (tile.isSecure && !(tile.row === 0 && tile.col === 0) && !(tile.row === 4 && tile.col === 4)) {
                tile.element.classList.add('secure-tile-hidden');
            }
        }
        
        this.selectedPath = [];
    },

    /**
     * Show the puzzle
     */
    show(onComplete = null) {
        this._isActive = true;
        this.onComplete = onComplete;
        
        // Create new grid
        this.createGrid();
        
        // Show the puzzle
        this.container.style.display = 'flex';
        
        // Start memory phase after a brief delay
        setTimeout(() => {
            this.startMemoryPhase();
        }, 1000);
        
        console.log('[BridgePuzzle] Puzzle shown');
    },

    /**
     * Close the puzzle
     */
    close() {
        this._isActive = false;
        this.container.style.display = 'none';
        console.log('[BridgePuzzle] Puzzle closed');
    },

    /**
     * Complete the puzzle
     */
    completePuzzle() {
        this.gameState = 'won';
        
        // Transform all selected tiles to glowing path
        this.selectedPath.forEach(tile => {
            tile.element.style.background = 'linear-gradient(135deg, rgba(0, 242, 255, 0.6), rgba(0, 200, 255, 0.5))';
            tile.element.style.borderColor = 'rgba(0, 242, 255, 0.9)';
            tile.element.style.boxShadow = '0 0 30px rgba(0, 242, 255, 0.8)';
        });
        
        // Success message
        this.statusMessage.textContent = '✓ SECURE PATH ESTABLISHED!';
        this.statusMessage.style.color = '#00ff00';
        this.timerDisplay.textContent = 'The bridge is now fully visible and protected';
        
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

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    BridgePuzzle.init();
});
