const { validationResult } = require('express-validator');

class ValidationMiddleware {
    validateJobCreation = (req, res, next) => {
        const errors = validationResult(req);
        console.log("Validation Errors:", errors.array());
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation error',
                details: errors.array().map(e => ({ message: e.msg, path: e.param }))
            });
        }
        next();
    };
}

module.exports = new ValidationMiddleware();