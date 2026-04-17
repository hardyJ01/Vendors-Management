const express = require('express');
const authenticate = require('../middlewares/Auth');
const validateRequest = require('../middlewares/Validate');
const controller = require('../controllers/Wallet');
const {
  amountValidation,
  transactionHistoryValidation,
  setBudgetValidation,
} = require('../validators/Wallet');

const router = express.Router();

router.get('/get_balance', authenticate, controller.getBalance);
router.get(
  '/get_transaction_history',
  authenticate,
  transactionHistoryValidation,
  validateRequest,
  controller.getTransactionHistory
);
router.post('/deposit', authenticate, amountValidation, validateRequest, controller.deposit);
router.post('/withdraw', authenticate, amountValidation, validateRequest, controller.withdraw);
router.post('/set_budget', authenticate, setBudgetValidation, validateRequest, controller.setBudget);

module.exports = router;
