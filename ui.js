export const UIManager = {
    canvas: document.getElementById('detection-overlay'),
    ctx: null,
    infoPanel: document.getElementById('info-panel'),
    settingsModal: document.getElementById('settings-modal'),
    videoElement: document.getElementById('camera-feed'),
    
    // Info Elements
    titleEl: document.getElementById('monument-title'),
    confEl: document.getElementById('confidence-value'),
    periodEl: document.getElementById('monument-period'),
    descEl: document.getElementById('monument-description'),
    addrEl: document.getElementById('monument-address'),
    
    emptyState: document.querySelector('.info-empty-state'),
    contentState: document.querySelector('.info-content'),

    init() {
        this.ctx = this.canvas.getContext('2d');
        
        // Setup slider
        const slider = document.getElementById('confidence-slider');
        const display = document.getElementById('conf-val-display');
        if(slider && display) {
            slider.addEventListener('input', (e) => {
                display.textContent = e.target.value;
            });
        }
        
        // Settings Modal Close
        document.querySelector('.close-btn')?.addEventListener('click', () => {
            this.settingsModal.classList.add('hidden');
        });
        
        // Setup bottom sheet drag/touch interactions (simplificado)
        this.infoPanel.addEventListener('click', () => {
            if (this.infoPanel.classList.contains('peek')) {
                this.infoPanel.style.maxHeight = '80vh';
                this.infoPanel.style.transform = 'translateY(0)';
            }
        });
    },

    setupOverlay(videoWidth, videoHeight) {
        // Set canvas internal dimensions to match video source
        this.canvas.width = videoWidth;
        this.canvas.height = videoHeight;
    },

    drawDetections(predictions, imageWidth, imageHeight) {
        // Clear previous
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!predictions || predictions.length === 0) return;

        // Calculate scaling if video aspect ratio differs from canvas (usually handled by object-fit)
        // Here we assume canvas dimension matches video dimensions directly via setupOverlay
        const scaleX = this.canvas.width / imageWidth;
        const scaleY = this.canvas.height / imageHeight;

        predictions.forEach(p => {
            const x = p.x * scaleX;
            const y = p.y * scaleY;
            const w = p.width * scaleX;
            const h = p.height * scaleY;
            
            // Calc Top Left
            const tlX = x - (w / 2);
            const tlY = y - (h / 2);

            // Draw Box
            this.ctx.strokeStyle = '#d4af37'; // Dourado
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(tlX, tlY, w, h);
            
            // Draw Background for text
            this.ctx.fillStyle = 'rgba(28, 25, 23, 0.8)';
            this.ctx.fillRect(tlX, tlY - 30, w, 30);
            
            // Draw Text
            this.ctx.fillStyle = '#d4af37';
            this.ctx.font = 'bold 16px Inter, sans-serif';
            
            // Format class name (remove underscores, capitalize)
            let displayName = p.class.replace(/_/g, ' ');
            // Limita nome muito longo no box
            if (displayName.length > 20) displayName = displayName.substring(0, 17) + '...';
            
            const text = `${displayName} (${Math.round(p.confidence * 100)}%)`;
            this.ctx.fillText(text, tlX + 5, tlY - 10);
        });
    },

    showInfoPanel(historicalData, confidence) {
        if (!historicalData) return;
        
        // Hide empty state, show content
        this.emptyState.classList.add('hidden');
        this.contentState.classList.remove('hidden');
        
        // Populate data
        this.titleEl.textContent = historicalData.name;
        this.confEl.textContent = `${Math.round(confidence * 100)}%`;
        this.periodEl.textContent = historicalData.period || 'Data não disponível';
        this.descEl.textContent = historicalData.description;
        this.addrEl.textContent = historicalData.location || 'São Luís, MA';
        
        // Slide up panel (peek mode)
        this.infoPanel.classList.remove('collapsed');
        this.infoPanel.classList.add('peek');
    },
    
    toggleSettings() {
        if (this.settingsModal.classList.contains('hidden')) {
            this.settingsModal.classList.remove('hidden');
        } else {
            this.settingsModal.classList.add('hidden');
        }
    }
};
