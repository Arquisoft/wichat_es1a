import * as mongoose from 'mongoose';
import { Question, IQuestion } from '../../questions/services/question-data-model.ts';
import "../utils/array-chunks.ts"

import { WikidataEntity, category_into_recipe, Categories, P } from "./wikidata";

import * as dotenv from "dotenv";
import { PromiseStore } from '../utils/promises.ts';
import { AnimalRecipe, FlagsRecipe, WikidataRecipe } from './question-generation.ts';
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
    private questionsCache: Map<String,Set<Number>> = new Map();

    private get_cache(user: String) : Set<Number> {
        if (user == "")
            return new Set()
        if (!this.questionsCache.has(user)) {
            this.questionsCache.set(user, new Set());
        }
        return this.questionsCache.get(user)
    }

    private constructor() {
        super();
    }

    private async build() {
        await mongoose.connect(QuestionDBService._mongodbUri)
        console.log(`Connected to mongodb at "${QuestionDBService._mongodbUri}"`);
        await Question.deleteMany();
        await this.generateQuestions(40, "", new FlagsRecipe())

    }

    private static _instance: QuestionDBService = null;
    private static _mongodbUri: string = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/questionDB';

    public static setMongodbUri(uri: string) {
        this._mongodbUri = uri;
    }

    public static getInstance() : QuestionDBService {
        if (!this._instance) {
            this._instance = new QuestionDBService();
            this._instance.addPromise(this._instance.build())
        }
        return this._instance
    }

    public static async destroy() {
        if (this._instance) {
            await this._instance.syncPendingPromises();
        }
        await mongoose.disconnect();
        this._instance = null;
    }

    async getRandomQuestions(n: number = 1, username: String = "", category: Number = Categories.Flags) : Promise<WikidataQuestion[]> {
        /* At this point, we need to sync previously postponed promises.
         * Like question deletion, or the initial question generation
         * from the constructor.
         */
        await this.syncPendingPromises();

        console.log(`getRandomQuestions(${n}, ${username}, ${category})`)

        let recipe: WikidataRecipe = category_into_recipe(category);

        let set = this.get_cache(username)
        return this.getRandomEntities(n * 4, username, recipe).then((entities) => {
            console.log(`Got ${entities.length} entities`)
            return entities.chunks(4).map((chunk) => {
                set.add(chunk[0].wdId)
                let g = recipe.generateQuestion();
                return new WikidataQuestion(chunk[0], chunk[0].attrs)
                            .set_response(g(chunk[0]))
                            .set_distractor(g(chunk[1]))
                            .set_distractor(g(chunk[2]))
                            .set_distractor(g(chunk[3]))
            });
        })
    }

    async get_entities(n: number, username: String, recipe: WikidataRecipe) : Promise<AsyncGenerator<IQuestion>> {
        // NO AGGREGATE; FINCDDDDD
        let category = recipe.getCategory();
        const stream = Question.aggregate([
            { $match: { category } },
        ]).cursor();

        let set = this.get_cache(username);

        function entity(q: IQuestion) : WikidataEntity {
            let entity = new WikidataEntity(q.image_url, q.wdId);
            for (let i = 0; i < q.attrs.length; i++) {
                let a = q.attrs[i];
                entity.addAttribute(a[0], a[1]);
            }
            return entity
        }

        let g = recipe.generateQuestion();

        async function * filter_question(cursor: mongoose.Cursor<IQuestion>) : AsyncGenerator<WikidataEntity> {
            let count = 0;
            let names = new Map();
            for await (const doc of cursor) {
                if (username != "" && set.has(doc.wdId)) {
                    continue
                }

                let en = entity(doc)

                if (names.has(g(en))) {
                    continue
                }
                names.add(g(en));


                if (count == n) {
                    return en
                }
                else yield en
                count += 1;
            }
        }

        return filter_question(stream)
    }

    async getRandomEntities(n: number = 1, username: String, recipe: WikidataRecipe) : Promise<WikidataEntity[]> {

        const MAX_ITERATIONS = 3;
        let n_iterations = 0;

        while (await this.getQuestionsCount(recipe.getCategory(), username) < n) {
            let gen_count = (await this.generateQuestions(Math.max(n * 2, 20), username, recipe)).length
            if (gen_count == 0) {
                console.log(`Couldn't generate more questions for ${username}, clearing the cache`)
                this.get_cache(username).clear()
                continue
            }

            n_iterations += 1;
            if (n_iterations >= MAX_ITERATIONS) {
                console.log("ERROR: Too many requests, giving up");
                // console.log("WARNING: Clearing the cache");
                // this.questionsCache.get(username).clear();
                break;
            }
        }

        let generator = await this.get_entities(n, username, recipe);

        /* Store the promise of the deletion, instead of blocking.
         * The next time we call resolvePendingPromises, it'll be
         * awaited. But, for now, it's faster to not block.
         */
        // let deletions = q.map((e: IQuestion) => {
        //     return Question.deleteOne({_id: e._id})
        //                    .then(() => { /*console.log("Deleted " + e.wdUri) */ })
        // })
        // this.addPromise(Promise.all(deletions));

        let questions = [];
        for await (const q of generator) {
            questions.push(q)
        }

        return questions
    }

    async getQuestionsCount(category: Number = Categories.Flags, username: String = "") : Promise<number> {
        const stream = Question.aggregate([
            { $match: { category } },
        ]).cursor();

        let count = 0;
        let set = this.get_cache(username);
        for await (const doc of stream) {
            if (username != "" && set.has(doc.wdId)) {
                continue
            }
            count += 1;
        }

        return count
    }

    async generateQuestions(n: number, username: String = "", recipe: WikidataRecipe = new FlagsRecipe()) : Promise<IQuestion[]> {
        console.log("Generating a batch of " + n + " questions")

        let query = new WikidataQueryBuilder()
                     .assocProperty(P.IMAGE, "imagen");

        recipe.buildQuery(query);

        query.random().limit(n);

        // For debugging
        // console.log("Executing query: " + query.build());
        const response = await query.send();

        let set = this.get_cache(username)

        const bindings = response.data.results.bindings.filter((e: any) => {
            let qid = e.qid.value
            qid = qid.replace("Q", "");
            e.wdId = Number(qid)
            if (username != "" && set.has(e.wdId)) {
                // console.log("Repeated " + n)
                return false;
            } else {
                return true;
            }
        })

        const genQuestions: Promise<IQuestion>[] =
            bindings.map((elem: any) => {

            let attrs = recipe.getAttributes(elem);
            return new Question({
                image_url: elem.imagen.value,
                wdId: elem.wdId,
                attrs,
                category: recipe.getCategory()
            }).save()
        });

        console.log("  Generated " + genQuestions.length);

        return Promise.all(genQuestions);
    }

}
