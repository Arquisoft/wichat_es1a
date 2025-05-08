import { QuestionDBService } from "../../services/question-db-service";
import { Categories, category_from_str, category_into_recipe, WikidataEntity } from "../../services/wikidata/index";
import { Question } from "../../services/question-data-model";
import { FlagsRecipe } from "../../services/question-generation";

let service: QuestionDBService;

beforeAll(async () => {
});

afterAll(async () => {
});

describe('Recipes test', () => {
    describe('getQuestion', () => {    it('Should generate the question', async () => {
            expect(category_from_str("flags")).toBe(Categories.Flags)
            expect(category_into_recipe(Categories.Flags)).toBeInstanceOf(FlagsRecipe)
            
            expect(new FlagsRecipe().getCategory()).toBe(Categories.Flags)
        });
    });
});
