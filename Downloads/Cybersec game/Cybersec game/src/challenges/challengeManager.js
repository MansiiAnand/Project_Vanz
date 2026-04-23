// challengeManager.js — Opens/closes challenge UI, delegates to challenge types
import { createPasswordChallenge, checkPasswordChallenge } from './passwordChallenge.js';
import { createAccessControlChallenge, checkAccessControlChallenge } from './accessControlChallenge.js';
import { createTrafficChallenge, checkTrafficChallenge } from './trafficChallenge.js';
import { createRestoreChallenge, checkRestoreChallenge } from './restoreChallenge.js';

export class ChallengeManager {
    constructor() {
        this.active = false;
        this.currentObject = null;
        this.overlay = document.getElementById('challenge-overlay');
        this.title = document.getElementById('challenge-title');
        this.typeBadge = document.getElementById('challenge-type-badge');
        this.icon = document.getElementById('challenge-icon');
        this.description = document.getElementById('challenge-description');
        this.content = document.getElementById('challenge-content');
        this.feedback = document.getElementById('challenge-feedback');
        this.submitBtn = document.getElementById('challenge-submit');
        this.closeBtn = document.getElementById('challenge-close');
        this.onComplete = null; // callback

        this.submitBtn.addEventListener('click', () => this._onSubmit());
        this.closeBtn.addEventListener('click', () => this.close());
    }

    open(interactableObj) {
        this.active = true;
        this.currentObject = interactableObj;
        this.feedback.classList.add('hidden');

        const type = interactableObj.challengeType;
        const label = interactableObj.label;

        // Set header
        this.title.textContent = this._getTitleForType(type);
        this.typeBadge.textContent = type.replace(/([A-Z])/g, ' $1').toUpperCase();
        this.icon.textContent = this._getIconForType(type);
        this.description.textContent = this._getDescForType(type);

        // Build challenge content
        switch (type) {
            case 'password':
                createPasswordChallenge(this.content, label);
                break;
            case 'accessControl':
                createAccessControlChallenge(this.content, label);
                break;
            case 'traffic':
                createTrafficChallenge(this.content, label);
                break;
            case 'restore':
                createRestoreChallenge(this.content, label);
                break;
        }

        this.overlay.classList.remove('hidden');
        this.submitBtn.textContent = 'EXECUTE';
        this.submitBtn.disabled = false;
    }

    close() {
        this.active = false;
        this.currentObject = null;
        this.overlay.classList.add('hidden');
        this.content.innerHTML = '';
    }

    _onSubmit() {
        if (!this.currentObject) return;

        let result = false;
        const type = this.currentObject.challengeType;

        switch (type) {
            case 'password':
                result = checkPasswordChallenge(this.content);
                break;
            case 'accessControl':
                result = checkAccessControlChallenge(this.content);
                break;
            case 'traffic':
                result = checkTrafficChallenge(this.content);
                break;
            case 'restore':
                result = checkRestoreChallenge(this.content);
                break;
        }

        this.feedback.classList.remove('hidden');
        if (result) {
            this.feedback.className = 'success';
            this.feedback.textContent = '✓ SYSTEM SECURED — Vulnerability patched successfully.';
            this.currentObject.completed = true;
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'SECURED';
            if (this.onComplete) this.onComplete();
            setTimeout(() => this.close(), 1500);
        } else {
            this.feedback.className = 'error';
            this.feedback.textContent = '✕ FAILED — Review your solution and try again.';
        }
    }

    _getTitleForType(type) {
        const titles = {
            password: 'Identify Weak Passwords',
            accessControl: 'Configure Access Control',
            traffic: 'Trace Malicious Traffic',
            restore: 'Restore Compromised System',
        };
        return titles[type] || 'Security Challenge';
    }

    _getIconForType(type) {
        const icons = {
            password: '🔑',
            accessControl: '🛡️',
            traffic: '📡',
            restore: '🔧',
        };
        return icons[type] || '⚡';
    }

    _getDescForType(type) {
        const descs = {
            password: 'Analyze the following passwords stored on this node. Select ALL passwords that are weak and should be flagged for a reset.',
            accessControl: 'This router\'s access control list has been misconfigured. Set the correct ALLOW/DENY rules for each traffic rule to secure the network.',
            traffic: 'Analyze the network traffic log captured by this sensor. Identify the IP address that is the source of the malicious activity.',
            restore: 'This system has been compromised. Drag the recovery commands into the correct execution order to restore the system.',
        };
        return descs[type] || '';
    }
}
