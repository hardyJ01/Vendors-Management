import { ChevronDown, Receipt, Wallet } from "lucide-react";
import styles from "./PaymentVendorAccordion.module.css";

const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const PaymentVendorAccordion = ({
    vendor,
    bills = [],
    isOpen,
    onToggle,
    onPayBill,
}) => {
    const safeBills = Array.isArray(bills) ? bills : [];
    const total = safeBills.reduce((sum, bill) => sum + Number(bill?.amount || 0), 0);

    return (
        <article className={styles.card}>
            <button className={styles.header} onClick={onToggle}>
                <div className={styles.identity}>
                    <div className={styles.iconWrap}><Wallet size={16} /></div>
                    <div>
                        <h3 className={styles.vendor}>{vendor}</h3>
                        <p className={styles.meta}>{safeBills.length} due item{safeBills.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <div className={styles.summary}>
                    <strong className={styles.total}>{formatCurrency(total)}</strong>
                    <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} />
                </div>
            </button>

            {isOpen ? (
                <div className={styles.body}>
                    {safeBills.map((bill) => (
                        <div key={bill.id} className={styles.billRow}>
                            <div className={styles.billInfo}>
                                <span className={styles.billCategory}><Receipt size={14} /> {bill.category}</span>
                                <span className={styles.billDate}>Due {formatDate(bill.dueDate)}</span>
                            </div>
                            <div className={styles.billAction}>
                                <strong className={styles.billAmount}>{formatCurrency(bill.amount)}</strong>
                                <button className={styles.payButton} onClick={() => onPayBill?.(bill)}>
                                    Pay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </article>
    );
};

export default PaymentVendorAccordion;
