import { QuestionDBService } from "../../../services/question-db-service";
import { WikidataEntity } from "../../../services/wikidata/index";
import { Question } from "../../../services/question-data-model";
import { AnimalRecipe, FlagsRecipe, GeographyRecipe } from "../../../services/question-generation";

let service: QuestionDBService;

beforeAll(async () => {
});

afterAll(async () => {
});

describe('Recipes test', () => {
    describe('getQuestion', () => {
        it('Should generate the question', async () => {
            let recipe = new AnimalRecipe();
            let entity = new WikidataEntity("").addAttribute("item_label", "abc");
            let genq = recipe.generateQuestion();
            expect(genq(entity)).toBe("abc")

            recipe = new GeographyRecipe();
            entity = new WikidataEntity("").addAttribute("item_label", "mountain");
            genq = recipe.generateQuestion();
            expect(genq(entity)).toBe("mountain")

            recipe = new FlagsRecipe();
            entity = new WikidataEntity("").addAttribute("country", "paris");
            genq = recipe.generateQuestion();
            expect(genq(entity)).toBe("paris")
        });
    });
});
