// import { json } from "stream/consumers";
// import { Serializer } from "v8";

import * as mongoose from 'mongoose';
import { Question } from './question-data-model.js';

import { WikidataQueryBuilder } from "./query_builder.ts";

import * as dotenv from "dotenv";
dotenv.config();

let uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/questionDB';
mongoose.connect(uri);

export class WikidataQuestion {
    image_url: String;
    response: String;
    wrong: String[];

    constructor(entity: WikidataEntity) {
        this.image_url = entity.image_url;
        this.response = ""
        this.wrong = [""]
    }

    public getJson() : any {
        return {
            url: this.image_url
        }
    }
}

export class WikidataEntity {
    image_url: String;

    constructor(image_url: String) {
        this.image_url = image_url;
    }
}

export class QuestionDBService {

    private constructor() {}
    private static _instance: QuestionDBService = new QuestionDBService()

    public static getInstance() : QuestionDBService {
        return this._instance
    }

    async getRandomQuestions(n: number = 1) : Promise<WikidataQuestion[]> {
        let entities = await this.getRandomEntities(n);
        return entities.map((e) => new WikidataQuestion(e))
    }

    private async getRandomEntities(n: number = 1) : Promise<WikidataEntity[]> {
        if (await this.getQuestionsCount() <= n) {
            // TODO: Generate more?
            await this.generateQuestions(n)
        }
        let q = await Question.aggregate([{ $sample: { size: n } }]);
        return q.map((q: any) => new WikidataEntity(q.image_url))
    }

    async getQuestionsCount() : Promise<number> {
      return await Question.countDocuments()
    }

    private async generateQuestions(n: number) {
        // TODO: Generate the specified number
        const response = await new WikidataQueryBuilder()
            .instanceOf(729)
            .assocProperty(18, "imagen")
            .send();
        await response.data.results.bindings.forEach(async (elem: any) => {
            new Question({
                image_url: elem.imagen.value
            }).save()
        });
    }

}
