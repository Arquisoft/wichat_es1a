import { Categories, P, Q, WikidataEntity } from "./wikidata";
import { WikidataQueryBuilder } from "./wikidata/query_builder";

export type GenFunction = (we: WikidataEntity) => String;

export abstract class WikidataRecipe {
    abstract buildQuery(qb: WikidataQueryBuilder): void;
    getImageUrl(binding: any) : String {
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

export class AnimalRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb
        .subclassOf(Q.ANIMAL)
        .assocProperty(1843, "common_name", null, true, "es")
    }
    getAttributes(binding: any): Array<[String,String]> {
        return [
            ["item_label", binding.itemLabel.value],
        ]
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }
    getCategory(): Number {
        return Categories.Animals
    }
}

export class GeographyRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb.subclassOf(Q.CITY)
    }
    getAttributes(binding: any): [String,String][] {
        return [
            ["item_label", binding.itemLabel.value],
        ]
    }
    generateQuestion(): GenFunction {
        return (we: WikidataEntity) => we.getAttribute("item_label")
    }

    getCategory(): Number {
        return Categories.Geography
    }

}

export class FlagsRecipe extends WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb
        .instanceOf(186516)
        .assocProperty(1001, "country")
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
        console.log(qb.build())
    }
    getImageUrl(binding: any): String {
        return binding.logoLabel.value
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
