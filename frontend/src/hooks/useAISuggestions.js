import { useState, useCallback } from "react";
import { getBillSuggestions } from "../services/api/Billpaymentservice";

export const useAISuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuggestions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getBillSuggestions();
            setSuggestions(res.data?.suggestions || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { suggestions, loading, error, fetchSuggestions };
};