const mongoose = require('mongoose');
const User = require('../models/User');
const TransactionHistory = require('../models/TransactionHistory');
const ApiError = require('../utils/ApiError');

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

const getBalanceSummary = async (userId) => {
  const user = await User.findById(userId).lean();
  const { start, end } = getMonthRange();

  const monthlySpend = await TransactionHistory.aggregate([
    {
      $match: {
        user_id: userId,
        type: { $in: ['withdraw', 'payment'] },
        timestamp: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  return {
    balance: user.balance,
    budget_overall: user.budget_overall,
    budget_spent_this_month: monthlySpend[0]?.total || 0,
  };
};

const getTransactionHistory = async (userId, page = 1, limit = 10) => {
  const currentPage = Number(page) || 1;
  const pageSize = Number(limit) || 10;
  const skip = (currentPage - 1) * pageSize;

  const transactions = await TransactionHistory.find({ user_id: userId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    transactions: transactions.map((item) => ({
      amount: item.amount,
      type: item.type,
      timestamp: item.timestamp,
    })),
  };
};

const buildWalletResponse = (type, newBalance) => ({
  status: 'success',
  message: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} completed successfully`,
  new_balance: newBalance,
});

const writeTransactionHistory = async ({ userId, amount, type, session }) => {
  const payload = {
    user_id: userId,
    amount,
    type,
    timestamp: new Date(),
  };

  if (session) {
    await TransactionHistory.create([payload], { session });
    return;
  }

  await TransactionHistory.create(payload);
};

const runWalletTransactionWithSession = async ({ userId, amount, type }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (type === 'withdraw' && user.balance < amount) {
      throw new ApiError(400, 'Insufficient balance');
    }

    user.balance = type === 'deposit' ? user.balance + amount : user.balance - amount;

    await user.save({ session });
    await writeTransactionHistory({ userId, amount, type, session });
    await session.commitTransaction();

    return buildWalletResponse(type, user.balance);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const runWalletTransactionWithoutSession = async ({ userId, amount, type }) => {
  const filter = type === 'withdraw' ? { _id: userId, balance: { $gte: amount } } : { _id: userId };
  const update = { $inc: { balance: type === 'deposit' ? amount : -amount } };

  const user = await User.findOneAndUpdate(filter, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const existingUser = await User.exists({ _id: userId });

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    throw new ApiError(400, 'Insufficient balance');
  }

  try {
    await writeTransactionHistory({ userId, amount, type });
  } catch (error) {
    await User.updateOne(
      { _id: userId },
      { $inc: { balance: type === 'deposit' ? -amount : amount } }
    );
    throw error;
  }

  return buildWalletResponse(type, user.balance);
};

const runWalletTransaction = async ({ userId, amount, type }) => {
  try {
    return await runWalletTransactionWithSession({ userId, amount, type });
  } catch (error) {
    if (error?.code === 20 || error?.codeName === 'IllegalOperation') {
      return runWalletTransactionWithoutSession({ userId, amount, type });
    }

    throw error;
  }
};

const setBudget = async ({ userId, overall_limit, vendor_limits }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (overall_limit !== undefined) {
    user.budget_overall = overall_limit;
  }

  if (Array.isArray(vendor_limits)) {
    const nextMap = new Map(user.budget_per_vendor || []);
    vendor_limits.forEach(({ vendor_id, limit }) => {
      nextMap.set(vendor_id, limit);
    });
    user.budget_per_vendor = nextMap;
  }

  await user.save();

  return {
    status: 'success',
    message: 'Budget updated successfully',
  };
};

module.exports = {
  getBalanceSummary,
  getTransactionHistory,
  runWalletTransaction,
  setBudget,
};
