import { initCamera, startCaptureLoop } from './camera.js';
import { UIManager } from './ui.js';

// Elements
const splashScreen = document.getElementById('splash-screen');
const appContainer = document.getElementById('app-container');
const startBtn = document.getElementById('start-btn');
const settingsBtn = document.getElementById('settings-btn');

// State
let isAppStarted = false;

// Initialize App
async function initApp() {
    console.log('[APP] initApp called');

    // Event Listeners
    startBtn.addEventListener('click', async () => {
        console.log('[APP] Start button clicked');
        try {
            startBtn.disabled = true;
            startBtn.textContent = "Conectando...";
            
            // Try to initialize camera
            console.log('[APP] Initializing camera...');
            await initCamera();
            console.log('[APP] Camera initialized successfully');
            
            // Transition UI
            splashScreen.style.display = 'none';
            appContainer.classList.remove('hidden');
            console.log('[APP] Splash hidden, app shown');

            // Setup UI manager
            UIManager.init();
            console.log('[APP] UIManager initialized');
            
            // Start detection loop
            startCaptureLoop();
            console.log('[APP] Detection loop started');
            
            isAppStarted = true;
        } catch (error) {
            console.error("[APP] Failed to start app:", error);
            startBtn.disabled = false;
            startBtn.textContent = "Tentar Novamente";
            alert("Não foi possível acessar a câmera. Verifique as permissões.");
        }
    });

    // Settings
    settingsBtn?.addEventListener('click', () => {
        UIManager.toggleSettings();
    });
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    console.log('[APP] DOMContentLoaded');
    initApp();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
});
