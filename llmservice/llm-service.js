const axios = require("axios");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" }); // Carga el archivo .env

console.log("API Key:", process.env.REACT_APP_GEMINI_API_KEY || "NO SE ENCONTRÓ CLAVE"); // Debug


const app = express();
const port = 8003;

app.use(express.json());
app.use(cors());

const llmConfigs = {
  gemini: {
    url: (apiKey) =>
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (imageUrl, chatHistory) => ({
      contents: [
        {
          parts: [
            { text: "Eres una IA en un juego de adivinanza de animales. Solo puedes responder con pistas relacionadas con el animal en la imagen. No puedes hablar de otros temas." },
            { text: `Imagen adjunta: ${imageUrl.trim()}` },
            { text: `Historial de chat: ${chatHistory.join("\n")}` },
          ],
        },
      ],
    }),
    transformResponse: (response) =>
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta.",
  },
};

function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body) || req.body[field] === undefined || req.body[field] === null) {
      throw new Error(`El campo "${field}" es obligatorio y no puede estar vacío.`);
    }
    
    // Solo aplica .trim() si el campo es un string
    if (typeof req.body[field] === "string" && !req.body[field].trim()) {
      throw new Error(`El campo "${field}" no puede estar vacío.`);
    }
    
    // Si es un array, debe tener al menos un elemento
    if (Array.isArray(req.body[field]) && req.body[field].length === 0) {
      throw new Error(`El campo "${field}" no puede ser un array vacío.`);
    }
  }
}


async function sendChatToLLM(imageUrl, chatHistory, apiKey, model = "gemini") {
  try {
    const config = llmConfigs[model];
    if (!config) {
      throw new Error(`El modelo "${model}" no está soportado.`);
    }

    const url = config.url(apiKey);
    const requestData = config.transformRequest(imageUrl, chatHistory);

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, requestData, { headers });
    return config.transformResponse(response);
  } catch (error) {
    console.error(`Error en la solicitud al LLM:`, error.message || error);
    return "Error en la solicitud al LLM.";
  }
}

app.post("/chat", async (req, res) => {
  try {
    console.log("🔹 Recibiendo solicitud a /chat con datos:", req.body);

    validateRequiredFields(req, ["imageUrl", "messages"]); // Validación de campos

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const { imageUrl, messages } = req.body;

    console.log("🔹 Enviando solicitud a LLM con:", { imageUrl, messages });

    const chatResponse = await sendChatToLLM(imageUrl, messages, apiKey);
    
    console.log("🔹 Respuesta del LLM:", chatResponse);

    res.json({ response: chatResponse });
  } catch (error) {
    console.error("❌ Error en /chat:", error.message);
    res.status(400).json({ error: error.message });
  }
});


const server = app.listen(port, () => {
  console.log(`Chat LLM en funcionamiento en http://localhost:${port}`);
});

module.exports = server;
