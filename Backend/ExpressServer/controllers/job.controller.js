const jobModel = require("../models/job.model");
const userModel = require("../models/user.model");

const { enqueueJob } = require("../services/jobQueue.service");

class JobController {
  createJob = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.user.id });
      const { name, scheduleType, runAt, cronExpr, command, description, maxRetries, payload } = req.body;

      const job = await jobModel.create({ 
        name, 
        type: scheduleType, 
        scheduledAt: runAt, 
        cronExpr, 
        command, 
        description, 
        maxRetries, 
        payload: payload || {},
        createdBy: user._id 
      });

      console.log("Created Job:", job);

      await enqueueJob(job);

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
}

module.exports = new JobController();
