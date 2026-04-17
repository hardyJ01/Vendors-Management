const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    status: 'error',
    message: 'Validation failed',
    error: errors.array().map((item) => ({
      field: item.path,
      message: item.msg,
    })),
  });
};

module.exports = validateRequest;
