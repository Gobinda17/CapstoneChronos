const { body } = require('express-validator');

const registrationValidation = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Email is invalid.'),
    body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password length must be at least 6 characters long.'),
];

const loginValidation = [
    body('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Email is invalid.'),
    body('password').notEmpty().withMessage('Password is required.'),
]

const updateEmailValidation = [
    body('newEmail').notEmpty().withMessage('New email is required.').isEmail().withMessage('New email is invalid.'),
];

const updatePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').notEmpty().withMessage('New password is required.').isLength({ min: 6 }).withMessage('New password length must be at least 6 characters long.'),
];

module.exports = {
    registrationValidation,
    loginValidation,
    updateEmailValidation,
    updatePasswordValidation
};