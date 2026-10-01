import { highlightMonumentOnMap } from './map.js';

export const UIManager = {
    canvas: document.getElementById('detection-overlay'),
    ctx: null,
    videoElement: document.getElementById('camera-feed'),
    
    // Screens
    screens: document.querySelectorAll('.screen'),
    navTabs: document.querySelectorAll('.nav-tab'),
    
    // Floating Card (Camera Screen)
    monumentCard: document.getElementById('monument-card'),
    cardConfidence: document.getElementById('card-confidence-text'),
    cardTitle: document.getElementById('card-monument-name'),
    cardLocation: document.getElementById('card-monument-location'),
    recognitionToast: document.getElementById('recognition-toast'),
    
    // Info Modal
    infoModal: document.getElementById('info-modal'),
    infoBackdrop: document.getElementById('info-modal-backdrop'),
    infoCloseBtn: document.getElementById('info-close-btn'),
    infoTitle: document.getElementById('info-title'),
    infoDesc: document.getElementById('info-description'),
    btnSave: document.getElementById('btn-save'),
    btnContinue: document.getElementById('btn-continue'),
    
    // Current detection state
    currentHistoricalData: null,

    init() {
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
        
        // Setup slider
        const slider = document.getElementById('confidence-slider');
        const display = document.getElementById('conf-val-display');
        if(slider && display) {
            slider.addEventListener('input', (e) => {
                display.textContent = e.target.value;
            });
        }
        
        // Screen Navigation
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetScreenId = tab.getAttribute('data-screen');
                this.switchScreen(targetScreenId);
            });
        });

        // Open Modal from Card
        this.monumentCard?.addEventListener('click', () => {
            this.openInfoModal();
        });

        // Close Modal
        this.infoBackdrop?.addEventListener('click', () => this.closeInfoModal());
        this.infoCloseBtn?.addEventListener('click', () => this.closeInfoModal());
        this.btnContinue?.addEventListener('click', () => this.closeInfoModal());
    },

    switchScreen(screenId) {
        // Update nav UI
        this.navTabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.nav-tab[data-screen="${screenId}"]`);
        if(activeTab) activeTab.classList.add('active');

        // Update screens
        this.screens.forEach(s => s.classList.remove('active'));
        const activeScreen = document.getElementById(screenId);
        if(activeScreen) activeScreen.classList.add('active');
    },

    setupOverlay(videoWidth, videoHeight) {
        if (this.canvas) {
            this.canvas.width = videoWidth;
            this.canvas.height = videoHeight;
        }
    },

    drawDetections(predictions, imageWidth, imageHeight) {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Se não houver predições, oculta o card e o toast
        if (!predictions || predictions.length === 0) {
            this.monumentCard?.classList.add('hidden');
            this.recognitionToast?.classList.add('hidden');
            return;
        }

        const scaleX = this.canvas.width / imageWidth;
        const scaleY = this.canvas.height / imageHeight;

        predictions.forEach(p => {
            const x = p.x * scaleX;
            const y = p.y * scaleY;
            const w = p.width * scaleX;
            const h = p.height * scaleY;
            
            const tlX = x - (w / 2);
            const tlY = y - (h / 2);

            // Bounding box (cantoneiras verdes limpas)
            this.ctx.strokeStyle = '#20b27c'; 
            this.ctx.lineWidth = 3;
            
            const cornerSize = 24;

            this.ctx.beginPath();
            // Top left corner
            this.ctx.moveTo(tlX, tlY + cornerSize);
            this.ctx.lineTo(tlX, tlY);
            this.ctx.lineTo(tlX + cornerSize, tlY);
            
            // Top right corner
            this.ctx.moveTo(tlX + w - cornerSize, tlY);
            this.ctx.lineTo(tlX + w, tlY);
            this.ctx.lineTo(tlX + w, tlY + cornerSize);
            
            // Bottom right corner
            this.ctx.moveTo(tlX + w, tlY + h - cornerSize);
            this.ctx.lineTo(tlX + w, tlY + h);
            this.ctx.lineTo(tlX + w - cornerSize, tlY + h);
            
            // Bottom left corner
            this.ctx.moveTo(tlX, tlY + h - cornerSize);
            this.ctx.lineTo(tlX, tlY + h);
            this.ctx.lineTo(tlX + cornerSize, tlY + h);
            
            this.ctx.stroke();
        });
    },

    showInfoPanel(historicalData, confidence, classKey) {
        if (!historicalData) return;

        this.currentHistoricalData = historicalData;
        const confPct = Math.round(confidence * 100);

        // Atualiza o Card Flutuante
        if(this.cardTitle) this.cardTitle.textContent = historicalData.name;
        if(this.cardConfidence) this.cardConfidence.textContent = `${confPct}% de confiança`;
        if(this.cardLocation) this.cardLocation.textContent = historicalData.location || 'São Luís, MA';
        
        // Exibe o toast e o card (se estiverem na tela da câmera)
        const cameraScreen = document.getElementById('screen-camera');
        if(cameraScreen && cameraScreen.classList.contains('active')) {
            this.recognitionToast?.classList.remove('hidden');
            this.monumentCard?.classList.remove('hidden');
        }

        // Highlight on map
        if (typeof highlightMonumentOnMap === 'function' && classKey) {
            highlightMonumentOnMap(classKey);
        }
    },
    
    openInfoModal() {
        if(!this.currentHistoricalData) return;
        
        // Preenche a modal
        this.infoTitle.textContent = this.currentHistoricalData.name;
        this.infoDesc.textContent = this.currentHistoricalData.description;
        
        // Mostra a modal
        this.infoModal.classList.remove('hidden');
    },
    
    closeInfoModal() {
        this.infoModal.classList.add('hidden');
    }
};
