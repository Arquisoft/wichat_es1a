import * as mongoose from 'mongoose';
import * as Question from './question-data-model.js';
import { config } from "dotenv";
config();

let uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/questionDB';
mongoose.connect(uri);

  // Add question to database
  export async function addQuestion (questionData) {
    try {
      const newQuestion = new Question(questionData);
      //console.log(newQuestion);
      await newQuestion.save();
      console.log(`Question ${newQuestion._id} saved successfully in DB`);
    } catch (error) {
      console.error('Error adding the question: ', error.message);
      return error.message;
    }
  }


  /**
   * Returns a question from the database that could be filtered using a dictionary and removes it.
   * @param {dict} filter - The dict containing the filter options for mongoose.
   * @returns {Question} The question (it will be removed from DB)
   */
  export async function getQuestion (filter = {}) {
    try {
      //if there is filter
      if (Object.keys(filter).length !== 0) {

        const q = await Question.aggregate([
          { $match: filter },
          { $sample: { size: 1 } }
        ]);
        return q[0];
      } else {
        //if not filter -> just random question
        const q = await Question.aggregate([
          { $sample: { size: 1 } }
        ]);

        return q[0];
      }

    } catch (error) {
      console.error('Error obtaining the question', error.message);
      return error.message;
    }
  }

  /**
   * Deletes a question from the database.
   * @param {id} str - The id of the document to be removed
   */
  export async function deleteQuestionById (id) {
    try {
      await Question.findByIdAndDelete(id);
      console.log(`Question ${id} deleted successfully`);

    } catch (error) {
        console.error('Error deleting question:', error.message);
        return error.message;
    }
  }

  /**
   * Returns a the number of questions in the db.
   * @returns {int} The question count
   */
  export async function getQuestionCount (language) {
    try {
      // Obtain total number of questions in database
      const totalQuestions = await Question.countDocuments({ language: language });
      return totalQuestions;

    } catch (error) {
      console.error('Error obtaining the number of questions: ', error.message);
      return error.message;
    }
  }

  /**
   * Returns a the number of questions in the db.
   * @returns {int} The question count
   */
   export async function getQuestionCountByCategory (wantedCategory, wantedLanguage) {
    try {
      // Obtain total number of questions in database
      const totalQuestions = await Question.countDocuments({ categories: wantedCategory, language: wantedLanguage });
      return totalQuestions;

    } catch (error) {
      console.error('Error obtaining the number of questions for category ', wantedCategory,' and language', wantedLanguage,': ', error.message);
      return error.message;
    }
  }


  // Get random questions
  async function getRandomQuestions(n, wantedLanguage) {
    try {
      // Obtain total number of questions in database
      const totalQuestions = await Question.countDocuments({ language: wantedLanguage });

      // Check if there are required number of questions
      if (totalQuestions < n) {
        console.log('Required ', n, ' questions and there are ', totalQuestions);
        return 'Required ' + n + ' questions and there are ' + totalQuestions;
      }

      return Question.aggregate([{ $match: { language: wantedLanguage } }, { $sample: { size: n } }]);

    } catch (error) {
      console.error('Error obtaining random questions: ', error.message);
      return error.message;
    }
  }

  // Obtaing random questions filtered by category
  export async function getRandomQuestionsByCategory (n, wantedCategory, wantedLanguage) {
    try {
      console.log("getRandom: ",wantedLanguage);
      // Obtain total number of questions with that category
      const totalQuestions = await Question.countDocuments({ categories: wantedCategory, language: wantedLanguage });

      // Check if there are required number of questions
      if (totalQuestions < n) {
        console.log('Required ', n, ' questions and there are ', totalQuestions);
        return null;
      }

    return Question.aggregate([
      { $match: { categories: wantedCategory,
                  language: wantedLanguage } },
      { $sample: { size: n } }
      ]);

    } catch (error) {
      console.error('Error obtaining random questions (with category): ', error.message);
      return error.message;
    }
  }
