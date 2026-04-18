import { Router } from "express";
import { getBillSuggestions } from "../ai/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All AI routes are protected — user must be logged in
router.use(verifyJWT);

/**
 * GET /api/ai/bill-suggestions
 * Returns AI-generated bill suggestions based on user's billing history
 */
router.get("/bill-suggestions", getBillSuggestions);

export default router;