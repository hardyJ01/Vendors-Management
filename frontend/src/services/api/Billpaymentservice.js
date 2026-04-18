const BASE_URL = "http://localhost:5000/api/v1";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
    };
};

const parseJsonSafely = async (response) => {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error(text || "Server returned an invalid response");
    }
};

const handleResponse = async (response) => {
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
        throw new Error(payload?.message || "Something went wrong");
    }
    return payload;
};

export const getBills = (status = "all") =>
    fetch(`${BASE_URL}/bills/get_bills?status=${status}`, {
        method: "GET",
        headers: getAuthHeader(),
    }).then(handleResponse);

export const getVendors = () =>
    fetch(`${BASE_URL}/bills/vendors`, {
        method: "GET",
        headers: getAuthHeader(),
    }).then(handleResponse);

export const getParticipants = () =>
    fetch(`${BASE_URL}/bills/participants`, {
        method: "GET",
        headers: getAuthHeader(),
    }).then(handleResponse);

export const addBill = (payload) =>
    fetch(`${BASE_URL}/bills/add_bill`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
    }).then(handleResponse);

export const disputeBill = (bill_id) =>
    fetch(`${BASE_URL}/bills/dispute_bill`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ bill_id }),
    }).then(handleResponse);

export const deleteBill = (bill_id) =>
    fetch(`${BASE_URL}/bills/delete_bill`, {
        method: "DELETE",
        headers: getAuthHeader(),
        body: JSON.stringify({ bill_id }),
    }).then(handleResponse);

export const resolveDispute = (bill_id) =>
    fetch(`${BASE_URL}/bills/resolve_dispute`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ bill_id }),
    }).then(handleResponse);

export const getPayments = () =>
    fetch(`${BASE_URL}/payments/get_payments`, {
        method: "GET",
        headers: getAuthHeader(),
    }).then(handleResponse);

export const makePayment = (payload) =>
    fetch(`${BASE_URL}/payments/make_payment`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
    }).then(handleResponse);

export const getBillSuggestions = () =>
    fetch(`${BASE_URL}/ai/bill-suggestions`, {
        method: "GET",
        headers: getAuthHeader(),
    }).then(handleResponse);
