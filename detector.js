import { UIManager } from './ui.js';
import { getHistoricalData } from './historical-data.js';

// Configurações do Roboflow (Versão 5 tem o modelo treinado ativo)
const PROJECT = import.meta.env.VITE_ROBOFLOW_PROJECT;
const VERSION = import.meta.env.VITE_ROBOFLOW_VERSION; 
const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY;
const CONFIDENCE_THRESHOLD = 0.25; // Abaixado para facilitar detecção de fotos na tela

export async function detectFrame(base64Image, videoWidth, videoHeight) {
    // Pega a confiança do slider
    const slider = document.getElementById('confidence-slider');
    const minConfidence = slider ? parseInt(slider.value) / 100 : CONFIDENCE_THRESHOLD;

    const url = `https://detect.roboflow.com/${PROJECT}/${VERSION}?api_key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            body: base64Image
        });

        if (!response.ok) {
            console.error(`[DETECTOR] API error: ${response.status}`);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[DETECTOR] Predictions received: ${data.predictions.length} total`);
        
        // Filtra detecções pela confiança mínima
        const validPredictions = data.predictions.filter(p => p.confidence >= minConfidence);
        console.log(`[DETECTOR] Valid predictions (>= ${Math.round(minConfidence*100)}%): ${validPredictions.length}`);

        // drawDetections é no-op (câmera limpa)
        UIManager.drawDetections(validPredictions, data.image.width, data.image.height);

        // Se encontrou algo, atualiza o painel com a de maior confiança
        if (validPredictions.length > 0) {
            // Pega a predição com maior confiança
            const bestPrediction = validPredictions.reduce((prev, current) => 
                (prev.confidence > current.confidence) ? prev : current
            );
            
            console.log(`[DETECTOR] Best: "${bestPrediction.class}" (${Math.round(bestPrediction.confidence*100)}%)`);
            
            // Busca dados históricos
            const info = getHistoricalData(bestPrediction.class);
            console.log(`[DETECTOR] Historical data found: "${info?.name}"`);
            UIManager.showInfoPanel(info, bestPrediction.confidence, bestPrediction.class);
        }

    } catch (error) {
        console.error("[DETECTOR] Inference Error:", error);
    }
}
