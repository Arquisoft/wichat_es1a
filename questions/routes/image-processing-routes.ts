// filepath: c:\Users\aleja\Desktop\UNI\3\ASW\Proyecto\wichat_es1a\questions\routes\image-processing-routes.ts
// Image processing routes for WIChat application
// This file provides API endpoints to configure and test the image processing service

import * as express from 'express';
import { ImageProcessingService, LogoProcessingStrategy } from '../services/image-processing-service';

export const generate_image_processing_router = function() {
    const router = express.Router();

    // Endpoint to get available processing strategies
    router.get("/strategies", (_req, res) => {
        // Return all available strategies except RANDOM (which is only for internal use)
        const strategies = Object.values(LogoProcessingStrategy)
            .filter(strategy => strategy !== LogoProcessingStrategy.RANDOM);

        res.json({
            strategies: strategies
        });
    });
    
    // Endpoint to get or set the default strategy
    router.route("/default-strategy")
        .get((_req, res) => {
            const service = ImageProcessingService.getInstance();
            res.json({
                defaultStrategy: service.getDefaultStrategy()
            });
        })
        .post((req, res) => {
            const { strategy } = req.body;
            
            if (!strategy) {
                res.status(400).json({
                    error: "Strategy is required"
                });
                return;
            }
            
            // Validate if the provided strategy is valid
            if (!Object.values(LogoProcessingStrategy).includes(strategy as LogoProcessingStrategy)) {
                res.status(400).json({
                    error: "Invalid strategy",
                    validStrategies: Object.values(LogoProcessingStrategy)
                        .filter(s => s !== LogoProcessingStrategy.RANDOM)
                });
                return;
            }
            
            const service = ImageProcessingService.getInstance();
            service.setDefaultStrategy(strategy as LogoProcessingStrategy);
            
            res.json({
                success: true,
                defaultStrategy: strategy
            });
        });
    
    // Endpoint to test image processing with a specific URL
    router.post("/process-test", async (req, res) => {
        try {
            const { imageUrl, strategy } = req.body;
            
            if (!imageUrl) {
                res.status(400).json({
                    error: "Image URL is required"
                });
                return;
            }
            
            const imageProcessingService = ImageProcessingService.getInstance();
            
            // Validate if the provided strategy is valid
            let selectedStrategy: LogoProcessingStrategy | undefined = undefined;
            if (strategy && Object.values(LogoProcessingStrategy).includes(strategy as LogoProcessingStrategy)) {
                selectedStrategy = strategy as LogoProcessingStrategy;
            }
            
            const processedImageUrl = await imageProcessingService.processLogoImage(imageUrl, selectedStrategy);
            
            res.json({
                originalUrl: imageUrl,
                processedUrl: processedImageUrl,
                strategy: selectedStrategy || 'default'
            });
        } catch (error) {
            console.error("Error processing image:", error);
            res.status(500).json({
                error: "Failed to process image",
                message: error instanceof Error ? error.message : String(error)
            });
        }
    });

    return router;
}
