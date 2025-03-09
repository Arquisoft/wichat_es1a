const request = require('supertest');
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import express from 'express';
import { router } from '../../routes/question-routes'; // Ajusta la ruta si es necesario
import * as bodyParser from 'body-parser';

let mongoServer;
let app = express();

beforeAll(async () => {
    // Crea un servidor de MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();

    // Configurar Express
    app.use(bodyParser.json());
    app.use('/questions', router); // Usamos el router de las rutas de la API
});

afterAll(async () => {
    // Desconectar la base de datos y parar el servidor de memoria
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Question Routes', () => {
    test('GET /questions/random - should return a random question', async () => {
        const response = await request(app).get('/questions/random');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('image_url');
        const urlPattern = /^https?:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/.+/;
        expect(urlPattern.test(response.body.image_url)).toBe(true);
        //expect(response.body.image_url).toBe('http://commons.wikimedia.org/wiki/Special:FilePath/Stenopus%20hispidus.jpg');
    });

    test('GET /questions/random/:n - should return n random questions', async () => {
        const n = 3;

        const response = await request(app).get(`/questions/random/${n}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(n);
        expect(response.body[0]).toHaveProperty('image_url');
        expect(response.body[1]).toHaveProperty('image_url');
        expect(response.body[2]).toHaveProperty('image_url');
        //expect(response.body[0].image_url).toBe('http://example.com/image1.jpg');
        const urlPattern = /^https?:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/.+/;
        expect(urlPattern.test(response.body[0].image_url)).toBe(true);
        expect(urlPattern.test(response.body[1].image_url)).toBe(true);
        expect(urlPattern.test(response.body[2].image_url)).toBe(true);
    });
});
