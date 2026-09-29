// Vercel Serverless Function — proxy para a API do Roboflow
// A API key fica APENAS no servidor, nunca exposta ao browser

export default async function handler(req, res) {
    // Apenas POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Variáveis de ambiente configuradas na Vercel (Settings > Environment Variables)
    const PROJECT = process.env.ROBOFLOW_PROJECT;
    const VERSION = process.env.ROBOFLOW_VERSION;
    const API_KEY = process.env.ROBOFLOW_API_KEY;

    if (!PROJECT || !VERSION || !API_KEY) {
        console.error('[API] Missing environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const url = `https://detect.roboflow.com/${PROJECT}/${VERSION}?api_key=${API_KEY}`;

    try {
        // Lê o body (base64 da imagem)
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const base64Image = Buffer.concat(chunks).toString();

        // Envia para o Roboflow
        const response = await fetch(url, {
            method: 'POST',
            body: base64Image
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API] Roboflow error ${response.status}:`, errorText);
            return res.status(response.status).json({ error: `Roboflow API error: ${response.status}` });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('[API] Proxy error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
