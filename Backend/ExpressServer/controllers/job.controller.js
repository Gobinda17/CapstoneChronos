const jobModel = require('../models/job.model');
const userModel = require('../models/user.model');

const { enqueueJob } = require('../services/jobQueue.service');

class JobController {
    createJob = async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.user.id });

            const job = await jobModel.create({ ...req.body, createdBy: user._id });

            await enqueueJob(job);

            return res.status(201).json({
                status: 'success',
                message: 'Job created successfully',
                job: job
            });

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    getAllJobs = async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.user.id });
            const jobs = await jobModel.find({ createdBy: user._id });
            return res.status(200).json({
                status: 'success',
                jobs: jobs
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };
}

module.exports = new JobController();