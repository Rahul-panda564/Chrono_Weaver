class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 1200;
        this.canvas.height = 800;
        
        // Core systems
        this.input = new InputManager();
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.ui = new UIManager();
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, levelComplete, gameComplete
        this.currentLevel = 1;
        this.maxLevels = 10;
        
        // Game objects
        this.level = null;
        this.player = null;
        this.timeline = null;
        
        // Timing
        this.lastTime = 0;
        this.dt = 0;
        
        // Initialize
        this.init();
    }

    async init() {
        console.log('Game: Initializing subsystems...');
        await this.audio.init();
        this.setupEventListeners();
        this.handleResize();
        this.loop(0);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state === 'playing') {
                this.pause();
            }
            // Restart level with T
            if ((e.key === 't' || e.key === 'T') && this.state === 'playing') {
                this.restartLevel();
            }
        });
    }

    startGame() {
        console.log('Game: Starting mission...');
        this.currentLevel = 1;
        this.loadLevel(1);
        this.state = 'playing';
        this.ui.hideMenu('mainMenu');
    }

    loadLevel(num) {
        this.currentLevel = num;
        this.level = new Level(num);
        this.player = new Player(this.level.spawnPoint.x, this.level.spawnPoint.y);
        this.timeline = new TimelineRecorder();
        
        // Setup camera
        this.camera.follow(this.player);
        this.camera.setBounds(0, 0, this.level.width, this.level.height);
        
        // Update UI
        this.ui.setLevel(num);
        this.ui.showNotification('Level ' + num, this.getLevelHint(num));
    }

    getLevelHint(num) {
        const hints = {
            1: "Use A/D to move, SPACE to jump. Climb the staircase to the portal.",
            2: "A gate blocks the way. Press R on the plate to record, R to stop, then SHIFT to spawn an echo!",
            3: "A gate blocks your path. Record (R) yourself on the plate, then Rewind (SHIFT) to create an echo.",
            4: "The plate is far below. Record your path down to it, rewind, then take the upper route.",
            5: "Two gates, two plates. You'll need two echoes to open the way.",
            6: "The plate is on a high platform. Record yourself up there, then take the low road.",
            7: "Watch out for spikes! Record an echo on the plate, then jump carefully past the hazards.",
            8: "Three gates in sequence. Plan three separate echo recordings to open them all.",
            9: "Navigate the maze. Find the plate, record an echo, then find the path past the gate.",
            10: "The final challenge. Three plates, hazards below. Master your timelines to escape."
        };
        return hints[num] || "Solve the temporal paradox.";
    }

    update(dt) {
        if (this.state !== 'playing') return;
        
        // Handle input (check justPressed BEFORE updating prevKeys)
        if (this.input.justPressed('record')) {
            if (this.timeline.isRecording) {
                this.timeline.stop();
            } else {
                this.timeline.start();
            }
        }
        
        if (this.input.justPressed('rewind')) {
            this.timeline.rewind();
        }
        
        // Update systems
        this.player.update(this.input, this.level, dt);
        this.timeline.recordFrame(this.player);
        this.timeline.update(dt);
        this.level.update(this.player, this.timeline.ghosts, dt);
        this.particles.update(dt);
        this.camera.update(dt);

        // Snapshot input state AFTER processing (so prevKeys = this frame's keys)
        this.input.update();
        
        // Check win condition
        if (this.level.checkExit(this.player)) {
            this.levelComplete();
        }
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'playing' || this.state === 'paused') {
            // Apply camera
            this.camera.applyTransform(this.ctx);
            
            // Draw level
            this.level.draw(this.ctx, this.camera);
            
            // Draw timeline ghosts
            this.timeline.draw(this.ctx);
            
            // Draw player
            this.player.draw(this.ctx);
            
            // Draw particles
            this.particles.draw(this.ctx);
            
            // Reset camera
            this.camera.resetTransform(this.ctx);
        }
    }

    loop(timestamp) {
        this.dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;
        
        this.update(this.dt);
        this.draw();
        
        requestAnimationFrame((t) => this.loop(t));
    }

    levelComplete() {
        if (this.state === 'levelComplete') return; // Prevent double-trigger
        this.state = 'levelComplete';
        this.audio.play('levelComplete');
        
        if (this.currentLevel < this.maxLevels) {
            this.ui.showMenu('levelComplete');
        } else {
            this.ui.showGameComplete();
        }
    }

    nextLevel() {
        if (this.state !== 'levelComplete') return; // Guard against double call
        this.loadLevel(this.currentLevel + 1);
        this.state = 'playing';
        this.ui.hideMenu('levelComplete');
    }

    pause() {
        this.state = 'paused';
        this.ui.showMenu('pauseMenu');
    }

    resume() {
        this.state = 'playing';
        this.ui.hideMenu('pauseMenu');
    }

    restartLevel() {
        this.loadLevel(this.currentLevel);
        this.resume();
    }

    toMainMenu() {
        this.state = 'menu';
        this.ui.showMenu('mainMenu');
        this.ui.hideMenu('pauseMenu');
        this.ui.hideMenu('levelComplete');
    }

    showTutorial() {
        this.ui.showMenu('tutorialMenu');
    }

    hideTutorial() {
        this.ui.hideMenu('tutorialMenu');
    }

    showSettings() {
        this.ui.showMenu('settingsMenu');
    }

    hideSettings() {
        this.ui.hideMenu('settingsMenu');
    }

    handleResize() {
        // Maintain aspect ratio
        const container = document.getElementById('gameContainer');
        const aspect = 1200 / 800;
        const windowAspect = window.innerWidth / window.innerHeight;
        
        if (windowAspect > aspect) {
            container.style.height = '95vh';
            container.style.width = `${95 * aspect}vh`;
        } else {
            container.style.width = '95vw';
            container.style.height = `${95 / aspect}vw`;
        }
    }
}

// Start game
let game;
window.addEventListener('DOMContentLoaded', () => {
    console.log('Chrono Weaver: Initializing Game Engine...');
    game = new Game();
});