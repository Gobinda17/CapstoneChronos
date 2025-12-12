const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        jobname: { type: String },
        status: { type: String, enum: ["completed", "failed"], required: true },
        runAt: { type: Date, required: true },
        command: { type: String },
        durationMs: Number,
        output: String,
        error: String,
    },
    { timestamps: true }
);

logSchema.statics.getRecentLogsByJobIds = async function(jobIds, limit = 10) {
    const logs = await this.find({ jobId: { $in: jobIds } })
        .sort({ runAt: -1 })
        .limit(limit);
    return logs;
};

module.exports = mongoose.model("Logs", logSchema, "Logs");