const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationSchema, "Notifications");
