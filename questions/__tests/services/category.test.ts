import { QuestionDBService } from "../../services/question-db-service";
import { Categories, category_from_str, category_into_recipe, WikidataEntity } from "../../services/wikidata/index";
import { Question } from "../../services/question-data-model";
import { MonumentsRecipe, FlagsRecipe, GeographyRecipe } from "../../services/question-generation";

let service: QuestionDBService;

beforeAll(async () => {
});

afterAll(async () => {
});

describe('Recipes test', () => {
    describe('getQuestion', () => {
        it('Should generate the question', async () => {
            expect(category_from_str("monuments")).toBe(Categories.Monuments)
            expect(category_from_str("geography")).toBe(Categories.Geography)
            expect(category_from_str("flags")).toBe(Categories.Flags)

            expect(category_into_recipe(Categories.Monuments)).toBeInstanceOf(MonumentsRecipe)
            expect(category_into_recipe(Categories.Geography)).toBeInstanceOf(GeographyRecipe)
            expect(category_into_recipe(Categories.Flags)).toBeInstanceOf(FlagsRecipe)

            expect(new MonumentsRecipe().getCategory()).toBe(Categories.Monuments)
            expect(new GeographyRecipe().getCategory()).toBe(Categories.Geography)
            expect(new FlagsRecipe().getCategory()).toBe(Categories.Flags)
        });
    });
});
