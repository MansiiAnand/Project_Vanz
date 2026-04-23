/**
 * Rune Keeper - Player Entity (Totem-Block)
 * Blocky hooded figure with glowing rune and dash mechanics
 */

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 56;
        this.baseSpeed = 150;
        this.speed = this.baseSpeed;
        
        // Dash properties
        this.isDashing = false;
        this.dashSpeed = 375; // 2.5x base speed
        this.dashDuration = 200; // ms
        this.dashCooldown = 1000; // ms
        this.lastDashTime = 0;
        this.dashDirection = { x: 0, y: 0 };
        
        // Movement state
        this.isMoving = false;
        this.facingDirection = 'down'; // up, down, left, right
        this.velocity = { x: 0, y: 0 };
        
        // Visual elements
        this.element = null;
        this.trailElements = [];
        this.footstepTimer = 0;
        
        // Collision
        this.hitbox = {
            offsetX: 8,
            offsetY: 4,
            width: 24,
            height: 48
        };
    }

    /**
     * Create the Totem-Block SVG figure
     */
    create(container) {
        const playerContainer = document.createElement('div');
        playerContainer.id = 'player';
        playerContainer.className = 'totem-block';
        playerContainer.style.cssText = `
            position: absolute;
            left: ${this.x - this.width/2}px;
            top: ${this.y - this.height/2}px;
            width: ${this.width}px;
            height: ${this.height}px;
            z-index: 100;
            will-change: transform, left, top;
        `;

        // Human-like Ancient Seeker - Flowing golden robes with hood
        playerContainer.innerHTML = `
            <svg viewBox="0 0 40 56" width="40" height="56" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <!-- Neon cyan outer glow for rune -->
                    <filter id="runeGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="3" result="blur1"/>
                        <feGaussianBlur stdDeviation="6" result="blur2"/>
                        <feMerge>
                            <feMergeNode in="blur2"/>
                            <feMergeNode in="blur1"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <filter id="dashGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    <!-- Golden robe gradient -->
                    <linearGradient id="robeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#DAA520;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#B8860B;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#8B6914;stop-opacity:1" />
                    </linearGradient>
                    
                    <linearGradient id="robeShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#B8860B;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <!-- Ground shadow -->
                <ellipse cx="20" cy="54" rx="12" ry="3" fill="rgba(0,0,0,0.3)" />
                
                <!-- Lower Robes - Flowing fabric -->
                <path d="M 10 30 
                         Q 8 38 9 46
                         Q 10 52 15 53
                         L 25 53
                         Q 30 52 31 46
                         Q 32 38 30 30
                         Q 20 32 10 30 Z" 
                      fill="url(#robeShadow)" stroke="#654321" stroke-width="1"/>
                
                <!-- Main Robe Body - Human torso shape -->
                <path d="M 12 15
                         Q 10 22 11 32
                         Q 20 34 29 32
                         Q 30 22 28 15
                         Q 20 12 12 15 Z" 
                      fill="url(#robeGradient)" stroke="#B8860B" stroke-width="1.5"/>
                
                <!-- Robe folds/creases -->
                <path d="M 15 20 Q 17 28 16 35" fill="none" stroke="#8B6914" stroke-width="1" opacity="0.5"/>
                <path d="M 25 20 Q 23 28 24 35" fill="none" stroke="#8B6914" stroke-width="1" opacity="0.5"/>
                <path d="M 20 18 Q 20 28 20 35" fill="none" stroke="#DAA520" stroke-width="0.5" opacity="0.4"/>
                
                <!-- Sash/Belt -->
                <rect x="11" y="28" width="18" height="4" rx="1" fill="#654321" opacity="0.7"/>
                <circle cx="20" cy="30" r="3" fill="#DAA520" stroke="#B8860B" stroke-width="1"/>
                
                <!-- Rune on chest - Glowing seal -->
                <g id="chest-rune" transform="translate(20, 22)" filter="url(#runeGlow)">
                    <circle cx="0" cy="0" r="6" fill="#1a1a1a" stroke="#DAA520" stroke-width="1" opacity="0.9"/>
                    <text x="0" y="1" text-anchor="middle" dominant-baseline="middle" 
                          fill="#00f2ff" font-size="8" font-family="serif" font-weight="bold">ᚱ</text>
                </g>
                
                <!-- Hood - Flowing fabric over head -->
                <path d="M 8 16
                         C 5 12 6 6 10 4
                         C 14 2 18 1 20 1
                         C 22 1 26 2 30 4
                         C 34 6 35 12 32 16
                         C 30 20 28 18 20 19
                         C 12 18 10 20 8 16 Z" 
                      fill="#2a2520" stroke="#DAA520" stroke-width="1.5"/>
                
                <!-- Hood inner shadow - mysterious void -->
                <ellipse cx="20" cy="9" rx="7" ry="5" fill="#0d0d0d" stroke="#1a1a1a" stroke-width="1"/>
                
                <!-- Left Arm - Human-like, robe sleeve -->
                <path d="M 11 17
                         Q 6 22 7 30
                         Q 8 35 10 34
                         L 13 28
                         Q 12 20 12 17 Z" 
                      fill="url(#robeShadow)" stroke="#B8860B" stroke-width="1"/>
                
                <!-- Right Arm - Human-like, robe sleeve -->
                <path d="M 29 17
                         Q 34 22 33 30
                         Q 32 35 30 34
                         L 27 28
                         Q 28 20 28 17 Z" 
                      fill="url(#robeShadow)" stroke="#B8860B" stroke-width="1"/>
                
                <!-- Glowing Eyes in the hood darkness -->
                <circle id="eye-left" cx="17" cy="9" r="1.8" fill="#00f2ff" filter="url(#eyeGlow)" opacity="0.95"/>
                <circle id="eye-right" cx="23" cy="9" r="1.8" fill="#00f2ff" filter="url(#eyeGlow)" opacity="0.95"/>
                
                <!-- Hood drape over shoulders -->
                <path d="M 8 16 Q 6 20 8 26 L 11 22 Q 9 18 10 16 Z" fill="#2a2520"/>
                <path d="M 32 16 Q 34 20 32 26 L 29 22 Q 31 18 30 16 Z" fill="#2a2520"/>
            </svg>
            
            <!-- Dash trail container -->
            <div id="dash-trails" style="position: absolute; top: 0; left: 0; pointer-events: none;"></div>
        `;

        container.appendChild(playerContainer);
        this.element = playerContainer;
        
        return this;
    }

    /**
     * Update player position and state
     */
    update(deltaTime, keys, walls) {
        if (this.isDashing) {
            this.updateDash(deltaTime, walls);
            return;
        }

        // Calculate movement direction
        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
            this.isMoving = true;
            
            // Update facing direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.facingDirection = dx > 0 ? 'right' : 'left';
            } else {
                this.facingDirection = dy > 0 ? 'down' : 'up';
            }
            
            // Update eye positions based on direction
            this.updateEyeDirection(dx, dy);
        } else {
            this.isMoving = false;
        }

        // Check for dash input
        if (keys[' '] && !this.isDashing) {
            const now = Date.now();
            if (now - this.lastDashTime >= this.dashCooldown) {
                this.startDash(dx, dy);
                return;
            }
        }

        // Calculate movement
        const moveDistance = this.baseSpeed * (deltaTime / 1000);
        const newX = this.x + dx * moveDistance;
        const newY = this.y + dy * moveDistance;

        // Apply collision and update position
        this.moveWithCollision(newX, newY, walls);

        // Update visual state
        this.updateVisuals();
        
        // Create footstep particles while moving
        if (this.isMoving && !this.isDashing) {
            this.createFootstepParticle();
        }
        
        // Store velocity for dash direction
        if (dx !== 0 || dy !== 0) {
            this.dashDirection = { x: dx, y: dy };
        }
    }

    /**
     * Create footstep particle effect
     */
    createFootstepParticle() {
        const now = Date.now();
        if (now - this.footstepTimer < 200) return; // Limit to every 200ms
        this.footstepTimer = now;
        
        if (!this.element) return;
        
        const particle = document.createElement('div');
        particle.className = 'footstep-particle';
        particle.style.left = `${this.x - 3}px`;
        particle.style.top = `${this.y + 20}px`;
        
        this.element.parentNode.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }

    /**
     * Update eye positions based on movement direction
     */
    updateEyeDirection(dx, dy) {
        if (!this.element) return;
        
        const eyeLeft = this.element.querySelector('#eye-left');
        const eyeRight = this.element.querySelector('#eye-right');
        
        if (!eyeLeft || !eyeRight) return;

        // Base positions for circles (cx, cy, r)
        let leftCx = 16, leftCy = 8, leftR = 2.5;
        let rightCx = 24, rightCy = 8, rightR = 2.5;

        // Offset based on direction (max 1.5px offset for center)
        const offset = 1.5;
        leftCx += dx * offset;
        leftCy += dy * offset;
        rightCx += dx * offset;
        rightCy += dy * offset;

        eyeLeft.setAttribute('cx', leftCx);
        eyeLeft.setAttribute('cy', leftCy);
        eyeRight.setAttribute('cx', rightCx);
        eyeRight.setAttribute('cy', rightCy);
    }

    /**
     * Start dash movement
     */
    startDash(dx, dy) {
        // Use current movement direction or last facing direction
        if (dx === 0 && dy === 0) {
            // Use facing direction if not moving
            switch (this.facingDirection) {
                case 'up': dx = 0; dy = -1; break;
                case 'down': dx = 0; dy = 1; break;
                case 'left': dx = -1; dy = 0; break;
                case 'right': dx = 1; dy = 0; break;
            }
        }

        this.isDashing = true;
        this.dashStartTime = Date.now();
        this.lastDashTime = this.dashStartTime;
        this.speed = this.dashSpeed;
        
        // Create dash trail effect
        this.createDashTrail();
        
        // Add dash glow effect
        if (this.element) {
            const svg = this.element.querySelector('svg');
            if (svg) {
                svg.style.filter = 'drop-shadow(0 0 10px #00f2ff)';
                this.element.classList.add('is-dashing');
            }
        }

        console.log('[Player] Dash started');
    }

    /**
     * Update dash movement
     */
    updateDash(deltaTime, walls) {
        const now = Date.now();
        const dashElapsed = now - this.dashStartTime;

        if (dashElapsed >= this.dashDuration) {
            this.endDash();
            return;
        }

        // Move at dash speed
        const moveDistance = this.dashSpeed * (deltaTime / 1000);
        const newX = this.x + this.dashDirection.x * moveDistance;
        const newY = this.y + this.dashDirection.y * moveDistance;

        this.moveWithCollision(newX, newY, walls);
        
        // Create trail during dash
        if (dashElapsed % 50 < 20) {
            this.spawnTrailGhost();
        }
    }

    /**
     * End dash movement
     */
    endDash() {
        this.isDashing = false;
        this.speed = this.baseSpeed;
        
        // Remove dash effects
        if (this.element) {
            const svg = this.element.querySelector('svg');
            if (svg) {
                svg.style.filter = '';
            }
            this.element.classList.remove('is-dashing');
        }
        
        // Clear trails after animation
        setTimeout(() => this.clearTrails(), 500);
        
        console.log('[Player] Dash ended');
    }

    /**
     * Create initial dash trail effect
     */
    createDashTrail() {
        // Spawn multiple ghost images
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.spawnTrailGhost(), i * 50);
        }
    }

    /**
     * Spawn a single trail ghost
     */
    spawnTrailGhost() {
        if (!this.element) return;
        
        const trailContainer = this.element.querySelector('#dash-trails');
        if (!trailContainer) return;

        const ghost = document.createElement('div');
        ghost.className = 'dash-ghost';
        ghost.style.cssText = `
            position: absolute;
            width: ${this.width}px;
            height: ${this.height}px;
            left: 0;
            top: 0;
            background: inherit;
            opacity: 0.6;
            pointer-events: none;
            border-radius: 4px;
            background: linear-gradient(180deg, rgba(212, 175, 55, 0.4) 0%, rgba(0, 242, 255, 0.2) 100%);
            border: 2px solid rgba(0, 242, 255, 0.5);
            animation: dashFade 0.4s ease-out forwards;
        `;

        trailContainer.appendChild(ghost);
        
        // Remove after animation
        setTimeout(() => {
            if (ghost.parentNode) {
                ghost.parentNode.removeChild(ghost);
            }
        }, 400);
    }

    /**
     * Clear all trail elements
     */
    clearTrails() {
        const trailContainer = this.element?.querySelector('#dash-trails');
        if (trailContainer) {
            trailContainer.innerHTML = '';
        }
    }

    /**
     * Move with collision detection
     */
    moveWithCollision(newX, newY, walls) {
        // Get hitbox for collision
        const hitbox = this.getHitbox(newX, newY);

        // Check collision with walls
        let canMoveX = true;
        let canMoveY = true;

        for (const wall of walls) {
            // Check X movement
            if (canMoveX && this.rectsIntersect(
                { x: hitbox.x - (newX - this.x), y: hitbox.y, width: hitbox.width, height: hitbox.height },
                wall
            )) {
                canMoveX = false;
            }
            
            // Check Y movement
            if (canMoveY && this.rectsIntersect(
                { x: hitbox.x, y: hitbox.y - (newY - this.y), width: hitbox.width, height: hitbox.height },
                wall
            )) {
                canMoveY = false;
            }
        }

        // Check boundary collision
        const marginX = this.width / 2;
        const marginY = this.height / 2;

        if (canMoveX) {
            this.x = Math.max(marginX, Math.min(1024 - marginX, newX));
        }
        if (canMoveY) {
            this.y = Math.max(marginY, Math.min(768 - marginY, newY));
        }

        // Update position
        if (this.element) {
            this.element.style.left = `${this.x - this.width/2}px`;
            this.element.style.top = `${this.y - this.height/2}px`;
        }

        // Save position to game state
        GameState.setPlayerPosition(this.x, this.y);
    }

    /**
     * Get player hitbox for collision
     */
    getHitbox(x = this.x, y = this.y) {
        return {
            x: x - this.hitbox.width / 2 + this.hitbox.offsetX,
            y: y - this.hitbox.height / 2 + this.hitbox.offsetY,
            width: this.hitbox.width,
            height: this.hitbox.height
        };
    }

    /**
     * Check if two rectangles intersect
     */
    rectsIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.width || 
                 r2.x + r2.width < r1.x || 
                 r2.y > r1.y + r1.height || 
                 r2.y + r2.height < r1.y);
    }

    /**
     * Update visual animations
     */
    updateVisuals() {
        if (!this.element) return;

        // Add/remove moving class for bob animation
        if (this.isMoving && !this.isDashing) {
            this.element.classList.add('is-moving');
        } else {
            this.element.classList.remove('is-moving');
        }

        // Pulse rune animation
        const rune = this.element.querySelector('#chest-rune');
        if (rune) {
            const pulse = (Math.sin(Date.now() / 500) + 1) / 2; // 0 to 1
            rune.style.opacity = 0.7 + pulse * 0.3;
        }
    }

    /**
     * Get position for interaction checks
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Check if near an object for interaction
     */
    isNearObject(objX, objY, threshold = 80) {
        const dx = objX - this.x;
        const dy = objY - this.y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    }

    /**
     * Set position directly (for level transitions)
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.element) {
            this.element.style.left = `${this.x - this.width/2}px`;
            this.element.style.top = `${this.y - this.height/2}px`;
        }
    }

    /**
     * Cleanup
     */
    cleanup() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}
