import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles, Wallet } from "lucide-react";
import BillCard from "../../components/BillCard/Billcard";
import AddBillModal from "../../components/AddBillModal/AddBillModal";
import AISuggestionPanel from "../../components/AISuggestionPanel/AISuggestionPanel";
import Modal from "../../components/Modal/Modal";
import { useBills } from "../../hooks/useBills";
import { useAISuggestions } from "../../hooks/useAISuggestions";
import { usePayments } from "../../hooks/usePayments";
import { getVendors, getParticipants } from "../../services/api/Billpaymentservice";
import styles from "./Billspage.module.css";

const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

const BillsPage = () => {
    const { bills, loading, error, fetchBills, createBill } = useBills();
    const { suggestions, fetchSuggestions } = useAISuggestions();
    const { sendPayment } = usePayments();

    const [vendors, setVendors] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        fetchBills("pending");
        fetchSuggestions();
    }, [fetchBills, fetchSuggestions]);

    // Load vendors (people the user pays — shown in read-only contexts)
    useEffect(() => {
        const load = async () => {
            try {
                const res = await getVendors();
                const safe = Array.isArray(res?.data) ? res.data : [];
                setVendors(safe.map((v) => ({ id: v._id, name: v.name })));
            } catch {
                setVendors([]);
            }
        };
        load();
    }, []);

    // BUG FIX: Also load participants (other users) — these are the people
    // who can OWE you money and should appear in the "Add Bill" dropdown.
    // Previously only vendors were loaded, so the modal had the wrong list.
    useEffect(() => {
        const load = async () => {
            try {
                const res = await getParticipants();
                const safe = Array.isArray(res?.data) ? res.data : [];
                setParticipants(safe.map((p) => ({ id: p._id, name: p.name })));
            } catch {
                setParticipants([]);
            }
        };
        load();
    }, []);

    // ── BUG FIX: Correct column mapping ───────────────────────────────────────
    //
    //  Schema:  user_id = creator (owed money)  |  vendor_id = debtor (owes money)
    //
    //  getBills returns:
    //    owned_bills  → { user_id: me }   → I am owed money → "Bills Owed to You" ✅
    //    to_pay_bills → { vendor_id: me } → I owe money     → "Bills to Pay"      ✅
    //
    // Previously the page had these SWAPPED — owned_bills was shown as
    // "Bills to Pay" and to_pay_bills was shown as "Bills Owed to You".
    // That caused every newly created bill (which goes into owned_bills) to
    // appear in the wrong column.
    const owedToYouBills = useMemo(
        () => (Array.isArray(bills?.owned_bills) ? bills.owned_bills : []),
        [bills],
    );
    const billsToPayBills = useMemo(
        () => (Array.isArray(bills?.to_pay_bills) ? bills.to_pay_bills : []),
        [bills],
    );

    const totals = useMemo(() => {
        const receivable = owedToYouBills.reduce(
            (sum, b) => sum + Number(b?.amount || 0), 0,
        );
        const payable = billsToPayBills.reduce(
            (sum, b) => sum + Number(b?.amount || 0), 0,
        );
        return { payable, receivable };
    }, [owedToYouBills, billsToPayBills]);

    const handleAddBill = async (newBill) => {
        // BUG FIX: newBill.vendor_id now correctly carries the debtor's id
        // (the person who owes money), as set in the fixed AddBillModal.
        // Split participants use user_id inside each splitDetails entry.
        const payload = {
            vendor_id: newBill.vendor_id,
            amount: newBill.amount,
            is_recurring: newBill.recurring,
            recurrence_frequency: newBill.recurring
                ? newBill.recurrence_frequency || "monthly"
                : null,
            split_participants: newBill.splitEnabled
                ? newBill.splitDetails.map((p) => ({
                      user_id: p.user_id || p.id,   // backend expects user_id per participant
                      amount:  p.amount,
                  }))
                : [],
        };

        const success = await createBill(payload);
        if (success) {
            await fetchBills("pending");
            await fetchSuggestions();
        }
    };

    const confirmPayBill = async () => {
        if (!selectedBill?._id) return;
        const success = await sendPayment({
            vendor_id: selectedBill.vendor_id,
            amount:    selectedBill.amount,
            bill_id:   selectedBill._id,
        });
        if (success) {
            await fetchBills("pending");
            await fetchSuggestions();
            setSelectedBill(null);
        }
    };

    const aiItems = (Array.isArray(suggestions) ? suggestions : []).map(
        (item, index) => ({
            id:          item.vendor_id || `${item.vendor_name}-${index}`,
            vendor:      item.vendor_name || "Unknown vendor",
            amount:      item.suggested_amount || 0,
            priority:    item.priority || "medium",
            reason:      item.reason || "Suggested from billing history.",
            description: item.description || "",
        }),
    );

    return (
        <div className={styles.page}>
            <div className={styles.shell}>

                {/* ── Page header ── */}
                <section className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Bills</h1>
                        <p className={styles.subtitle}>
                            Track payable bills, owed collections, and AI-suggested priorities.
                        </p>
                    </div>
                    <button
                        className={styles.addButton}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} />
                        Add Bill
                    </button>
                </section>

                {/* ── Stats strip ── */}
                <section className={styles.statsRow}>
                    <article className={styles.statCard}>
                        <span className={styles.statLabel}>Total Payable</span>
                        <strong className={styles.statValue}>
                            {formatCurrency(totals.payable)}
                        </strong>
                        <span className={styles.statSub}>
                            across {billsToPayBills.length} bills
                        </span>
                    </article>
                    <article className={styles.statCard}>
                        <span className={styles.statLabel}>Total Receivable</span>
                        <strong className={`${styles.statValue} ${styles.positiveValue}`}>
                            {formatCurrency(totals.receivable)}
                        </strong>
                        <span className={styles.statSub}>
                            from {owedToYouBills.length} parties
                        </span>
                    </article>
                    <article className={styles.statCard}>
                        <span className={styles.statLabel}>Bills Overview</span>
                        <strong className={styles.statValue}>
                            {owedToYouBills.length + billsToPayBills.length}
                        </strong>
                        <span className={styles.statSub}>
                            <Wallet size={13} /> active records
                        </span>
                    </article>
                </section>

                {/* ── Bills grid ── */}
                <section className={styles.billsGrid}>

                    {/* ── Bills to Pay (to_pay_bills) ── */}
                    <div className={styles.billColumn}>
                        <div className={styles.columnHeader}>
                            <div className={styles.columnTitleWrap}>
                                <span className={`${styles.columnDot} ${styles.payDot}`} />
                                <h2 className={styles.columnTitle}>Bills to Pay</h2>
                                <span className={styles.columnCount}>
                                    {billsToPayBills.length}
                                </span>
                            </div>
                        </div>
                        <div className={styles.columnBody}>
                            {loading ? (
                                <div className={styles.emptyState}><p>Loading...</p></div>
                            ) : billsToPayBills.length > 0 ? (
                                billsToPayBills.map((bill) => (
                                    <BillCard
                                        key={bill._id}
                                        bill={{
                                            id:       bill._id,
                                            _id:      bill._id,
                                            vendor:   bill.user_details?.name || "Unknown",
                                            amount:   bill.amount,
                                            dueDate:  bill.createdAt,
                                            priority: bill.is_recurring ? "high" : "low",
                                            status:   bill.status,
                                            category: bill.user_details?.business || "Bill",
                                            vendor_id: bill.user_id, // payer sends money to user_id
                                        }}
                                        type="payable"
                                        onPrimaryAction={setSelectedBill}
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>All bills are settled.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Bills Owed to You (owned_bills) ── */}
                    <div className={styles.billColumn}>
                        <div className={styles.columnHeader}>
                            <div className={styles.columnTitleWrap}>
                                <span className={`${styles.columnDot} ${styles.owedDot}`} />
                                <h2 className={styles.columnTitle}>Bills Owed to You</h2>
                                <span className={styles.columnCount}>
                                    {owedToYouBills.length}
                                </span>
                            </div>
                            <button
                                className={styles.inlineAddButton}
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <Plus size={14} />
                                Add Bill
                            </button>
                        </div>
                        <div className={styles.columnBody}>
                            {loading ? (
                                <div className={styles.emptyState}><p>Loading...</p></div>
                            ) : owedToYouBills.length > 0 ? (
                                owedToYouBills.map((bill) => (
                                    <BillCard
                                        key={bill._id}
                                        bill={{
                                            id:         bill._id,
                                            user:       bill.vendor_details?.name || "Unknown",
                                            amount:     bill.amount,
                                            status:     bill.status,
                                            createdAt:  bill.createdAt,
                                            splitCount: bill.is_split ? 2 : 1,
                                        }}
                                        type="owed"
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No owed bills yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── AI Suggestions ── */}
                <section className={styles.aiSection}>
                    <div className={styles.aiHeader}>
                        <div className={styles.aiIcon}><Sparkles size={16} /></div>
                        <div>
                            <h2 className={styles.aiTitle}>AI Bill Suggestions</h2>
                            <p className={styles.aiSubtitle}>
                                Smart recommendations based on due dates and spend patterns.
                            </p>
                        </div>
                    </div>
                    <AISuggestionPanel suggestions={aiItems} />
                </section>

                {error ? (
                    <div className={styles.emptyState}><p>{error}</p></div>
                ) : null}
            </div>

            {/* ── Add Bill Modal ── */}
            <AddBillModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddBill}
                vendors={vendors}
                users={participants}   // participants = people who can owe you
            />

            {/* ── Pay Confirm Modal ── */}
            <Modal
                isOpen={!!selectedBill}
                onClose={() => setSelectedBill(null)}
                title="Confirm Payment"
            >
                {selectedBill ? (
                    <div className={styles.confirmModal}>
                        <strong className={styles.confirmAmount}>
                            {formatCurrency(selectedBill.amount)}
                        </strong>
                        <p className={styles.confirmText}>
                            Would you like to pay this bill to{" "}
                            <strong>{selectedBill.vendor}</strong> now?
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                className={styles.modalSecondaryButton}
                                onClick={() => setSelectedBill(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.modalPrimaryButton}
                                onClick={confirmPayBill}
                            >
                                Confirm &amp; Pay
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default BillsPage;