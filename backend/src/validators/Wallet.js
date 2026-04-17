const { body, query } = require('express-validator');

const amountValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number')
    .toFloat(),
];

const transactionHistoryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

const setBudgetValidation = [
  body('overall_limit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('overall_limit must be a non-negative number')
    .toFloat(),
  body('vendor_limits').optional().isArray().withMessage('vendor_limits must be an array'),
  body('vendor_limits.*.vendor_id')
    .optional()
    .notEmpty()
    .withMessage('vendor_id is required for each vendor limit'),
  body('vendor_limits.*.limit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('limit must be a non-negative number')
    .toFloat(),
];

module.exports = {
  amountValidation,
  transactionHistoryValidation,
  setBudgetValidation,
};
