import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/Payment.js";
import { Bill } from "../models/Bill.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

// Make a payment (no MongoDB transactions - works on standalone localhost MongoDB)
const makePayment = asyncHandler(async (req, res) => {
    const { vendor_id, amount, bill_id } = req.body;
    const payer_id = req.user._id;

    if (!vendor_id || !amount) {
        throw new ApiError(400, "Vendor ID and Amount are required");
    }

    // 1. Validate payer exists and has sufficient balance
    const payer = await User.findById(payer_id);
    if (!payer) {
        throw new ApiError(404, "Payer not found");
    }
    if (payer.balance < amount) {
        throw new ApiError(400, "Insufficient wallet balance");
    }

    // 2. Validate vendor exists
    const vendor = await User.findById(vendor_id);
    if (!vendor) {
        throw new ApiError(404, "Vendor not found");
    }

    // 3. Deduct from payer's wallet, credit to vendor's wallet
    await User.findByIdAndUpdate(payer_id, { $inc: { balance: -amount } });
    await User.findByIdAndUpdate(vendor_id, { $inc: { balance: amount } });

    // 4. Create a new bill (if direct payment) or mark existing bill as done
    let finalBillId = bill_id;

    if (!bill_id) {
        // Direct payment — create a new bill with status 'done'
        const newBill = await Bill.create({
            user_id: payer_id,
            vendor_id,
            amount,
            status: "done",
        });
        finalBillId = newBill._id; // FIX: assign the new bill's id
    } else {
        // Settling an existing pending bill
        const existingBill = await Bill.findById(bill_id);
        if (!existingBill) {
            throw new ApiError(404, "Bill not found");
        }
        await Bill.findByIdAndUpdate(bill_id, { status: "done" });
    }

    // 5. Create payment record
    const paymentRecord = await Payment.create({
        bill_id: finalBillId,
        user_id: payer_id,
        vendor_id,
        amount,
    });

    // 6. Link payment_id back to the bill
    await Bill.findByIdAndUpdate(finalBillId, { payment_id: paymentRecord._id });

    // 7. Auto-add vendor to payer's vendor list if not already added (per project spec)
    await User.findByIdAndUpdate(payer_id, { $addToSet: { vendors: vendor_id } });

    return res
        .status(200)
        .json(new ApiResponse(200, paymentRecord, "Payment processed successfully"));
});

// Get all payments for the logged-in user
const getPayments = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const payments = await Payment.aggregate([
        { $match: { user_id: userId } },
        {
            $lookup: {
                from: "users",
                localField: "vendor_id",
                foreignField: "_id",
                as: "vendor_details",
            },
        },
        { $unwind: { path: "$vendor_details", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        {
            $project: {
                amount: 1,
                createdAt: 1,
                bill_id: 1,
                "vendor_details.name": 1,
                "vendor_details.business": 1,
                "vendor_details.profile_pic": 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

export { makePayment, getPayments };