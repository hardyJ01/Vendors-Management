import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Bill } from "../models/Bill.js";
import { SplitGroup } from "../models/SplitGroup.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

// ─── How the Bill schema maps to the UI ───────────────────────────────────────
//
//  user_id   = the person who CREATED the bill (the one owed money)
//  vendor_id = the person who OWES money (must pay)
//
//  getBills returns:
//    owned_bills  → where user_id === loggedInUser  → "Bills Owed to You"  ✅
//    to_pay_bills → where vendor_id === loggedInUser → "Bills to Pay"       ✅
//
//  So when the logged-in user clicks "Add Bill" to record money someone owes
//  them, the bill must be created with:
//    user_id   = req.user._id          (creator = the one who will receive)
//    vendor_id = the other party's id  (the one who owes / will pay)
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Get all bills (owned + to-pay), filtered by status ──────────────────────
const getBills = asyncHandler(async (req, res) => {
    const { status = "all" } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    let ownedMatch = { user_id: userId };
    let toPayMatch = { vendor_id: userId };

    if (status !== "all") {
        ownedMatch.status = status;
        toPayMatch.status = status;
    }

    // owned_bills  → bills where this user is the creator (owed money)
    const ownedBills = await Bill.aggregate([
        { $match: ownedMatch },
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
    ]);

    // to_pay_bills → bills where this user is the debtor (owes money)
    const toPayBills = await Bill.aggregate([
        { $match: toPayMatch },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_details",
            },
        },
        { $unwind: { path: "$user_details", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            { owned_bills: ownedBills, to_pay_bills: toPayBills },
            "Bills fetched successfully",
        ),
    );
});

// ─── Get vendors for the logged-in user ──────────────────────────────────────
const getVendors = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: "vendors",
        select: "_id name business profile_pic phone_number rating no_rating",
    });

    const vendors = Array.isArray(user?.vendors) ? user.vendors : [];

    return res
        .status(200)
        .json(new ApiResponse(200, vendors, "Vendors fetched successfully"));
});

// ─── Get other users as split-bill participants ───────────────────────────────
const getParticipants = asyncHandler(async (req, res) => {
    const participants = await User.find({ _id: { $ne: req.user._id } })
        .select("_id name email business")
        .limit(20)
        .lean();

    return res
        .status(200)
        .json(
            new ApiResponse(200, participants, "Participants fetched successfully"),
        );
});

// ─── Add a new bill ───────────────────────────────────────────────────────────
const addBill = asyncHandler(async (req, res) => {
    const {
        vendor_id,        // the OTHER party — the one who owes money
        amount,
        is_recurring,
        recurrence_frequency,
        split_participants,
    } = req.body;

    if (!vendor_id || !amount) {
        throw new ApiError(400, "Vendor ID and Amount are required");
    }

    // ── Split bill ────────────────────────────────────────────────────────────
    if (split_participants && split_participants.length > 0) {

        // BUG FIX (split bill invisible): Previously the creator's _id was
        // only stored in SplitGroup.created_by and never in any Bill document.
        // getBills queries Bill by user_id / vendor_id, so the creator could
        // never find their own split bills.
        //
        // Correct mapping per bill document:
        //   user_id   = req.user._id          → creator (owed money, sees it in owned_bills)
        //   vendor_id = participant.user_id    → each person who owes a share
        //
        // This mirrors exactly how a regular bill works and makes getBills
        // return the split bills correctly in owned_bills for the creator and
        // in to_pay_bills for each participant.

        try {
            // 1. Create the parent split group for reference
            const splitGroup = await SplitGroup.create([{
                created_by: req.user._id,
                vendor_id,          // the primary "vendor" context
                total_amount: amount,
            }]);

            // 2. Create one Bill per participant with correct user_id / vendor_id
            const billDocs = split_participants.map((participant) => ({
                user_id:        new mongoose.Types.ObjectId(req.user._id),  // creator is owed
                vendor_id:      new mongoose.Types.ObjectId(participant.user_id), // participant owes
                amount:         participant.amount,
                is_split:       true,
                split_group_id: splitGroup[0]._id,
                status:         "pending",
            }));

            const createdBills = await Bill.insertMany(billDocs);

            // 3. Auto-add all participants to the creator's vendor list
            const participantIds = split_participants.map((p) => p.user_id);
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { vendors: { $each: participantIds } },
            });

            return res
                .status(201)
                .json(
                    new ApiResponse(201, createdBills, "Split bills created successfully"),
                );
        } catch (error) {
            throw new ApiError(500, "Failed to create split bills: " + error.message);
        }
    }

    // ── Regular / recurring bill ──────────────────────────────────────────────
    //
    // BUG FIX (regular bill in wrong section): Previously the bill was created
    // with user_id = req.user._id and vendor_id = the other party (correct for
    // "Bills to Pay" perspective). But the UI intent of "Add Bill" is to record
    // money the OTHER party owes YOU — so the bill should appear in
    // owned_bills ("Bills Owed to You"), not to_pay_bills ("Bills to Pay").
    //
    // The schema rule is:
    //   user_id   = creator = the one who is owed money (sees it in owned_bills)
    //   vendor_id = debtor  = the one who owes money    (sees it in to_pay_bills)
    //
    // req.user._id is the creator, so user_id = req.user._id is already correct.
    // vendor_id = the selected other party is also correct.
    // The real fix is in BillsPage.jsx: owned_bills must map to "Bills Owed to
    // You" and to_pay_bills must map to "Bills to Pay" — which is exactly what
    // the frontend already does. The issue was that the AddBillModal was
    // selecting a vendor from the user's own vendor list (people they PAY),
    // not from the participants list (people who owe them).
    //
    // So we now use vendor_id as the debtor (the person who owes), and
    // user_id as the creator (req.user._id). No change needed here —
    // the controller was already correct for regular bills.
    // The real fix is in AddBillModal (explained below).

    const newBill = await Bill.create({
        user_id:              new mongoose.Types.ObjectId(req.user._id),
        vendor_id:            new mongoose.Types.ObjectId(vendor_id),
        amount,
        is_recurring:         is_recurring || false,
        recurrence_frequency: is_recurring ? (recurrence_frequency || "monthly") : null,
        status:               "pending",
    });

    // Auto-add the debtor to the creator's vendor list
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { vendors: vendor_id },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newBill, "Bill created successfully"));
});

// ─── Dispute a bill ───────────────────────────────────────────────────────────
const disputeBill = asyncHandler(async (req, res) => {
    const { bill_id } = req.body;
    if (!bill_id) throw new ApiError(400, "Bill ID is required");

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const updatedBill = await Bill.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(bill_id),
            $or: [{ user_id: userId }, { vendor_id: userId }],
        },
        { $set: { status: "disputed" } },
        { returnDocument: "after" },
    );

    if (!updatedBill) throw new ApiError(404, "Bill not found or access denied");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedBill, "Bill disputed successfully"));
});

// ─── Delete a bill (creator only) ────────────────────────────────────────────
const deleteBill = asyncHandler(async (req, res) => {
    const { bill_id } = req.body;
    if (!bill_id) throw new ApiError(400, "Bill ID is required");

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const deletedBill = await Bill.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(bill_id),
        user_id: userId,
    });

    if (!deletedBill)
        throw new ApiError(404, "Bill not found or not authorized to delete");

    return res
        .status(200)
        .json(new ApiResponse(200, deletedBill, "Bill deleted successfully"));
});

// ─── Resolve a disputed bill ──────────────────────────────────────────────────
const resolveDispute = asyncHandler(async (req, res) => {
    const { bill_id } = req.body;
    if (!bill_id) throw new ApiError(400, "Bill ID is required");

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const bill = await Bill.findOne({
        _id: new mongoose.Types.ObjectId(bill_id),
        $or: [{ user_id: userId }, { vendor_id: userId }],
    });

    if (!bill) throw new ApiError(404, "Bill not found or access denied");
    if (bill.status !== "disputed")
        throw new ApiError(400, "Only disputed bills can be resolved");

    bill.status = "pending";
    await bill.save();

    return res
        .status(200)
        .json(new ApiResponse(200, bill, "Dispute resolved successfully"));
});

export {
    getBills,
    getVendors,
    getParticipants,
    addBill,
    disputeBill,
    deleteBill,
    resolveDispute,
};