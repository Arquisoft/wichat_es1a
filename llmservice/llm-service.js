const axios = require("axios");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors());

const llmConfigs = {
  gemini: {
    url: (apiKey) =>
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (imageUrl) => ({
      contents: [
        {
          parts: [
            { text: "Eres una IA en un juego donde se muestra la imagen de un animal y cuatro opciones de respuesta," +
                 " de las cuales solo una es correcta. Tu tarea es dar una pista sobre el animal en la imagen sin revelar su nombre," +
                 " pero ayudando al jugador a elegir la opción correcta." },

            { text: `Imagen adjunta: ${imageUrl.trim()}` },
          ],
        },
      ],
    }),
    transformResponse: (response) =>
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta.",
  },
};

// Valida que el cuerpo de la solicitud tenga la URL de la imagen
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body) || !req.body[field].trim()) {
      throw new Error(`El campo "${field}" es obligatorio y no puede estar vacío.`);
    }
  }
}

// Función para enviar la solicitud al LLM con la URL de la imagen
async function sendImageToLLM(imageUrl, apiKey, model = "gemini") {
  try {
    const config = llmConfigs[model];
    if (!config) {
      throw new Error(`El modelo "${model}" no está soportado.`);
    }

    const url = config.url(apiKey);
    const requestData = config.transformRequest(imageUrl);

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, requestData, { headers });

    return config.transformResponse(response);
  } catch (error) {
    console.error(`Error enviando la imagen a ${model}:`, error.message || error);
    return "Error en la solicitud al LLM.";
  }
}

// Endpoint POST que recibe la URL de la imagen y devuelve la pista
app.post("/getHint", async (req, res) => {
  try {
    validateRequiredFields(req, ["imageUrl"]);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    const { imageUrl, messages } = req.body;
    const chatHistory = messages && messages.length > 0 ? messages : ["¡Hola! ¿Quieres una pista sobre el animal en la imagen?"];
    const hint = await sendChatToLLM(imageUrl, chatHistory, apiKey);
    res.json({ hint });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Servicio LLM escuchando en http://localhost:${port}`);
});

module.exports = server;


