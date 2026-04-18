import styles from "./Paymentcard.module.css";

const PaymentCard = ({ payment }) => {
    const amount = payment.amount?.toLocaleString("en-IN", { style: "currency", currency: "INR" });
    const date = new Date(payment.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
    const time = new Date(payment.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <div className={styles.card}>
            <div className={styles.iconWrap}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22V12m0 0L8 16m4-4 4 4M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"/>
                </svg>
            </div>
            <div className={styles.info}>
                <h4 className={styles.vendorName}>{payment.vendor_details?.name || "Unknown Vendor"}</h4>
                <span className={styles.business}>{payment.vendor_details?.business || ""}</span>
            </div>
            <div className={styles.right}>
                <span className={styles.amount}>- {amount}</span>
                <span className={styles.date}>{date} · {time}</span>
            </div>
        </div>
    );
};

export default PaymentCard;