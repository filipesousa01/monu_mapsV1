import { highlightMonumentOnMap } from './map.js';

export const UIManager = {
    canvas: document.getElementById('detection-overlay'),
    ctx: null,
    videoElement: document.getElementById('camera-feed'),
    settingsModal: document.getElementById('settings-modal'),
    
    // Bottom sheet
    infoPanel: document.getElementById('info-panel'),
    emptyState: document.querySelector('.info-empty-state'),
    contentState: document.querySelector('.info-content'),
    
    // Info Elements
    titleEl: document.getElementById('monument-title'),
    confEl: document.getElementById('confidence-value'),
    periodEl: document.getElementById('monument-period'),
    descEl: document.getElementById('monument-description'),
    addrEl: document.getElementById('monument-address'),
    
    // Collapsible Elements
    pillNameDisplay: document.getElementById('pill-name-display'),
    pillBadgeDisplay: document.getElementById('pill-badge-display'),
    sheetPillToggle: document.getElementById('sheet-pill-toggle'),
    sheetDragHandle: document.getElementById('sheet-drag-handle'),

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
        
        // Settings Modal Close
        document.querySelector('.close-btn')?.addEventListener('click', () => {
            this.settingsModal.classList.add('hidden');
        });

        this.sheetPillToggle?.addEventListener('click', () => this.toggleSheet());
        this.sheetDragHandle?.addEventListener('click', () => this.toggleSheet());

        // Initially show collapsed state
        this.infoPanel.className = 'bottom-sheet state-collapsed';
    },

    toggleSheet() {
        // Se estiver escondido, não faz nada
        if (this.infoPanel.classList.contains('state-hidden')) return;

        // Se estiver expandido, recolhe para o estado anterior (peek se tiver conteúdo, senão collapsed)
        if (this.infoPanel.classList.contains('state-expanded')) {
            if (!this.emptyState.classList.contains('hidden')) {
                this.infoPanel.className = 'bottom-sheet state-collapsed';
            } else {
                this.infoPanel.className = 'bottom-sheet state-peek';
            }
        } else {
            // Se estiver colapsado ou em peek, expande para ver tudo
            this.infoPanel.className = 'bottom-sheet state-expanded';
        }
    },

    setupOverlay(videoWidth, videoHeight) {
        // Canvas mantido apenas para captura de frames (offscreen), sem desenho visual
        if (this.canvas) {
            this.canvas.width = videoWidth;
            this.canvas.height = videoHeight;
        }
    },

    drawDetections(predictions, imageWidth, imageHeight) {
        if (!this.ctx) return;
        
        // Clear previous
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!predictions || predictions.length === 0) return;

        // Calculate scaling
        const scaleX = this.canvas.width / imageWidth;
        const scaleY = this.canvas.height / imageHeight;

        predictions.forEach(p => {
            const x = p.x * scaleX;
            const y = p.y * scaleY;
            const w = p.width * scaleX;
            const h = p.height * scaleY;
            
            // Top Left
            const tlX = x - (w / 2);
            const tlY = y - (h / 2);

            // Bounding box minimalista (cantoneiras)
            this.ctx.strokeStyle = '#20b27c'; // Emerald accent
            this.ctx.lineWidth = 2.5;
            
            const cornerSize = 20;

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

            // Ponto central de foco (cruz pequena)
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y);
            this.ctx.lineTo(x + 5, y);
            this.ctx.moveTo(x, y - 5);
            this.ctx.lineTo(x, y + 5);
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Dourado
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
        });
    },

    showInfoPanel(historicalData, confidence, classKey) {
        if (!historicalData) return;

        const confPct = Math.round(confidence * 100);

        // Update Pill UI
        this.pillNameDisplay.textContent = historicalData.name;
        this.pillNameDisplay.classList.remove('pill-name-empty');
        this.pillBadgeDisplay.textContent = `${confPct}%`;
        this.pillBadgeDisplay.classList.remove('hidden');

        // Hide empty state, show content
        this.emptyState.classList.add('hidden');
        this.contentState.classList.remove('hidden');

        // Populate expanded data
        this.titleEl.textContent = historicalData.name;
        this.periodEl.textContent = historicalData.period || 'Data não disponível';
        this.descEl.textContent = historicalData.description;
        this.addrEl.textContent = historicalData.location || 'São Luís, MA';

        // Auto-show info panel when monument detected
        // Se está escondido ou apenas colapsado, abre em peek para mostrar resultado
        if (this.infoPanel.classList.contains('state-hidden') || 
            this.infoPanel.classList.contains('state-collapsed')) {
            this.infoPanel.className = 'bottom-sheet state-peek';
        }

        // Highlight on map (if map is active/implemented)
        if (typeof highlightMonumentOnMap === 'function' && classKey) {
            highlightMonumentOnMap(classKey);
        }
    },
    
    toggleSettings() {
        if (this.settingsModal.classList.contains('hidden')) {
            this.settingsModal.classList.remove('hidden');
        } else {
            this.settingsModal.classList.add('hidden');
        }
    }
};
