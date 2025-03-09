import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import express from 'express';
import { router } from '../../routes/question-routes'; // Ajusta la ruta si es necesario
import * as bodyParser from 'body-parser';
import { QuestionDBService } from "../../services/question-db-service";
import { WikidataEntity } from "../../services/wikidata/index";
import { Question } from "../../services/question-data-model";

let mongoServer;
let app = express();
let service: QuestionDBService;

beforeAll(async () => {
    // Crea un servidor de MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();

    // Configurar Express
    app.use(bodyParser.json());
    app.use('/questions', router); // Usamos el router de las rutas de la API

    service = QuestionDBService.getInstance(); // Crear la instancia del servicio
});

afterAll(async () => {
    // Desconectar la base de datos y parar el servidor de memoria
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('QuestionDBService', () => {
    describe('getRandomQuestions', () => {
        it('should fetch random questions and return them as WikidataQuestion instances', async () => {
            // Mock de la función que obtiene las entidades
            const mockEntities = [
                new WikidataEntity('https://example.com/image1', 'Common Name 1'),
                new WikidataEntity('https://example.com/image2', 'Common Name 2'),
            ];

            service.getRandomEntities = jest.fn().mockResolvedValue(mockEntities);

            const questions = await service.getRandomQuestions(2);

            expect(questions).toHaveLength(2);
            expect(questions[0]).toHaveProperty('image_url');
            expect(questions[1]).toHaveProperty('image_url');
            expect(questions[0].response).toBe('');
            expect(questions[0].wrong).toEqual(['']);
        });

        it('should handle an error when fetching random questions', async () => {
            // Simular un error
            service.getRandomEntities = jest.fn().mockRejectedValue(new Error('Something went wrong'));

            await expect(service.getRandomQuestions(2)).rejects.toThrow('Something went wrong');
        });
    });

    describe('generateQuestions', () => {
        it('should generate a batch of questions and store them in the database', async () => {
            // Simula que la función de generación de preguntas responde correctamente
            const mockQuestions = [
                { image_url: 'https://example.com/image1', common_name: 'Common Name 1', wdUri: 'Q123' },
                { image_url: 'https://example.com/image2', common_name: 'Common Name 2', wdUri: 'Q124' },
            ];

            service.getRandomEntities = jest.fn().mockResolvedValue(mockQuestions);

            // Mock del método save en el modelo Question
            const saveMock = jest.fn().mockResolvedValue(true);
            Question.prototype.save = saveMock;

            await service.generateQuestions(2);

            expect(saveMock).toHaveBeenCalledTimes(2);

        });
    });

    describe('getQuestionsCount', () => {
        it('should return the correct question count from the database', async () => {
            // Mock de la función countDocuments de Mongoose
            Question.countDocuments = jest.fn().mockResolvedValue(5);

            const count = await service.getQuestionsCount();

            expect(count).toBe(5);
        });
    });
});
