const { body } = require('express-validator');

const allowedTypes = ["one-time", "recurring"];
const allowedCommands = ["DB_BACKUP", "CLEANUP_LOGS", "SEND_EMAIL", "HTTP_REQUEST"];

const validateCreateJob = [
    body('name')
        .exists({ checkFalsy: true }).withMessage('name is required')
        .isString().withMessage('name must be a string')
        .trim(),

    body('scheduleType')
        .exists({ checkFalsy: true }).withMessage('scheduleType is required')
        .isIn(allowedTypes).withMessage(`scheduleType must be one of: ${allowedTypes.join(', ')}`),

    body('command')
        .exists({ checkFalsy: true }).withMessage('command is required')
        .isIn(allowedCommands).withMessage(`command must be one of: ${allowedCommands.join(', ')}`),

    body('description')
        .optional()
        .isString().withMessage('description must be a string'),

    body('maxRetries')
        .optional()
        .isInt({ min: 0 }).withMessage('maxRetries must be a non-negative integer'),

    body('payload')
        .optional()
        .isObject().withMessage('payload must be an object'),

    // Conditional requirements based on scheduleType
    body('runAt')
        .custom((value, { req }) => {
            if (req.body.scheduleType === 'one-time') {
                if (!value) throw new Error('runAt is required for one-time jobs');
                const date = new Date(value);
                if (isNaN(date.getTime())) throw new Error('runAt must be a valid date');
            }
            return true;
        }),

    body('cronExpr')
        .custom((value, { req }) => {
            if (req.body.scheduleType === 'recurring') {
                if (!value || typeof value !== 'string' || !value.trim()) {
                    throw new Error('cronExpr is required for recurring jobs');
                }
            }
            return true;
        }),
];

module.exports = {
    validateCreateJob,
};