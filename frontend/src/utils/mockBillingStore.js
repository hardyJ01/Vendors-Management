const STORAGE_KEY = "awt-fintech-billing-state";
const EVENT_NAME = "awt-fintech-billing-state-updated";

const defaultState = {
    walletBalance: 48200,
    payableBills: [
        { id: "pay-1", vendor: "Amazon", amount: 2400, dueDate: "2026-04-14", priority: "high", category: "Shopping", status: "Pending" },
        { id: "pay-2", vendor: "Swiggy", amount: 650, dueDate: "2026-04-16", priority: "low", category: "Food", status: "Pending" },
        { id: "pay-3", vendor: "Razorpay", amount: 8500, dueDate: "2026-04-18", priority: "high", category: "Finance", status: "Pending" },
        { id: "pay-4", vendor: "Airtel Fiber", amount: 1199, dueDate: "2026-04-19", priority: "high", category: "Utility", status: "Pending" },
        { id: "pay-5", vendor: "Netflix", amount: 649, dueDate: "2026-04-22", priority: "low", category: "Subscription", status: "Pending" },
    ],
    owedBills: [
        { id: "owed-1", user: "Ankit Patel", amount: 3200, status: "Pending", createdAt: "2026-04-09", splitCount: 1, note: "Shared dinner bill" },
        { id: "owed-2", user: "Riya Sharma", amount: 1500, status: "Pending", createdAt: "2026-04-07", splitCount: 2, note: "Office supplies split" },
        { id: "owed-3", user: "Vijay Ops", amount: 7000, status: "Pending", createdAt: "2026-04-04", splitCount: 1, note: "Project advance payment" },
    ],
    aiSuggestions: [
        { id: "ai-1", vendor: "Airtel Fiber", amount: 1199, priority: "high", reason: "Due in 3 days." },
        { id: "ai-2", vendor: "Razorpay", amount: 8500, priority: "high", reason: "Highest-value recurring vendor this week." },
        { id: "ai-3", vendor: "Netflix", amount: 649, priority: "low", reason: "Flexible renewal window remains." },
        { id: "ai-4", vendor: "Swiggy", amount: 800, priority: "low", reason: "Near your weekly average spend." },
    ],
    paymentHistory: [
        { id: "txn-1", vendor: "Figma", amount: 1200, direction: "outgoing", createdAt: "2026-04-08T10:15:00.000Z", counterparty: "Figma", note: "Workspace renewal" },
        { id: "txn-2", vendor: "Aarav Sharma", amount: 2200, direction: "incoming", createdAt: "2026-04-08T15:30:00.000Z", counterparty: "Aarav Sharma", note: "Bill settlement received" },
        { id: "txn-3", vendor: "Slack", amount: 899, direction: "outgoing", createdAt: "2026-04-06T09:00:00.000Z", counterparty: "Slack", note: "Team subscription" },
        { id: "txn-4", vendor: "Ishita Patel", amount: 850, direction: "incoming", createdAt: "2026-04-05T13:20:00.000Z", counterparty: "Ishita Patel", note: "Shared meal reimbursement" },
    ],
};

const cloneState = (state) => JSON.parse(JSON.stringify(state));

const readState = () => {
    if (typeof window === "undefined") {
        return cloneState(defaultState);
    }

    const rawState = window.localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
        return cloneState(defaultState);
    }

    try {
        return {
            ...cloneState(defaultState),
            ...JSON.parse(rawState),
        };
    } catch {
        return cloneState(defaultState);
    }
};

const writeState = (nextState) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextState }));
};

export const getBillingWorkspace = () => readState();

export const subscribeBillingWorkspace = (callback) => {
    if (typeof window === "undefined") {
        return () => {};
    }

    const handler = () => callback(readState());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);

    return () => {
        window.removeEventListener(EVENT_NAME, handler);
        window.removeEventListener("storage", handler);
    };
};

export const addOwedBill = (bill) => {
    const currentState = readState();
    const nextState = {
        ...currentState,
        owedBills: [
            {
                id: `owed-${Date.now()}`,
                ...bill,
            },
            ...(Array.isArray(currentState.owedBills) ? currentState.owedBills : []),
        ],
    };

    writeState(nextState);
    return nextState;
};

export const payBillById = (billId) => {
    const currentState = readState();
    const payableBills = Array.isArray(currentState.payableBills) ? currentState.payableBills : [];
    const targetBill = payableBills.find((bill) => bill.id === billId);

    if (!targetBill) {
        return currentState;
    }

    const nextState = {
        ...currentState,
        walletBalance: Number(currentState.walletBalance || 0) - Number(targetBill.amount || 0),
        payableBills: payableBills.filter((bill) => bill.id !== billId),
        paymentHistory: [
            {
                id: `txn-${Date.now()}`,
                vendor: targetBill.vendor,
                amount: Number(targetBill.amount || 0),
                direction: "outgoing",
                createdAt: new Date().toISOString(),
                counterparty: targetBill.vendor,
                note: `${targetBill.category || "Bill"} payment`,
            },
            ...(Array.isArray(currentState.paymentHistory) ? currentState.paymentHistory : []),
        ],
    };

    writeState(nextState);
    return nextState;
};
