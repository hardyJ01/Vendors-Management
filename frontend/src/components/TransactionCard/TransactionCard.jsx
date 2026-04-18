import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import styles from "./TransactionCard.module.css";

const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

const formatDateTime = (value) =>
    new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const TransactionCard = ({ transaction = {}, direction = "outgoing" }) => {
    const isIncoming = direction === "incoming";

    return (
        <article className={styles.card}>
            <div className={`${styles.iconWrap} ${isIncoming ? styles.incoming : styles.outgoing}`}>
                {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
            </div>
            <div className={styles.info}>
                <h4 className={styles.name}>{transaction.counterparty || transaction.vendor || "Unknown"}</h4>
                <p className={styles.note}>{transaction.note || "Payment activity"}</p>
            </div>
            <div className={styles.meta}>
                <strong className={`${styles.amount} ${isIncoming ? styles.amountIn : styles.amountOut}`}>
                    {isIncoming ? "+" : "-"} {formatCurrency(transaction.amount)}
                </strong>
                <span className={styles.date}>{formatDateTime(transaction.createdAt)}</span>
            </div>
        </article>
    );
};

export default TransactionCard;
