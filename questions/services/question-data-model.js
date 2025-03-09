const mongoose = require('mongoose');

// Database schema
const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    categories: [String],
    // language: String,
    wdUri: String,
    image_url: String,
    common_name: String,
});

//Auto generated id
// questionSchema.add({
//     id: {
//         type: mongoose.Schema.Types.ObjectId,
//         auto: true,
//         unique: true,
//     },
// });

const Question = mongoose.model('Question', questionSchema);

module.exports = { Question };
