import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { QuestionDBService } from "../../services/question-db-service";
import { WikidataEntity } from "../../services/wikidata/index";
import { Question } from "../../services/question-data-model";

let mongoServer: MongoMemoryServer;
let service: QuestionDBService;

beforeAll(async () => {
    // Crea un servidor de MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    QuestionDBService.setMongodbUri(mongoServer.getUri());

    service = QuestionDBService.getInstance(); // Crear la instancia del servicio
    service.syncPendingPromises()
}, 30000);

afterAll(async () => {
    // Desconectar la base de datos y parar el servidor de memoria
    await mongoose.disconnect();
    await mongoServer.stop();
}, 30000);

describe('QuestionDBService', () => {
    describe('getRandomQuestions', () => {
        it('should fetch random questions and return them as WikidataQuestion instances', async () => {
            // Mock de la función que obtiene las entidades
            const mockEntities = [
                new WikidataEntity('https://example.com/image1').addAttribute("country", 'Common Name 1'),
                new WikidataEntity('https://example.com/image2').addAttribute("country", 'Common Name 2'),
                new WikidataEntity('https://example.com/image1').addAttribute("country", 'Common Name 3'),
                new WikidataEntity('https://example.com/image1').addAttribute("country", 'Common Name 4'),
                new WikidataEntity('https://example.com/image2').addAttribute("country", 'Common Name 5'),
                new WikidataEntity('https://example.com/image2').addAttribute("country", 'Common Name 6'),
                new WikidataEntity('https://example.com/image2').addAttribute("country", 'Common Name 7'),
                new WikidataEntity('https://example.com/image2').addAttribute("country", 'Common Name 8'),
            ];

            service.getRandomEntities = jest.fn().mockResolvedValue(mockEntities);

            const questions = await service.getRandomQuestions(2);

            expect(questions).toHaveLength(2);
            expect(questions[0].getJson()).toHaveProperty('image_url');
            expect(questions[1].getJson()).toHaveProperty('image_url');
            expect(questions[0].getJson().response).toBe('Common Name 1');
            expect(questions[0].distractors).toEqual(['Common Name 2','Common Name 3','Common Name 4']);
        }, 30000);

        it('should handle an error when fetching random questions', async () => {
            // Simular un error
            service.getRandomEntities = jest.fn().mockRejectedValue(new Error('Something went wrong'));

            await expect(service.getRandomQuestions(2)).rejects.toThrow('Something went wrong');
        });
    });

    // describe('generateQuestions', () => {
    //     it('should generate a batch of questions and store them in the database', async () => {
    //         // Simula que la función de generación de preguntas responde correctamente
    //         const mockQuestions = [
    //             { image_url: 'https://example.com/image1', common_name: 'Common Name 1', wdUri: 'Q123' },
    //             { image_url: 'https://example.com/image2', common_name: 'Common Name 2', wdUri: 'Q124' },
    //         ];

    //         // service.getRandomEntities = jest.fn().mockResolvedValue(mockQuestions);

    //         // Mock del método save en el modelo Question
    //         const saveMock = jest.fn().mockResolvedValue(true);
    //         Question.prototype.save = saveMock;

    //         await service.generateQuestions(2);

    //         expect(saveMock).toHaveBeenCalled(2);

    //     });
    // });
});
