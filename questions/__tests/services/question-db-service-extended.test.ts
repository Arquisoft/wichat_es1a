import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { QuestionDBService, WikidataQuestion } from "../../services/question-db-service";
import { WikidataEntity, Categories, category_into_recipe } from "../../services/wikidata/index";
import { Question } from "../../services/question-data-model";
import { MonumentsRecipe, FlagsRecipe } from '../../services/question-generation';
import axios from 'axios';
import { PromiseStore } from '../../utils/promises';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

let mongoServer: MongoMemoryServer;
let service: QuestionDBService;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    QuestionDBService.setMongodbUri(uri);
    service = QuestionDBService.getInstance();
}, 30000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}, 30000);

describe('QuestionDBService Extended Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Category management', () => {        it('should retrieve recipes by category', () => {
            // No need to register recipes, use category_into_recipe function
            
            // Get recipes by their categories
            const recipe1 = category_into_recipe(Categories.Monuments); // Monuments
            const recipe2 = category_into_recipe(Categories.Flags); // Flags
            
            expect(recipe1).toBeInstanceOf(MonumentsRecipe);
            expect(recipe2).toBeInstanceOf(FlagsRecipe);
        });
        
        it('should return undefined for non-registered category', () => {
            const recipe = category_into_recipe(999);
            expect(recipe).toBeUndefined();
        });
    });
      describe('DB operations', () => {
        beforeEach(async () => {
            // Clear all questions before each test
            await Question.deleteMany({});
            
            // Mock axios para evitar llamadas a la API externa
            mockedAxios.get.mockResolvedValue({
                data: {
                    results: {
                        bindings: []
                    }
                }
            });
        });
          it('should save questions to the database', async () => {
            const question = new Question({
                question: "Test question?",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                correctAnswer: "Option 2",
                categories: ["Test"],
                wdId: 123,
                image_url: "https://example.com/image.jpg",
                category: 1,
                attrs: [["attr1", "value1"]]
            });
            
            await question.save();
            
            const savedQuestions = await Question.find({});
            expect(savedQuestions).toHaveLength(1);
            expect(savedQuestions[0].question).toBe("Test question?");
            expect(savedQuestions[0].options).toContain("Option 2");
            expect(savedQuestions[0].correctAnswer).toBe("Option 2");
        });
        
        it('should return questions from DB by category', async () => {
            // Save questions with different categories
            await new Question({
                question: "Question 1",
                category: 1,
                attrs: [["attr1", "value1"]]
            }).save();
            
            await new Question({
                question: "Question 2",
                category: 2,
                attrs: [["attr2", "value2"]]
            }).save();
            
            await new Question({
                question: "Question 3",
                category: 1,
                attrs: [["attr3", "value3"]]
            }).save();
            
            // Get questions by category using a cursor
            const generator1 = await service.get_questions(10, "", 1);
            const generator2 = await service.get_questions(10, "", 2);
            
            // Convertir los generadores a arrays
            const cat1Questions = [];
            const cat2Questions = [];
            for await (const doc of generator1) {
                cat1Questions.push(doc);
            }
            for await (const doc of generator2) {
                cat2Questions.push(doc);
            }
            
            expect(cat1Questions).toHaveLength(2);
            expect(cat2Questions).toHaveLength(1);
            expect(cat1Questions[0].category).toBe(1);
            expect(cat1Questions[1].category).toBe(1);
            expect(cat2Questions[0].category).toBe(2);
        });
        
        it('should handle empty DB gracefully', async () => {
            const generator = await service.get_questions(10, "", 3);
            const questions = [];
            for await (const doc of generator) {
                questions.push(doc);
            }
            expect(questions).toHaveLength(0);
        });
    });      describe('syncPendingPromises', () => {
        beforeEach(() => {
            // Mock axios para evitar llamadas a la API externa
            mockedAxios.get.mockResolvedValue({
                data: {
                    results: {
                        bindings: []
                    }
                }
            });
        });
        
        it('should resolve pending promises', async () => {
            // Preparar un mock de PromiseStore para testear aisladamente
            let mockPromiseStore = new PromiseStore();
            let result = '';
            const promise = Promise.resolve('result').then(res => {
                result = res;
                return res;
            });
            
            // Add a promise to our mock
            mockPromiseStore.addPromise(promise);
            
            // Wait for promises to resolve
            await mockPromiseStore.syncPendingPromises();
            
            // Verify the promise was resolved
            expect(result).toBe('result');
        });    });describe('getRandomQuestions', () => {
        // Mock the necessary functions instead of using the DB
        beforeEach(() => {
            // Mock axios para evitar llamadas a la API externa
            mockedAxios.get.mockResolvedValue({
                data: {
                    results: {
                        bindings: []
                    }
                }
            });
            
            // Creamos instancias mock de WikidataEntity
            const entity1 = new WikidataEntity("https://example.com/image1.jpg", 1);
            entity1.addAttribute("country", "Country 1");
            
            const entity2 = new WikidataEntity("https://example.com/image2.jpg", 2);
            entity2.addAttribute("country", "Country 2");
            
            const entity3 = new WikidataEntity("https://example.com/image3.jpg", 3);
            entity3.addAttribute("country", "Country 3");
            
            const entity4 = new WikidataEntity("https://example.com/image4.jpg", 4);
            entity4.addAttribute("country", "Country 4");
            
            // Mock getRandomEntities para retornar entidades directamente
            (service as any).getRandomEntities = jest.fn().mockResolvedValue([
                entity1, entity2, entity3, entity4
            ]);
            
            // Mock get_cache para evitar problemas con null
            (service as any).get_cache = jest.fn().mockReturnValue(new Set());
        });
          it('should generate WikidataQuestion objects', async () => {
            // Usar el método real category_into_recipe en vez de mock
            const questions = await service.getRandomQuestions(1, "", Categories.Flags);
            
            expect(questions.length).toBeGreaterThan(0);
            questions.forEach(q => {
                expect(q).toBeInstanceOf(WikidataQuestion);
                expect(q.image_url).toBeDefined();
            });
        });
    });
});
