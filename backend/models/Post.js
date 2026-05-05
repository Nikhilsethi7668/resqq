const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    type: { type: String, enum: ['text', 'image', 'audio'], required: true },
    content: { type: String, required: true }, // Media URL or primary text if no media
    textContent: { type: String }, // Optional text description alongside media
    city: { type: String, required: true },
    state: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'investigating', 'help_sent', 'completed'],
        default: 'pending'
    },
    dangerLevel: { type: Number, default: 0 },
    mlResponse: { type: Object },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    helpDetails: {
        situation: String,
        timestamp: Date
    },
    review: {
        rating: Number,
        comment: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
