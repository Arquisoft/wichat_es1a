import { Categories, P, Q, WikidataEntity } from "./wikidata";
import { WikidataQueryBuilder } from "./wikidata/query_builder";

export type GenFunction = (we: WikidataEntity) => String;

export abstract class WikidataRecipe {
    abstract buildQuery(qb: WikidataQueryBuilder): void;
    async getImageUrl(binding: any) : Promise<String> {
         return binding.imagen.value
    }
    isValid(binding: any) : boolean {
       let itemLabel = binding.itemLabel;
       if (itemLabel)
           return !itemLabel.value.startsWith("Q")
       else
           return true
    }
    abstract getAttributes(binding: any) : Array<[String,String]>;
    abstract generateQuestion(): GenFunction;
    abstract getCategory() : Number;
}





export class FlagsRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb
        .instanceOf(186516)
        .assocProperty(1001, "country")
    }
    // Override the getImageUrl method to match async signature
    async getImageUrl(binding: any): Promise<String> {
        return binding.imagen.value;
    }
    getAttributes(binding: any): Array<[String, String]> {
        return [
            ["country", binding.countryLabel.value],
        ]
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("country")
    }
    getCategory(): Number {
        return Categories.Flags
    }
}

export class LogosRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb.clearProperties();
        qb
        .instanceOf(4830453)
        .assocProperty(361, "partof", 242345)
        .assocProperty(154, "logo")
    }
    
    async getImageUrl(binding: any): Promise<String> {
        // We'll process the logo image before returning it
        const originalUrl = binding.logoLabel.value;
          // Import here to avoid circular dependencies
        const { ImageProcessingService } = await import('./image-processing-service');
        const imageProcessingService = ImageProcessingService.getInstance();
        
        // Process the logo image to blur text
        try {
            const processedUrl = await imageProcessingService.processLogoImage(originalUrl);
            return processedUrl;
        } catch (error) {
            console.error('Failed to process logo image:', error);
            return originalUrl; // Fall back to original if processing fails
        }
    }
    
    getAttributes(binding: any): Array<[String, String]> {
        return [
            ["logo", binding.logoLabel.value],
            ["item_label", binding.itemLabel.value],
        ]
    }
    
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }
    
    getCategory(): Number {
        return Categories.Logos
    }
}
