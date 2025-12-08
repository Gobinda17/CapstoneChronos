const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const jobController = require('../controllers/job.controller');

// Create Job Route
router.post('/', authMiddleware.validateAccessToken.bind(authMiddleware), jobController.createJob.bind(jobController));

// Get all Jobs Route
router.get('/', authMiddleware.validateAccessToken.bind(authMiddleware), jobController.getAllJobs.bind(jobController));

module.exports = router;