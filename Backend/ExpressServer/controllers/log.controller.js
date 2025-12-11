const jobModel = require("../models/job.model");
const userModel = require("../models/user.model");
const logModel = require("../models/log.model");

class LogController {
    recentLogs = async (req, res) => {
        const { limit } = req.query;
        console.log("Fetching recent logs with limit:", limit);
    }
}

module.exports = new LogController();