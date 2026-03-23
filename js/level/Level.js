class Level {
    constructor(num) {
        const data = LEVEL_DATA[num];
        if (!data) {
            console.error('Level data not found for level', num);
            return;
        }

        this.tileSize = data.tileSize;
        this.map = data.map;
        this.rows = this.map.length;
        this.cols = this.map[0].length;
        this.width = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;

        // Build tiles
        this.tiles = [];
        this.spawnPoint = { x: 80, y: 400 };
        this.exitTiles = [];

        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const type = this.map[row][col];
                this.tiles[row][col] = new Tile(type, col, row, this.tileSize);

                if (type === 5) {
                    this.spawnPoint = { x: col * this.tileSize, y: row * this.tileSize - 36 };
                    this.map[row][col] = 0; // Clear spawn marker
                    this.tiles[row][col].type = 0;
                }
                if (type === 4) {
                    this.exitTiles.push(this.tiles[row][col]);
                }
            }
        }

        // Build mechanisms
        this.mechanisms = [];
        this.pressurePlates = [];
        this.gates = [];

        for (const mechData of (data.mechanisms || [])) {
            const mech = new Mechanism(mechData.type, mechData, this.tileSize);
            this.mechanisms.push(mech);

            if (mechData.type === 'pressurePlate') {
                this.pressurePlates.push(mech);
            } else if (mechData.type === 'gate') {
                this.gates.push(mech);
                // Only clear gate marker tiles (7), preserve wall tiles (1) as solid floor
                if (this.map[mechData.row] && this.map[mechData.row][mechData.col] === 7) {
                    this.map[mechData.row][mechData.col] = 0; // handled by mechanism
                }
            }

            // Clear mechanism tiles from map (drawn separately)
            if (mechData.type === 'pressurePlate' && this.map[mechData.row]) {
                this.map[mechData.row][mechData.col] = 0;
            }
        }

        // Background grid animation
        this.bgTimer = 0;
    }

    isSolid(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;
        if (this.map[row][col] === 1) return true;

        // Check gates
        for (const gate of this.gates) {
            if (gate.col === col && gate.row === row && gate.isSolid()) {
                return true;
            }
        }
        return false;
    }

    update(player, ghosts, dt) {
        this.bgTimer += dt || 0.016;

        // Collect all entities for mechanism checks
        const entities = [player, ...ghosts.filter(g => g.active)];

        // Update mechanisms
        for (const mech of this.mechanisms) {
            mech.update(dt || 0.016, entities);
        }

        // Link plates to gates
        for (const plate of this.pressurePlates) {
            if (plate.linkedId) {
                for (const gate of this.gates) {
                    if (gate.id === plate.linkedId) {
                        gate.activated = plate.activated;
                        gate.animProgress += (gate.activated ? 1 : 0 - gate.animProgress) * 0.15;
                    }
                }
            }

            // Play sound on activation change
            if (plate.activated && !plate.prevActivated) {
                if (typeof game !== 'undefined' && game.audio) {
                    game.audio.play('pressurePlate');
                }
                if (typeof game !== 'undefined' && game.particles) {
                    game.particles.plateActivate(
                        plate.x + plate.width / 2,
                        plate.y
                    );
                }
            }
        }

        // Portal particles
        for (const exit of this.exitTiles) {
            if (typeof game !== 'undefined' && game.particles && Math.random() < 0.15) {
                game.particles.portalSparkle(
                    exit.x + exit.size / 2,
                    exit.y + exit.size / 2
                );
            }
        }
    }

    checkExit(player) {
        for (const exit of this.exitTiles) {
            const dx = player.getCenterX() - (exit.x + exit.size / 2);
            const dy = player.getCenterY() - (exit.y + exit.size / 2);
            if (Math.abs(dx) < exit.size * 0.6 && Math.abs(dy) < exit.size * 0.6) {
                return true;
            }
        }
        return false;
    }

    draw(ctx, camera) {
        // Background grid
        this.drawBackground(ctx, camera);

        // Draw tiles
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.tiles[row][col];
                if (tile.type !== 0 && tile.type !== 5 && tile.type !== 6 && tile.type !== 7) {
                    if (camera.isVisible(tile.x, tile.y, tile.size, tile.size)) {
                        tile.draw(ctx, 0.016);
                    }
                }
            }
        }

        // Draw mechanisms
        for (const mech of this.mechanisms) {
            mech.draw(ctx);
        }
    }

    drawBackground(ctx, camera) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        ctx.lineWidth = 1;

        const gridSize = 80;
        const startX = Math.floor(camera.x / gridSize) * gridSize;
        const startY = Math.floor(camera.y / gridSize) * gridSize;
        const endX = startX + camera.viewWidth + gridSize;
        const endY = startY + camera.viewHeight + gridSize;

        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }

        ctx.restore();
    }
}