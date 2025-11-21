const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');

router.use('/jobs', jobRoutes);

router.use('/auth', authRoutes);

module.exports = router;