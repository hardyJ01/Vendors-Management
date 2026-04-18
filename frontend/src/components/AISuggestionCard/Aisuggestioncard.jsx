import styles from "./Aisuggestioncard.module.css";

const AISuggestionCard = ({ suggestion, onUse }) => {
    const amount = suggestion.suggested_amount?.toLocaleString("en-IN", {
        style: "currency", currency: "INR",
    });
    const confidencePct = Math.round((suggestion.confidence || 0) * 100);

    const confidenceColor =
        confidencePct >= 80 ? "#34d399" :
        confidencePct >= 50 ? "#fbbf24" : "#f87171";

    return (
        <div className={styles.card}>
            <div className={styles.glowBar} style={{ background: confidenceColor }} />
            <div className={styles.inner}>
                <div className={styles.topRow}>
                    <div className={styles.aiChip}>
                        <span className={styles.aiDot} />
                        AI Suggestion
                    </div>
                    <div className={styles.confidence} style={{ color: confidenceColor }}>
                        {confidencePct}% match
                    </div>
                </div>

                <h4 className={styles.vendorName}>{suggestion.vendor_name}</h4>
                <p className={styles.reason}>{suggestion.reason}</p>

                <div className={styles.footer}>
                    <div className={styles.meta}>
                        <span className={styles.amount}>{amount}</span>
                        {suggestion.is_recurring && (
                            <span className={styles.chip}>{suggestion.suggested_frequency}</span>
                        )}
                    </div>
                    <button className={styles.useBtn} onClick={() => onUse(suggestion)}>
                        Use Suggestion →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AISuggestionCard;