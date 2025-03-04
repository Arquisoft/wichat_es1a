const axios = require("axios");
const express = require("express");

const app = express();
const port = 8003;

app.use(express.json());

const llmConfigs = {
  gemini: {
    url: (apiKey) =>
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (imageUrl) => ({
      contents: [
        {
          parts: [
            { text: "Describe las características de la imagen adjunta sin revelar exactamente qué es." },
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
    validateRequiredFields(req, ["imageUrl", "apiKey"]);

    const { imageUrl, apiKey } = req.body;
    const hint = await sendImageToLLM(imageUrl, apiKey);
    res.json({ hint });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Servicio LLM escuchando en http://localhost:${port}`);
});

module.exports = server;



