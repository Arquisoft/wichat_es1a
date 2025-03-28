const axios = require("axios");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors());

// Variable global para almacenar la URL de la imagen de referencia
let imageUrlRef = null;

// Objeto para almacenar el historial de conversaciones por sesión
const chatSessions = {};

const llmConfigs = {
    gemini: {
        url: (apiKey) =>
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        transformRequest: (imageUrl, chatHistory) => {
            // Extraer solo el texto de los mensajes para el historial
            const formattedHistory = chatHistory.map(msg => {
                if (typeof msg === 'string') return msg;
                return msg.content || msg.text || JSON.stringify(msg);
            });
            
            let parts = [
                { text: "Eres una IA en un juego de adivinanza de animales. Solo puedes responder con pistas relacionadas con el animal en la imagen." },
                { text: `Historial de chat: ${formattedHistory.join("\n")}` }
            ];

            if (imageUrl) {
                parts.push({ text: `Imagen de referencia: ${imageUrl.trim()}` });
            }

            return { contents: [{ parts }] };
        },
        transformResponse: (response) =>
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta.",
    },
};

async function sendChatToLLM(chatHistory, apiKey, model = "gemini") {
    try {
        const config = llmConfigs[model];
        if (!config) {
            throw new Error(`El modelo "${model}" no está soportado.`);
        }

        const url = config.url(apiKey);
        const requestData = config.transformRequest(imageUrlRef, chatHistory);

        const headers = { "Content-Type": "application/json" };

        const response = await axios.post(url, requestData, { headers });
        return config.transformResponse(response);
    } catch (error) {
        console.error(`Error en la solicitud al LLM:`, error.message || error);
        return "Error en la solicitud al LLM.";
    }
}

// Endpoint para establecer la imagen de referencia
app.post("/set-image", (req, res) => {
    try {
        if (!req.body.imageUrl || typeof req.body.imageUrl !== "string" || !req.body.imageUrl.trim()) {
            throw new Error("Debes proporcionar una URL válida para la imagen.");
        }

        imageUrlRef = req.body.imageUrl.trim();
        
        // Resetear todas las sesiones de chat cuando se cambia la imagen
        Object.keys(chatSessions).forEach(sessionId => {
            chatSessions[sessionId] = [];
        });
        
        console.log("✅ Imagen de referencia establecida:", imageUrlRef);
        res.json({ message: "Imagen de referencia actualizada correctamente." });
    } catch (error) {
        console.error("❌ Error en /set-image:", error.message);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para el chat con memoria de sesión
app.post("/chat", async (req, res) => {
    try {
        console.log("🔹 Recibiendo solicitud a /chat con datos:", req.body);

        if (!req.body.messages || !Array.isArray(req.body.messages) || req.body.messages.length === 0) {
            throw new Error("El campo 'messages' es obligatorio y debe contener al menos un mensaje.");
        }

        if (!imageUrlRef) {
            throw new Error("No se ha configurado una imagen de referencia. Usa /set-image primero.");
        }

        // Obtener o crear ID de sesión
        const sessionId = req.body.sessionId || 'default';
        
        // Inicializar el historial de la sesión si no existe
        if (!chatSessions[sessionId]) {
            chatSessions[sessionId] = [];
        }

        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const { messages } = req.body;
        
        // Agregar el nuevo mensaje al historial de la sesión
        chatSessions[sessionId].push(messages[messages.length - 1]);
        
        console.log("🔹 Enviando solicitud a LLM con imagen de referencia:", imageUrlRef);
        const chatResponse = await sendChatToLLM(chatSessions[sessionId], apiKey);
        
        // Agregar la respuesta al historial
        chatSessions[sessionId].push(chatResponse);

        console.log("🔹 Respuesta del LLM:", chatResponse);
        res.json({ 
            response: chatResponse,
            sessionId: sessionId,
            history: chatSessions[sessionId]
        });
    } catch (error) {
        console.error("❌ Error en /chat:", error.message);
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para crear una nueva sesión
app.post("/new-session", (req, res) => {
    const sessionId = `session_${Date.now()}`;
    chatSessions[sessionId] = [];
    res.json({ sessionId, message: "Nueva sesión creada" });
});

// Endpoint para limpiar una sesión específica
app.post("/clear-session", (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: "Se requiere el ID de sesión" });
    }
    
    if (chatSessions[sessionId]) {
        chatSessions[sessionId] = [];
        res.json({ message: `Sesión ${sessionId} limpiada correctamente` });
    } else {
        res.status(404).json({ error: "Sesión no encontrada" });
    }
});

const server = app.listen(port, () => {
    console.log(`Chat LLM en funcionamiento en http://localhost:${port}`);
});

module.exports = server;
