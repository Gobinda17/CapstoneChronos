const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        status: { type: String, enum: ["completed", "failed"], required: true },
        runAt: { type: Date, required: true },
        durationMs: Number,
        output: String,
        error: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Logs", logSchema, "Logs");