import { IQuestion, Tuple } from "./question-data-model";
import { WikidataQuestion } from "./question-db-service";
import { P, Q, WikidataEntity } from "./wikidata";
import { WikidataQueryBuilder } from "./wikidata/query_builder";

export interface WikidataRecipe {
    buildQuery() : WikidataQueryBuilder;
    getAttributes(binding: any) : Tuple<String>[];
    generateQuestion(chunk: WikidataEntity[]) : WikidataQuestion;
}

export class AnimalRecipe implements WikidataRecipe {
    buildQuery(): WikidataQueryBuilder {
        return new WikidataQueryBuilder()
                .subclassOf(Q.ANIMAL)
                .assocProperty(P.IMAGE, "imagen")
                .assocProperty(P.COMMON_NAME, "common_name", true, "es")
                .assocProperty(P.TAXON_NAME, "taxon_name", false)
    }
    getAttributes(binding: any): Tuple<String>[] {
        let common_name = binding.common_name ? binding.common_name.value : "UNKNOWN";
        return [
            { first: "common_name", second: common_name },
            { first: "taxon_name", second: binding.taxon_name.value },
        ]
    }
    generateQuestion(chunk: WikidataEntity[]): WikidataQuestion {
        return new WikidataQuestion(chunk[0])
                    .set_response(chunk[0].getAttribute("taxon_name"))
                    .set_distractor(chunk[1].getAttribute("taxon_name"))
                    .set_distractor(chunk[2].getAttribute("taxon_name"))
                    .set_distractor(chunk[3].getAttribute("taxon_name"))
    }

}
