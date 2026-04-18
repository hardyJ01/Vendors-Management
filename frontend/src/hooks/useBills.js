import { useState, useCallback } from "react";
import {
    getBills,
    addBill,
    disputeBill,
    deleteBill,
    resolveDispute,
} from "../services/api/Billpaymentservice";

export const useBills = () => {
    // BUG FIX 1: Always initialise with safe empty arrays so .length never
    // throws "Cannot read properties of undefined" on first render.
    const [bills, setBills] = useState({ owned_bills: [], to_pay_bills: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBills = useCallback(async (status = "pending") => {
        // BUG FIX 2: Default status changed from "all" → "pending" so that
        // already-paid (done) bills are NOT shown in the Bills to Pay column.
        setLoading(true);
        setError(null);
        try {
            const res = await getBills(status);

            // BUG FIX 3: Guard against undefined / malformed API response.
            // If res.data is missing or the arrays are absent, fall back to
            // empty arrays instead of crashing with "Cannot read properties
            // of undefined (reading 'length')".
            setBills({
                owned_bills: Array.isArray(res?.data?.owned_bills)
                    ? res.data.owned_bills
                    : [],
                to_pay_bills: Array.isArray(res?.data?.to_pay_bills)
                    ? res.data.to_pay_bills
                    : [],
            });
        } catch (err) {
            setError(err.message);
            // Keep the previous safe state rather than setting undefined.
            setBills({ owned_bills: [], to_pay_bills: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    const createBill = useCallback(
        async (payload) => {
            setLoading(true);
            setError(null);
            try {
                await addBill(payload);
                // BUG FIX 4: Re-fetch with "pending" so the newly created
                // pending bill appears immediately and done bills stay hidden.
                await fetchBills("pending");
                return true;
            } catch (err) {
                setError(err.message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [fetchBills],
    );

    const markDisputed = useCallback(
        async (bill_id) => {
            try {
                await disputeBill(bill_id);
                await fetchBills("pending");
            } catch (err) {
                setError(err.message);
            }
        },
        [fetchBills],
    );

    const removeBill = useCallback(
        async (bill_id) => {
            try {
                await deleteBill(bill_id);
                await fetchBills("pending");
            } catch (err) {
                setError(err.message);
            }
        },
        [fetchBills],
    );

    const fixDispute = useCallback(
        async (bill_id) => {
            try {
                await resolveDispute(bill_id);
                await fetchBills("pending");
            } catch (err) {
                setError(err.message);
            }
        },
        [fetchBills],
    );

    return {
        bills,
        loading,
        error,
        fetchBills,
        createBill,
        markDisputed,
        removeBill,
        fixDispute,
    };
};