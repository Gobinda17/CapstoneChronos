const express = require("express");
const router = express.Router();

const { validateCreateJob } = require("../validations/job.validation");
const validationMiddleware = require("../middlewares/job.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const jobController = require("../controllers/job.controller");

// Create Job Route
router.post(
  "/",
  [
    authMiddleware.validateAccessToken.bind(authMiddleware),
    validateCreateJob,
    validationMiddleware.validateJobCreation.bind(validationMiddleware),
  ],
  jobController.createJob.bind(jobController)
);

// Get all Jobs Stats
router.get(
  "/stats",
  authMiddleware.validateAccessToken.bind(authMiddleware),
  jobController.getJobsCount.bind(jobController)
);

// Get all Jobs
router.get(
  "/",
  authMiddleware.validateAccessToken.bind(authMiddleware),
  jobController.getAllJobs.bind(jobController)
);

// Toggle Job (Pause/Active)
router.put(
  "/:id/toggle",
  [authMiddleware.validateAccessToken.bind(authMiddleware)],
  jobController.toggleAJob.bind(jobController)
);

// Update a Job
router.put(
  "/:id/update",
  [authMiddleware.validateAccessToken.bind(authMiddleware)],
  jobController.updateAJob.bind(jobController)
);

// Delete a Job
router.delete(
  "/:id",
  authMiddleware.validateAccessToken.bind(authMiddleware),
  jobController.deleteAJob.bind(jobController)
);

// Rerun a Job
router.post(
  "/:id/rerun",
  authMiddleware.validateAccessToken.bind(authMiddleware),
  jobController.rerunAJob.bind(jobController)
);

module.exports = router;
