const axios = require("axios");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });


const app = express();
const port = process.env.PORT || 8003;

app.use(express.json());
app.use(cors({ origin: '*' }));

let imageUrlRef = null;

const llmConfigs = {
  gemini: {
    url: (apiKey) =>
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (imageUrl, chatHistory, gameCategory) => {
      const gameContexts = {
        animals: "Eres una IA en un juego de adivinanza de animales. El usuario intentará adivinar el animal mediante pistas que tú proporcionas. NUNCA reveles directamente el nombre del animal. Si preguntan algo fuera del juego responde literalmente: 'Lo siento, solo puedo darte pistas sobre el animal que aparece en la imagen.'",
        geography: "Eres una IA en un juego de adivinanza de lugares geográficos. El usuario intentará adivinar mediante pistas que proporcionas. NUNCA reveles directamente el nombre del lugar. Si preguntan algo fuera del juego responde literalmente: 'Lo siento, solo puedo darte pistas sobre el lugar geográfico que aparece en la imagen.'",
        default: "Eres una IA en un juego de adivinanza. El usuario intentará adivinar mediante pistas que tú proporcionas. NUNCA reveles directamente lo que aparece en la imagen. Si preguntan algo fuera del juego responde literalmente: 'Lo siento, solo puedo darte pistas sobre lo que aparece en la imagen.'"
      };

      const context = gameContexts[gameCategory.toLowerCase()] || gameContexts.default;
      const chatText = chatHistory.map(m => `${m.sender}: ${m.text}`).join("\n");

      const parts = [
        { text: context },
        { text: `Historial del chat:\n${chatText}` }
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

async function sendChatToLLM(chatHistory, apiKey, gameCategory = "animals", model = "gemini") {
  try {
    const config = llmConfigs[model];
    if (!config) throw new Error(`Modelo ${model} no soportado.`);

    const url = config.url(apiKey);
    const requestData = config.transformRequest(imageUrlRef, chatHistory, gameCategory);
    const headers = { "Content-Type": "application/json" };

    console.log("🔍 Solicitud al LLM:", JSON.stringify(requestData, null, 2));

    const response = await axios.post(url, requestData, { headers });
    console.log("📡 URL del LLM:", url);
    console.log("📡 Request al LLM:", JSON.stringify(requestData, null, 2));


    return config.transformResponse(response);
  } catch (error) {
    console.error(`Error en solicitud LLM:`, error.response?.data || error.message);
    return "Error en la solicitud al LLM.";
  }
}

app.post("/set-image", (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      throw new Error("URL inválida.");
    }
    imageUrlRef = imageUrl.trim();
    console.log("✅ Imagen configurada:", imageUrlRef);
    res.json({ message: "Imagen de referencia actualizada correctamente." });
  } catch (error) {
    console.error("❌ Error /set-image:", error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { messages, gameCategory } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("El campo 'messages' es requerido y debe ser un array.");
    }

    if (!imageUrlRef) {
      throw new Error("Imagen no configurada. Usa /set-image primero.");
    }

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    console.log("🔑 API KEY:", apiKey);

    const formattedMessages = messages.map(msg => ({
      sender: msg.sender || 'user',
      text: msg.text || msg
    }));

    console.log("🔹 Mensajes recibidos:", formattedMessages);

    const chatResponse = await sendChatToLLM(formattedMessages, apiKey, gameCategory);

    res.json({ response: chatResponse });
  } catch (error) {
    console.error("❌ Error /chat:", error.message);
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Servidor LLM en http://localhost:${port}`);
});

module.exports = server;