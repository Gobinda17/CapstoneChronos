const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const logController = require('../controllers/log.controller');

// Get Recent Logs
router.get('/recent', authMiddleware.validateAccessToken.bind(authMiddleware), logController.recentLogs.bind(logController));

// Get All Logs with Pagination (use `req.query.page` and `req.query.limit`)
router.get('/', authMiddleware.validateAccessToken.bind(authMiddleware), logController.getAllLogs.bind(logController));

module.exports = router;