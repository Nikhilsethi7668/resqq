const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'success_story'],
        default: 'general'
    },
    image: {
        type: String
    },
    relatedPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
