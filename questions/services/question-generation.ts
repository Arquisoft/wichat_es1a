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
