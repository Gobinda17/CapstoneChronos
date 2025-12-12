const { Worker } = require("bullmq");

const redisClient = require("../config/redis");
const jobModel = require("../models/job.model");
const logModel = require("../models/log.model");

// Job handler functions
const backupDb = async (payload) => {
  console.log("Executing DB_BACKUP with payload:", payload);
  // TODO: Implement database backup logic
  return { success: true, message: "Database backup completed" };
};

const cleanupLogs = async (payload) => {
  console.log("Executing CLEANUP_LOGS with payload:", payload);
  // TODO: Implement log cleanup logic
  return { success: true, message: "Logs cleanup completed" };
};

const sendEmail = async (payload) => {
  console.log("Executing SEND_EMAIL with payload:", payload);
  // TODO: Implement email sending logic
  return { success: true, message: "Email sent successfully" };
};

const httpRequest = async (payload) => {
  console.log("Executing HTTP_REQUEST with payload:", payload);
  // TODO: Implement HTTP request logic
  return { success: true, message: "HTTP request completed" };
};

const handlers = {
  DB_BACKUP: async (payload) => backupDb(payload),
  CLEANUP_LOGS: async (payload) => cleanupLogs(payload),
  SEND_EMAIL: async (payload) => sendEmail(payload),
  HTTP_REQUEST: async (payload) => httpRequest(payload),
};

const jobWorker = new Worker(
  "jobs",
  async (bullJob) => {
    const { jobId, userId, name, jobType, payload } = bullJob.data;

    const jobDoc = await jobModel.findById(jobId);
    console.log(name);

    // If the DB row is gone, just skip (especially for recurring jobs)
    if (!jobDoc) {
      throw new Error(`⚠️ Job doc ${jobId} not found in DB`);
    }

    if (jobDoc.status === "paused") {
      console.warn(`⏸ Job ${jobId} is paused. Skipping execution.`);
      await logModel.create({
        jobId,
        jobname: name,
        status: "paused",
        runAt: new Date(),
        durationMs: Date.now() - start,
        output: "Job skipped because it is paused",
      });
      return; // don't execute
    }

    // For one-time jobs, only run if still active
    if (jobType === "one-time" && jobDoc.status !== "active") {
      throw new Error(
        `⚠️ One-time job ${jobId} has status ${jobDoc.status}, skipping`
      );
    }

    const start = Date.now();

    try {
      console.log(
        `Executing job ${name} of type ${jobType} for user ${userId} with payload:`,
        payload
      );

      jobDoc.lastRunAt = new Date();
      await jobDoc.save();

      // Execute the appropriate handler based on command
      const handler = handlers[jobDoc.command];
      if (!handler) {
        throw new Error(`Invalid command: ${jobDoc.command}`);
      }

      const result = await handler(jobDoc.payload);

      await logModel.create({
        jobId,
        jobname: name,
        status: "completed",
        runAt: new Date(),
        durationMs: Date.now() - start,
        output: JSON.stringify(result),
      });

      return true;
    } catch (error) {
      await logModel.create({
        jobId,
        jobname: name,
        status: "failed",
        runAt: new Date(),
        durationMs: Date.now() - start,
        error: error.message,
      });
      throw error;
    }
  },
  { connection: redisClient }
);

jobWorker.on("completed", async (job) => {
  console.log(`✅ Job ${job.id} completed`);
  try {
    const jobDoc = await jobModel.findById(job.data.jobId);
    if (!jobDoc) return;

    if (jobDoc.type === "one-time" || job.data.jobType === "one-time") {
      jobDoc.status = "completed";
    } else {
      jobDoc.status = "active";
    }

    jobDoc.lastRunAt = new Date();
    await jobDoc.save();
  } catch (error) {
    console.error(
      `Failed to update job status for job ID ${job.data.jobId}:`,
      error
    );
  }
});

jobWorker.on("failed", async (job, err) => {
  console.log(`❌ Job ${job?.id} failed: ${err.message}`);
  try {
    await jobModel.findByIdAndUpdate(job.data.jobId, { status: "failed" });
    await logModel.create({
      jobId: job?.data?.jobId ?? null,
      jobname: job?.data?.name ?? null,
      status: "failed",
      runAt: new Date(),
      durationMs: 0, // or compute if you track start elsewhere
      error: err.message,
    });
  } catch (error) {
    console.error(
      `Failed to update job status for job ID ${job.data.jobId}:`,
      error
    );
  }
});

module.exports = jobWorker;
