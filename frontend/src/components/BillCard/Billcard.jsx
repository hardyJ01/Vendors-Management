import { ArrowRight, CalendarDays, Users } from "lucide-react";
import styles from "./Billcard.module.css";

const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

const formatDate = (value) => {
    if (!value) return "No date available";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const priorityMap = {
    high: { label: "Highly Recommended", className: "priorityHigh" },
    low: { label: "Low Priority", className: "priorityLow" },
    medium: { label: "Recommended", className: "priorityMedium" },
};

const BillCard = ({ bill = {}, type = "payable", onPrimaryAction }) => {
    const entityName = type === "payable" ? bill.vendor || "Unknown vendor" : bill.user || "Unknown user";
    const metaLabel = type === "payable" ? bill.category || "Vendor bill" : `${bill.splitCount || 1} participant${bill.splitCount > 1 ? "s" : ""}`;
    const status = bill.status || "Pending";
    const priority = priorityMap[bill.priority] || null;

    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <div className={styles.identity}>
                    <div className={styles.avatar}>{entityName.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3 className={styles.name}>{entityName}</h3>
                        <p className={styles.meta}>{metaLabel}</p>
                    </div>
                </div>

                <div className={styles.amountBlock}>
                    <strong className={styles.amount}>{formatCurrency(bill.amount)}</strong>
                    <span className={styles.statusBadge}>{status}</span>
                </div>
            </div>

            <div className={styles.detailRow}>
                <span className={styles.detailItem}>
                    <CalendarDays size={14} />
                    {type === "payable" ? `Due ${formatDate(bill.dueDate)}` : `Created ${formatDate(bill.createdAt)}`}
                </span>

                {type === "owed" ? (
                    <span className={styles.detailItem}>
                        <Users size={14} />
                        {bill.splitCount || 1} split
                    </span>
                ) : null}
            </div>

            {type === "payable" ? (
                <div className={styles.footer}>
                    <div className={styles.badges}>
                        {priority ? (
                            <span className={`${styles.priorityBadge} ${styles[priority.className]}`}>
                                {priority.label}
                            </span>
                        ) : null}
                    </div>
                    <button className={styles.primaryAction} onClick={() => onPrimaryAction?.(bill)}>
                        Pay Now
                        <ArrowRight size={16} />
                    </button>
                </div>
            ) : (
                <div className={styles.footer}>
                    <p className={styles.owedHint}>
                        {bill.vendor ? `Raised for ${bill.vendor}` : "Track incoming collection from your contact."}
                    </p>
                </div>
            )}
        </article>
    );
};

export default BillCard;
