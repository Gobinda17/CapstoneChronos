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

router.get(
  "/",
  authMiddleware.validateAccessToken.bind(authMiddleware),
  jobController.getAllJobs.bind(jobController)
);

router.put(
  "/:id/toggle",
  [authMiddleware.validateAccessToken.bind(authMiddleware)],
  jobController.toggleAJob.bind(jobController)
);

module.exports = router;
