// Tile types:
// 0 = empty, 1 = solid wall, 2 = platform (one-way), 
// 3 = hazard/spikes, 4 = exit portal spawn, 5 = player spawn,
// 6 = pressure plate, 7 = gate (opened by pressure plate)

class Tile {
    constructor(type, col, row, tileSize) {
        this.type = type;
        this.col = col;
        this.row = row;
        this.x = col * tileSize;
        this.y = row * tileSize;
        this.size = tileSize;
        this.animTimer = Math.random() * Math.PI * 2; // offset for animations
    }

    isSolid() {
        return this.type === 1;
    }

    draw(ctx, dt) {
        this.animTimer += dt || 0.016;

        switch (this.type) {
            case 1: // Solid wall
                this.drawWall(ctx);
                break;
            case 3: // Hazard
                this.drawHazard(ctx);
                break;
            case 4: // Exit portal
                this.drawPortal(ctx);
                break;
            case 6: // Pressure plate
                // Drawn by Mechanism class
                break;
            case 7: // Gate
                // Drawn by Mechanism class
                break;
        }
    }

    drawWall(ctx) {
        // Dark tech wall
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // Grid pattern
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 1, this.y + 1, this.size - 2, this.size - 2);

        // Highlight edges
        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.fillRect(this.x, this.y, this.size, 2); // top edge
        ctx.fillRect(this.x, this.y, 2, this.size); // left edge
    }

    drawHazard(ctx) {
        const pulse = 0.3 + 0.2 * Math.sin(this.animTimer * 3);
        ctx.save();
        ctx.fillStyle = `rgba(255, 0, 50, ${pulse})`;
        ctx.shadowColor = '#ff0032';
        ctx.shadowBlur = 10;

        // Spike triangles
        const spikes = 4;
        const sw = this.size / spikes;
        for (let i = 0; i < spikes; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + i * sw, this.y + this.size);
            ctx.lineTo(this.x + i * sw + sw / 2, this.y + this.size * 0.4);
            ctx.lineTo(this.x + (i + 1) * sw, this.y + this.size);
            ctx.fill();
        }
        ctx.restore();
    }

    drawPortal(ctx) {
        const cx = this.x + this.size / 2;
        const cy = this.y + this.size / 2;
        const pulse = 0.6 + 0.4 * Math.sin(this.animTimer * 2);
        const radius = (this.size / 2 - 4) * pulse;

        ctx.save();
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 25;

        // Outer ring
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(cx, cy, this.size / 2 - 4, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Rotating indicator
        const angle = this.animTimer * 2;
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, this.size / 2 - 8, angle, angle + Math.PI * 0.5);
        ctx.stroke();

        ctx.restore();
    }
}
