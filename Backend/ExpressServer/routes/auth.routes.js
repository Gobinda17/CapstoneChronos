const express = require('express');
const router = express.Router();

const { registrationValidation, loginValidation, updateEmailValidation, updatePasswordValidation } = require('../validations/auth.validation');

const authController = require('../controllers/auth.controller');

const authMiddleware = require('../middlewares/auth.middleware');

// Registration Route
router.post('/register', [registrationValidation, authMiddleware.validateRegistration.bind(authMiddleware)], authController.userRegistration.bind(authController));

// Login Route
router.post('/login', [loginValidation, authMiddleware.validateLogin.bind(authMiddleware)], authController.userLogin.bind(authController));

// Refresh Token Route
router.post('/refresh', authMiddleware.validateAccessToken.bind(authMiddleware), authController.freshAccessToken.bind(authController));

// Route for Logout
router.post('/logout', authMiddleware.validateAccessToken.bind(authMiddleware), authController.userLogout.bind(authController));

// Route for Password Reset Request
router.post('/password-reset', authController.requestPasswordReset.bind(authController));

// Route get user info
router.get('/me', authMiddleware.validateAccessToken.bind(authMiddleware), authController.getUserInfo.bind(authController));

// Route to update email
router.put('/me/email', [updateEmailValidation, authMiddleware.validateAccessToken.bind(authMiddleware), authMiddleware.validateEmailUpdate.bind(authMiddleware)], authController.updateUserEmail.bind(authController));

// Route to update password
router.put('/me/password', [updatePasswordValidation, authMiddleware.validateAccessToken.bind(authMiddleware), authMiddleware.validatePasswordUpdate.bind(authMiddleware)], authController.updateUserPassword.bind(authController));

module.exports = router;