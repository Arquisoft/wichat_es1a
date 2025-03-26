const request = require("supertest");
const server = require("../llm-service"); // Asegúrate de actualizar esta ruta correctamente

describe("Chatbot API Tests", () => {
  afterAll(() => {
    server.close();
  });

  test("POST /set-image debería configurar la imagen de referencia", async () => {
    const res = await request(server).post("/set-image").send({
      imageUrl: "https://example.com/image.jpg",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Imagen de referencia actualizada correctamente.");
  });

  test("POST /set-image debería devolver un error si no se proporciona una URL", async () => {
    const res = await request(server).post("/set-image").send({ imageUrl: "" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Debes proporcionar una URL válida para la imagen.");
  });

  test("POST /chat debería devolver error si no se ha configurado una imagen", async () => {
    const res = await request(server).post("/chat").send({
      messages: [{ sender: "user", text: "Hola" }],
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "No se ha configurado una imagen de referencia. Usa /set-image primero.");
  });

  test("POST /chat debería devolver error si no se envían mensajes", async () => {
    await request(server).post("/set-image").send({ imageUrl: "https://example.com/image.jpg" });
    const res = await request(server).post("/chat").send({ messages: [] });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "El campo 'messages' es obligatorio y debe contener al menos un mensaje.");
  });
});
