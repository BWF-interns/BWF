const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
});

const questionSchema = new mongoose.Schema({
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple_choice', 'true_false', 'fill_blank'], default: 'multiple_choice' },
    options: [optionSchema],
    explanation: { type: String }, // shown after answering
    points: { type: Number, default: 10 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    resourceReference: { type: String } // which resource this is based on
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
