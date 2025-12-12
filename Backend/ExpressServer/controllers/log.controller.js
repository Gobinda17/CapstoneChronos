const jobModel = require("../models/job.model");
const userModel = require("../models/user.model");
const logModel = require("../models/log.model");

class LogController {
    recentLogs = async (req, res) => {
        const { limit } = req.query;
        try {
            const userID = await userModel.getUserIdByEmail(req.user.id);
            const jobIds = await jobModel.getJobIdsByUserId({ createdBy: userID });
            const logs = await logModel.getRecentLogsByJobIds(jobIds, parseInt(limit));
            return res.status(200).json({ logs });

        } catch (error) {
            console.error("Error fetching recent logs:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new LogController();