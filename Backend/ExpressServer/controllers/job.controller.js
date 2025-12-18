const jobModel = require("../models/job.model");
const userModel = require("../models/user.model");
const { CronExpressionParser } = require("cron-parser");

const {
  enqueueJob,
  upsertRecurringScheduler,
  removeRecurringScheduler,
  reScheduleJob,
  enqueueRerunNow,
} = require("../services/jobQueue.service");

class JobController {
  createJob = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.user.id });
      const {
        name,
        scheduleType,
        runAt,
        cronExpr,
        command,
        description,
        maxRetries,
        payload,
      } = req.body;

      const job = await jobModel.create({
        name,
        type: scheduleType,
        scheduledAt: runAt,
        cronExpr,
        command,
        description,
        maxRetries,
        payload: payload || {},
        createdBy: user._id,
      });

      if (job.type === "one-time") {
        const ms = new Date(job.scheduledAt).getTime();
        if (Number.isNaN(ms)) throw new Error("Invalid scheduledAt");

        job.status = ms > Date.now() ? "scheduled" : "active"; // or "scheduled" always
        await job.save();

        await enqueueJob(job);

      } else if (job.type === "recurring") {
        await upsertRecurringScheduler(job);
      }

      return res.status(201).json({
        status: "success",
        message: "Job created successfully",
        job: job,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `Message: ${error}`,
      });
    }
  };

  getJobsCount = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.user.id });
      const jobs = await jobModel.find({ createdBy: user._id });
      let total = 0;
      let running = 0;
      let failed = 0;
      let completed = 0;
      jobs.forEach((job) => {
        total = total + 1;
        if (job.status === "active") running = running + 1;
        if (job.status === "failed") failed = failed + 1;
        if (job.status === "completed") completed = completed + 1;
      });
      return res.status(200).json({
        status: "success",
        stats: {
          total,
          running,
          failed,
          completed,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `Message: ${error}`,
      });
    }
  };

  getAllJobs = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.user.id });
      const jobs = await jobModel.find({ createdBy: user._id });
      return res.status(200).json({
        status: "success",
        jobs: jobs,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `Message: ${error}`,
      });
    }
  };

  toggleAJob = async (req, res) => {
    const id = req.params.id;
    const user = await userModel.findOne({ email: req.user.id });
    try {
      const job = await jobModel.findById({ _id: id, createdBy: user._id });
      if (!job) {
        return res.status(404).json({
          status: "error",
          message: "Job not found",
        });
      }

      const newStatus = job.status === "paused" ? "active" : "paused";

      const updatedJob = await jobModel.findByIdAndUpdate(
        id,
        { status: newStatus },
        { new: true }
      );

      if (newStatus === "paused") {
        await removeRecurringScheduler(updatedJob);
      } else if (newStatus === "active") {
        reScheduleJob(updatedJob);
      }

      return res.status(200).json({
        status: "success",
        message:
          newStatus === "active"
            ? "Job resumed successfully"
            : "Job paused successfully",
        job: updatedJob,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `Message: ${error}`,
      });
    }
  };

  updateAJob = async (req, res) => {
    const id = req.params.id;
    try {
      const user = await userModel.findOne({ email: req.user.id });
      const job = await jobModel.findById({ _id: id, createdBy: user._id });
      if (!job) {
        return res.status(404).json({
          status: "error",
          message: "Job not found",
        });
      }
      if (req.body.scheduleType === "recurring") {
        await removeRecurringScheduler(job);
        const updatedJob = await jobModel.findByIdAndUpdate(
          id,
          {
            ...req.body,
          },
          { new: true }
        );
        await upsertRecurringScheduler(updatedJob);
        return res.status(200).json({
          status: "success",
          message: "Job updated successfully",
          job: updatedJob,
        });
      } else {
        const updatedJob = await jobModel.findByIdAndUpdate(
          id,
          {
            ...req.body,
          },
          { new: true }
        );
        await enqueueJob(updatedJob);
        return res.status(200).json({
          status: "success",
          message: "Job updated successfully",
          job: updatedJob,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `Message: ${error}`,
      });
    }
  };

  deleteAJob = async (req, res) => {
    const id = req.params.id;
    try {
      const user = await userModel.findOne({ email: req.user.id });
      const job = await jobModel.findByIdAndDelete({
        _id: id,
        createdBy: user._id,
      });
      if (!job) {
        return res.status(404).json({
          status: "error",
          message: "Job not found",
        });
      }
      if (job.type === "recurring") {
        await removeRecurringScheduler(job);
      }
      return res.status(200).json({
        status: "success",
        message: "Job deleted successfully",
        job: job,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `Message: ${error}`,
      });
    }
  };

  rerunAJob = async (req, res) => {
    const id = req.params.id;
    try {
      const user = await userModel.findOne({ email: req.user.id });
      const job = await jobModel.findOneAndUpdate(
        { _id: id, createdBy: user._id },
        { status: "active" }
      );
      if (!job) {
        return res.status(404).json({
          status: "error",
          message: "Job not found",
        });
      }
      await enqueueRerunNow(job);

      return res.status(200).json({
        status: "success",
        message: "Job rerun successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: `Message: ${error}`,
      });
    }
  };

  getJobDetailsInRange = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.user.id });

      const occurrences = [];
      const startDate = new Date(req.params.date);
      if (isNaN(startDate.getTime())) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid date parameter" });
      }

      // ✅ Your calendar is IST; keep day boundaries in IST-style? (You are using setHours local)
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // ✅ 7-day window (start + 6)
      endDate.setHours(23, 59, 59, 999);

      // 1) One-time jobs
      const oneTimeJobs = await jobModel
        .find({
          createdBy: user._id,
          type: "one-time",
          scheduledAt: { $gte: startDate, $lte: endDate },
        })
        .lean();

      for (const job of oneTimeJobs) {
        occurrences.push({
          jobId: job._id,
          name: job.name,
          type: job.type,
          command: job.command,
          status: job.status,
          lastRunAt: job.lastRunAt,
          scheduledAt: job.scheduledAt,
          description: job.description,
        });
      }

      const tz = "Asia/Kolkata";

      // ✅ 2) Recurring jobs: DO NOT restrict by createdAt within range
      // Include all active recurring jobs for this user
      const recurringJobs = await jobModel
        .find({
          createdBy: user._id,
          type: "recurring",
          cronExpr: { $exists: true, $ne: null },
          status: "active",
        })
        .lean();

      for (const rjob of recurringJobs) {
        try {
          // ✅ Don’t generate occurrences before the job was created
          const createdAt = new Date(rjob.createdAt);
          const effectiveStart =
            createdAt.getTime() > startDate.getTime() ? createdAt : startDate;

          const inclusiveStart = new Date(effectiveStart.getTime() - 1000);
          const parseOpts = { currentDate: inclusiveStart, endDate };
          if (tz) parseOpts.tz = tz;

          const interval = CronExpressionParser.parse(rjob.cronExpr, parseOpts);

          let iterations = 0;
          const maxIterations = 1000; // cron like */1 * * * * might need more for 7 days

          while (true) {
            if (++iterations > maxIterations) break;

            const next = interval.next();
            const dtObj = next.toDate
              ? next.toDate()
              : new Date(next.toString());

            if (dtObj.getTime() > endDate.getTime()) break;

            occurrences.push({
              jobId: rjob._id,
              name: rjob.name,
              type: rjob.type,
              command: rjob.command,
              status: rjob.status,
              description: rjob.description,
              cronExpr: rjob.cronExpr,
              runAt: dtObj.toISOString(),
              runAtLocal: tz
                ? dtObj.toLocaleString("en-GB", { timeZone: tz, hour12: false })
                : dtObj.toISOString(),
            });
          }
        } catch (err) {
          // invalid cron or no more occurrences
          continue;
        }
      }

      return res.status(200).json({
        status: "success",
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        jobs: occurrences,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", message: `Message: ${error}` });
    }
  };
}

module.exports = new JobController();
