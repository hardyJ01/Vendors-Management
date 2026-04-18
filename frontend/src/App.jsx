import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BillsPage from "./pages/BillsPage/BillsPage";
import PaymentsPage from "./pages/PaymentsPage/PaymentsPage";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import "./styles/globals.css";

function App() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "dark";
        return window.localStorage.getItem("awt-theme") || "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        window.localStorage.setItem("awt-theme", theme);
    }, [theme]);

    return (
        <BrowserRouter>
            <ThemeToggle
                theme={theme}
                onToggle={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
            />
            <Routes>
                <Route path="/bills" element={<BillsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App
