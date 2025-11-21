const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },

    name: { type: String, required: true },
    type: { type: String, enum: ["one-time", "recurring"], required: true },

    // for one-time jobs
    scheduledAt: { type: Date },

    // for recurring jobs
    cronExpr: { type: String },

    payload: { type: Object, default: {} },

    status: {
        type: String,
        enum: ["active", "paused", "completed", "failed", "canceled"],
        default: "active"
    },

    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },

    lastRunAt: { type: Date },
    nextRunAt: { type: Date },

}, { 
    timestamps: true 
});

module.exports = mongoose.model('Jobs', jobSchema, 'Jobs');