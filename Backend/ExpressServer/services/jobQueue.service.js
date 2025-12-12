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
        payload: jobDoc.command
    };
    console.log('Enqueue data:', data);

    if (jobDoc.type === "one-time") {
        const delayMs = new Date(jobDoc.scheduledAt).getTime() - Date.now();
        return await jobQueue.add("one-time-job", data, {
            delay: delayMs > 0 ? delayMs : 0,
            attempts: jobDoc.maxRetries || 3,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        });
    }

    if (jobDoc.type === "recurring") {
        return await jobQueue.add("recurring-job", data, {
            repeat: { cron: jobDoc.cronExpr },
            attempts: jobDoc.maxRetries || 3,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        });
    }
};

module.exports = { jobQueue, enqueueJob };