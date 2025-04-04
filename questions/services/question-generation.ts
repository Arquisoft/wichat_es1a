import { Console } from "console";
import { WikidataQuestion } from "./question-db-service";
import { Categories, P, Q, WikidataEntity } from "./wikidata";
import { WikidataQueryBuilder } from "./wikidata/query_builder";

export type GenFunction = (we: WikidataEntity) => String;

export interface WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder);
    getAttributes(binding: any) : Array<[String,String]>;
    generateQuestion(): GenFunction;

    getCategory() : Number;
}

export class AnimalRecipe implements WikidataRecipe {
    buildQuery(qb: WikidataQueryBuilder) {
        qb
        .subclassOf(Q.ANIMAL)
        .assocProperty(1843, "common_name", true, "es")
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

export class GeographyRecipe implements WikidataRecipe {
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

export class FlagsRecipe implements WikidataRecipe {
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
