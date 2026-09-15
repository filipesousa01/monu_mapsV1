import { detectFrame } from './detector.js';
import { UIManager } from './ui.js';

const video = document.getElementById('camera-feed');
const canvas = document.createElement('canvas'); // Offscreen canvas for capturing frames
const ctx = canvas.getContext('2d');

let currentStream = null;
let useFrontCamera = false;
let isDetecting = false;
let detectionInterval = null;

// Config
const CAPTURE_INTERVAL_MS = 600; // Captura a cada 600ms para não sobrecarregar a API

export async function initCamera() {
    return switchCamera(useFrontCamera);
}

export async function switchCamera(front = false) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    useFrontCamera = front;
    
    const constraints = {
        video: {
            facingMode: useFrontCamera ? "user" : "environment",
            width: { ideal: 640 }, // Mantém resolução baixa para envio rápido
            height: { ideal: 480 }
        },
        audio: false
    };

    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                // Setup overlay dimensions to match video
                UIManager.setupOverlay(video.videoWidth, video.videoHeight);
                resolve(true);
            };
        });
    } catch (err) {
        console.error("Camera error:", err);
        throw err;
    }
}

export function startCaptureLoop() {
    if (detectionInterval) clearInterval(detectionInterval);
    
    detectionInterval = setInterval(async () => {
        if (isDetecting || !video.videoWidth) return;
        
        isDetecting = true;
        
        try {
            // Setup canvas size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert to base64 (jpeg is smaller)
            const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            
            // Send to Roboflow
            await detectFrame(base64Image, canvas.width, canvas.height);
            
        } catch (error) {
            console.error("Detection error:", error);
        } finally {
            isDetecting = false;
        }
        
    }, CAPTURE_INTERVAL_MS);
}

// Attach listener to settings
document.getElementById('switch-camera-btn')?.addEventListener('click', () => {
    switchCamera(!useFrontCamera);
});
