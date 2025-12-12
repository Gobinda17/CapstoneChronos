const { Worker } = require("bullmq");

const redisClient = require("../config/redis");
const jobModel = require("../models/job.model");
const logModel = require("../models/log.model");

// Job handler functions
const backupDb = async (command) => {
  console.log("Executing DB_BACKUP with payload:", command);
  // TODO: Implement database backup logic
  return { success: true, message: "Database backup completed" };
};

const cleanupLogs = async (command) => {
  console.log("Executing CLEANUP_LOGS with payload:", command);
  // TODO: Implement log cleanup logic
  return { success: true, message: "Logs cleanup completed" };
};

const sendEmail = async (command) => {
  console.log("Executing SEND_EMAIL with payload:", command);
  // TODO: Implement email sending logic
  return { success: true, message: "Email sent successfully" };
};

const httpRequest = async (command) => {
  console.log("Executing HTTP_REQUEST with payload:", command);
  // TODO: Implement HTTP request logic
  return { success: true, message: "HTTP request completed" };
};

const sendReports = async (command) => {
  console.log("Executing SEND_REPORTS with payload:", command);
  return { success: true, message: "Reports sent successfully" };
};

const dataSync = async (command) => {
  console.log("Executing DATA_SYNC with payload:", command);
  return { success: true, message: "Data synchronization completed" };
};

const systemUpdate = async (command) => {
  console.log("Executing SYSTEM_UPDATE with payload:", command);
  return { success: true, message: "System update completed" };
};


const handlers = {
  DB_BACKUP: async (command) => backupDb(command),
  CLEANUP_LOGS: async (command) => cleanupLogs(command),
  SEND_EMAIL: async (command) => sendEmail(command),
  HTTP_REQUEST: async (command) => httpRequest(command),
  SEND_REPORTS: async (command) => sendReports(command),
  DATA_SYNC: async (command) => dataSync(command),
  SYSTEM_UPDATE: async (command) => systemUpdate(command),
};

const jobWorker = new Worker(
  "jobs",
  async (bullJob) => {
    const { jobId, userId, name, jobType, payload, command } = bullJob.data;

    const jobDoc = await jobModel.findById(jobId);

    // If the DB row is gone, just skip (especially for recurring jobs)
    if (!jobDoc) {
      throw new Error(`⚠️ Job doc ${jobId} not found in DB`);
    }

    if (jobDoc.status === "paused") {
      console.warn(`⏸ Job ${jobId} is paused. Skipping execution.`);
      await logModel.create({
        jobId,
        jobname: name,
        command: command,
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

      const result = await handler(jobDoc.command);

      await logModel.create({
        jobId,
        jobname: name,
        command: command,
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
        command: command,
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
      command: job?.data?.command ?? null,
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
