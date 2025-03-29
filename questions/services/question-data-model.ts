import mongoose, { Schema, Document, Model } from 'mongoose';

export class Tuple<T> {
    public first: T;
    public second: T;
}

interface IQuestion extends Document {
    id: mongoose.Types.ObjectId;
    question: string;
    options: string[];
    correctAnswer: string;
    categories: string[];
    wdUri: string;
    image_url: string;
    attrs: Tuple<String>[],
}

const questionSchema: Schema<IQuestion> = new Schema({
    question: { type: String, required: false },
    options: { type: [String], required: false },
    correctAnswer: { type: String, required: false },
    categories: { type: [String], required: false },
    wdUri: { type: String, required: false },
    image_url: { type: String, required: false },
    attrs: {
        type: Array<[String,String]>,
        required: false,
        default: () => []
    },
    id: {
        type: Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
}, { timestamps: true });

// Modelo de Mongoose
const Question: Model<IQuestion> = mongoose.model<IQuestion>('Question', questionSchema);

export { Question, IQuestion };

