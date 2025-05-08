import sharp from 'sharp';
import axios from 'axios';

/**
 * Enumeration of available logo processing strategies
 */
export enum LogoProcessingStrategy {
    BLUR = 'blur',
    PIXELATE = 'pixelate',
    THRESHOLD = 'threshold',
    EDGE_DETECTION = 'edge-detection',
    RANDOM = 'random'
}

/**
 * Service to process images for the WIChat application.
 * Provides methods to blur text in logos to make the game more challenging.
 */
export class ImageProcessingService {
    private static instance: ImageProcessingService;
    
    // Default strategy to use if not specified
    private defaultStrategy: LogoProcessingStrategy = LogoProcessingStrategy.RANDOM;
    
    // Cache processed images to avoid reprocessing the same image
    private imageCache: Map<string, string> = new Map();
    
    private constructor() { }

    /**
     * Get the singleton instance of the ImageProcessingService
     */
    public static getInstance(): ImageProcessingService {
        if (!ImageProcessingService.instance) {
            ImageProcessingService.instance = new ImageProcessingService();
        }
        return ImageProcessingService.instance;
    }
    
    /**
     * Get the current default processing strategy
     */
    public getDefaultStrategy(): LogoProcessingStrategy {
        return this.defaultStrategy;
    }
    
    /**
     * Set the default processing strategy
     * @param strategy The strategy to use as default
     */
    public setDefaultStrategy(strategy: LogoProcessingStrategy): void {
        this.defaultStrategy = strategy;
        // Clear the cache when changing strategies
        this.imageCache.clear();
    }

    /**
     * Process a logo image to make it more challenging to recognize
     * 
     * @param imageUrl URL of the original image
     * @param strategy Optional strategy to use for processing
     * @returns URL of the processed image (base64 data URL)
     */
    public async processLogoImage(imageUrl: string, strategy?: LogoProcessingStrategy): Promise<string> {
        try {
            // Check if image is already in cache
            if (this.imageCache.has(imageUrl)) {
                console.log('Using cached processed image');
                return this.imageCache.get(imageUrl);
            }

            // Choose a strategy if not provided
            const selectedStrategy = strategy || 
                (this.defaultStrategy === LogoProcessingStrategy.RANDOM ? 
                    this.getRandomStrategy() : this.defaultStrategy);
            
            console.log(`Processing logo with strategy: ${selectedStrategy}`);

            // Fetch the image from the URL
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');

            // Apply the selected processing strategy
            const processedBuffer = await this.applyProcessingStrategy(imageBuffer, selectedStrategy);

            // Convert the processed image to a base64 data URL
            const base64Image = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
            
            // Cache the processed image
            this.imageCache.set(imageUrl, base64Image);
            
            return base64Image;
        } catch (error) {
            console.error('Error processing logo image:', error);
            // If processing fails, return the original image URL
            return imageUrl;
        }
    }
    
    /**
     * Apply the selected processing strategy to the image
     * 
     * @param imageBuffer Original image buffer
     * @param strategy Processing strategy to apply
     * @returns Processed image buffer
     */
    private async applyProcessingStrategy(imageBuffer: Buffer, strategy: LogoProcessingStrategy): Promise<Buffer> {
        const sharpInstance = sharp(imageBuffer);
        
        switch (strategy) {
            case LogoProcessingStrategy.BLUR:
                // Apply gaussian blur to hide text
                return await sharpInstance
                    .blur(10) // Higher radius for stronger blur
                    .toBuffer();
                
            case LogoProcessingStrategy.PIXELATE:
                // Create a pixelated effect that preserves overall shape but obscures text
                const metadata = await sharpInstance.metadata();
                const width = metadata.width || 300;
                const height = metadata.height || 300;
                
                // Resize down to a very small image then back up for pixelation effect
                return await sharpInstance
                    .resize(Math.max(10, Math.floor(width / 15)), Math.max(10, Math.floor(height / 15)), {
                        kernel: 'nearest'
                    })
                    .resize(width, height, {
                        kernel: 'nearest' // Use nearest neighbor for pixelated look
                    })
                    .toBuffer();
                
            case LogoProcessingStrategy.THRESHOLD:
                // Convert to binary image (just black and white)
                // This often removes text while preserving logo shapes
                return await sharpInstance
                    .grayscale()
                    .threshold(128) // Mid-level threshold
                    .toBuffer();
                
            case LogoProcessingStrategy.EDGE_DETECTION:
                // Apply edge detection to highlight shapes but obscure text
                return await sharpInstance
                    .convolve({
                        width: 3,
                        height: 3,
                        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
                    })
                    .toBuffer();
                
            default:
                // Default to blur if strategy not recognized
                return await sharpInstance
                    .blur(10)
                    .toBuffer();
        }
    }
    
    /**
     * Select a random processing strategy
     */
    private getRandomStrategy(): LogoProcessingStrategy {
        const strategies = [
            LogoProcessingStrategy.BLUR,
            LogoProcessingStrategy.PIXELATE,
            LogoProcessingStrategy.THRESHOLD,
            LogoProcessingStrategy.EDGE_DETECTION
        ];
        
        const randomIndex = Math.floor(Math.random() * strategies.length);
        return strategies[randomIndex];
    }
}
