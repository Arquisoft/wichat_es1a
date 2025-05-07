const axios = require("axios");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 8003;

app.use(express.json());
app.use(cors({ origin: '*' }));

// Exportar imageUrlRef para que los tests puedan manipularla
let imageUrlRef = null;

// Sistema unificado de configuración de categorías
// Esto permite añadir nuevas categorías sin duplicar estructura de prompt
const getCategoryPrompt = (category) => {
  const basePrompt = [
    "Eres una IA en un juego de adivinanza.",
    "El usuario intentará adivinar mediante las pistas que tú proporcionas.",
    "NUNCA reveles directamente lo que aparece en la imagen.",
    "Proporciona respuestas claras y concisas, ni demasiado cortas ni demasiado largas.",
    "Cada respuesta debe tener 2-3 frases informativas.",
    "No des respuestas de sí/no solamente.",
    "Si preguntan algo fuera del juego responde: 'Lo siento, solo puedo darte pistas sobre"
  ];  // Configuración específica por categoría
  const categoryConfig = {
    monuments: {
      subject: "el monumento",
      specificInstructions: [
        "Menciona características arquitectónicas, historia, ubicación o datos curiosos del monumento.",
        "No menciones directamente el nombre del monumento, pero puedes dar pistas sobre su localización o estilo."
      ]
    },    logos: {
      subject: "la persona famosa",
      specificInstructions: [
        "Menciona características de la persona como su profesión, logros, época en que vivió, nacionalidad o datos curiosos sin nombrarla directamente.",
        "Puedes referirte a obras, películas, canciones o eventos importantes en los que participó, pero no menciones directamente su nombre."
      ]
    },
    flags: {
      subject: "el país o región cuya bandera",
      specificInstructions: [
        "Menciona características del país como geografía, cultura, historia, economía o datos curiosos.",
        "No menciones directamente el nombre del país o región, ni describas visualmente la bandera."
      ]
    },
    default: {
      subject: "lo que",
      specificInstructions: []
    }
  };

  // Obtener configuración específica o usar default si la categoría no existe
  const config = categoryConfig[category?.toLowerCase()] || categoryConfig.default;

  // Añadir instrucciones específicas de la categoría
  const fullPrompt = [
    ...basePrompt,
    ...config.specificInstructions,
    `${config.subject} aparece en la imagen.'`
  ].join(" ");

  return fullPrompt;
};

// Obtener el mensaje de bienvenida según la categoría
const getWelcomeMessage = (gameCategory) => {  if (gameCategory?.toLowerCase() === "monuments") {
    return "¡Bienvenido al juego de adivinanzas de monumentos del mundo! Hazme preguntas y te daré pistas para que adivines qué monumento aparece en la imagen.";  } else if (gameCategory?.toLowerCase() === "logos") {
    return "¡Bienvenido al juego de adivinanzas de personas famosas! Hazme preguntas y te daré pistas para que adivines quién es la persona famosa que aparece en la imagen.";
  }else if (gameCategory?.toLowerCase() === "flags") {
    return "¡Bienvenido al juego de adivinanzas de banderas! Hazme preguntas y te daré pistas para que adivines a qué país o región pertenece la bandera que aparece en la imagen.";
  } else {
    return "¡Bienvenido al juego de adivinanzas! Hazme preguntas y te daré pistas para que adivines lo que aparece en la imagen.";
  }
};

const llmConfigs = {
  gemini: {
    url: (apiKey) =>
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (imageUrl, chatHistory, gameCategory) => {
      const context = getCategoryPrompt(gameCategory);
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

async function sendChatToLLM(chatHistory, apiKey, gameCategory = "flags", model = "gemini") {
  try {
    const config = llmConfigs[model];
    if (!config) throw new Error(`Modelo ${model} no soportado.`);

    const url = config.url(apiKey);
    const requestData = config.transformRequest(imageUrlRef, chatHistory, gameCategory);
    const headers = { "Content-Type": "application/json" };

    const response = await axios.post(url, requestData, { headers });
    return config.transformResponse(response);
  } catch (error) {
    console.error(`Error en solicitud LLM:`, error.response?.data || error.message);
    return "Error en la solicitud al LLM.";
  }
}

app.post("/set-image", (req, res) => {
  try {
    const { imageUrl, gameCategory } = req.body;
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      throw new Error("URL inválida.");
    }
    imageUrlRef = imageUrl.trim();

    // Crear mensaje de bienvenida según la categoría
    const welcomeMessage = getWelcomeMessage(gameCategory);

    res.json({
      message: "Imagen de referencia actualizada correctamente.",
      welcomeMessage: welcomeMessage
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { messages, gameCategory } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "El campo 'messages' es requerido y debe ser un array." });
    }

    if (!imageUrlRef) {
      return res.status(400).json({ error: "Imagen no configurada. Usa /set-image primero." });
    }

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    // Si es el primer mensaje y no viene del sistema, añadir mensaje de bienvenida
    let formattedMessages = messages.map(msg => ({
      sender: msg.sender || 'user',
      text: msg.text || msg
    }));

    // Si no hay mensajes previos del sistema (bienvenida), añadirlo al inicio
    if (!formattedMessages.some(msg => msg.sender === 'system' && msg.text.includes('¡Bienvenido'))) {
      // Determinar el texto del mensaje de bienvenida según la categoría
      let welcomeText = getWelcomeMessage(gameCategory);

      // Añadir el mensaje de bienvenida al inicio del array
      formattedMessages = [
        { sender: 'system', text: welcomeText },
        ...formattedMessages
      ];
    }

    const chatResponse = await sendChatToLLM(formattedMessages, apiKey, gameCategory);

    res.json({ response: chatResponse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Servidor LLM en http://localhost:${port}`);
});

// Exponer imageUrlRef como propiedad del módulo para que los tests puedan manipularla
module.exports = server;
module.exports.imageUrlRef = null; // Inicializar con null

// Usar getter y setter para imageUrlRef
Object.defineProperty(module.exports, 'imageUrlRef', {
  get: function() { return imageUrlRef; },
  set: function(value) { imageUrlRef = value; }
});