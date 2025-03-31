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
                .assocProperty(P.IMAGE, "imagen")
                .assocProperty(P.COMMON_NAME, "common_name", true, "es")
                .assocProperty(P.TAXON_NAME, "taxon_name", false)
    }
    getAttributes(binding: any): Array<[String,String]> {
        let common_name = binding.common_name ? binding.common_name.value : "UNKNOWN";
        return [
            ["common_name", common_name],
            ["taxon_name", binding.taxon_name.value],
        ]
    }
    generateQuestion(chunk: WikidataEntity[]): WikidataQuestion {
        return new WikidataQuestion(chunk[0], chunk[0].attrs)
                    .set_response(chunk[0].getAttribute("taxon_name"))
                    .set_distractor(chunk[1].getAttribute("taxon_name"))
                    .set_distractor(chunk[2].getAttribute("taxon_name"))
                    .set_distractor(chunk[3].getAttribute("taxon_name"))
    }

    getCategory(): Number {
        return Categories.Animals
    }

}

export class CitiesRecipe implements WikidataRecipe {
    buildQuery(): WikidataQueryBuilder {
        return new WikidataQueryBuilder()
                .subclassOf(Q.CITY)
                .assocProperty(P.IMAGE, "imagen")
                .assocProperty(P.COUNTRY, "country")
    }
    getAttributes(binding: any): [String,String][] {
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
        return Categories.Cities
    }

}
