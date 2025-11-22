const { Worker } = require("bullmq");

const redisClient = require('../config/redis');
const jobModel = require('../models/job.model');
const logModel = require('../models/log.model');

const jobWorker = new Worker("jobs", async (bullJob) => {
    const { jobId, userId, name, jobType, payload } = bullJob.data;

    const jobDoc = await jobModel.findById(jobId);
    if (!jobDoc || jobDoc.status !== "active") {
        throw new Error(`Job with ID ${jobId} not found`);
    }

    const start = Date.now();

    try {
        console.log(`Executing job ${name} of type ${jobType} for user ${userId} with payload:`, payload);

        jobDoc.lastRunAt = new Date();
        await jobDoc.save();

        await logModel.create({
            jobId,
            status: "completed",
            runAt: new Date(),
            durationMs: Date.now() - start,
            output: "Executed successfully"
        });

        return true;

    } catch (error) {
        await logModel.create({
            jobId,
            status: "failed",
            runAt: new Date(),
            durationMs: Date.now() - start,
            error: error.message
        });
        throw error;
    }
}, { connection: redisClient });

jobWorker.on("completed", (job) =>
    console.log(`✅ Job ${job.id} completed`)
);

jobWorker.on("failed", (job, err) =>
    console.log(`❌ Job ${job?.id} failed: ${err.message}`)
);

module.exports = jobWorker;