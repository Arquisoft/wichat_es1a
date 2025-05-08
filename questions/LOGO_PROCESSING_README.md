/**
 * Logo Processing README for WIChat project
 * ----------------------------------------
 * 
 * This document describes how the logo processing feature works in the WIChat application.
 */

# Logo Processing Feature

## Overview

The Logo Processing feature enhances the logo-based game in WIChat by making it more challenging. 
The original issue was that company logos often included the company name, making the game too easy.
The solution implemented applies various image processing techniques to obscure or hide text in logos,
forcing players to identify companies by other visual elements like shapes, colors, and overall composition.

## Implementation Details

The implementation consists of:

1. **Image Processing Service**: A new service that applies various transformations to logo images.
2. **API Endpoints**: Routes to test and configure the image processing service.
3. **Integration with LogosRecipe**: Updates to the logo fetching logic to process images before sending them to the client.

## Available Processing Strategies

The following strategies are available:

- **Blur**: Applies a Gaussian blur to hide text while preserving general shapes
- **Pixelate**: Creates a pixelated effect that preserves overall shape but obscures text
- **Threshold**: Converts the image to black and white, often removing text while preserving logo shapes
- **Edge Detection**: Highlights edges and contours, obscuring text while preserving distinctive shapes
- **Random**: Randomly selects one of the above strategies for variety

## How to Use

### API Endpoints

The feature exposes two main API endpoints:

1. `GET /api/image-processing/strategies` - Lists all available processing strategies
2. `POST /api/image-processing/process-test` - Tests a specific strategy on a provided image URL

### Testing a Strategy

To test a processing strategy on a specific logo:

```
POST /api/image-processing/process-test
{
  "imageUrl": "https://example.com/logo.png",
  "strategy": "blur"
}
```

Response:
```
{
  "originalUrl": "https://example.com/logo.png",
  "processedUrl": "data:image/jpeg;base64,...",
  "strategy": "blur"
}
```

## Technical Implementation

The image processing is handled by the Sharp library, which provides fast and efficient image 
transformations. Processed images are cached to improve performance on repeated requests.

## Future Improvements

Potential enhancements to consider:

1. Add more processing strategies like color inversion or selective blurring
2. Implement difficulty levels with varying degrees of processing
3. Add machine learning-based text detection for more targeted text removal
4. Configure processing parameters through admin UI instead of code changes
