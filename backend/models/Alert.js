const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    targetRole: { type: String }, // 'city', 'state', 'central'
    targetCity: { type: String },
    targetState: { type: String },
    acknowledgedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },

    // Escalation fields
    escalationLevel: {
        type: Number,
        default: 0  // 0=initial, 1=city_level, 2=state_level, 3=central_level
    },
    helpRequested: {
        type: Boolean,
        default: false
    },
    escalationHistory: [{
        level: {
            type: String,
            enum: ['city', 'state', 'central', 'peer_cities', 'peer_states']
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        targetRegions: [String],  // Cities or states requested
        reason: String,
        notifiedAdmins: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);

