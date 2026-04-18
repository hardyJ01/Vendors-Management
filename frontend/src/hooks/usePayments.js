import { useState, useCallback } from "react";
import { getPayments, makePayment } from "../services/api/Billpaymentservice";

export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPayments();
            setPayments(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const sendPayment = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            await makePayment(payload);
            await fetchPayments();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchPayments]);

    return { payments, loading, error, fetchPayments, sendPayment };
};