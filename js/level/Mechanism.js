class Mechanism {
    constructor(type, data, tileSize) {
        this.type = type; // 'pressurePlate' or 'gate'
        this.tileSize = tileSize;

        // Position from tile coords
        this.col = data.col;
        this.row = data.row;
        this.x = data.col * tileSize;
        this.y = data.row * tileSize;
        this.width = tileSize;
        this.height = tileSize;

        // State
        this.activated = false;
        this.prevActivated = false;
        this.animProgress = 0;

        // Linked mechanisms (gates linked to plates)
        this.linkedId = data.linkedId || null;
        this.id = data.id || null;

        this.animTimer = Math.random() * Math.PI * 2;
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    update(dt, entities) {
        this.prevActivated = this.activated;
        this.animTimer += dt;

        if (this.type === 'pressurePlate') {
            // Check if any entity is standing on the plate
            this.activated = false;
            for (const ent of entities) {
                if (!ent.active) continue;
                const eb = ent.getBounds();
                // Entity must be standing on or overlapping the plate
                if (eb.right > this.x + 4 && eb.left < this.x + this.width - 4 &&
                    eb.bottom >= this.y && eb.bottom <= this.y + this.height &&
                    eb.top < this.y + this.height) {
                    this.activated = true;
                    break;
                }
            }
        }

        // Animate
        const target = this.activated ? 1 : 0;
        this.animProgress += (target - this.animProgress) * 0.15;
    }

    isSolid() {
        if (this.type === 'gate') {
            return !this.activated;
        }
        return false;
    }

    draw(ctx) {
        if (this.type === 'pressurePlate') {
            this.drawPressurePlate(ctx);
        } else if (this.type === 'gate') {
            this.drawGate(ctx);
        }
    }

    drawPressurePlate(ctx) {
        ctx.save();
        const pressed = this.animProgress;

        // Base
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(this.x + 4, this.y + this.height - 8, this.width - 8, 8);

        // Plate surface
        const plateY = this.y + this.height - 8 - (1 - pressed) * 6;
        const color = this.activated ? '#ffaa00' : '#555566';
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = this.activated ? 15 : 5;
        ctx.fillRect(this.x + 4, plateY, this.width - 8, 4);

        // Indicator lights
        if (this.activated) {
            ctx.fillStyle = '#ffaa00';
            ctx.globalAlpha = 0.5 + 0.3 * Math.sin(this.animTimer * 4);
            ctx.fillRect(this.x + this.width / 2 - 2, plateY - 3, 4, 3);
        }

        ctx.restore();
    }

    drawGate(ctx) {
        if (this.activated && this.animProgress > 0.95) return; // Fully open

        ctx.save();
        const openAmount = this.animProgress;

        // Gate bars
        const barHeight = this.height * (1 - openAmount);
        const color = this.activated ? 'rgba(255, 170, 0, 0.5)' : '#ff3366';

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        // Draw bars sliding up
        const barCount = 4;
        const barWidth = (this.width - 8) / barCount;
        for (let i = 0; i < barCount; i++) {
            ctx.fillRect(
                this.x + 4 + i * barWidth + 1,
                this.y,
                barWidth - 2,
                barHeight
            );
        }

        // Top frame
        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(this.x, this.y, this.width, 4);

        ctx.restore();
    }
}