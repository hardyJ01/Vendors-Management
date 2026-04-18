import { useMemo, useState } from "react";
import Modal from "../Modal/Modal";
import SplitBillComponent from "../SplitBillComponent/SplitBillComponent";
import styles from "./AddBillModal.module.css";

// ─── Why this modal uses `users` (participants) as the debtor selector ────────
//
// The schema rule is:
//   user_id   = creator = the logged-in user (owed money, sees "Bills Owed to You")
//   vendor_id = debtor  = the other party (owes money, sees "Bills to Pay")
//
// "Add Bill" means: "I am owed money by someone → record it."
// So the dropdown must list PEOPLE WHO OWE YOU (participants / contacts),
// NOT the vendor list (people you pay). The selected person's id is sent
// as vendor_id to the backend.
//
// Previously the modal received `vendors` and used vendor.id as vendor_id,
// which was correct in structure but the vendor list is people you pay — the
// opposite of who you want to bill. The fix: use `users` (participants) as
// the debtor list, and rename the field to make the intent clear.
// ─────────────────────────────────────────────────────────────────────────────

const initialFormState = {
    debtor_id:            "",   // the person who owes you (sent as vendor_id to backend)
    amount:               "",
    splitEnabled:         false,
    recurring:            false,
    recurrence_frequency: "monthly",
    selectedUsers:        [],
    splitAmounts:         {},
};

const AddBillModal = ({ isOpen, onClose, onSubmit, vendors = [], users = [] }) => {
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState("");

    // Combine vendors + users into one participant list so the dropdown
    // includes everyone — both registered vendors and plain user contacts.
    // Deduplicate by id so nobody appears twice.
    const allParticipants = useMemo(() => {
        const seen = new Set();
        const combined = [
            ...(Array.isArray(users) ? users : []),
            ...(Array.isArray(vendors) ? vendors : []),
        ];
        return combined.filter((p) => {
            const id = p.id || p._id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        }).map((p) => ({ id: p.id || p._id, name: p.name }));
    }, [users, vendors]);

    const amountValue = Number(form.amount || 0);

    const splitValidationMessage = useMemo(() => {
        if (!form.splitEnabled) return "";
        if (form.selectedUsers.length === 0)
            return "Select at least one user for splitting.";
        const totalAssigned = form.selectedUsers.reduce(
            (sum, userId) => sum + Number(form.splitAmounts[userId] || 0),
            0,
        );
        if (totalAssigned !== amountValue)
            return "Split total must exactly match the bill amount.";
        return "";
    }, [amountValue, form.selectedUsers, form.splitAmounts, form.splitEnabled]);

    const handleToggleUser = (userId) => {
        setForm((current) => {
            const selectedUsers = Array.isArray(current.selectedUsers)
                ? current.selectedUsers : [];
            const exists = selectedUsers.includes(userId);
            return {
                ...current,
                selectedUsers: exists
                    ? selectedUsers.filter((id) => id !== userId)
                    : [...selectedUsers, userId],
                splitAmounts: exists
                    ? Object.fromEntries(
                          Object.entries(current.splitAmounts).filter(
                              ([id]) => id !== userId,
                          ),
                      )
                    : current.splitAmounts,
            };
        });
    };

    const handleAmountChange = (userId, value) => {
        setForm((current) => ({
            ...current,
            splitAmounts: { ...current.splitAmounts, [userId]: value },
        }));
    };

    const handleSubmit = () => {
        // Validation
        if (!form.debtor_id || !form.amount) {
            setError("Please select a person and enter an amount.");
            return;
        }
        if (Number(form.amount) <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }
        if (form.splitEnabled && splitValidationMessage) {
            setError(splitValidationMessage);
            return;
        }

        const splitDetails = form.splitEnabled
            ? form.selectedUsers.map((userId) => {
                  const match = allParticipants.find((p) => p.id === userId);
                  return {
                      id:     userId,
                      name:   match?.name || "Unknown",
                      // BUG FIX: pass user_id (not id) so the backend
                      // spread works correctly as participant.user_id
                      user_id: userId,
                      amount: Number(form.splitAmounts[userId] || 0),
                  };
              })
            : [];

        onSubmit?.({
            // BUG FIX: send debtor_id as vendor_id — the backend stores it
            // as vendor_id (the person who owes money). The logged-in user's
            // _id is automatically used as user_id by the controller.
            vendor_id:            form.debtor_id,
            amount:               Number(form.amount),
            splitEnabled:         form.splitEnabled,
            recurring:            form.recurring,
            recurrence_frequency: form.recurring ? form.recurrence_frequency : null,
            splitDetails,
        });

        onClose?.();
    };

    const handleClose = () => {
        setForm(initialFormState);
        setError("");
        onClose?.();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Bill">
            <div className={styles.form}>

                {/* ── Debtor selector ── */}
                <div className={styles.field}>
                    <label className={styles.label}>Bill is owed by</label>
                    <select
                        className={styles.select}
                        value={form.debtor_id}
                        onChange={(e) => {
                            setForm((c) => ({ ...c, debtor_id: e.target.value }));
                            setError("");
                        }}
                    >
                        <option value="">— Select person —</option>
                        {allParticipants.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ── Amount ── */}
                <div className={styles.field}>
                    <label className={styles.label}>Total amount (₹)</label>
                    <input
                        className={styles.input}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="0"
                        value={form.amount}
                        onChange={(e) => {
                            setForm((c) => ({ ...c, amount: e.target.value }));
                            setError("");
                        }}
                    />
                </div>

                {/* ── Toggles ── */}
                <div className={styles.toggleRow}>
                    <label className={styles.toggleCard}>
                        <div>
                            <span className={styles.toggleTitle}>Split Bill</span>
                            <p className={styles.toggleText}>
                                Divide the amount among multiple people.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={form.splitEnabled}
                            onChange={(e) =>
                                setForm((c) => ({
                                    ...c,
                                    splitEnabled: e.target.checked,
                                    // Reset split state when toggled off
                                    selectedUsers: e.target.checked ? c.selectedUsers : [],
                                    splitAmounts:  e.target.checked ? c.splitAmounts  : {},
                                }))
                            }
                        />
                    </label>

                    <label className={styles.toggleCard}>
                        <div>
                            <span className={styles.toggleTitle}>Recurring</span>
                            <p className={styles.toggleText}>
                                Mark this bill for regular tracking.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={form.recurring}
                            onChange={(e) =>
                                setForm((c) => ({ ...c, recurring: e.target.checked }))
                            }
                        />
                    </label>
                </div>

                {/* ── Frequency selector (only when recurring is ON) ── */}
                {form.recurring ? (
                    <div className={styles.field}>
                        <label className={styles.label}>Repeat every</label>
                        <select
                            className={styles.select}
                            value={form.recurrence_frequency}
                            onChange={(e) =>
                                setForm((c) => ({
                                    ...c,
                                    recurrence_frequency: e.target.value,
                                }))
                            }
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                ) : null}

                {/* ── Split participants ── */}
                {form.splitEnabled ? (
                    <SplitBillComponent
                        // Pass all participants EXCEPT the already-selected debtor
                        // so you don't split a bill with the same person twice.
                        users={allParticipants.filter(
                            (p) => p.id !== form.debtor_id,
                        )}
                        totalAmount={amountValue}
                        selectedUsers={form.selectedUsers}
                        splitAmounts={form.splitAmounts}
                        onToggleUser={handleToggleUser}
                        onAmountChange={handleAmountChange}
                        validationMessage={error || splitValidationMessage}
                    />
                ) : null}

                {/* ── Non-split error message ── */}
                {!form.splitEnabled && error ? (
                    <p className={styles.error}>{error}</p>
                ) : null}

                {/* ── Actions ── */}
                <div className={styles.actions}>
                    <button className={styles.secondaryButton} onClick={handleClose}>
                        Cancel
                    </button>
                    <button className={styles.primaryButton} onClick={handleSubmit}>
                        Create Bill
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddBillModal;