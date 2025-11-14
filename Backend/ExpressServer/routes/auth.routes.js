const express = require('express');
const router = express.Router();

const { registrationValidation } = require('../validations/auth.validation');

const authController = require('../controllers/auth.controller');

const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', [registrationValidation, authMiddleware.validateRegistration.bind(authMiddleware)], authController.userRegistration.bind(authController));

module.exports = router;