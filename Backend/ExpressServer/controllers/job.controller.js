const jobModel = require("../models/job.model");
const userModel = require("../models/user.model");

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
      const job = await jobModel.findOneAndUpdate({ _id: id, createdBy: user._id }, { status: "active" });
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
}

module.exports = new JobController();
