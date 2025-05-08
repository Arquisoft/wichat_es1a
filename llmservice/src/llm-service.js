const axios = require("axios");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Configuración de dotenv
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  console.log("Archivo .env no encontrado, usando variables de entorno del sistema");
  require("dotenv").config();
}

// Verificar API key
if (!process.env.REACT_APP_GEMINI_API_KEY) {
  console.warn("⚠️ REACT_APP_GEMINI_API_KEY no está configurada. El servicio LLM no funcionará correctamente.");
}

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
    "MANTÉN EL HILO DE LA CONVERSACIÓN y responde directamente a lo que pregunta el usuario.",
    "Si la pregunta es relevante para el juego, proporciona pistas ÚTILES y ESPECÍFICAS.",
    "Evita respuestas genéricas y haz referencia a cosas mencionadas previamente.",
    "No des respuestas de sí/no solamente, elabora siempre con información útil.",
    "Si preguntan algo fuera del juego responde: 'Lo siento, solo puedo darte pistas sobre"
  ];
  
  // Configuración específica por categoría
  const categoryConfig = {
    art: {
      subject: "la obra de arte",
      specificInstructions: [
        "Menciona características de la obra y su autor/artista.",
        "Si preguntan sobre estilo artístico, época, técnica o contexto histórico, responde con información real.",
        "Si preguntan sobre el museo donde se encuentra, materiales usados o significado, proporciona información específica.",
        "Adapta tu respuesta al nivel de especificidad de la pregunta del usuario."
      ]
    },
    flags: {
      subject: "el país o región cuya bandera",
      specificInstructions: [
        "Menciona características del país como cultura, historia, economía o datos curiosos.",
        "No menciones directamente el nombre del país o región, ni describas visualmente la bandera.",
        "Si preguntan por el continente, idioma oficial, población o características geográficas, proporciona información específica.",
        "Recuerda información mencionada previamente en la conversación para dar coherencia a tus respuestas."
      ]
    },
    default: {
      subject: "lo que",
      specificInstructions: [
        "Adapta tus pistas al tipo de objeto o concepto en la imagen.",
        "Mantén un tono conversacional mientras sigues proporcionando pistas útiles."
      ]
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
const getWelcomeMessage = (gameCategory) => {
  if (gameCategory?.toLowerCase() === "art") {
    return "¡Bienvenido al juego de adivinanzas de obras de arte! Hazme preguntas y te daré pistas para que adivines qué obra de arte aparece en la imagen.";
  } else if (gameCategory?.toLowerCase() === "flags") {
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

      // Manejar imageUrl con mayor robustez
      if (imageUrl && typeof imageUrl === 'string') {
        parts.push({ text: `Imagen de referencia: ${imageUrl.trim()}` });
      } else {
        console.warn("⚠️ No se proporcionó una URL de imagen válida");
      }

      return { contents: [{ parts }] };
    },
    transformResponse: (response) =>
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta.",
  },
};

async function sendChatToLLM(chatHistory, apiKey, gameCategory = "flags", model = "gemini") {
  try {
    // Verificar que tenemos una API key
    if (!apiKey) {
      console.error("Error: No se proporcionó una API key de Gemini");
      return "Error: No se ha configurado la API key de Gemini.";
    }

    // Verificar que tenemos un modelo configurado
    const config = llmConfigs[model];
    if (!config) {
      console.error(`Error: Modelo ${model} no soportado.`);
      return `Modelo ${model} no soportado. Modelos disponibles: ${Object.keys(llmConfigs).join(", ")}`;
    }

    // Construir la solicitud
    const url = config.url(apiKey);
    const requestData = config.transformRequest(imageUrlRef, chatHistory, gameCategory);
    const headers = { "Content-Type": "application/json" };

    console.log(`Enviando solicitud a ${model} con categoría: ${gameCategory}`);
    const response = await axios.post(url, requestData, { headers });
    
    const result = config.transformResponse(response);
    console.log(`Respuesta recibida de ${model}`);
    return result;
  } catch (error) {    // Log detallado del error
    console.error(`Error en solicitud LLM:`, error.message);
    
    if (error.response) {
      console.error("Detalles del error:", {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    return "Error en la solicitud al LLM.";
  }
}

app.post("/set-image", (req, res) => {
  try {
    const { imageUrl, gameCategory } = req.body;
    
    // Validación mejorada de la URL de la imagen
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      console.error("Error: URL de imagen inválida", imageUrl);
      throw new Error("URL inválida.");
    }
    
    // Guardar URL de imagen normalizada
    imageUrlRef = imageUrl.trim();
    console.log(`Imagen configurada con éxito para categoría: ${gameCategory || 'sin especificar'}`);

    // Crear mensaje de bienvenida según la categoría
    const welcomeMessage = getWelcomeMessage(gameCategory);

    res.json({
      message: "Imagen de referencia actualizada correctamente.",
      welcomeMessage: welcomeMessage
    });
  } catch (error) {
    console.error("Error en /set-image:", error);
    res.status(400).json({ 
      error: error.message,
      details: "No se pudo configurar la imagen de referencia"
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { messages, gameCategory } = req.body;

    // Validar los mensajes recibidos
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Error: Formato de mensajes inválido");
      return res.status(400).json({ error: "El campo 'messages' es requerido y debe ser un array." });
    }

    // Verificar que hay una imagen configurada
    if (!imageUrlRef) {
      console.error("Error: Intento de chat sin imagen configurada");
      return res.status(400).json({ error: "Imagen no configurada. Usa /set-image primero." });
    }

    // Obtener la API key
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Error: API key de Gemini no configurada");
      return res.status(500).json({ error: "API key de Gemini no configurada en el servidor." });
    }

    console.log(`Procesando solicitud de chat para categoría: ${gameCategory || 'sin especificar'}`);

    // Formatear los mensajes y añadir mensaje de bienvenida si es necesario
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

    // Procesar la solicitud al LLM
    const chatResponse = await sendChatToLLM(formattedMessages, apiKey, gameCategory);

    // Responder al cliente
    res.json({ response: chatResponse });
    console.log("Respuesta enviada al cliente");
  } catch (error) {
    console.error("Error en /chat:", error);
    res.status(500).json({ 
      error: "Error procesando la solicitud", 
      details: error.message 
    });
  }
});

// Añadir un endpoint para comprobar la salud del servicio
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.REACT_APP_GEMINI_API_KEY,
    imageUrlConfigured: !!imageUrlRef
  });
});

// Añadir un endpoint para recibir solicitudes de prueba
app.get("/", (req, res) => {
  res.send("LLM Service running. Use /health for status check.");
});

// Iniciar el servidor
const server = app.listen(port, () => {
  console.log(`Servidor LLM iniciado en http://localhost:${port}`);
  console.log(`Estado de API key: ${process.env.REACT_APP_GEMINI_API_KEY ? 'Configurada' : 'No configurada'}`);
  console.log(`Comprueba el estado del servidor en: http://localhost:${port}/health`);
});

// Manejar señales para cierre elegante
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Exponer imageUrlRef como propiedad del módulo para que los tests puedan manipularla
module.exports = server;
module.exports.imageUrlRef = null; // Inicializar con null
// Exportar la configuración de LLM para pruebas
module.exports.llmConfigs = llmConfigs;

// Usar getter y setter para imageUrlRef
Object.defineProperty(module.exports, 'imageUrlRef', {
  get: function() { return imageUrlRef; },
  set: function(value) { imageUrlRef = value; }
});
