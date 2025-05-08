/**
 * Test script for logo processing functionality
 * 
 * This script provides a simple way to test the logo processing feature
 * by sending test requests to the API endpoints.
 */

import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:8010';

/**
 * Tests the logo processing API
 */
async function testLogoProcessing() {
  try {
    console.log('Testing Logo Processing API...');
    
    // 1. Get available strategies
    console.log('\n1. Fetching available strategies...');
    const strategiesResponse = await axios.get(`${API_URL}/api/image-processing/strategies`);
    console.log('Available strategies:', strategiesResponse.data.strategies);
    
    // Example logo URLs to test
    const logoUrls = [
      'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'
    ];
    
    // 2. Process each logo with each available strategy
    console.log('\n2. Testing each strategy on sample logos...');
    
    for (const url of logoUrls) {
      console.log(`\nTesting logo: ${url}`);
      
      for (const strategy of strategiesResponse.data.strategies) {
        console.log(`  Processing with strategy: ${strategy}`);
        
        try {
          const processResponse = await axios.post(`${API_URL}/api/image-processing/process-test`, {
            imageUrl: url,
            strategy: strategy
          });
          
          console.log(`  Status: ${processResponse.status}`);
          
          // Save the base64 image to a file for visual inspection
          if (processResponse.data.processedUrl.startsWith('data:image/')) {
            const base64Data = processResponse.data.processedUrl.split(',')[1];
            const filename = `logo_${strategy}_${url.split('/').pop().replace(/\.[^/.]+$/, '')}.jpg`;
            
            fs.writeFileSync(filename, base64Data, 'base64');
            console.log(`  Saved processed image to ${filename}`);
          }
        } catch (error) {
          console.error(`  Error processing image with ${strategy}:`, error.message);
        }
      }
    }
    
    console.log('\nAll tests completed!');
    
  } catch (error) {
    console.error('Error testing logo processing:', error.message);
  }
}

// Run the test
testLogoProcessing().catch(console.error);
