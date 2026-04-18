import styles from "./SplitBillComponent.module.css";

const formatAmount = (value) => (value === "" ? "" : Number(value || 0));

const SplitBillComponent = ({
    users = [],
    totalAmount = 0,
    selectedUsers = [],
    splitAmounts = {},
    onToggleUser,
    onAmountChange,
    validationMessage,
}) => {
    const safeUsers = Array.isArray(users) ? users : [];
    const safeSelectedUsers = Array.isArray(selectedUsers) ? selectedUsers : [];
    const totalAssigned = safeSelectedUsers.reduce(
        (sum, userId) => sum + Number(splitAmounts?.[userId] || 0),
        0,
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h3 className={styles.title}>Split bill</h3>
                <span className={styles.summary}>
                    Assigned {totalAssigned.toLocaleString("en-IN")} / {Number(totalAmount || 0).toLocaleString("en-IN")}
                </span>
            </div>

            <div className={styles.userGrid}>
                {safeUsers.map((user) => {
                    const checked = safeSelectedUsers.includes(user.id);

                    return (
                        <label key={user.id} className={`${styles.userCard} ${checked ? styles.userCardActive : ""}`}>
                            <div className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => onToggleUser?.(user.id)}
                                />
                                <span>{user.name}</span>
                            </div>

                            <input
                                className={styles.amountInput}
                                type="number"
                                min="0"
                                step="1"
                                disabled={!checked}
                                value={checked ? formatAmount(splitAmounts?.[user.id]) : ""}
                                onChange={(event) => onAmountChange?.(user.id, event.target.value)}
                                placeholder="Amount"
                            />
                        </label>
                    );
                })}
            </div>

            {validationMessage ? <p className={styles.error}>{validationMessage}</p> : null}
        </div>
    );
};

export default SplitBillComponent;
