import * as mongoose from 'mongoose';

// Database schema
const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    categories: [String],
    // language: String,
    image_url: String,
});

//Auto generated id
questionSchema.add({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        unique: true,
    },
});

export const Question = mongoose.model('Question', questionSchema);
