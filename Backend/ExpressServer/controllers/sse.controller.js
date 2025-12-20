const jobModel = require("../models/job.model");
const userModel = require("../models/user.model");
const logModel = require("../models/log.model");

const { addClient, removeClient, send } = require("../sse/sseHub");

class SSEController {
    sseEvents = async (req, res) => {
        try {
            const userID = await userModel.getUserIdByEmail(req.user.id);
            // If you want to restrict by auth cookie, check here:
            // if (!req.cookies?.accessToken) return res.status(401).end();

            // SSE headers
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache, no-transform");
            res.setHeader("Connection", "keep-alive");

            // If behind nginx:
            // res.setHeader("X-Accel-Buffering", "no");

            // (Optional) If cross-origin (not recommended), you’d need:
            // res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
            // res.setHeader("Access-Control-Allow-Credentials", "true");

            // First event
            send(res, "connected", { ok: true, at: Date.now() });

            addClient(res);

            // heartbeat keeps connection alive
            const hb = setInterval(() => {
                res.write(`: ping\n\n`);
            }, 20000);

            req.on("close", () => {
                clearInterval(hb);
                removeClient(res);
            });
        } catch (error) {
            console.error("Error verifying user for SSE:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new SSEController();
