import { UIManager } from './ui.js';
import { getHistoricalData } from './historical-data.js';

// Configurações do Roboflow (Versão 5 tem o modelo treinado ativo)
const PROJECT = "hisoria_na_palma_da_mao-bkhoi";
const VERSION = "5"; 
const API_KEY = "ctApc87kQzIZ5PlfinJG";
const CONFIDENCE_THRESHOLD = 0.40; // Default

export async function detectFrame(base64Image, videoWidth, videoHeight) {
    // Pega a confiança do slider
    const slider = document.getElementById('confidence-slider');
    const minConfidence = slider ? parseInt(slider.value) / 100 : CONFIDENCE_THRESHOLD;

    const url = `https://detect.roboflow.com/${PROJECT}/${VERSION}?api_key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: base64Image
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Filtra detecções pela confiança mínima
        const validPredictions = data.predictions.filter(p => p.confidence >= minConfidence);
        
        // Atualiza overlay com caixas (draw)
        UIManager.drawDetections(validPredictions, data.image.width, data.image.height);

        // Se encontrou algo, atualiza o painel com a de maior confiança
        if (validPredictions.length > 0) {
            // Pega a predição com maior confiança
            const bestPrediction = validPredictions.reduce((prev, current) => 
                (prev.confidence > current.confidence) ? prev : current
            );
            
            // Busca dados históricos
            const info = getHistoricalData(bestPrediction.class);
            UIManager.showInfoPanel(info, bestPrediction.confidence);
        }

    } catch (error) {
        console.error("Inference Error:", error);
    }
}
