
import { ImageProcessingService, LogoProcessingStrategy } from '../../services/image-processing-service';
import axios from 'axios';
import sharp from 'sharp';

// Mock for axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock for sharp
jest.mock('sharp');
const mockedSharp = sharp as jest.MockedFunction<typeof sharp>;

describe('ImageProcessingService', () => {
    let service: ImageProcessingService;

    beforeEach(() => {
        // Reset service instance before each test
        // @ts-ignore - Accessing private property for testing
        ImageProcessingService.instance = undefined;
        
        service = ImageProcessingService.getInstance();
        
        // Mock implementations
        const mockSharpInstance = {
            metadata: jest.fn().mockResolvedValue({ width: 300, height: 200 }),
            blur: jest.fn().mockReturnThis(),
            grayscale: jest.fn().mockReturnThis(),
            threshold: jest.fn().mockReturnThis(),
            resize: jest.fn().mockReturnThis(),
            convolve: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-image-data'))
        };
        
        mockedSharp.mockReturnValue(mockSharpInstance as any);
        
        // Mock axios response
        mockedAxios.get.mockResolvedValue({
            data: Buffer.from('test-image-data')
        });
    });

    test('getInstance should return a singleton instance', () => {
        const instance1 = ImageProcessingService.getInstance();
        const instance2 = ImageProcessingService.getInstance();
        
        expect(instance1).toBe(instance2);
    });

    test('getDefaultStrategy should return the default strategy', () => {
        // Default strategy is RANDOM
        expect(service.getDefaultStrategy()).toBe(LogoProcessingStrategy.RANDOM);
    });

    test('setDefaultStrategy should update the default strategy and clear cache', () => {
        // Set a new strategy
        service.setDefaultStrategy(LogoProcessingStrategy.BLUR);
        
        // Verify strategy was updated
        expect(service.getDefaultStrategy()).toBe(LogoProcessingStrategy.BLUR);
        
        // Add an item to cache and verify it's cleared
        // @ts-ignore - Accessing private property for testing
        service.imageCache.set('test-url', 'test-data');
        
        service.setDefaultStrategy(LogoProcessingStrategy.PIXELATE);
        
        // @ts-ignore - Accessing private property for testing
        expect(service.imageCache.size).toBe(0);
    });

    test('processLogoImage should process and cache an image', async () => {
        const imageUrl = 'https://example.com/test-logo.png';
        
        // First call should process the image
        const result1 = await service.processLogoImage(imageUrl, LogoProcessingStrategy.BLUR);
        
        // Verify axios was called to fetch the image
        expect(mockedAxios.get).toHaveBeenCalledWith(imageUrl, { responseType: 'arraybuffer' });
        
        // Verify result is a base64 data URL
        expect(result1).toMatch(/^data:image\/jpeg;base64,/);
        
        // Second call with same URL should use cache
        const result2 = await service.processLogoImage(imageUrl, LogoProcessingStrategy.BLUR);
        
        // axios should still have been called only once
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        
        // Results should match
        expect(result2).toBe(result1);
    });    test('processLogoImage should handle the BLUR strategy', async () => {
        // Use a unique URL for this test to avoid cache
        const imageUrl = 'https://example.com/test-blur-strategy.png';
        
        // Create a specific mock for blur
        const mockSharpBlurInstance = {
            blur: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-blur-image'))
        };
        
        // Setup mock
        mockedSharp.mockReturnValue(mockSharpBlurInstance as any);
        
        // Process image with blur strategy
        await service.processLogoImage(imageUrl, LogoProcessingStrategy.BLUR);
        
        // Verify blur was called
        expect(mockSharpBlurInstance.blur).toHaveBeenCalled();
    });
    
    test('processLogoImage should handle the PIXELATE strategy', async () => {
        // Use a unique URL for this test to avoid cache
        const imageUrl = 'https://example.com/test-pixelate-strategy.png';
        
        // Create a specific mock for pixelate
        const mockSharpPixelateInstance = {
            metadata: jest.fn().mockResolvedValue({ width: 300, height: 200 }),
            resize: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-pixelate-image'))
        };
        
        // Setup mock
        mockedSharp.mockReturnValue(mockSharpPixelateInstance as any);
        
        // Process image with pixelate strategy
        await service.processLogoImage(imageUrl, LogoProcessingStrategy.PIXELATE);
        
        // Verify resize was called
        expect(mockSharpPixelateInstance.resize).toHaveBeenCalled();
    });
    
    test('processLogoImage should handle the THRESHOLD strategy', async () => {
        // Use a unique URL for this test to avoid cache
        const imageUrl = 'https://example.com/test-threshold-strategy.png';
        
        // Create a specific mock for threshold
        const mockSharpThresholdInstance = {
            grayscale: jest.fn().mockReturnThis(),
            threshold: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-threshold-image'))
        };
        
        // Setup mock
        mockedSharp.mockReturnValue(mockSharpThresholdInstance as any);
        
        // Process image with threshold strategy
        await service.processLogoImage(imageUrl, LogoProcessingStrategy.THRESHOLD);
        
        // Verify threshold operations were called
        expect(mockSharpThresholdInstance.grayscale).toHaveBeenCalled();
        expect(mockSharpThresholdInstance.threshold).toHaveBeenCalled();
    });
    
    test('processLogoImage should handle the EDGE_DETECTION strategy', async () => {
        // Use a unique URL for this test to avoid cache
        const imageUrl = 'https://example.com/test-edge-strategy.png';
        
        // Create a specific mock for edge detection
        const mockSharpEdgeInstance = {
            convolve: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-edge-image'))
        };
        
        // Setup mock
        mockedSharp.mockReturnValue(mockSharpEdgeInstance as any);
        
        // Process image with edge detection strategy
        await service.processLogoImage(imageUrl, LogoProcessingStrategy.EDGE_DETECTION);
        
        // Verify convolve was called
        expect(mockSharpEdgeInstance.convolve).toHaveBeenCalled();
    });    test('processLogoImage should use random strategy when default is RANDOM', async () => {
        // Use a unique URL for this test to avoid cache
        const imageUrl = 'https://example.com/test-random-strategy.png';
        
        // Force default to RANDOM
        service.setDefaultStrategy(LogoProcessingStrategy.RANDOM);
        
        // Create a mock for the random strategy test (which will select BLUR)
        const mockSharpRandomInstance = {
            blur: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-random-image'))
        };
        
        // Setup mock
        mockedSharp.mockReturnValue(mockSharpRandomInstance as any);
        
        // Mock Math.random to return a predictable value
        const originalRandom = Math.random;
        Math.random = jest.fn().mockReturnValue(0); // Will select first strategy (BLUR)
        
        // Process image with default (random) strategy
        await service.processLogoImage(imageUrl);
        
        // Verify blur was applied (first strategy in random list)
        expect(mockSharpRandomInstance.blur).toHaveBeenCalled();
        
        // Restore Math.random
        Math.random = originalRandom;
    });

    test('processLogoImage should return original URL on error', async () => {
        const imageUrl = 'https://example.com/error-image.png';
        
        // Make axios throw an error
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
        
        const result = await service.processLogoImage(imageUrl);
        
        // Should return the original URL
        expect(result).toBe(imageUrl);
    });
});
