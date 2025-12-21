const notification = require('../models/notification.model');
const userModel = require('../models/user.model');

class NotificationController {
    getNotifications = async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await userModel.findOne({ email: userId });
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filter = req.query.filter || 'all';
            const query = { createdBy: user._id };
            if (filter === 'unread') {
                query.isRead = false;
            }
            const notifications = await notification.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            return res.status(200).json({
                status: 'success',
                data: notifications,
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    markAsRead = async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await userModel.findOne({ email: userId });
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const notificationId = req.params.id;
            const notificationToUpdate = await notification.findOne({ _id: notificationId, createdBy: user._id });

            if (!notificationToUpdate) {
                return res.status(404).json({
                    message: 'Notification not found'
                });
            }

            notificationToUpdate.isRead = true;
            await notificationToUpdate.save();

            return res.status(200).json({
                status: 'success',
                message: 'Notification marked as read',
            });

        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    markAllAsRead = async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await userModel.findOne({ email: userId });
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            await notification.updateMany({ createdBy: user._id, isRead: false }, { isRead: true });

            return res.status(200).json({
                status: 'success',
                message: 'All notifications marked as read',
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    deleteNotification = async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await userModel.findOne({ email: userId });
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const notificationId = req.params.id;
            const notificationToDelete = await notification.findOneAndDelete({ _id: notificationId, createdBy: user._id });

            if (!notificationToDelete) {
                return res.status(404).json({
                    message: 'Notification not found'
                });
            }

            return res.status(200).json({
                status: 'success',
                message: 'Notification deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    clearAllNotifications = async (req, res) => {
        try {
            const userEmail = req.user.id; // currently email in your middleware
            const user = await userModel.findOne({ email: userEmail }).select("_id");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const result = await notification.deleteMany({ createdBy: user._id });

            return res.status(200).json({
                status: "success",
                message: "All notifications cleared successfully",
                deletedCount: result.deletedCount, // ✅ helps debug
            });

        } catch (error) {
            console.error('Error clearing all notifications:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

}

module.exports = new NotificationController();