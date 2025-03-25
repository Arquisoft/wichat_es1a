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

const llmConfigs = {
  gemini: {
    url: (apiKey) =>
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (imageUrl, chatHistory, gameCategory) => {
      // Define el contexto de acuerdo a la categoría del juego
      let gameContext = "";
      switch (gameCategory.toLowerCase()) {
        case "animals":
          gameContext =
            "Eres una IA en un juego de adivinanza de animales. Solo puedes responder con pistas relacionadas con el animal en la imagen.";
          break;
        case "geography":
          gameContext =
            "Eres una IA en un juego de adivinanza de lugares geográficos. Solo puedes responder con pistas relacionadas con el lugar en la imagen.";
          break;
        // Puedes agregar más casos según tus categorías
        default:
          gameContext =
            "Eres una IA en un juego de adivinanza. Solo puedes responder con pistas relacionadas con el objeto en la imagen.";
          break;
      }

      // Convierte el historial de chat en una cadena con formato "remitente: mensaje"
      const chatText = chatHistory.map(m => `${m.sender}: ${m.text}`).join("\n");

      let parts = [
        { text: gameContext },
        { text: `Historial de chat: ${chatText}` }
      ];

      if (imageUrl) {
        parts.push({ text: `Imagen de referencia: ${imageUrl.trim()}` });
      }

      return { contents: [{ parts }] };
    },
    transformResponse: (response) =>
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No se recibió respuesta.",
  },
};

async function sendChatToLLM(chatHistory, apiKey, gameCategory = "animals", model = "gemini") {
  try {
    const config = llmConfigs[model];
    if (!config) {
      throw new Error(`El modelo "${model}" no está soportado.`);
    }

    const url = config.url(apiKey);
    const requestData = config.transformRequest(imageUrlRef, chatHistory, gameCategory);
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
    console.log("✅ Imagen de referencia establecida:", imageUrlRef);
    res.json({ message: "Imagen de referencia actualizada correctamente." });
  } catch (error) {
    console.error("❌ Error en /set-image:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para el chat: ahora se espera un campo 'gameCategory'
app.post("/chat", async (req, res) => {
  try {
    console.log("🔹 Recibiendo solicitud a /chat con datos:", req.body);

    if (
      !req.body.messages ||
      !Array.isArray(req.body.messages) ||
      req.body.messages.length === 0
    ) {
      throw new Error(
        "El campo 'messages' es obligatorio y debe contener al menos un mensaje."
      );
    }

    if (!imageUrlRef) {
      throw new Error(
        "No se ha configurado una imagen de referencia. Usa /set-image primero."
      );
    }

    // Se extrae la categoría del juego, por defecto 'animals'
    const gameCategory = req.body.gameCategory || "animals";
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const { messages } = req.body;

    console.log("🔹 Enviando solicitud a LLM con imagen de referencia:", imageUrlRef);
    const chatResponse = await sendChatToLLM(messages, apiKey, gameCategory);

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
