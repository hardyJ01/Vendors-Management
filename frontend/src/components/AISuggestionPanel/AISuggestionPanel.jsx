import { Sparkles } from "lucide-react";
import styles from "./AISuggestionPanel.module.css";

const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

const priorityClassName = {
    high: "high",
    medium: "medium",
    low: "low",
};

const AISuggestionPanel = ({ suggestions = [] }) => {
    const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

    return (
        <section className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.headerBadge}>
                    <Sparkles size={15} />
                    AI Suggestions
                </div>
                <h2 className={styles.title}>Recommended bills to pay next</h2>
            </div>

            <div className={styles.list}>
                {safeSuggestions.length > 0 ? (
                    safeSuggestions.map((item, index) => (
                        <article
                            key={item.id || `${item.vendor}-${index}`}
                            className={`${styles.card} ${index === 0 ? styles.featured : ""}`}
                        >
                            <div className={styles.cardTop}>
                                <div>
                                    <h3 className={styles.vendor}>{item.vendor || "Unknown vendor"}</h3>
                                    <p className={styles.reason}>{item.reason || "No reason provided."}</p>
                                </div>
                                <span className={`${styles.priority} ${styles[priorityClassName[item.priority] || "medium"]}`}>
                                    {item.priority === "high" ? "High" : item.priority === "low" ? "Low" : "Medium"}
                                </span>
                            </div>
                            <strong className={styles.amount}>{formatCurrency(item.amount)}</strong>
                        </article>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <p>No AI suggestions available right now.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AISuggestionPanel;
