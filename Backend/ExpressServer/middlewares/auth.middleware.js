const { validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const userModel = require('../models/user.model');

class AuthMiddleware {
    #checkExistingEmail = async (req, res) => {
        try {
            const { email } = req.body;
            const userExist = await userModel.findOne({ email: email });
            return userExist;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    #handleValidationErrors = (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation errors',
                errors: errors.array()[0].msg
            });
        }
    };

    validateRegistration = async (req, res, next) => {
        try {
            this.#handleValidationErrors(req, res);
            const userExist = await this.#checkExistingEmail(req, res);
            if (userExist) {
                return res.status(409).json({
                    status: 'fail',
                    message: 'Email already exist'
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    validateLogin = async (req, res, next) => {
        try {
            this.#handleValidationErrors(req, res);
            const userExist = await this.#checkExistingEmail(req, res);
            if (!userExist) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Invalid email'
                });
            }
            req.user = userExist;
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };
}

module.exports = new AuthMiddleware();