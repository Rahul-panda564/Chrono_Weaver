class Particle {
    constructor(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.dead = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 100 * dt; // gravity
        this.life -= dt;
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const currentSize = this.size * alpha;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(this.x - currentSize / 2, this.y - currentSize / 2, currentSize, currentSize);
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, options = {}) {
        const {
            color = '#00f0ff',
            speed = 100,
            life = 0.8,
            size = 4,
            spread = Math.PI * 2,
            angle = -Math.PI / 2,
            gravity = true
        } = options;

        for (let i = 0; i < count; i++) {
            const dir = angle + (Math.random() - 0.5) * spread;
            const spd = speed * (0.5 + Math.random() * 0.5);
            const vx = Math.cos(dir) * spd;
            const vy = Math.sin(dir) * spd;
            const p = new Particle(
                x + (Math.random() - 0.5) * 8,
                y + (Math.random() - 0.5) * 8,
                vx, vy,
                life * (0.5 + Math.random() * 0.5),
                color,
                size * (0.5 + Math.random() * 0.5)
            );
            if (!gravity) p.vy = vy; // override gravity in update if needed
            this.particles.push(p);
        }
    }

    // Preset: jump dust
    jumpDust(x, y) {
        this.emit(x, y, 8, {
            color: '#aaaacc',
            speed: 60,
            life: 0.4,
            size: 3,
            spread: Math.PI,
            angle: -Math.PI / 2
        });
    }

    // Preset: land dust
    landDust(x, y) {
        this.emit(x, y, 12, {
            color: '#888899',
            speed: 80,
            life: 0.3,
            size: 3,
            spread: Math.PI * 0.8,
            angle: -Math.PI / 2
        });
    }

    // Preset: ghost spawn
    ghostSpawn(x, y) {
        this.emit(x, y, 20, {
            color: '#ff006e',
            speed: 120,
            life: 0.6,
            size: 5,
            spread: Math.PI * 2
        });
    }

    // Preset: portal sparkle
    portalSparkle(x, y) {
        this.emit(x, y, 3, {
            color: '#00ff88',
            speed: 40,
            life: 1.0,
            size: 3,
            spread: Math.PI * 2
        });
    }

    // Preset: plate activation
    plateActivate(x, y) {
        this.emit(x, y, 10, {
            color: '#ffaa00',
            speed: 80,
            life: 0.5,
            size: 4,
            spread: Math.PI,
            angle: -Math.PI / 2
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt || 0.016);
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    clear() {
        this.particles = [];
    }
}
