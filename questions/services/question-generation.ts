import { Console } from "console";
import { WikidataQuestion } from "./question-db-service";
import { Categories, P, Q, WikidataEntity } from "./wikidata";
import { WikidataQueryBuilder } from "./wikidata/query_builder";

export interface WikidataRecipe {
    buildQuery() : WikidataQueryBuilder;
    getAttributes(binding: any) : Array<[String,String]>;
    generateQuestion(chunk: WikidataEntity[]) : WikidataQuestion;

    getCategory() : Number;
}

export class AnimalRecipe implements WikidataRecipe {
    buildQuery(): WikidataQueryBuilder {
        return new WikidataQueryBuilder()
                .subclassOf(Q.ANIMAL)
                .assocProperty(1843, "common_name", true, "es")
                .assocProperty(P.IMAGE, "imagen")
    }
    getAttributes(binding: any): Array<[String,String]> {
        return [
            ["item_label", binding.itemLabel.value],
        ]
    }
    generateQuestion(chunk: WikidataEntity[]): WikidataQuestion {
        return new WikidataQuestion(chunk[0], chunk[0].attrs)
                    .set_response(chunk[0].getAttribute("item_label"))
                    .set_distractor(chunk[1].getAttribute("item_label"))
                    .set_distractor(chunk[2].getAttribute("item_label"))
                    .set_distractor(chunk[3].getAttribute("item_label"))
    }

    getCategory(): Number {
        return Categories.Animals
    }

}

export class GeographyRecipe implements WikidataRecipe {
    buildQuery(): WikidataQueryBuilder {
        return new WikidataQueryBuilder()
                .subclassOf(Q.CITY)
                .assocProperty(P.IMAGE, "imagen")
    }
    getAttributes(binding: any): [String,String][] {
        return [
            ["item_label", binding.itemLabel.value],
        ]
    }
    generateQuestion(chunk: WikidataEntity[]): WikidataQuestion {
        return new WikidataQuestion(chunk[0], chunk[0].attrs)
                    .set_response(chunk[0].getAttribute("item_label"))
                    .set_distractor(chunk[1].getAttribute("item_label"))
                    .set_distractor(chunk[2].getAttribute("item_label"))
                    .set_distractor(chunk[3].getAttribute("item_label"))
    }

    getCategory(): Number {
        return Categories.Geography
    }

}

export class FlagsRecipe implements WikidataRecipe {
    buildQuery(): WikidataQueryBuilder {
        return new WikidataQueryBuilder()
                    .instanceOf(186516)
                    .assocProperty(P.IMAGE, "imagen")
                    .assocProperty(1001, "country")
    }
    getAttributes(binding: any): Array<[String, String]> {
        return [
            ["country", binding.countryLabel.value],
        ]
    }
    generateQuestion(chunk: WikidataEntity[]): WikidataQuestion {
        return new WikidataQuestion(chunk[0], chunk[0].attrs)
                    .set_response(chunk[0].getAttribute("country"))
                    .set_distractor(chunk[1].getAttribute("country"))
                    .set_distractor(chunk[2].getAttribute("country"))
                    .set_distractor(chunk[3].getAttribute("country"))
    }
    getCategory(): Number {
        return Categories.Flags
    }

}
