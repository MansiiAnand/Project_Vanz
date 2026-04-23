/**
 * Rune Keeper - NPC System
 * Non-player characters with dialogue and interaction
 */

class NPC {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 56;
        this.name = config.name || 'Unknown';
        this.role = config.role || 'villager';
        this.dialogues = config.dialogues || [];
        this.currentDialogueIndex = 0;
        this.colorScheme = config.colorScheme || 'silver';
        this.facingDirection = config.facing || 'down';
        
        this.element = null;
        this.interactionRadius = 50;
    }

    /**
     * Create NPC visual - Human-like with flowing robes
     */
    create(container) {
        const npcContainer = document.createElement('div');
        npcContainer.className = 'npc ancient-npc';
        npcContainer.dataset.npcId = this.name.toLowerCase().replace(/\s+/g, '_');
        npcContainer.style.cssText = `
            position: absolute;
            left: ${this.x - this.width/2}px;
            top: ${this.y - this.height/2}px;
            width: ${this.width}px;
            height: ${this.height}px;
            z-index: 90;
            cursor: pointer;
        `;

        // Get color scheme values
        const colors = this.getColorScheme();

        // SVG NPC figure - Human-like flowing robes
        npcContainer.innerHTML = `
            <svg viewBox="0 0 40 56" width="40" height="56" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="npcGlow_${this.name}" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    <!-- Robe gradients -->
                    <linearGradient id="npcRobeGrad_${this.name}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colors.bodyColor};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${colors.robeShadow};stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <!-- Ground shadow -->
                <ellipse cx="20" cy="54" rx="11" ry="3" fill="rgba(0,0,0,0.25)" />
                
                <!-- Lower Robes - Flowing fabric -->
                <path d="M 11 32 
                         Q 9 40 10 48
                         Q 11 53 16 54
                         L 24 54
                         Q 29 53 30 48
                         Q 31 40 29 32
                         Q 20 34 11 32 Z" 
                      fill="url(#npcRobeGrad_${this.name})" stroke="${colors.robeShadow}" stroke-width="1"/>
                
                <!-- Main Robe Body - Human torso -->
                <path d="M 13 16
                         Q 11 24 12 34
                         Q 20 36 28 34
                         Q 29 24 27 16
                         Q 20 13 13 16 Z" 
                      fill="${colors.bodyColor}" stroke="${colors.bodyStroke}" stroke-width="1.5"/>
                
                <!-- Robe folds -->
                <path d="M 16 22 Q 18 30 17 38" fill="none" stroke="${colors.robeShadow}" stroke-width="0.8" opacity="0.4"/>
                <path d="M 24 22 Q 22 30 23 38" fill="none" stroke="${colors.robeShadow}" stroke-width="0.8" opacity="0.4"/>
                
                <!-- Sash -->
                <rect x="12" y="30" width="16" height="3" rx="0.5" fill="${colors.sashColor}" opacity="0.6"/>
                
                <!-- Emblem on chest -->
                <g transform="translate(20, 24)">
                    <circle cx="0" cy="0" r="5" fill="#1a1a1a" stroke="${colors.bodyStroke}" stroke-width="0.5" opacity="0.8"/>
                    <text x="0" y="0.5" text-anchor="middle" dominant-baseline="middle" 
                          fill="${colors.emblemColor}" font-size="7" font-family="serif">${colors.emblem}</text>
                </g>
                
                <!-- Hood - Flowing fabric -->
                <path d="M 10 17
                         C 7 13 8 7 12 5
                         C 16 3 20 2 20 2
                         C 20 2 24 3 28 5
                         C 32 7 33 13 30 17
                         C 28 21 26 19 20 20
                         C 14 19 12 21 10 17 Z" 
                      fill="${colors.hoodColor}" stroke="${colors.hoodStroke}" stroke-width="1.5"/>
                
                <!-- Hood drape -->
                <path d="M 10 17 Q 8 21 10 26 L 12 22 Q 11 19 12 17 Z" fill="${colors.hoodShadow}"/>
                <path d="M 30 17 Q 32 21 30 26 L 28 22 Q 29 19 28 17 Z" fill="${colors.hoodShadow}"/>
                
                <!-- Face void -->
                <ellipse cx="20" cy="10" rx="6" ry="4" fill="#0d0d0d" stroke="#1a1a1a" stroke-width="0.5"/>
                
                <!-- Arms - Human-like sleeves -->
                <path d="M 12 18
                         Q 8 23 9 30
                         Q 10 34 11 33
                         L 13 27
                         Q 12 21 13 18 Z" 
                      fill="url(#npcRobeGrad_${this.name})" stroke="${colors.bodyStroke}" stroke-width="0.8"/>
                
                <path d="M 28 18
                         Q 32 23 31 30
                         Q 30 34 29 33
                         L 27 27
                         Q 28 21 27 18 Z" 
                      fill="url(#npcRobeGrad_${this.name})" stroke="${colors.bodyStroke}" stroke-width="0.8"/>
                
                <!-- Glowing Eyes -->
                <circle cx="17.5" cy="10" r="1.5" fill="${colors.eyeColor}" filter="url(#npcGlow_${this.name})" opacity="0.9"/>
                <circle cx="22.5" cy="10" r="1.5" fill="${colors.eyeColor}" filter="url(#npcGlow_${this.name})" opacity="0.9"/>
            </svg>
            
            <!-- Nameplate (shows on hover) -->
            <div class="npc-nameplate" style="
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(26, 26, 26, 0.9);
                border: 1px solid var(--sandstone);
                padding: 4px 8px;
                border-radius: 4px;
                color: var(--sandstone);
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
                margin-bottom: 5px;
            ">${this.name}</div>
            
            <!-- Interaction indicator - static, no bounce -->
            <div class="interaction-indicator" style="
                position: absolute;
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                width: 6px;
                height: 6px;
                background: var(--cyber-teal);
                border-radius: 50%;
                opacity: 0;
                box-shadow: 0 0 8px var(--cyber-teal);
            "></div>
        `;

        // Add hover effect for nameplate
        npcContainer.addEventListener('mouseenter', () => {
            const nameplate = npcContainer.querySelector('.npc-nameplate');
            if (nameplate) nameplate.style.opacity = '1';
        });
        npcContainer.addEventListener('mouseleave', () => {
            const nameplate = npcContainer.querySelector('.npc-nameplate');
            if (nameplate) nameplate.style.opacity = '0';
        });

        container.appendChild(npcContainer);
        this.element = npcContainer;
        
        return this;
    }

    /**
     * Get color scheme based on type
     */
    getColorScheme() {
        const schemes = {
            silver: {
                legColor: '#8a8a8a',
                legStroke: '#5a5a5a',
                bodyColor: '#b8b8b8',
                bodyStroke: '#8a8a8a',
                hoodColor: '#d0d0d0',
                hoodStroke: '#a0a0a0',
                eyeColor: '#00f2ff',
                emblemColor: '#00f2ff',
                emblem: 'ᛊ'
            },
            gold: {
                legColor: '#b8982f',
                legStroke: '#8a7020',
                bodyColor: '#d4af37',
                bodyStroke: '#b8982f',
                hoodColor: '#e8c84a',
                hoodStroke: '#d4af37',
                eyeColor: '#ff4d4d',
                emblemColor: '#ff4d4d',
                emblem: 'ᚦ'
            },
            bronze: {
                legColor: '#8b5a2b',
                legStroke: '#5d3a1a',
                bodyColor: '#cd7f32',
                bodyStroke: '#8b5a2b',
                hoodColor: '#d4a574',
                hoodStroke: '#cd7f32',
                eyeColor: '#00ff88',
                emblemColor: '#00ff88',
                emblem: 'ᛒ'
            },
            scribe_marble: {
                legColor: '#c0c0c0',
                legStroke: '#808080',
                bodyColor: '#e8e8e8',
                bodyStroke: '#a0a0a0',
                hoodColor: '#f0f0f0',
                hoodStroke: '#c0c0c0',
                hoodShadow: '#d0d0d0',
                robeShadow: '#b0b0b0',
                sashColor: '#909090',
                eyeColor: '#00f2ff',
                emblemColor: '#00f2ff',
                emblem: 'ᛊ'
            },
            archivist_blue: {
                legColor: '#3a5a7a',
                legStroke: '#2a4a6a',
                bodyColor: '#4a6a8a',
                bodyStroke: '#3a5a7a',
                hoodColor: '#5a7a9a',
                hoodStroke: '#4a6a8a',
                hoodShadow: '#3a5a7a',
                robeShadow: '#2a4a6a',
                sashColor: '#00aaff',
                eyeColor: '#00f2ff',
                emblemColor: '#00f2ff',
                emblem: 'ᚢ'
            },
            priest_gold: {
                legColor: '#d4af37',
                legStroke: '#b8982f',
                bodyColor: '#f5f5dc',
                bodyStroke: '#d4af37',
                hoodColor: '#ffd700',
                hoodStroke: '#d4af37',
                hoodShadow: '#b8982f',
                robeShadow: '#d4af37',
                sashColor: '#ff6b35',
                eyeColor: '#ff6b35',
                emblemColor: '#ff6b35',
                emblem: '☀'
            },
            sentinel_iron: {
                legColor: '#4a4a5a',
                legStroke: '#3a3a4a',
                bodyColor: '#5a5a6a',
                bodyStroke: '#4a4a5a',
                hoodColor: '#2a2a3a',
                hoodStroke: '#1a1a2a',
                hoodShadow: '#3a3a5a',
                robeShadow: '#2a2a4a',
                sashColor: '#00f2ff',
                eyeColor: '#00f2ff',
                emblemColor: '#00f2ff',
                emblem: '◈'
            },
            caravan_brown: {
                legColor: '#8b4513',
                legStroke: '#654321',
                bodyColor: '#a0522d',
                bodyStroke: '#8b4513',
                hoodColor: '#cd853f',
                hoodStroke: '#a0522d',
                hoodShadow: '#8b4513',
                robeShadow: '#654321',
                sashColor: '#daa520',
                eyeColor: '#daa520',
                emblemColor: '#daa520',
                emblem: '⌘'
            },
            merchant_pink: {
                legColor: '#c71585',
                legStroke: '#8b0a50',
                bodyColor: '#ff69b4',
                bodyStroke: '#c71585',
                hoodColor: '#ffb6c1',
                hoodStroke: '#ff69b4',
                hoodShadow: '#c71585',
                robeShadow: '#8b0a50',
                sashColor: '#ffd700',
                eyeColor: '#00f2ff',
                emblemColor: '#ffd700',
                emblem: '☆'
            },
            oracle_ethereal: {
                legColor: 'rgba(200, 200, 210, 0.5)',
                legStroke: 'rgba(180, 180, 190, 0.6)',
                bodyColor: 'rgba(220, 220, 230, 0.6)',
                bodyStroke: 'rgba(200, 200, 210, 0.7)',
                hoodColor: 'rgba(240, 248, 255, 0.7)',
                hoodStroke: 'rgba(220, 240, 255, 0.8)',
                hoodShadow: 'rgba(0, 242, 255, 0.3)',
                robeShadow: 'rgba(0, 200, 255, 0.2)',
                sashColor: '#00f2ff',
                eyeColor: '#00f2ff',
                emblemColor: '#00f2ff',
                emblem: '◉'
            },
            king_gold: {
                legColor: '#b8860b',
                legStroke: '#8b6914',
                bodyColor: '#daa520',
                bodyStroke: '#b8860b',
                hoodColor: '#ffd700',
                hoodStroke: '#daa520',
                hoodShadow: '#b8860b',
                robeShadow: '#8b6914',
                sashColor: '#ff0000',
                eyeColor: '#4169e1',
                emblemColor: '#ffd700',
                emblem: '👑'
            }
        };
        
        return schemes[this.colorScheme] || schemes.silver;
    }

    /**
     * Show interaction indicator
     */
    showInteractionIndicator() {
        if (this.element) {
            const indicator = this.element.querySelector('.interaction-indicator');
            if (indicator) indicator.style.opacity = '1';
        }
    }

    /**
     * Hide interaction indicator
     */
    hideInteractionIndicator() {
        if (this.element) {
            const indicator = this.element.querySelector('.interaction-indicator');
            if (indicator) indicator.style.opacity = '0';
        }
    }

    /**
     * Check if player is near enough to interact
     */
    canInteract(playerX, playerY) {
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.interactionRadius;
    }

    /**
     * Get next dialogue
     */
    getNextDialogue() {
        if (this.currentDialogueIndex < this.dialogues.length) {
            return this.dialogues[this.currentDialogueIndex++];
        }
        // Reset to allow repeating
        this.currentDialogueIndex = 0;
        return this.dialogues[0] || null;
    }

    /**
     * Get current dialogue without advancing
     */
    peekCurrentDialogue() {
        if (this.currentDialogueIndex < this.dialogues.length) {
            return this.dialogues[this.currentDialogueIndex];
        }
        return this.dialogues[0] || null;
    }

    /**
     * Update NPC (for animations, etc.)
     */
    update(deltaTime) {
        // Subtle idle animation - slight bob
        if (this.element) {
            const time = Date.now() / 1000;
            const bobOffset = Math.sin(time * 1.5) * 1; // 1px bob
            this.element.style.transform = `translateY(${bobOffset}px)`;
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

/**
 * Elder Scribe NPC - Pre-configured for Level 1
 */
class ElderScribe extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'Elder Scribe',
            role: 'scribe',
            colorScheme: 'scribe_marble',
            facing: 'down',
            dialogues: [
                {
                    text: "Warden... our kingdom's seals are as weak as dry papyrus. Any thief could guess the patterns. You must go to the Vault and forge a Seal that is complex—combine the symbols of the old world with the weight of the new.",
                    speaker: 'Elder Scribe'
                }
            ]
        });
    }
}

/**
 * Head Archivist NPC - Pre-configured for Level 2
 */
class HeadArchivist extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'Head Archivist',
            role: 'archivist',
            colorScheme: 'archivist_blue',
            facing: 'down',
            dialogues: [
                {
                    text: "The King's orders are being intercepted and replaced! Someone is sending forged scrolls to the generals. You must find the one true message before we go to war over a lie!",
                    speaker: 'Head Archivist'
                },
                {
                    text: "Look closely, Warden. The forger's hand is skilled, but their ink is unstable. Use the Lens of Truth to find the corruption. The authentic scroll will remain steady under scrutiny.",
                    speaker: 'Head Archivist'
                }
            ]
        });
    }
}

/**
 * High Priest NPC - Pre-configured for Level 3
 */
class HighPriest extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'High Priest',
            role: 'priest',
            colorScheme: 'priest_gold',
            facing: 'down',
            dialogues: [
                {
                    text: "The sacred prayers are being intercepted by the Shadow-Scribe. We must scramble the runes so only those with the Sun-Key can read them. Our ancestors used the Rotating Pillars to hide the truth.",
                    speaker: 'High Priest'
                },
                {
                    text: "Approach the central pillar and align the rings according to the Sun-Key. When the light shines through, the encryption is broken. Use the Caesar Shift - each ring must be rotated by the number shown on the Sun-Key.",
                    speaker: 'High Priest'
                }
            ]
        });
    }
}

/**
 * Sentinel Jax NPC - Pre-configured for Level 4
 */
class SentinelJax extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'Sentinel Jax',
            role: 'sentinel',
            colorScheme: 'sentinel_iron',
            facing: 'down',
            dialogues: [
                {
                    text: "Warden, look! The system logs—the Scrying Pool—is being flooded. Most of these signals are just the wind and the birds, but some... some are jagged. They are probes from the Shadow-Scribe. You must purge the corruption before they find a way in.",
                    speaker: 'Sentinel Jax'
                },
                {
                    text: "Gaze into the pool and watch the flow of data. Click the corrupted runes—the ones that glow red and jitter—before they reach the bottom. Purge 15 to secure the system.",
                    speaker: 'Sentinel Jax'
                }
            ]
        });
    }
}

/**
 * Caravan Lead NPC - Pre-configured for Level 5
 */
class CaravanLead extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'Caravan Lead',
            role: 'caravan',
            colorScheme: 'caravan_brown',
            facing: 'right',
            dialogues: [
                {
                    text: "Warden! The shadows have sabotaged the bridge. It's still there, but it's 'invisible.' We tried to cross, but the Shadow-Harpies are watching. If we step on an unshielded tile, they'll intercept our cargo! We need a secure route.",
                    speaker: 'Caravan Lead'
                },
                {
                    text: "The bridge tiles have an Encryption Signature - a faint teal shimmer on the safe path. But beware, the shimmer only lasts moments. You must remember the secure route, or look closely for the recurring pulse. Find the path from entrance to exit!",
                    speaker: 'Caravan Lead'
                }
            ]
        });
    }
}

/**
 * Merchant Miri A - The Phisher (Asks for sensitive info)
 * Pre-configured for Level 6
 */
class MerchantMiriA extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'Merchant Miri (?)',
            role: 'merchant',
            colorScheme: 'merchant_pink',
            facing: 'down',
            dialogues: [
                {
                    text: "Oh, Warden, thank goodness you're here! I've been waiting for you. To prove you are the real Warden and not another shape-shifter, please tell me the secret sequence of the Royal Vault from Level 1. I need to verify your identity!",
                    speaker: 'Merchant Miri (?)'
                }
            ]
        });
        this.npcType = 'MiriA';
        this.canAccuse = false;
    }

    enableAccusation() {
        this.canAccuse = true;
        this.dialogues.push({
            text: "[Verify Identity] You seem overly eager to get sensitive information. A real merchant wouldn't ask for the Vault's secrets. You're trying to phish information from me!",
            speaker: 'Warden'
        });
    }

    getNextDialogue() {
        if (this.currentDialogueIndex < this.dialogues.length) {
            return this.dialogues[this.currentDialogueIndex++];
        }
        // Reset to allow cycling through dialogues
        this.currentDialogueIndex = 0;
        return this.dialogues[0] || null;
    }
}

/**
 * Merchant Miri B - The Imposter (Gives wrong facts)
 * Pre-configured for Level 6
 */
class MerchantMiriB extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'Merchant Miri (?)',
            role: 'merchant',
            colorScheme: 'merchant_pink',
            facing: 'down',
            dialogues: [
                {
                    text: "Warden! I heard about your amazing journey! You fought those terrible Shadow-Harpies at the Sun Temple! And you solved the Rotating Cipher in the Grand Canyon! Such bravery!",
                    speaker: 'Merchant Miri (?)'
                }
            ]
        });
        this.npcType = 'MiriB';
        this.canAccuse = false;
    }

    enableAccusation() {
        this.canAccuse = true;
        this.dialogues.push({
            text: "[Verify Identity] You have your facts wrong. The harpies were at the Grand Canyon, not the Sun Temple. The cipher was at the Sun Temple. You're an imposter who doesn't know my journey!",
            speaker: 'Warden'
        });
    }

    getNextDialogue() {
        if (this.currentDialogueIndex < this.dialogues.length) {
            return this.dialogues[this.currentDialogueIndex++];
        }
        this.currentDialogueIndex = 0;
        return this.dialogues[0] || null;
    }
}

/**
 * Merchant Miri C - The Real Miri (Asks for verification token)
 * Pre-configured for Level 6
 */
class MerchantMiriC extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'Merchant Miri (?)',
            role: 'merchant',
            colorScheme: 'merchant_pink',
            facing: 'down',
            dialogues: [
                {
                    text: "Warden, I don't need your secrets. But I do need proof. Show me the Caravan Compass you received from the Canyon Lead. Only the true Warden who crossed the Ghost Bridge would have it. The shape-shifters cannot replicate such an artifact.",
                    speaker: 'Merchant Miri (?)'
                }
            ]
        });
        this.npcType = 'MiriC';
        this.canAccuse = false;
    }

    enableAccusation() {
        this.canAccuse = true;
        this.dialogues.push({
            text: "[Verify Identity] You ask for proper verification—the Caravan Compass. This is the mark of the real Merchant Miri. You are the true Miri!",
            speaker: 'Warden'
        });
    }

    getNextDialogue() {
        if (this.currentDialogueIndex < this.dialogues.length) {
            return this.dialogues[this.currentDialogueIndex++];
        }
        this.currentDialogueIndex = 0;
        return this.dialogues[0] || null;
    }
}

/**
 * The Oracle NPC - Pre-configured for Level 7
 */
class Oracle extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'The Oracle',
            role: 'oracle',
            colorScheme: 'oracle_ethereal',
            facing: 'down',
            dialogues: [
                {
                    text: "Warden, you seek the final Core? The Sanctum requires the Dual-Factor protocol. A single key is a single point of failure. You must prove your identity through the three Sacred Pillars of Truth.",
                    speaker: 'The Oracle'
                },
                {
                    text: "Activate all three pedestals: Something you HAVE, something you KNOW, and something you DO. But be swift - the ritual has a time limit. If you take too long, the first seal will break.",
                    speaker: 'The Oracle'
                }
            ]
        });
    }
}

/**
 * The King NPC - Pre-configured for Level 8
 */
class TheKing extends NPC {
    constructor(x, y) {
        super(x, y, {
            name: 'The King',
            role: 'king',
            colorScheme: 'king_gold',
            facing: 'down',
            dialogues: [
                {
                    text: "Warden! The Shadow-Scribe has bypassed the outer wards! The system is in a state of 'Total Breach.' We don't have time to build new walls—you must patch the holes as they appear! Move fast, or our history is deleted!",
                    speaker: 'The King'
                },
                {
                    text: "The four Terminal Pillars around the Core must be stabilized. Each requires a different security protocol: Password, Phishing Filter, IDS Purge, and MFA Override. You have 180 seconds before total system failure!",
                    speaker: 'The King'
                }
            ]
        });
    }
}
