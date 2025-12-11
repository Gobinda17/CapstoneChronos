const { Worker } = require("bullmq");

const redisClient = require("../config/redis");
const jobModel = require("../models/job.model");
const logModel = require("../models/log.model");

const jobWorker = new Worker(
  "jobs",
  async (bullJob) => {
    const { jobId, userId, name, jobType, payload } = bullJob.data;

    const jobDoc = await jobModel.findById(jobId);

    // If the DB row is gone, just skip (especially for recurring jobs)
    if (!jobDoc) {
      throw new Error(`⚠️ Job doc ${jobId} not found in DB`);
    }

    if (jobDoc.status === "paused") {
      console.warn(`⏸ Job ${jobId} is paused. Skipping execution.`);
      await logModel.create({
        jobId,
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

      // 🔹 your actual business logic goes here
      // e.g. call external API, send email, etc.

      await logModel.create({
        jobId,
        status: "completed",
        runAt: new Date(),
        durationMs: Date.now() - start,
        output: "Executed successfully",
      });

      return true;
    } catch (error) {
      await logModel.create({
        jobId,
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
