import { Moon, Sun } from "lucide-react";
import styles from "./ThemeToggle.module.css";

const ThemeToggle = ({ theme = "dark", onToggle }) => (
    <button className={styles.toggle} onClick={onToggle} aria-label="Toggle theme">
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
    </button>
);

export default ThemeToggle;
