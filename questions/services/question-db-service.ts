import * as mongoose from 'mongoose';
import { Question, IQuestion } from '../../questions/services/question-data-model.ts';
import "../utils/array-chunks.ts"

import { WikidataEntity, category_into_recipe, Categories, P } from "./wikidata";

import * as dotenv from "dotenv";
import { PromiseStore } from '../utils/promises.ts';
import { AnimalRecipe, WikidataRecipe } from './question-generation.ts';
import { WikidataQueryBuilder } from './wikidata/query_builder.ts';
import { chunks } from '../utils/array-chunks.ts';

dotenv.config();

export class WikidataQuestion {
    image_url: String;
    response: String;
    distractors: String[];
    attrs: Map<String,String>;

    constructor(entity: WikidataEntity, attrs: Map<String,String>) {
        this.image_url = entity.image_url;
        this.response = ""
        this.attrs = attrs;
        this.distractors = []
    }

    public set_response(res: String) : WikidataQuestion {
        this.response = res;
        return this;
    }

    public set_distractor(dist: String) : WikidataQuestion {
        this.distractors.push(dist);
        return this;
    }

    public getJson() : any {
        let options = this.distractors.slice();
        options.push(this.response);
        return {
            image_url: this.image_url,
            response: this.response,
            distractors: this.distractors,
            options,
            attrs: Object.fromEntries(this.attrs)
        }
    }
}

export class QuestionDBService extends PromiseStore {
    private questionsCache: Map<Number,Set<Number>> = new Map();

    private constructor() {
        super();
        this.addPromise(
            mongoose.connect(QuestionDBService._mongodbUri)
                    .then(async () => {
                        await Question.deleteMany().then(async () => {
                            await this.generateQuestions(20, new AnimalRecipe())
                        })
                    })
        );
    }

    private static _instance: QuestionDBService = null;
    private static _mongodbUri: string = process.env.DATABASE_URI || 'mongodb://localhost:27017/questionDB';

    public static setMongodbUri(uri: string) {
        this._mongodbUri = uri;
    }

    public static getInstance() : QuestionDBService {
        if (this._instance == null)
            this._instance = new QuestionDBService();
        return this._instance
    }

    public static async destroy() {
        if (this._instance) {
            await this._instance.syncPendingPromises();
        }
        await mongoose.disconnect();
        this._instance = null;
    }

    async getRandomQuestions(n: number = 1, category: Number = Categories.Animals) : Promise<WikidataQuestion[]> {
        /* At this point, we need to sync previously postponed promises.
         * Like question deletion, or the initial question generation
         * from the constructor.
         */
        await this.syncPendingPromises();

        let recipe: WikidataRecipe = category_into_recipe(category);

        return this.getRandomEntities(n * 4, recipe).then((entities) => {
            return entities.chunks(4).map((chunk) => {
                let g = recipe.generateQuestion();
                return new WikidataQuestion(chunk[0], chunk[0].attrs)
                            .set_response(g(chunk[0]))
                            .set_distractor(g(chunk[1]))
                            .set_distractor(g(chunk[2]))
                            .set_distractor(g(chunk[3]))
            });
        })
    }

    async getRandomEntities(n: number = 1, recipe: WikidataRecipe) : Promise<WikidataEntity[]> {

        const MAX_ITERATIONS = 3;
        let n_iterations = 0;

        while (await this.getQuestionsCount(recipe.getCategory()) <= n) {
            await this.generateQuestions(Math.max(n * 2, 20), recipe)

            n_iterations += 1;
            if (n_iterations >= MAX_ITERATIONS) {
                console.log("ERROR: Too many requests, giving up");
                console.log("WARNING: Clearing the cache");
                this.questionsCache.get(recipe.getCategory()).clear();
                break;
            }
        }

        let q = await Question.aggregate([
            { $match: { category: recipe.getCategory() } },
            { $sample: { size: n } },
        ]);

        /* Store the promise of the deletion, instead of blocking.
         * The next time we call resolvePendingPromises, it'll be
         * awaited. But, for now, it's faster to not block.
         */
        let deletions = q.map((e: IQuestion) => {
            return Question.deleteOne({_id: e._id})
                           .then(() => { /*console.log("Deleted " + e.wdUri) */ })
        })
        this.addPromise(Promise.all(deletions));

        return q.map((q: IQuestion) => {
            let entity = new WikidataEntity(q.image_url);
            for (let i = 0; i < q.attrs.length; i++) {
                let a = q.attrs[i];
                entity.addAttribute(a[0], a[1]);
            }
            return entity
        })
    }

    async getQuestionsCount(cat: Number = Categories.Animals) : Promise<number> {
      return await Question.countDocuments({
          category: cat
      })
    }

    async generateQuestions(n: number, recipe: WikidataRecipe = new AnimalRecipe()) : Promise<IQuestion[]> {
        if (!this.questionsCache.has(recipe.getCategory())) {
            this.questionsCache.set(recipe.getCategory(), new Set());
        }
        let cache = this.questionsCache.get(recipe.getCategory());

        console.log("Generating a batch of " + n + " questions")

        let query = new WikidataQueryBuilder()
                     .assocProperty(P.IMAGE, "imagen");

        recipe.buildQuery(query);

        query.random().limit(n);

        // For debugging
        // console.log("Executing query: " + query.build());
        const response = await query.send();

        const bindings = response.data.results.bindings.filter((e: any) => {
            /* TODO: We need to enable this, but for now wikidata returns only a few items */
            // return true;

            const pattern = "http://www.wikidata.org/entity/Q"
            let n = Number(e.item.value.replace(pattern, ""));
            if (cache.has(n)) {
                // console.log("Repeated " + n)
                return false;
            } else {
                cache.add(n);
                return true;
            }
        })

        const genQuestions: Promise<IQuestion>[] =
            bindings.map((elem: any) => {

            let attrs = recipe.getAttributes(elem);
            return new Question({
                image_url: elem.imagen.value,
                wdUri: elem.item.value,
                attrs,
                category: recipe.getCategory()
            }).save()
        });

        console.log("  Generated " + genQuestions.length);

        return Promise.all(genQuestions);
    }

}
