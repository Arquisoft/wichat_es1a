import * as express from 'express';

import { QuestionDBService } from '../services/question-db-service.ts';
import { category_from_str } from '../services/wikidata/index.ts';

export const generate_router = function(dbService: QuestionDBService) {
    const router = express.Router();

    router.get("/random", async (_req,res) => {
        const questions = await dbService.getRandomQuestions()
        res.json(questions[0].getJson())
    })

    router.get("/random/:n", async (req,res) => {
        const n = Number(req.params.n);
        const questions = await dbService.getRandomQuestions(n)
        res.json(questions.map((q) => q.getJson()))
    })

    router.get("/random/:category/:n", async (req,res) => {
        const n = Number(req.params.n);
        let username = req.query.username
        if (!username)
            username = ""
        const category = category_from_str(req.params.category);
        if (category == null) {
            res.status(400).json({
                error: `Unknown category: '${req.params.category}'`
            })
        } else {
            const questions = await dbService.getRandomQuestions(n, String(username), category)
            res.json(questions.map((q) => q.getJson()))
        }

    })

    return router;
}
