const express = require('express');
const router = express.Router();

const { registrationValidation, loginValidation } = require('../validations/auth.validation');

const authController = require('../controllers/auth.controller');

const authMiddleware = require('../middlewares/auth.middleware');

// Registration Route
router.post('/register', [registrationValidation, authMiddleware.validateRegistration.bind(authMiddleware)], authController.userRegistration.bind(authController));

// Login Route
router.post('/login',[loginValidation, authMiddleware.validateLogin.bind(authMiddleware)], authController.userLogin.bind(authController));

// Refresh Token Route
router.post('/refresh', authMiddleware.validateAccessToken.bind(authMiddleware), authController.freshAccessToken.bind(authController));

// Route for Logout
router.post('/logout', authMiddleware.validateAccessToken.bind(authMiddleware), authController.userLogout.bind(authController));

module.exports = router;