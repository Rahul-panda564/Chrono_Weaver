class TimelineRecorder {
    constructor() {
        this.isRecording = false;
        this.currentRecording = [];
        this.ghosts = [];
        this.maxGhosts = 5;
        this.maxRecordFrames = 600; // ~10 seconds at 60fps
        this.recordTimer = 0;
    }

    start() {
        if (this.isRecording) return;
        this.isRecording = true;
        this.currentRecording = [];
        this.recordTimer = 0;

        if (typeof game !== 'undefined') {
            game.audio.play('record');
            game.ui.updateCoreStatus('recording');
        }

        console.log('Timeline: Recording started');
    }

    stop() {
        if (!this.isRecording) return;
        this.isRecording = false;

        if (typeof game !== 'undefined') {
            game.audio.play('stopRecord');
            game.ui.updateCoreStatus('normal');
        }

        console.log('Timeline: Recording stopped, frames:', this.currentRecording.length);
    }

    recordFrame(player) {
        if (!this.isRecording) return;

        this.currentRecording.push(player.getSnapshot());

        // Auto-stop if max frames reached
        if (this.currentRecording.length >= this.maxRecordFrames) {
            this.stop();
        }
    }

    rewind() {
        // Stop recording if active
        if (this.isRecording) {
            this.stop();
        }

        // Need a recording to create a ghost
        if (this.currentRecording.length < 10) {
            console.log('Timeline: Recording too short');
            if (typeof game !== 'undefined') {
                game.ui.showNotification('ERROR', 'Recording too short. Hold R to record first.', 2000);
            }
            return;
        }

        // Remove oldest ghost if at max
        if (this.ghosts.length >= this.maxGhosts) {
            this.ghosts.shift();
        }

        // Create ghost from recording
        const ghost = new Ghost([...this.currentRecording]);
        this.ghosts.push(ghost);

        if (typeof game !== 'undefined') {
            game.audio.play('ghostSpawn');
            game.particles.ghostSpawn(ghost.getCenterX(), ghost.getCenterY());
            game.ui.updateEchoCounter(this.ghosts.length, this.maxGhosts);
        }

        // Clear recording for next one
        this.currentRecording = [];

        console.log('Timeline: Ghost spawned, total:', this.ghosts.length);
    }

    update(dt) {
        for (const ghost of this.ghosts) {
            ghost.update(dt || 0.016);
        }

        // Remove inactive ghosts
        this.ghosts = this.ghosts.filter(g => g.active);

        // Update UI
        if (typeof game !== 'undefined') {
            const progress = this.isRecording
                ? this.currentRecording.length / this.maxRecordFrames
                : 0;
            game.ui.updateTimeline(progress, this.isRecording);
        }
    }

    draw(ctx) {
        for (const ghost of this.ghosts) {
            ghost.draw(ctx);
        }
    }

    clear() {
        this.ghosts = [];
        this.currentRecording = [];
        this.isRecording = false;
    }
}
