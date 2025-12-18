const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },

    name: { type: String, required: true },
    type: { type: String, enum: ["one-time", "recurring"], required: true },

    // for one-time jobs
    scheduledAt: { type: Date },

    // for recurring jobs
    cronExpr: { type: String },

    command: {
        type: String,
        required: true,
        enum: ["DB_BACKUP", "CLEANUP_LOGS", "SEND_EMAIL", "HTTP_REQUEST", "DATA_SYNC", "SEND_REPORTS", "SYSTEM_UPDATE"]
    },

    payload: { type: Object, default: {} },

    status: {
        type: String,
        enum: ["active", "paused", "completed", "failed", "scheduled"],
    },

    description: { type: String },

    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },

    lastRunAt: { type: Date },
    nextRunAt: { type: Date },

    bullJobId: { type: String },     // for one-time delayed jobs
    schedulerId: { type: String }, // for recurring jobs

}, {
    timestamps: true
});

jobSchema.statics.getJobIdsByUserId = async function (filter) {
    const jobs = await this.find(filter).select('_id');
    return jobs.map(job => job._id);
};

module.exports = mongoose.model('Jobs', jobSchema, 'Jobs');