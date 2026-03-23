class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width || 32;
        this.height = height || 32;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.gravity = 800;
        this.maxFallSpeed = 600;
        this.friction = 0.85;

        // State
        this.active = true;
        this.facingRight = true;
    }

    applyGravity(dt) {
        if (!this.onGround) {
            this.vy = Math.min(this.vy + this.gravity * dt, this.maxFallSpeed);
        }
    }

    updatePhysics(dt) {
        this.applyGravity(dt);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    // Axis-aligned bounding box
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    // Check overlap with another entity
    overlaps(other) {
        const a = this.getBounds();
        const b = other.getBounds();
        return a.left < b.right && a.right > b.left &&
               a.top < b.bottom && a.bottom > b.top;
    }

    // Resolve collisions against the tilemap
    resolveCollisions(level) {
        const tileSize = level.tileSize;
        this.onGround = false;

        // Horizontal collision
        {
            const startRow = Math.floor(this.y / tileSize);
            const endRow = Math.floor((this.y + this.height - 1) / tileSize);
            if (this.vx > 0) {
                const col = Math.floor((this.x + this.width) / tileSize);
                for (let row = startRow; row <= endRow; row++) {
                    if (level.isSolid(col, row)) {
                        this.x = col * tileSize - this.width;
                        this.vx = 0;
                        break;
                    }
                }
            } else if (this.vx < 0) {
                const col = Math.floor(this.x / tileSize);
                for (let row = startRow; row <= endRow; row++) {
                    if (level.isSolid(col, row)) {
                        this.x = (col + 1) * tileSize;
                        this.vx = 0;
                        break;
                    }
                }
            }
        }

        // Vertical collision
        {
            const startCol = Math.floor(this.x / tileSize);
            const endCol = Math.floor((this.x + this.width - 1) / tileSize);
            if (this.vy > 0) {
                const row = Math.floor((this.y + this.height) / tileSize);
                for (let col = startCol; col <= endCol; col++) {
                    if (level.isSolid(col, row)) {
                        this.y = row * tileSize - this.height;
                        this.vy = 0;
                        this.onGround = true;
                        break;
                    }
                }
            } else if (this.vy < 0) {
                const row = Math.floor(this.y / tileSize);
                for (let col = startCol; col <= endCol; col++) {
                    if (level.isSolid(col, row)) {
                        this.y = (row + 1) * tileSize;
                        this.vy = 0;
                        break;
                    }
                }
            }
        }
    }

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }
}