// controls.js — Input manager with drag-to-orbit camera (no pointer lock)

export class Controls {
    constructor() {
        this.keys = { w: false, a: false, s: false, d: false, e: false, shift: false };
        this.mouse = { dx: 0, dy: 0 };
        this.dragging = false;
        this.interactPressed = false;
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);
    }

    init(canvas) {
        this.canvas = canvas;
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        canvas.addEventListener('mousedown', this._onMouseDown);
        document.addEventListener('mouseup', this._onMouseUp);
        document.addEventListener('mousemove', this._onMouseMove);
        canvas.addEventListener('contextmenu', this._onContextMenu);
    }

    _onContextMenu(e) {
        e.preventDefault();
    }

    _onMouseDown(e) {
        // Left or right mouse button starts drag
        if (e.button === 0 || e.button === 2) {
            this.dragging = true;
        }
    }

    _onMouseUp(e) {
        if (e.button === 0 || e.button === 2) {
            this.dragging = false;
        }
    }

    _onMouseMove(e) {
        if (!this.dragging) return;
        this.mouse.dx += e.movementX;
        this.mouse.dy += e.movementY;
    }

    _onKeyDown(e) {
        const k = e.key.toLowerCase();
        if (k in this.keys) this.keys[k] = true;
        if (k === 'w' || k === 'arrowup') this.keys.w = true;
        if (k === 's' || k === 'arrowdown') this.keys.s = true;
        if (k === 'a' || k === 'arrowleft') this.keys.a = true;
        if (k === 'd' || k === 'arrowright') this.keys.d = true;
        if (k === 'shift') this.keys.shift = true;
        if (k === 'e') this.interactPressed = true;
    }

    _onKeyUp(e) {
        const k = e.key.toLowerCase();
        if (k in this.keys) this.keys[k] = false;
        if (k === 'w' || k === 'arrowup') this.keys.w = false;
        if (k === 's' || k === 'arrowdown') this.keys.s = false;
        if (k === 'a' || k === 'arrowleft') this.keys.a = false;
        if (k === 'd' || k === 'arrowright') this.keys.d = false;
        if (k === 'shift') this.keys.shift = false;
    }

    consumeMouse() {
        const dx = this.mouse.dx;
        const dy = this.mouse.dy;
        this.mouse.dx = 0;
        this.mouse.dy = 0;
        return { dx, dy };
    }

    consumeInteract() {
        const v = this.interactPressed;
        this.interactPressed = false;
        return v;
    }

    get moveDir() {
        let x = 0, z = 0;
        if (this.keys.w) z -= 1;
        if (this.keys.s) z += 1;
        if (this.keys.a) x -= 1;
        if (this.keys.d) x += 1;
        const len = Math.sqrt(x * x + z * z);
        if (len > 0) { x /= len; z /= len; }
        return { x, z };
    }
}
