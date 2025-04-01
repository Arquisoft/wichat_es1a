const request = require("supertest");
const axios = require("axios");
let server;

// Mock explícito para axios.post
jest.mock("axios", () => ({
  post: jest.fn(),
}));

// Antes de cada prueba iniciamos un nuevo servidor para evitar conflictos
beforeEach(() => {
  jest.resetModules();
  server = require("./llm-service");

  axios.post.mockImplementation((url, data) => {
    if (url.includes("generativelanguage")) {
      return Promise.resolve({
        data: {
          candidates: [{
            content: {
              parts: [{ text: "llmanswer" }]
            }
          }]
        },
      });
    }
    return Promise.reject(new Error("URL not mocked"));
  });
});

// Cerramos el servidor después de cada prueba para evitar conflictos en puertos
afterEach((done) => {
  if (server && server.close) {
    server.close(done);
  } else {
    done();
  }
});

describe("LLM Service", () => {
  test("Debería configurar una imagen de referencia con /set-image", async () => {
    const response = await request(server)
      .post("/set-image")
      .send({ imageUrl: "https://www.wikidata.org/wiki/Q134015#/media/File:Meerkat_(Suricata_suricatta).jpg" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Imagen de referencia actualizada correctamente.");
  });

  test("Debería recibir una respuesta del LLM en /chat", async () => {
    await request(server)
      .post("/set-image")
      .send({ imageUrl: "https://www.wikidata.org/wiki/Q134015#/media/File:Meerkat_(Suricata_suricatta).jpg" });

    const response = await request(server)
      .post("/chat")
      .send({
        messages: [{ sender: "user", text: "Dame una pista" }],
        gameCategory: "animals",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toBe("llmanswer");
  });

  test("Debería devolver error si no hay imagen de referencia configurada", async () => {
    // Requerimos un servidor limpio sin imagen configurada
    jest.resetModules();
    server = require("./llm-service");

    const response = await request(server)
      .post("/chat")
      .send({
        messages: [{ sender: "user", text: "Dame una pista" }],
        gameCategory: "animals",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("No se ha configurado una imagen de referencia");

    // Cerramos este servidor al terminar esta prueba
    server.close();
  });
});
