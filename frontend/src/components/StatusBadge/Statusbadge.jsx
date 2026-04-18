import styles from "./StatusBadge.module.css";

const StatusBadge = ({ status }) => {
    return (
        <span className={`${styles.badge} ${styles[status]}`}>
            {status}
        </span>
    );
};

export default StatusBadge;