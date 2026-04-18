/**
 * Builds the system prompt that tells Google GenAI its role for bill suggestions.
 */
const getBillSuggestionSystemPrompt = () => `
You are a smart billing assistant for a vendor management and payments application.
Your job is to analyse a user's past billing history with their vendors and return
intelligent suggestions for new bills they are likely to create.

Rules:
- Always respond with ONLY a valid JSON object — no explanation, no markdown, no preamble.
- Base suggestions on real patterns in the provided history (recurring amounts, frequent vendors, average amounts).
- Confidence should be a number between 0 and 1 (e.g. 0.92).
- Reason should be a short, human-readable sentence explaining why you suggest this bill.
- Suggested amount should be rounded to 2 decimal places.
- Return between 1 and 5 suggestions, ordered by confidence descending.

Response format (strict):
{
  "suggestions": [
    {
      "vendor_id": "<string>",
      "vendor_name": "<string>",
      "suggested_amount": <number>,
      "confidence": <number>,
      "reason": "<string>",
      "is_recurring": <boolean>,
      "suggested_frequency": "<string | null>"  // e.g. "monthly", "weekly", null
    }
  ]
}
`;

/**
 * Builds the user prompt from the user's bill history data.
 *
 * @param {Array}  billHistory  - Array of past bill objects
 * @param {Array}  vendors      - Array of vendor objects the user has
 * @param {Object} userContext  - { name, business }
 */
const buildBillSuggestionPrompt = (billHistory, vendors, userContext) => {
    const vendorMap = vendors.reduce((acc, v) => {
        acc[v._id.toString()] = v.name;
        return acc;
    }, {});

    // Simplify bill history to only what Claude needs — keep token usage low
    const simplifiedHistory = billHistory.map((bill) => ({
        vendor_id: bill.vendor_id?.toString(),
        vendor_name: vendorMap[bill.vendor_id?.toString()] || "Unknown",
        amount: bill.amount,
        status: bill.status,
        is_recurring: bill.is_recurring || false,
        recurrence_frequency: bill.recurrence_frequency || null,
        created_at: bill.createdAt,
    }));

    return `
User context:
- Name: ${userContext.name}
- Business type: ${userContext.business || "Not specified"}

The user has ${vendors.length} vendor(s) and the following billing history (most recent first):
${JSON.stringify(simplifiedHistory, null, 2)}

Based on this history, suggest the most likely bills this user should create next.
`;
};

export { getBillSuggestionSystemPrompt, buildBillSuggestionPrompt };