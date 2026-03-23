class Player extends Entity {
    constructor(x, y) {
        super(x, y, 28, 36);

        // Movement params
        this.moveSpeed = 250;
        this.jumpForce = -380;
        this.airControl = 0.6;

        // State
        this.isRecording = false;
        this.canJump = true;
        this.jumpCooldown = 0;

        // Animation
        this.animTimer = 0;
        this.animFrame = 0;
        this.squash = 1;
        this.stretch = 1;
        this.trailPositions = [];

        // Colors
        this.bodyColor = '#00f0ff';
        this.coreColor = '#ffffff';
    }

    update(input, level, dt) {
        // Horizontal movement
        const moveMultiplier = this.onGround ? 1 : this.airControl;

        if (input.isPressed('moveLeft')) {
            this.vx = -this.moveSpeed * moveMultiplier;
            this.facingRight = false;
        } else if (input.isPressed('moveRight')) {
            this.vx = this.moveSpeed * moveMultiplier;
            this.facingRight = true;
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 5) this.vx = 0;
        }

        // Jump
        if (input.isPressed('jump') && this.onGround && this.canJump) {
            this.vy = this.jumpForce;
            this.onGround = false;
            this.canJump = false;

            // Squash/stretch on jump
            this.squash = 0.7;
            this.stretch = 1.3;

            // Particles & Sound
            if (typeof game !== 'undefined' && game.particles) {
                game.particles.jumpDust(this.getCenterX(), this.y + this.height);
            }
            if (typeof game !== 'undefined' && game.audio) {
                game.audio.play('jump');
            }
        }

        if (!input.isPressed('jump') && this.onGround) {
            this.canJump = true;
        }

        // Physics
        const wasInAir = !this.onGround;
        this.updatePhysics(dt);
        this.resolveCollisions(level);

        // Landing effect
        if (wasInAir && this.onGround) {
            this.squash = 1.3;
            this.stretch = 0.7;
            if (typeof game !== 'undefined' && game.particles) {
                game.particles.landDust(this.getCenterX(), this.y + this.height);
            }
            if (typeof game !== 'undefined' && game.audio) {
                game.audio.play('land');
            }
        }

        // Animate squash/stretch recovery
        this.squash += (1 - this.squash) * 0.15;
        this.stretch += (1 - this.stretch) * 0.15;

        // Trail
        this.trailPositions.unshift({ x: this.getCenterX(), y: this.getCenterY() });
        if (this.trailPositions.length > 10) this.trailPositions.pop();

        // Animation timer
        this.animTimer += dt;
    }

    draw(ctx) {
        ctx.save();

        // Trail
        for (let i = 1; i < this.trailPositions.length; i++) {
            const alpha = 1 - i / this.trailPositions.length;
            ctx.globalAlpha = alpha * 0.2;
            ctx.fillStyle = this.isRecording ? '#ff006e' : this.bodyColor;
            const size = (this.width * 0.4) * (1 - i / this.trailPositions.length);
            ctx.fillRect(
                this.trailPositions[i].x - size / 2,
                this.trailPositions[i].y - size / 2,
                size, size
            );
        }
        ctx.globalAlpha = 1;

        const cx = this.getCenterX();
        const cy = this.getCenterY();

        ctx.translate(cx, cy);
        ctx.scale(this.squash, this.stretch);
        ctx.translate(-cx, -cy);

        // Body glow
        const color = this.isRecording ? '#ff006e' : this.bodyColor;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        // Body
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#0a1628';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Core (eye)
        const eyeX = cx + (this.facingRight ? 4 : -4);
        const eyeY = this.y + 12;
        ctx.fillStyle = this.coreColor;
        ctx.shadowColor = this.coreColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(eyeX - 3, eyeY - 3, 6, 6);

        // Visor line
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(this.x + 3, this.y + 10, this.width - 6, 2);
        ctx.globalAlpha = 1;

        // Legs animation
        if (Math.abs(this.vx) > 10 && this.onGround) {
            const legOffset = Math.sin(this.animTimer * 12) * 3;
            ctx.fillStyle = color;
            ctx.fillRect(this.x + 5, this.y + this.height - 2, 6, 2 + legOffset);
            ctx.fillRect(this.x + this.width - 11, this.y + this.height - 2, 6, 2 - legOffset);
        }

        ctx.restore();
    }

    // Snapshot for timeline recording
    getSnapshot() {
        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            facingRight: this.facingRight,
            onGround: this.onGround
        };
    }
}
