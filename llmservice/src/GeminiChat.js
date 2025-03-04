import { useState } from "react";
import "./GeminiChat.css";

const API_KEY = "AIzaSyDck1F1GLzB1_nzEsh-XCGBt314Ono9ljk";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

function GeminiChat() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); // Nueva variable para la URL de la imagen
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImage(reader.result); // Guarda la imagen en base64
        setImageUrl(""); // Limpiar la URL si se sube una imagen
      };
    }
  };

  const fetchResponse = async () => {
    if (!prompt.trim() && !image && !imageUrl.trim()) return;

    setLoading(true);
    setResponse("");

    const requestBody = {
      contents: [{ parts: [] }],
    };

    const gameContext =
      "Estás ayudando en un juego de preguntas tipo '¿Quién quiere ser millonario?'. Solo puedes dar pistas, pero nunca revelar la respuesta. " +
      "Si te preguntan algo que no tenga que ver con el juego, responde 'Lo siento, solo puedo dar pistas en este juego.'. " +
      "Si se sube una imagen, describe características sin decir qué es.";

    requestBody.contents[0].parts.push({ text: gameContext });

    if (prompt.trim()) {
      requestBody.contents[0].parts.push({ text: `Pregunta del juego: ${prompt}` });
    }

    // Agregar imagen si existe (base64 o URL)
    if (image) {
      const mimeType = image.split(";")[0].split(":")[1];
      const base64Data = image.split(",")[1];

      requestBody.contents[0].parts.push({
        inlineData: { mimeType, data: base64Data },
      });
    } else if (imageUrl.trim()) {
      requestBody.contents[0].parts.push({
        text: `Imagen adjunta: ${imageUrl.trim()}`,
      });
    }

    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
      setResponse(textResponse);
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse("Error al obtener la respuesta.");
    }

    setLoading(false);
  };

  return (
    <div className="gemini-chat-container">
      <h2>Asistente de Pistas - ¿Quién Quiere Ser Millonario?</h2>

      <textarea
        className="gemini-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Escribe una pregunta del juego..."
        rows={3}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="gemini-file-input"
      />

      <input
        type="text"
        placeholder="O ingresa una URL de imagen..."
        className="gemini-url-input"
        value={imageUrl}
        onChange={(e) => {
          setImageUrl(e.target.value);
          setImage(null); // Limpiar imagen en base64 si se ingresa una URL
        }}
      />

      {image && <img src={image} alt="Vista previa" className="gemini-image-preview" />}
      {imageUrl && !image && <img src={imageUrl} alt="Vista previa" className="gemini-image-preview" />}

      <button className="gemini-button" onClick={fetchResponse} disabled={loading}>
        {loading ? "Generando pista..." : "Obtener pista"}
      </button>

      <div className="gemini-response-container">
        <strong>Pista:</strong>
        <p>{response || "Esperando pista..."}</p>
      </div>
    </div>
  );
}

export default GeminiChat;
