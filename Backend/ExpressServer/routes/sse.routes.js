const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const sseController = require("../controllers/sse.controller");

router.get("/events", authMiddleware.validateAccessToken.bind(authMiddleware), sseController.sseEvents.bind(sseController));

module.exports = router;
