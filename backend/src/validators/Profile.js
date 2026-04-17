const { body } = require('express-validator');

const updateUserValidation = [
  body('name').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Address cannot be empty'),
  body('business').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Business cannot be empty'),
];

module.exports = {
  updateUserValidation,
};
