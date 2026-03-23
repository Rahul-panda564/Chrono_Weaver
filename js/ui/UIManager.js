class UIManager {
    constructor() {
        this.elements = {
            coreStatus: document.getElementById('coreStatus'),
            levelDisplay: document.getElementById('levelDisplay'),
            ghostCount: document.getElementById('ghostCount'),
            echoFill: document.getElementById('echoFill'),
            timelineProgress: document.getElementById('timelineProgress'),
            timelineStatus: document.getElementById('timelineStatus'),
            notification: document.getElementById('notification'),
            notifTitle: document.getElementById('notifTitle'),
            notifText: document.getElementById('notifText')
        };
        
        this.notifTimeout = null;
    }

    updateCoreStatus(status) {
        const el = this.elements.coreStatus;
        if (!el) return;
        el.className = 'core-center';
        
        switch(status) {
            case 'recording':
                el.classList.add('recording');
                break;
            case 'cooldown':
                el.classList.add('cooldown');
                break;
        }
    }

    setLevel(num) {
        if (this.elements.levelDisplay) {
            this.elements.levelDisplay.textContent = num.toString().padStart(2, '0');
        }
    }

    updateEchoCounter(current, max) {
        if (this.elements.ghostCount) {
            this.elements.ghostCount.textContent = current;
        }
        if (this.elements.echoFill) {
            this.elements.echoFill.style.width = `${(current / max) * 100}%`;
        }
    }

    updateTimeline(progress, isRecording) {
        if (!this.elements.timelineProgress) return;
        this.elements.timelineProgress.style.width = `${progress * 100}%`;
        this.elements.timelineProgress.className = 'timeline-progress';
        
        if (isRecording) {
            this.elements.timelineProgress.classList.add('recording');
            this.elements.timelineStatus.textContent = 'RECORDING';
            this.elements.timelineStatus.style.color = '#ff006e';
        } else {
            this.elements.timelineStatus.textContent = 'NOW';
            this.elements.timelineStatus.style.color = '#00f0ff';
        }
    }

    showNotification(title, text, duration = 3000) {
        const el = this.elements.notification;
        if (!el) return;
        this.elements.notifTitle.textContent = title;
        this.elements.notifText.textContent = text;
        
        el.classList.remove('hidden');
        el.classList.add('show');
        
        if (this.notifTimeout) clearTimeout(this.notifTimeout);
        
        this.notifTimeout = setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.classList.add('hidden'), 300);
        }, duration);
    }

    showMenu(menuId) {
        const el = document.getElementById(menuId);
        if (el) el.classList.add('active');
    }

    hideMenu(menuId) {
        const el = document.getElementById(menuId);
        if (el) el.classList.remove('active');
    }

    showLevelComplete(callback) {
        this.showMenu('levelComplete');
        setTimeout(callback, 3000);
    }

    showGameComplete() {
        this.showMenu('gameComplete');
    }
}