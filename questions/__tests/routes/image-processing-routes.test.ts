
import request from 'supertest';
import express from 'express';
import * as bodyParser from 'body-parser';
import { generate_image_processing_router } from '../../routes/image-processing-routes';
import { ImageProcessingService, LogoProcessingStrategy } from '../../services/image-processing-service';

// Mock for ImageProcessingService
jest.mock('../../services/image-processing-service');

// Setup Express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/image-processing', generate_image_processing_router());

describe('Image Processing Routes', () => {
    let mockService: ImageProcessingService;
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup mock service
        mockService = {
            getInstance: jest.fn(),
            getDefaultStrategy: jest.fn(),
            setDefaultStrategy: jest.fn(),
            processLogoImage: jest.fn()
        } as unknown as ImageProcessingService;
        
        // Make getInstance return our mock
        (ImageProcessingService.getInstance as jest.Mock).mockReturnValue(mockService);
        
        // Default mock responses
        (mockService.getDefaultStrategy as jest.Mock).mockReturnValue(LogoProcessingStrategy.BLUR);
        (mockService.processLogoImage as jest.Mock).mockResolvedValue('data:image/jpeg;base64,mockedImageData');
    });
    
    describe('GET /strategies', () => {
        test('should return all strategies except RANDOM', async () => {
            const response = await request(app).get('/image-processing/strategies');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('strategies');
            expect(response.body.strategies).toContain(LogoProcessingStrategy.BLUR);
            expect(response.body.strategies).toContain(LogoProcessingStrategy.PIXELATE);
            expect(response.body.strategies).toContain(LogoProcessingStrategy.THRESHOLD);
            expect(response.body.strategies).toContain(LogoProcessingStrategy.EDGE_DETECTION);
            expect(response.body.strategies).not.toContain(LogoProcessingStrategy.RANDOM);
        });
    });
    
    describe('GET /default-strategy', () => {
        test('should return the current default strategy', async () => {
            const response = await request(app).get('/image-processing/default-strategy');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('defaultStrategy', LogoProcessingStrategy.BLUR);
            expect(mockService.getDefaultStrategy).toHaveBeenCalled();
        });
    });
    
    describe('POST /default-strategy', () => {
        test('should update the default strategy', async () => {
            const response = await request(app)
                .post('/image-processing/default-strategy')
                .send({ strategy: LogoProcessingStrategy.PIXELATE });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                defaultStrategy: LogoProcessingStrategy.PIXELATE
            });
            expect(mockService.setDefaultStrategy).toHaveBeenCalledWith(LogoProcessingStrategy.PIXELATE);
        });
        
        test('should return 400 if strategy is missing', async () => {
            const response = await request(app)
                .post('/image-processing/default-strategy')
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Strategy is required');
            expect(mockService.setDefaultStrategy).not.toHaveBeenCalled();
        });
        
        test('should return 400 if strategy is invalid', async () => {
            const response = await request(app)
                .post('/image-processing/default-strategy')
                .send({ strategy: 'invalid-strategy' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid strategy');
            expect(response.body).toHaveProperty('validStrategies');
            expect(mockService.setDefaultStrategy).not.toHaveBeenCalled();
        });
    });
    
    describe('POST /process-test', () => {
        test('should process an image with default strategy', async () => {
            const imageUrl = 'https://example.com/logo.png';
            
            const response = await request(app)
                .post('/image-processing/process-test')
                .send({ imageUrl });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                originalUrl: imageUrl,
                processedUrl: 'data:image/jpeg;base64,mockedImageData',
                strategy: 'default'
            });
            expect(mockService.processLogoImage).toHaveBeenCalledWith(imageUrl, undefined);
        });
        
        test('should process an image with specified strategy', async () => {
            const imageUrl = 'https://example.com/logo.png';
            const strategy = LogoProcessingStrategy.EDGE_DETECTION;
            
            const response = await request(app)
                .post('/image-processing/process-test')
                .send({ imageUrl, strategy });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                originalUrl: imageUrl,
                processedUrl: 'data:image/jpeg;base64,mockedImageData',
                strategy
            });
            expect(mockService.processLogoImage).toHaveBeenCalledWith(imageUrl, strategy);
        });
        
        test('should return 400 if imageUrl is missing', async () => {
            const response = await request(app)
                .post('/image-processing/process-test')
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Image URL is required');
            expect(mockService.processLogoImage).not.toHaveBeenCalled();
        });
        
        test('should handle processing errors', async () => {
            const imageUrl = 'https://example.com/invalid-logo.png';
            const errorMessage = 'Failed to process image';
            
            // Make service throw an error
            (mockService.processLogoImage as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
            
            const response = await request(app)
                .post('/image-processing/process-test')
                .send({ imageUrl });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to process image');
            expect(response.body).toHaveProperty('message', errorMessage);
        });
        
        test('should handle non-Error objects thrown during processing', async () => {
            const imageUrl = 'https://example.com/invalid-logo.png';
            
            // Make service throw a non-Error object
            (mockService.processLogoImage as jest.Mock).mockRejectedValueOnce('Something went wrong');
            
            const response = await request(app)
                .post('/image-processing/process-test')
                .send({ imageUrl });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to process image');
            expect(response.body).toHaveProperty('message', 'Something went wrong');
        });
    });
});
