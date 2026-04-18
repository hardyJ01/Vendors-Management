import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Bill } from "../models/Bill.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";
import { askGoogleGenAI } from "../ai/services/ai.service.js";
import AiSuggestionCache from "../models/AiSuggestionCache.js";
import {
    getBillSuggestionSystemPrompt,
    buildBillSuggestionPrompt,
} from "../ai/prompts/billSuggestion.prompt.js";

/**
 * GET /api/ai/bill-suggestions
 *
 * Fetches the logged-in user's bill history + vendor list,
 * sends it to Google GenAI, and returns smart bill suggestions.
 */
const getBillSuggestions = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Fetch user details (name, business)
    const user = await User.findById(userId).select("name business vendors");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 2. Need at least some history to make suggestions
    const billCount = await Bill.countDocuments({ user_id: userId });
    if (billCount === 0) {
        return res.status(200).json(
            new ApiResponse(200, { suggestions: [] }, "No billing history found to generate suggestions")
        );
    }

    // 3. Fetch last 50 bills (enough pattern data, keeps prompt small)
    const billHistory = await Bill.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    // 4. Fetch full vendor details for the user's vendor list
    const vendors = await User.find({ _id: { $in: user.vendors } })
        .select("_id name business")
        .lean();

    // 5. Build prompts and call Google GenAI
    const systemPrompt = getBillSuggestionSystemPrompt();
    const userPrompt = buildBillSuggestionPrompt(billHistory, vendors, {
        name: user.name,
        business: user.business,
    });

    let aiResponse;

    try {
        aiResponse = await askGoogleGenAI(systemPrompt, userPrompt);
    } catch (error) {
        const cached = await AiSuggestionCache.findOne({ user_id: userId }).sort({ generated_at: -1 }).lean();

        if (cached?.suggestions && Array.isArray(cached.suggestions)) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    { suggestions: cached.suggestions, source: "cache" },
                    "Bill suggestions fetched from cache"
                )
            );
        }

        throw new ApiError(500, `AI suggestion generation failed: ${error.message}`);
    }

    // 6. Validate Google GenAI actually returned suggestions array
    if (!aiResponse?.suggestions || !Array.isArray(aiResponse.suggestions)) {
        throw new ApiError(500, "AI returned an unexpected response format");
    }

    return res.status(200).json(
        new ApiResponse(200, aiResponse, "Bill suggestions generated successfully")
    );
});

export { getBillSuggestions };
