const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    targetRole: { type: String }, // 'city', 'state', 'central'
    targetCity: { type: String },
    targetState: { type: String },
    acknowledgedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
