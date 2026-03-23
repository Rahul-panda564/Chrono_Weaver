class AudioManager {
    constructor() {
        this.ctx = null;
        this.sounds = {};
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
    }

    async init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.ctx.destination);

            this.initialized = true;
            console.log('AudioManager: Web Audio API initialized');
        } catch (e) {
            console.warn('AudioManager: Web Audio API not available', e);
        }
    }

    // Generate sounds procedurally (no external files needed)
    _createTone(frequency, duration, type = 'sine', gain = 0.3) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.sfxGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    _createNoise(duration, gain = 0.1) {
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);

        source.start();
    }

    play(soundName) {
        if (!this.initialized) return;

        // Resume context if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        switch (soundName) {
            case 'jump':
                this._createTone(300, 0.15, 'square', 0.15);
                setTimeout(() => this._createTone(450, 0.1, 'square', 0.1), 50);
                break;

            case 'land':
                this._createNoise(0.08, 0.15);
                this._createTone(120, 0.1, 'sine', 0.1);
                break;

            case 'record':
                this._createTone(523, 0.1, 'sine', 0.2);
                setTimeout(() => this._createTone(659, 0.1, 'sine', 0.2), 80);
                setTimeout(() => this._createTone(784, 0.15, 'sine', 0.15), 160);
                break;

            case 'stopRecord':
                this._createTone(784, 0.1, 'sine', 0.2);
                setTimeout(() => this._createTone(523, 0.2, 'sine', 0.15), 80);
                break;

            case 'rewind':
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this._createTone(800 - i * 100, 0.08, 'sawtooth', 0.08);
                    }, i * 60);
                }
                break;

            case 'ghostSpawn':
                this._createTone(200, 0.3, 'sine', 0.15);
                this._createTone(400, 0.3, 'triangle', 0.1);
                break;

            case 'pressurePlate':
                this._createTone(440, 0.15, 'square', 0.15);
                setTimeout(() => this._createTone(660, 0.15, 'square', 0.1), 100);
                break;

            case 'levelComplete':
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, i) => {
                    setTimeout(() => this._createTone(freq, 0.3, 'sine', 0.2), i * 150);
                });
                break;

            case 'portal':
                this._createTone(600, 0.2, 'sine', 0.1);
                this._createTone(900, 0.2, 'triangle', 0.08);
                break;

            default:
                // Generic blip
                this._createTone(440, 0.1, 'sine', 0.1);
        }
    }

    setMusicVolume(val) {
        if (this.musicGain) this.musicGain.gain.value = val;
    }

    setSfxVolume(val) {
        if (this.sfxGain) this.sfxGain.gain.value = val;
    }
}