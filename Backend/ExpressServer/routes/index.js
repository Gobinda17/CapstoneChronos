const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');
const logRoutes = require('./log.routes');

router.use('/jobs', jobRoutes);

router.use('/auth', authRoutes);

router.use('/logs', logRoutes);

module.exports = router;