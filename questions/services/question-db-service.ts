import * as mongoose from 'mongoose';
import { Question, IQuestion } from '../../questions/services/question-data-model.ts';
import "../utils/array-chunks.ts"

import { WikidataEntity, Q } from "./wikidata";
import { WikidataQueryBuilder } from "./wikidata/query_builder.ts";

import * as dotenv from "dotenv";
import { PromiseStore } from '../utils/promises.ts';

dotenv.config();

let uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/questionDB';
mongoose.connect(uri);

export class WikidataQuestion {
    image_url: String;
    _response: String;
    wrong: String[];

    constructor(entity: WikidataEntity) {
        this.image_url = entity.image_url;
        this._response = ""
        this.wrong = [""]
    }

    public response(res: String) : WikidataQuestion {
        this._response = res;
        return this;
    }

    public distractor(dist: String) : WikidataQuestion {
        this.wrong.push(dist);
        return this;
    }

    public getJson() : any {
        return {
            image_url: this.image_url,
            response: this._response,
            distractors: this.wrong,
        }
    }
}

export class QuestionDBService extends PromiseStore {
    private questionsCache: Set<Number> = new Set();

    private constructor() {
        super();
        this.addPromise(
            Question.deleteMany().then(() => {
                this.generateQuestions(20)
            })
        );
    }

    private static _instance: QuestionDBService = new QuestionDBService()

    public static getInstance() : QuestionDBService {
        return this._instance
    }

    async getRandomQuestions(n: number = 1) : Promise<WikidataQuestion[]> {
        /* At this point, we need to sync previously postponed promises.
         * Like question deletion, or the initial question generation
         * from the constructor.
         */
        await this.syncPendingPromises();

        return this.getRandomEntities(n * 4).then((entities) => {
            return entities.chunks(4).map((chunk) => {
                return new WikidataQuestion(chunk[0])
                            .response(chunk[0].taxon_name)
                            .distractor(chunk[1].taxon_name)
                            .distractor(chunk[2].taxon_name)
                            .distractor(chunk[3].taxon_name)
            });
        })
    }

    async getRandomEntities(n: number = 1) : Promise<WikidataEntity[]> {

        const MAX_ITERATIONS = 3;
        let n_iterations = 0;

        while (await this.getQuestionsCount() <= n) {
            await this.generateQuestions(Math.max(n * 2, 20));

            n_iterations += 1;
            if (n_iterations >= MAX_ITERATIONS) {
                console.log("ERROR: Too many requests, giving up");
                break;
            }
        }

        let q = await Question.aggregate([{ $sample: { size: n } }]);

        /* Store the promise of the deletion, instead of blocking.
         * The next time we call resolvePendingPromises, it'll be
         * awaited. But, for now, it's faster to not block.
         */
        let deletions = q.map((e: IQuestion) => {
            return Question.deleteOne({_id: e._id})
                           .then(() => { /*console.log("Deleted " + e.wdUri) */ })
        })
        this.addPromise(Promise.all(deletions));

        return q.map((q: IQuestion) => new WikidataEntity(q.image_url, q.common_name, q.taxon_name))
    }

    async getQuestionsCount() : Promise<number> {
      return await Question.countDocuments()
    }

    async generateQuestions(n: number) : Promise<IQuestion[]> {
        console.log("Generating a batch of " + n + " questions")

        const query = new WikidataQueryBuilder()
                .subclassOf(Q.ANIMAL)
                .assocProperty(18, "imagen")
                .assocProperty(1843, "common_name", true, "es")
                .assocProperty(225, "taxon_name", false)
                .random()
                .limit(n);

        // For debugging
        // console.log("Executing query: " + query.build());
        const response = await query.send();

        const bindings = response.data.results.bindings.filter((e: any) => {
            /* TODO: We need to enable this, but for now wikidata returns only a few items */
            return true;

            // const pattern = /.*Q/;
            // let n = Number(e.item.value.replace(pattern, ""));
            // if (this.questionsCache.has(n)) {
            //     console.log("Repeated " + n)
            //     return false;
            // } else {
            //     this.questionsCache.add(n);
            //     return true;
            // }
        })

        const genQuestions: Promise<IQuestion>[] =
            bindings.map((elem: any) => {
            let common_name = elem.common_name ? elem.common_name.value : "UNKNOWN";
            return new Question({
                image_url: elem.imagen.value,
                common_name,
                wdUri: elem.item.value,
                taxon_name: elem.taxon_name.value,
            }).save()
        });

        console.log("  Generated " + genQuestions.length);

        return Promise.all(genQuestions);
    }

}
