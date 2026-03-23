class Camera {
    constructor(viewWidth, viewHeight) {
        this.x = 0;
        this.y = 0;
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.target = null;

        // Bounds
        this.minX = 0;
        this.minY = 0;
        this.maxX = Infinity;
        this.maxY = Infinity;

        // Smooth follow
        this.smoothing = 0.08;

        // Screen shake
        this.shakeAmount = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    follow(entity) {
        this.target = entity;
        // Snap immediately on first follow
        if (entity) {
            this.x = entity.x - this.viewWidth / 2;
            this.y = entity.y - this.viewHeight / 2;
        }
    }

    setBounds(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    shake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    update(dt) {
        if (this.target) {
            const targetX = this.target.x + (this.target.width || 0) / 2 - this.viewWidth / 2;
            const targetY = this.target.y + (this.target.height || 0) / 2 - this.viewHeight / 2;

            this.x += (targetX - this.x) * this.smoothing;
            this.y += (targetY - this.y) * this.smoothing;
        }

        // Clamp to bounds
        this.x = Math.max(this.minX, Math.min(this.x, this.maxX - this.viewWidth));
        this.y = Math.max(this.minY, Math.min(this.y, this.maxY - this.viewHeight));

        // Shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt || 0.016;
            const intensity = (this.shakeTimer / this.shakeDuration) * this.shakeAmount;
            this.shakeOffsetX = (Math.random() - 0.5) * intensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * intensity * 2;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    applyTransform(ctx) {
        ctx.save();
        ctx.translate(
            -Math.round(this.x + this.shakeOffsetX),
            -Math.round(this.y + this.shakeOffsetY)
        );
    }

    resetTransform(ctx) {
        ctx.restore();
    }

    // Convert screen coords to world coords
    screenToWorld(sx, sy) {
        return {
            x: sx + this.x,
            y: sy + this.y
        };
    }

    // Check if a rectangle is visible on screen
    isVisible(x, y, w, h) {
        return x + w > this.x && x < this.x + this.viewWidth &&
               y + h > this.y && y < this.y + this.viewHeight;
    }
}