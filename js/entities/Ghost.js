class Ghost extends Entity {
    constructor(recording) {
        // Start at first recorded position
        const first = recording[0];
        super(first.x, first.y, 28, 36);

        this.recording = recording;
        this.frameIndex = 0;
        this.active = true;
        this.looping = true;
        this.alpha = 0.6;

        // Visual
        this.color = '#ff006e';
        this.pulseTimer = 0;
        this.trailPositions = [];
    }

    update(dt) {
        if (!this.active || this.recording.length === 0) return;

        // Advance frame
        this.frameIndex++;
        if (this.frameIndex >= this.recording.length) {
            if (this.looping) {
                this.frameIndex = 0;
            } else {
                this.active = false;
                return;
            }
        }

        // Apply recorded state
        const frame = this.recording[this.frameIndex];
        this.x = frame.x;
        this.y = frame.y;
        this.vx = frame.vx;
        this.vy = frame.vy;
        this.facingRight = frame.facingRight;
        this.onGround = frame.onGround;

        this.pulseTimer += dt;

        // Trail
        this.trailPositions.unshift({ x: this.getCenterX(), y: this.getCenterY() });
        if (this.trailPositions.length > 8) this.trailPositions.pop();
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        // Ghost trail
        for (let i = 1; i < this.trailPositions.length; i++) {
            const a = (1 - i / this.trailPositions.length) * this.alpha * 0.3;
            ctx.globalAlpha = a;
            ctx.fillStyle = this.color;
            const size = (this.width * 0.3) * (1 - i / this.trailPositions.length);
            ctx.fillRect(
                this.trailPositions[i].x - size / 2,
                this.trailPositions[i].y - size / 2,
                size, size
            );
        }

        // Pulsing alpha
        const pulse = 0.15 * Math.sin(this.pulseTimer * 4);
        ctx.globalAlpha = this.alpha + pulse;

        // Body glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;

        // Outer glow
        ctx.fillStyle = this.color;
        ctx.globalAlpha = (this.alpha + pulse) * 0.2;
        ctx.fillRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);

        // Body
        ctx.globalAlpha = this.alpha + pulse;
        ctx.fillStyle = 'rgba(20, 5, 15, 0.7)';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -this.pulseTimer * 20;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.setLineDash([]);

        // Core
        const cx = this.getCenterX() + (this.facingRight ? 4 : -4);
        const cy = this.y + 12;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(cx - 3, cy - 3, 6, 6);

        // "ECHO" label
        ctx.font = '8px Orbitron, monospace';
        ctx.fillStyle = this.color;
        ctx.globalAlpha = (this.alpha + pulse) * 0.7;
        ctx.textAlign = 'center';
        ctx.fillText('ECHO', this.getCenterX(), this.y - 6);

        ctx.restore();
    }
}
