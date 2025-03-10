import * as express from 'express';

import { QuestionDBService } from '../services/question-db-service.ts';

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

    return router;
}
