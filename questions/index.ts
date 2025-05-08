// Imports (express syntax)
import express from 'express';
import cors from 'cors';
// Routes:
import { QuestionDBService } from './services/question-db-service.ts';

import { generate_router } from './routes/question-routes.ts';
import { generate_image_processing_router } from './routes/image-processing-routes.ts';

const questionRoutes = generate_router(QuestionDBService.getInstance());
const imageProcessingRoutes = generate_image_processing_router();

// App definition and
const app = express();
app.disable("x-powered-by");

const port = 8010;

// Middlewares added to the application
app.use(cors());
app.use(express.json());

// Routes middlewares to be used
app.use('/questions', questionRoutes);
app.use('/api/image-processing', imageProcessingRoutes);

// Start the service
export const server = app.listen(port, () => {
  console.log(`Question Service listening at http://localhost:${port}`);
});

