class InputManager {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
        this.touches = {};
        this.prevTouches = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.gamepad = null;

        // Key mappings
        this.bindings = {
            'moveLeft': ['ArrowLeft', 'a', 'A'],
            'moveRight': ['ArrowRight', 'd', 'D'],
            'jump': [' ', 'ArrowUp', 'w', 'W'],
            'record': ['r', 'R'],
            'rewind': ['Shift', 'Enter'],
            'pause': ['Escape', 'p', 'P']
        };

        this.setupListeners();
        this.setupGamepad();
        this.setupTouchListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Prevent default for game keys
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (typeof game === 'undefined' || !game || !game.canvas) return;
            const rect = game.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (game.canvas.width / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (game.canvas.height / rect.height);
        });

        window.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);
    }

    setupTouchListeners() {
        const touchMappings = {
            'btnLeft': 'moveLeft',
            'btnRight': 'moveRight',
            'btnJump': 'jump',
            'btnRecord': 'record',
            'btnEcho': 'rewind',
            'btnPause': 'pause'
        };

        Object.entries(touchMappings).forEach(([btnId, action]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                // Use pointer events to handle both mouse and touch on the buttons
                btn.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    this.touches[action] = true;
                });
                btn.addEventListener('pointerup', (e) => {
                    e.preventDefault();
                    this.touches[action] = false;
                });
                btn.addEventListener('pointerleave', (e) => {
                    e.preventDefault();
                    this.touches[action] = false;
                });
                // Prevent context menu on long press
                btn.addEventListener('contextmenu', (e) => e.preventDefault());
            }
        });
    }

    setupGamepad() {
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepad = e.gamepad;
            console.log('Gamepad connected:', e.gamepad.id);
        });
    }

    isPressed(action) {
        if (this.touches[action]) return true;
        const keys = this.bindings[action];
        return keys.some(key => this.keys[key]);
    }

    justPressed(action) {
        if (this.touches[action] && !this.prevTouches[action]) return true;
        
        const keys = this.bindings[action];
        return keys.some(key => {
            const currentlyPressed = this.keys[key] || false;
            const previouslyPressed = this.prevKeys[key] || false;
            return currentlyPressed && !previouslyPressed;
        });
    }

    update() {
        // Store previous states
        this.prevKeys = { ...this.keys };
        this.prevTouches = { ...this.touches };

        // Update gamepad if connected
        if (this.gamepad) {
            const gp = navigator.getGamepads()[this.gamepad.index];
            if (gp) {
                // Map gamepad buttons to keys
                this.keys['ArrowLeft'] = gp.axes[0] < -0.5 || gp.buttons[14].pressed;
                this.keys['ArrowRight'] = gp.axes[0] > 0.5 || gp.buttons[15].pressed;
                this.keys[' '] = gp.buttons[0].pressed || gp.buttons[1].pressed;
            }
        }
    }
}