const request = require("supertest");
const axios = require("axios");
const app = require("./llm-service");

jest.mock("axios"); 

afterAll(async () => {
  app.close(); 
});

describe("LLM Service", () => {
  beforeEach(() => {
    axios.post.mockImplementation((url, data) => {
      if (url.startsWith("https://generativelanguage")) {
        return Promise.resolve({
          data: { candidates: [{ content: { parts: [{ text: "llmanswer" }] } }] },
        });
      }
    });
  });

  test("Debería configurar una imagen de referencia con /set-image", async () => {
    const response = await request(app)
      .post("/set-image")
      .send({ imageUrl: "https://www.wikidata.org/wiki/Q134015#/media/File:Meerkat_(Suricata_suricatta).jpg" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Imagen de referencia actualizada correctamente.");
  });

  test("Debería recibir una respuesta del LLM en /chat", async () => {
    await request(app)
      .post("/set-image")
      .send({ imageUrl: "https://www.wikidata.org/wiki/Q134015#/media/File:Meerkat_(Suricata_suricatta).jpg" });
    const response = await request(app)
      .post("/chat")
      .send({
        messages: [{ sender: "user", text: "Dame una pista" }],
        gameCategory: "animals",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toBe("llmanswer");
  });
});
