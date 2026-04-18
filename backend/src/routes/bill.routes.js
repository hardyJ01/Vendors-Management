import { Router } from "express";
import {
    getBills,
    getVendors,
    getParticipants,
    addBill,
    disputeBill,
    deleteBill,
    resolveDispute,
} from "../controllers/bill.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All bill routes are protected
router.use(verifyJWT);

// ── Read ──────────────────────────────────────────────────────────────────────
router.get("/get_bills", getBills);

// BUG FIX: These two routes were completely missing from the router.
// Without them, GET /api/v1/bills/vendors returned 404, so the vendor
// dropdown in AddBillModal was always empty and newly created bills had
// no vendor attached (causing the "add bill not changing in DB" symptom).
router.get("/vendors", getVendors);
router.get("/participants", getParticipants);

// ── Write ─────────────────────────────────────────────────────────────────────
router.post("/add_bill", addBill);
router.post("/dispute_bill", disputeBill);
router.post("/resolve_dispute", resolveDispute);
router.delete("/delete_bill", deleteBill);

export default router;