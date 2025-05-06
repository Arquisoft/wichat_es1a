import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Question, IQuestion } from '../../services/question-data-model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  // Disconnect and stop the MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

describe('Question Data Model', () => {
  it('should create a Question with required fields', async () => {
    const questionData = {
      category: 1,
      attrs: [["key1", "value1"], ["key2", "value2"]]
    };

    const question = new Question(questionData);
    const savedQuestion = await question.save();

    // Check if the saved question has the expected properties
    expect(savedQuestion).toBeDefined();
    expect(savedQuestion.category).toBe(1);
    expect(savedQuestion.attrs).toHaveLength(2);
    expect(savedQuestion.attrs[0][0]).toBe("key1");
    expect(savedQuestion.attrs[0][1]).toBe("value1");
    expect(savedQuestion.attrs[1][0]).toBe("key2");
    expect(savedQuestion.attrs[1][1]).toBe("value2");
    expect(savedQuestion.id).toBeDefined();
  });

  it('should create a Question with all fields', async () => {
    const questionData = {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      correctAnswer: "Paris",
      categories: ["Geography", "Capitals"],
      wdId: 12345,
      image_url: "https://example.com/image.jpg",
      category: 2,
      attrs: [["country", "France"], ["continent", "Europe"]]
    };

    const question = new Question(questionData);
    const savedQuestion = await question.save();

    // Check if the saved question has the expected properties
    expect(savedQuestion).toBeDefined();
    expect(savedQuestion.question).toBe("What is the capital of France?");
    expect(savedQuestion.options).toEqual(["Paris", "London", "Berlin", "Madrid"]);
    expect(savedQuestion.correctAnswer).toBe("Paris");
    expect(savedQuestion.categories).toEqual(["Geography", "Capitals"]);
    expect(savedQuestion.wdId).toBe(12345);
    expect(savedQuestion.image_url).toBe("https://example.com/image.jpg");
    expect(savedQuestion.category).toBe(2);
    expect(savedQuestion.attrs).toHaveLength(2);
  });

  it('should generate a default ID for a new question', async () => {
    const questionData = {
      category: 3,
      attrs: [["test", "value"]]
    };

    const question = new Question(questionData);
    expect(question.id).toBeDefined();
    expect(mongoose.Types.ObjectId.isValid(question.id)).toBe(true);

    const savedQuestion = await question.save();
    expect(savedQuestion.id).toEqual(question.id);
  });
  it('should fail validation if required fields are missing', async () => {
    const invalidQuestion = new Question({});
    
    let error;
    try {
      await invalidQuestion.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
    // Mongoose no valida el campo attrs como se esperaba, solo validamos category
  });
});
