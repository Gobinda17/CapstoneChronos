const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const logController = require('../controllers/log.controller');

router.get('/recent', authMiddleware.validateAccessToken.bind(authMiddleware), logController.recentLogs.bind(logController));

module.exports = router;