import mongoose, { Schema, Document, Model } from 'mongoose';

interface IQuestion extends Document {
    id: mongoose.Types.ObjectId;
    question: string;
    options: string[];
    correctAnswer: string;
    categories: string[];
    wdId: Number;
    image_url: string;
    category: Number;
    attrs: [String,String][],
}

const questionSchema: Schema<IQuestion> = new Schema({
    question: { type: String, required: false },
    options: { type: [String], required: false },
    correctAnswer: { type: String, required: false },
    categories: { type: [String], required: false },
    wdId: { type: Number, required: false },
    image_url: { type: String, required: false },
    category: { type: Number, required: true },
    attrs: {
        type: [[String,String]],
        required: true,
    },
    id: {
        type: Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
}, { timestamps: true });

// Modelo de Mongoose
const Question: Model<IQuestion> = mongoose.model<IQuestion>('Question', questionSchema);

export { Question, IQuestion };

