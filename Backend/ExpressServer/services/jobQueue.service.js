const { Queue } = require("bullmq");
const redisClient = require("../config/redis");

const jobQueue = new Queue("jobs", {
    connection: redisClient
});

const enqueueJob = async (jobDoc) => {
    console.log('Enqueuing Job:', jobDoc._id.toString());
    const data = {
        jobId: jobDoc._id.toString(),
        userId: jobDoc.createdBy.toString(),
        name: jobDoc.name,
        jobType: jobDoc.type,
        command: jobDoc.command,
        payload: jobDoc.payload || {}
    };
    console.log('Enqueue data:', data);

    if (jobDoc.type === "one-time") {
        const scheduledMs = new Date(jobDoc.scheduledAt).getTime();
        if (Number.isNaN(scheduledMs)) throw new Error("Invalid scheduledAt");

        const delayMs = scheduledMs - Date.now();

        const bullJob = await jobQueue.add("one-time-job", data, {
            delay: Math.max(delayMs, 0),
            attempts: jobDoc.maxRetries || 3,
            backoff: { type: "exponential", delay: 5000 },
        });

        // ✅ Save bull job id so we can pause/cancel later
        await Job.updateOne(
            { _id: jobDoc._id },
            { $set: { bullJobId: String(bullJob.id) } }
        );

        return bullJob;
    }

    if (jobDoc.type === "recurring") {
        const bullJob = await jobQueue.add("recurring-job", data, {
            repeat: { cron: jobDoc.cronExpr /*, tz: "Asia/Kolkata" */ },
            attempts: jobDoc.maxRetries || 3,
            backoff: { type: "exponential", delay: 5000 },
        });

        // ✅ Save repeat key so we can remove schedule later
        await Job.updateOne(
            { _id: jobDoc._id },
            { $set: { repeatJobKey: bullJob.repeatJobKey || null } }
        );

        return bullJob;
    }
};

module.exports = { jobQueue, enqueueJob };