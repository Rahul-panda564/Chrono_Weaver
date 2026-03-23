class InputManager {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
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

    setupGamepad() {
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepad = e.gamepad;
            console.log('Gamepad connected:', e.gamepad.id);
        });
    }

    isPressed(action) {
        const keys = this.bindings[action];
        return keys.some(key => this.keys[key]);
    }

    justPressed(action) {
        const keys = this.bindings[action];
        return keys.some(key => {
            const currentlyPressed = this.keys[key] || false;
            const previouslyPressed = this.prevKeys[key] || false;
            return currentlyPressed && !previouslyPressed;
        });
    }

    update() {
        // Store previous state
        this.prevKeys = { ...this.keys };

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