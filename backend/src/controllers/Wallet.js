const catchAsync = require('../utils/CatchAsync');
const walletService = require('../services/Wallet');

const getBalance = catchAsync(async (req, res) => {
  const data = await walletService.getBalanceSummary(req.user.id);
  res.status(200).json(data);
});

const getTransactionHistory = catchAsync(async (req, res) => {
  const data = await walletService.getTransactionHistory(req.user.id, req.query.page, req.query.limit);
  res.status(200).json(data);
});

const deposit = catchAsync(async (req, res) => {
  const response = await walletService.runWalletTransaction({
    userId: req.user.id,
    amount: req.body.amount,
    type: 'deposit',
  });

  res.status(200).json({
    ...response,
    error: null,
  });
});

const withdraw = catchAsync(async (req, res) => {
  const response = await walletService.runWalletTransaction({
    userId: req.user.id,
    amount: req.body.amount,
    type: 'withdraw',
  });

  res.status(200).json({
    ...response,
    error: null,
  });
});

const setBudget = catchAsync(async (req, res) => {
  const response = await walletService.setBudget({
    userId: req.user.id,
    overall_limit: req.body.overall_limit,
    vendor_limits: req.body.vendor_limits,
  });

  res.status(200).json({
    ...response,
    error: null,
  });
});

module.exports = {
  getBalance,
  getTransactionHistory,
  deposit,
  withdraw,
  setBudget,
};
