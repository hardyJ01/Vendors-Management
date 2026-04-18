import { useEffect, useMemo, useState } from "react";
import { Landmark, ListCollapse, PlusCircle } from "lucide-react";
import Modal from "../../components/Modal/Modal";
import TransactionCard from "../../components/TransactionCard/TransactionCard";
import { useBills } from "../../hooks/useBills";
import { usePayments } from "../../hooks/usePayments";
import styles from "./Paymentspage.module.css";

const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

const groupBillsByVendor = (bills) =>
    bills.reduce((groups, bill) => {
        const key = bill?.vendor_details?.name || "Unknown Vendor";
        return {
            ...groups,
            [key]: [...(groups[key] || []), bill],
        };
    }, {});

const PaymentsPage = () => {
    const { bills, loading: billsLoading, error: billsError, fetchBills } = useBills();
    const { payments, loading: paymentsLoading, error: paymentsError, fetchPayments, sendPayment } = usePayments();
    const [selectedVendor, setSelectedVendor] = useState("");
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        fetchBills("all");
        fetchPayments();
    }, [fetchBills, fetchPayments]);

    const payableBills = useMemo(
        () => (Array.isArray(bills?.owned_bills) ? bills.owned_bills.filter((bill) => bill.status === "pending") : []),
        [bills],
    );
    const incomingBills = useMemo(
        () => (Array.isArray(bills?.to_pay_bills) ? bills.to_pay_bills.filter((bill) => bill.status === "done") : []),
        [bills],
    );
    const outgoingPayments = useMemo(
        () => (Array.isArray(payments) ? payments : []),
        [payments],
    );

    const vendorGroups = useMemo(() => groupBillsByVendor(payableBills), [payableBills]);
    const vendorNames = Object.keys(vendorGroups);
    const activeVendor = selectedVendor && vendorNames.includes(selectedVendor) ? selectedVendor : vendorNames[0] || "";
    const selectedVendorBills = activeVendor ? vendorGroups[activeVendor] || [] : [];

    const totalSpent = outgoingPayments.reduce((sum, payment) => sum + Number(payment?.amount || 0), 0);
    const lastPaymentDate = outgoingPayments[0]?.createdAt
        ? new Date(outgoingPayments[0].createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "—";

    const incomingTransactions = incomingBills.map((bill) => ({
        id: bill._id,
        counterparty: bill.user_details?.name || "Unknown user",
        amount: bill.amount,
        createdAt: bill.updatedAt || bill.createdAt,
        note: `Received for ${bill.user_details?.business || "settled bill"}`,
    }));

    const confirmPay = async () => {
        if (!selectedBill?._id) return;
        const success = await sendPayment({
            vendor_id: selectedBill.vendor_id,
            amount: selectedBill.amount,
            bill_id: selectedBill._id,
        });

        if (success) {
            await Promise.all([fetchBills("all"), fetchPayments()]);
            setSelectedBill(null);
        }
    };

    const pageError = billsError || paymentsError;
    const pageLoading = billsLoading || paymentsLoading;

    return (
        <div className={styles.page}>
            <div className={styles.shell}>
                <section className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Payments</h1>
                        <p className={styles.subtitle}>Review vendor dues, settle bills, and track incoming and outgoing money.</p>
                    </div>
                    <button
                        className={styles.topButton}
                        onClick={() => setSelectedVendor(vendorNames[0] || "")}
                    >
                        <PlusCircle size={16} />
                        Make Payment
                    </button>
                </section>

                <section className={styles.statsRow}>
                    <article className={styles.statCard}>
                        <span className={styles.statLabel}>Total Payments</span>
                        <strong className={styles.statValue}>{outgoingPayments.length}</strong>
                    </article>
                    <article className={styles.statCard}>
                        <span className={styles.statLabel}>Total Spent</span>
                        <strong className={styles.statValue}>{formatCurrency(totalSpent)}</strong>
                    </article>
                    <article className={styles.statCard}>
                        <span className={styles.statLabel}>Last Payment</span>
                        <strong className={styles.statValue}>{lastPaymentDate}</strong>
                    </article>
                </section>

                <section className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIntro}>
                            <div className={styles.sectionIcon}><ListCollapse size={18} /></div>
                            <div>
                                <h2 className={styles.sectionTitle}>Vendor payment dues</h2>
                                <p className={styles.sectionText}>Choose one vendor from the dropdown to view only that vendor’s pending bills.</p>
                            </div>
                        </div>
                    </div>

                    {vendorNames.length > 0 ? (
                        <>
                            <div className={styles.vendorFilterRow}>
                                <label className={styles.vendorLabel}>Select vendor</label>
                                <select
                                    className={styles.vendorSelect}
                                    value={activeVendor}
                                    onChange={(event) => setSelectedVendor(event.target.value)}
                                >
                                    {vendorNames.map((vendor) => (
                                        <option key={vendor} value={vendor}>{vendor}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.vendorList}>
                                {selectedVendorBills.length > 0 ? selectedVendorBills.map((bill) => (
                                    <div key={bill._id} className={styles.vendorBillCard}>
                                        <div>
                                            <h3 className={styles.vendorBillTitle}>{bill.vendor_details?.business || "Vendor bill"}</h3>
                                            <p className={styles.vendorBillMeta}>
                                                Due {new Date(bill.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                        </div>
                                        <div className={styles.vendorBillAction}>
                                            <strong className={styles.vendorBillAmount}>{formatCurrency(bill.amount)}</strong>
                                            <button className={styles.payInlineButton} onClick={() => setSelectedBill(bill)}>Pay</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className={styles.emptyState}>No pending bills for the selected vendor.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>No pending vendor dues right now.</div>
                    )}
                </section>

                <section className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIntro}>
                            <div className={styles.sectionIcon}><Landmark size={18} /></div>
                            <div>
                                <h2 className={styles.sectionTitle}>Payment history</h2>
                                <p className={styles.sectionText}>Incoming and outgoing money shown separately for easier review.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.historyGrid}>
                        <div className={styles.historyColumn}>
                            <div className={styles.historyHeader}>
                                <h3 className={styles.historyTitle}>Outgoing</h3>
                                <span className={styles.historyCount}>{outgoingPayments.length}</span>
                            </div>
                            <div className={styles.historyList}>
                                {outgoingPayments.length > 0 ? outgoingPayments.map((payment) => (
                                    <TransactionCard
                                        key={payment._id || payment.id}
                                        transaction={{
                                            id: payment._id || payment.id,
                                            counterparty: payment.vendor_details?.name || "Unknown vendor",
                                            amount: payment.amount,
                                            createdAt: payment.createdAt,
                                            note: payment.vendor_details?.business || "Vendor payment",
                                        }}
                                        direction="outgoing"
                                    />
                                )) : (
                                    <div className={styles.emptyState}>No outgoing payments yet.</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.historyColumn}>
                            <div className={styles.historyHeader}>
                                <h3 className={styles.historyTitle}>Incoming</h3>
                                <span className={styles.historyCount}>{incomingTransactions.length}</span>
                            </div>
                            <div className={styles.historyList}>
                                {incomingTransactions.length > 0 ? incomingTransactions.map((payment) => (
                                    <TransactionCard key={payment.id} transaction={payment} direction="incoming" />
                                )) : (
                                    <div className={styles.emptyState}>No incoming payments yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {pageLoading ? <div className={styles.emptyState}>Loading payment data...</div> : null}
                {pageError ? <div className={styles.emptyState}>{pageError}</div> : null}
            </div>

            <Modal isOpen={!!selectedBill} onClose={() => setSelectedBill(null)} title="Confirm Payment">
                {selectedBill ? (
                    <div className={styles.confirmModal}>
                        <strong className={styles.confirmAmount}>{formatCurrency(selectedBill.amount)}</strong>
                        <p className={styles.confirmText}>Would you like to pay the bill for <strong>{selectedBill.vendor_details?.name || "this vendor"}</strong>?</p>
                        <div className={styles.confirmActions}>
                            <button className={styles.secondaryButton} onClick={() => setSelectedBill(null)}>Cancel</button>
                            <button className={styles.primaryButton} onClick={confirmPay}>Confirm &amp; Pay</button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default PaymentsPage;