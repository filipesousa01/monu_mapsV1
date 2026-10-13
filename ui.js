import { highlightMonumentOnMap, invalidateMapSize } from './map.js';
import { getHistoricalData } from './historical-data.js';

const SAVED_STORAGE_KEY = 'hpm-saved-monuments';

function loadSaved() {
    try {
        return new Set(JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY)) || []);
    } catch {
        return new Set();
    }
}

function persistSaved(saved) {
    try {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify([...saved]));
    } catch {
        // armazenamento indisponível (aba anônima etc.) — fica só em memória
    }
}

export const UIManager = {
    canvas: document.getElementById('detection-overlay'),
    ctx: null,
    videoElement: document.getElementById('camera-feed'),

    // Screens
    screens: document.querySelectorAll('.screen'),
    navTabs: document.querySelectorAll('.nav-tab'),
    bottomNav: document.getElementById('bottom-nav'),
    cameraScreen: document.getElementById('screen-camera'),

    // Selo flutuante (tela Explorar)
    monumentCard: document.getElementById('monument-card'),
    cardConfidence: document.getElementById('card-confidence-text'),
    cardTitle: document.getElementById('card-monument-name'),
    cardLocation: document.getElementById('card-monument-location'),
    recognitionToast: document.getElementById('recognition-toast'),

    // Ficha do monumento
    infoModal: document.getElementById('info-modal'),
    infoBackdrop: document.getElementById('info-modal-backdrop'),
    infoCloseBtn: document.getElementById('info-close-btn'),
    infoTitle: document.getElementById('info-title'),
    infoDesc: document.getElementById('info-description'),
    infoPeriod: document.getElementById('info-period'),
    infoLocation: document.getElementById('info-location'),
    infoConfidence: document.getElementById('info-confidence'),
    infoConfidenceRow: document.getElementById('info-confidence-row'),
    btnSave: document.getElementById('btn-save'),
    btnMap: document.getElementById('btn-map'),
    btnContinue: document.getElementById('btn-continue'),

    // Current detection state
    currentHistoricalData: null,
    currentClassKey: null,
    currentConfidence: null,

    // Monumento aberto na ficha
    modalClassKey: null,
    saved: loadSaved(),

    init() {
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
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

        // Ações da ficha
        this.btnSave?.addEventListener('click', () => this.toggleSaved());
        this.btnMap?.addEventListener('click', () => {
            const classKey = this.modalClassKey;
            this.closeInfoModal();
            this.switchScreen('screen-map');
            if (classKey) highlightMonumentOnMap(classKey, true);
        });
    },

    switchScreen(screenId) {
        // Update nav UI
        this.navTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-screen') === screenId;
            tab.classList.toggle('active', isActive);
            if (isActive) tab.setAttribute('aria-current', 'page');
            else tab.removeAttribute('aria-current');
        });

        // Barra escura sobre a câmera, clara nas outras telas
        this.bottomNav?.classList.toggle('on-camera', screenId === 'screen-camera');

        // Update screens
        this.screens.forEach(s => s.classList.toggle('active', s.id === screenId));

        // O Leaflet precisa recalcular o tamanho quando o mapa fica visível
        if (screenId === 'screen-map') invalidateMapSize();
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

        const hasDetection = Boolean(predictions && predictions.length > 0);
        this.cameraScreen?.classList.toggle('has-detection', hasDetection);

        // Se não houver predições, oculta o selo
        if (!hasDetection) {
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

            // Cantos de foco amarelos (mesmo estilo do visor)
            this.ctx.strokeStyle = '#FFD60A';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

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
        this.currentClassKey = classKey || null;
        this.currentConfidence = confidence;
        const confPct = Math.round(confidence * 100);

        // Atualiza o selo
        if (this.cardTitle) this.cardTitle.textContent = historicalData.name;
        if (this.cardConfidence) this.cardConfidence.textContent = `${confPct}% de confiança`;
        if (this.cardLocation) this.cardLocation.textContent = historicalData.location || 'São Luís, MA';
        if (this.recognitionToast) this.recognitionToast.textContent = `${historicalData.name} reconhecido`;

        // Exibe o selo (se estiver na tela da câmera)
        if (this.cameraScreen?.classList.contains('active')) {
            this.recognitionToast?.classList.remove('hidden');
            this.monumentCard?.classList.remove('hidden');
        }

        // Highlight on map
        if (classKey) highlightMonumentOnMap(classKey);
    },

    // Abre a ficha do monumento detectado agora pela câmera
    openInfoModal() {
        if (!this.currentHistoricalData) return;
        this.renderInfoModal(this.currentHistoricalData, this.currentClassKey, this.currentConfidence);
    },

    // Abre a ficha a partir do mapa (sem dado de reconhecimento)
    openMonument(classKey) {
        this.renderInfoModal(getHistoricalData(classKey), classKey, null);
    },

    renderInfoModal(data, classKey, confidence) {
        this.modalClassKey = classKey;

        this.infoTitle.textContent = data.name;
        this.infoDesc.textContent = data.description;
        if (this.infoPeriod) this.infoPeriod.textContent = data.period || '—';
        if (this.infoLocation) this.infoLocation.textContent = data.location || 'São Luís, MA';

        const hasConfidence = typeof confidence === 'number';
        this.infoConfidenceRow?.classList.toggle('hidden', !hasConfidence);
        if (hasConfidence && this.infoConfidence) {
            this.infoConfidence.textContent = `${Math.round(confidence * 100)}%`;
        }

        this.btnSave?.classList.toggle('hidden', !classKey);
        this.btnMap?.classList.toggle('hidden', !classKey);
        this.updateSaveButton();

        this.infoModal.classList.remove('hidden');
        this.infoModal.querySelector('.info-modal-sheet')?.scrollTo(0, 0);
    },

    closeInfoModal() {
        this.infoModal.classList.add('hidden');
    },

    toggleSaved() {
        const key = this.modalClassKey;
        if (!key) return;

        if (this.saved.has(key)) this.saved.delete(key);
        else this.saved.add(key);

        persistSaved(this.saved);
        this.updateSaveButton();
    },

    updateSaveButton() {
        if (!this.btnSave) return;
        const isSaved = Boolean(this.modalClassKey && this.saved.has(this.modalClassKey));
        this.btnSave.setAttribute('aria-pressed', String(isSaved));
        const label = this.btnSave.querySelector('.action-label');
        if (label) label.textContent = isSaved ? 'Salvo' : 'Salvar';
    }
};
