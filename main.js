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
    // Show start button after a small delay (simulating load)
    setTimeout(() => {
        document.querySelector('.loader').classList.add('hidden');
        startBtn.classList.remove('hidden');
    }, 1500);

    // Event Listeners
    startBtn.addEventListener('click', async () => {
        try {
            startBtn.disabled = true;
            startBtn.textContent = "Conectando...";
            
            // Try to initialize camera
            await initCamera();
            
            // Transition UI
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            
            // Setup UI manager
            UIManager.init();
            
            // Start detection loop
            startCaptureLoop();
            
            isAppStarted = true;
        } catch (error) {
            console.error("Failed to start app:", error);
            startBtn.disabled = false;
            startBtn.textContent = "Tentar Novamente";
            alert("Não foi possível acessar a câmera. Verifique as permissões.");
        }
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
        UIManager.toggleSettings();
    });
}

// Start
document.addEventListener('DOMContentLoaded', () => {
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
