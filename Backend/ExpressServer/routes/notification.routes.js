const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const notificationController = require('../controllers/notification.controller');

router.get('/', authMiddleware.validateAccessToken.bind(authMiddleware), notificationController.getNotifications.bind(notificationController));

router.patch('/:id/read', authMiddleware.validateAccessToken.bind(authMiddleware), notificationController.markAsRead.bind(notificationController));

router.patch('/mark-all-read', authMiddleware.validateAccessToken.bind(authMiddleware), notificationController.markAllAsRead.bind(notificationController));

router.delete('/:id', authMiddleware.validateAccessToken.bind(authMiddleware), notificationController.deleteNotification.bind(notificationController));

router.delete('/', authMiddleware.validateAccessToken.bind(authMiddleware), notificationController.clearAllNotifications.bind(notificationController));

module.exports = router;