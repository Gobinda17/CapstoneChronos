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
        enum: ["DB_BACKUP", "CLEANUP_LOGS", "SEND_EMAIL", "HTTP_REQUEST"]
    },

    status: {
        type: String,
        enum: ["active", "paused", "completed", "failed", "canceled"],
        default: "active"
    },

    description: { type: String },

    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },

    lastRunAt: { type: Date },
    nextRunAt: { type: Date },

}, {
    timestamps: true
});

jobSchema.statics.getJobIdsByUserId = async function (filter) {
    const jobs = await this.find(filter).select('_id');
    return jobs.map(job => job._id);
};

module.exports = mongoose.model('Jobs', jobSchema, 'Jobs');