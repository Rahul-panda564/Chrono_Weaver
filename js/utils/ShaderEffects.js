class ShaderEffects {
    static glowRect(ctx, x, y, w, h, color, intensity = 1) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 * intensity;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 * intensity;
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        ctx.restore();
    }

    static drawGlowLine(ctx, x1, y1, x2, y2, color, width = 2, intensity = 1) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * intensity;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    static drawGlowCircle(ctx, x, y, radius, color, intensity = 1) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 * intensity;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5 * intensity;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static scanlines(ctx, width, height, opacity = 0.03) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 2);
        }
        ctx.restore();
    }

    static vignette(ctx, width, height) {
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, height * 0.3,
            width / 2, height / 2, height * 0.8
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    static chromaticAberration(ctx, imageData, amount = 2) {
        // Simplified chromatic aberration shift
        const data = imageData.data;
        const width = imageData.width;
        for (let i = 0; i < data.length; i += 4) {
            const pixel = i / 4;
            const shiftIdx = (pixel + amount) * 4;
            if (shiftIdx < data.length) {
                data[i] = data[shiftIdx]; // shift red channel
            }
        }
        return imageData;
    }
}
