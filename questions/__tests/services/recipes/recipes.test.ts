import { QuestionDBService } from "../../../services/question-db-service";
import { WikidataEntity } from "../../../services/wikidata/index";
import { Question } from "../../../services/question-data-model";
import { FlagsRecipe } from "../../../services/question-generation";

let service: QuestionDBService;

beforeAll(async () => {
});

afterAll(async () => {
});

describe('Recipes test', () => {
    describe('getQuestion', () => {        it('Should generate the question', async () => {
            let recipe = new FlagsRecipe();
            let entity = new WikidataEntity("").addAttribute("country", "paris");
            let genq = recipe.generateQuestion();
            expect(genq(entity)).toBe("paris")
        });
    });
});
