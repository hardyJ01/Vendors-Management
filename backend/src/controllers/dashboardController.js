import User from '../models/User.js';
import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import { ansyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// GET /api/dashboard
export const getDashboard = ansyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Fetch user balance
  const user = await User.findById(userId).select('balance');
  const balance = user ? user.balance : 0;

  // Pending bills (bills where the user owes money, status = pending)
  const pendingBills = await Bill.find({ user_id: userId, status: 'pending' })
    .populate('vendor_id', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const pending_amount = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  const pendingBillsFormatted = pendingBills.map(b => ({
    bill_id: b._id,
    vendor_name: b.vendor_id?.name || 'Unknown',
    amount: b.amount,
    date: b.createdAt,
  }));

  // Owed bills (bills where the user is the vendor, status = pending)
  const owedBills = await Bill.find({ vendor_id: userId, status: 'pending' })
    .populate('user_id', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const owed_amount = owedBills.reduce((sum, b) => sum + b.amount, 0);

  const owedBillsFormatted = owedBills.map(b => ({
    bill_id: b._id,
    vendor_name: b.user_id?.name || 'Unknown',
    amount: b.amount,
    date: b.createdAt,
  }));

  // Money spent this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paymentsThisMonth = await Payment.find({
    user_id: userId,
    date: { $gte: startOfMonth },
  }).lean();
  const spent_this_month = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

  // Spend graph data (last 6 months)
  const spend_graph_data = [];
  const received_graph_data = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

    const spent = await Payment.aggregate([
      { $match: { user_id: user._id, date: { $gte: d, $lt: dEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const received = await Payment.aggregate([
      { $match: { vendor_id: user._id, date: { $gte: d, $lt: dEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    spend_graph_data.push({ month: monthLabel, amount: spent[0]?.total || 0 });
    received_graph_data.push({ month: monthLabel, amount: received[0]?.total || 0 });
  }

  res.status(200).json(
    new ApiResponse(200, 'Dashboard data fetched successfully', {
      balance,
      pending_amount,
      owed_amount,
      spent_this_month,
      pending_bills: pendingBillsFormatted,
      owed_bills: owedBillsFormatted,
      spend_graph_data,
      received_graph_data,
    })
  );
});
