const { Queue } = require("bullmq");
const redisClient = require("../config/redis");

const jobQueue = new Queue("jobs", {
  connection: redisClient,
});

const enqueueJob = async (jobDoc) => {
  console.log("Enqueuing Job:", jobDoc._id.toString());
  const data = {
    jobId: jobDoc._id.toString(),
    userId: jobDoc.createdBy.toString(),
    name: jobDoc.name,
    jobType: jobDoc.type,
    command: jobDoc.command,
    payload: jobDoc.payload || {},
  };

  const scheduledMs = new Date(jobDoc.scheduledAt).getTime();
  if (Number.isNaN(scheduledMs)) throw new Error("Invalid scheduledAt");

  const delayMs = scheduledMs - Date.now();

  const bullJob = await jobQueue.add("one-time-job", data, {
    delay: Math.max(delayMs, 0),
    attempts: jobDoc.maxRetries || 3,
    backoff: { type: "exponential", delay: 5000 },
  });

  // ✅ Save bull job id so we can pause/cancel later
  jobDoc.bullJobId = String(bullJob.id);
  await jobDoc.save();

  return bullJob;
};

const enqueueRerunNow = async (jobDoc) => {
  const data = {
    jobId: jobDoc._id.toString(),
    userId: jobDoc.createdBy.toString(),
    name: jobDoc.name,
    jobType: jobDoc.type,
    command: jobDoc.command,
    payload: jobDoc.payload || {},
  };

  // ✅ no delay, no scheduledAt check
  return jobQueue.add("manual-run", data, {
    attempts: jobDoc.maxRetries || 3,
    backoff: { type: "exponential", delay: 5000 },
  });
};

const upsertRecurringScheduler = async (jobDoc) => {
  const data = {
    jobId: jobDoc._id.toString(),
    userId: jobDoc.createdBy.toString(),
    name: jobDoc.name,
    jobType: jobDoc.type,
    command: jobDoc.command,
    payload: jobDoc.payload || {},
  };

  const scheduler = await jobQueue.upsertJobScheduler(
    jobDoc._id.toString(), // schedulerId (I use jobId here)
    {
      // 👇 THIS is the key BullMQ expects for cron-style schedules
      pattern: jobDoc.cronExpr, // e.g. "0 0 * * *" or "*/5 * * * *"
      // or: every: 10_000,         // if you want fixed interval instead
    },
    {
      name: "recurring-job",
      data,
      opts: {
        attempts: jobDoc.maxRetries || 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    }
  );

  jobDoc.schedulerId = scheduler.id;
  await jobDoc.save();

  return scheduler;
};

const removeRecurringScheduler = async (jobDoc) => {
  if (!jobDoc._id) return;
  await jobQueue.removeJobScheduler(jobDoc._id.toString());
};

const reScheduleJob = async (jobDoc) => {
  return upsertRecurringScheduler(jobDoc);
};

module.exports = {
  jobQueue,
  enqueueJob,
  upsertRecurringScheduler,
  removeRecurringScheduler,
  reScheduleJob,
  enqueueRerunNow
};
