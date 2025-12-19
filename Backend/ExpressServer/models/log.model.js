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

logSchema.statics.getLogsByJobIdsWithPagination = async function (
  jobIds,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ jobId: { $in: jobIds } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = mongoose.model("Logs", logSchema, "Logs");