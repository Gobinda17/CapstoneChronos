const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

// Create Job Route
router.post('/jobs', authMiddleware.validateAccessToken.bind(authMiddleware));

module.exports = router;