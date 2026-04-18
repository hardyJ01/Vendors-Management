import { useState, useEffect } from "react";
import { dashboard } from "../services/api/dashboard";

export function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [pending_bill_amount, setPending_bill_amount] = useState(0);
  const [owed_bill_amount, setOwed_bill_amount] = useState(0);
  const [money_spent_in_month, setMoney_spent_in_month] = useState(0);
  const [pendingBills, setPendingBills] = useState([]);
  const [owedBills, setOwedBills] = useState([]);
  const [spendGraph, setSpendGraph] = useState([]);
  const [receivedGraph, setReceivedGraph] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashData = dashboard();
        setBalance(dashData.balance || 0);
        setPending_bill_amount(dashData.pending_amount || 0);
        setOwed_bill_amount(dashData.owed_amount || 0);
        setMoney_spent_in_month(dashData.spent_this_month || 0);

        // Current month daily spending data
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const spendData = [];
        const receivedData = [];
        for (let d = 1; d <= currentDay; d++) {
          spendData.push({ day: d, amount: Math.floor(Math.random() * 800 + 100) });
          receivedData.push({ day: d, amount: Math.floor(Math.random() * 600 + 50) });
        }
        setSpendGraph(spendData);
        setReceivedGraph(receivedData);

        setPendingBills([
          { vendor_name: "TechParts Co.", amount: 4500, date: "2026-04-10" },
          { vendor_name: "FastShip Inc.", amount: 2200, date: "2026-04-08" },
          { vendor_name: "PrintWorld", amount: 850, date: "2026-04-05" },
        ]);
        setOwedBills([
          { vendor_name: "CloudSoft Ltd.", amount: 6700, date: "2026-04-09" },
          { vendor_name: "MetaDesigns", amount: 3100, date: "2026-04-06" },
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (val) =>
    "\u20B9" + Number(val).toLocaleString("en-IN");

  const maxSpend = Math.max(...spendGraph.map((d) => d.amount), 1);
  const maxReceived = Math.max(...receivedGraph.map((d) => d.amount), 1);

  const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Loading your financial overview...</p>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header fade-in">
        <h1>Dashboard</h1>
        <p>Your financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card balance fade-in fade-in-delay-1">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value">{formatCurrency(balance)}</div>
        </div>
        <div className="glass-card stat-card pending fade-in fade-in-delay-2">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="stat-label">Pending Bills</div>
          <div className="stat-value">{formatCurrency(pending_bill_amount)}</div>
        </div>
        <div className="glass-card stat-card owed fade-in fade-in-delay-3">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div className="stat-label">Owed to You</div>
          <div className="stat-value">{formatCurrency(owed_bill_amount)}</div>
        </div>
        <div className="glass-card stat-card spent fade-in fade-in-delay-4">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
          </div>
          <div className="stat-label">Spent This Month</div>
          <div className="stat-value">{formatCurrency(money_spent_in_month)}</div>
        </div>
      </div>

      {/* Charts — current month */}
      <div className="chart-container fade-in">
        <div className="chart-grid">
          <div className="glass-card chart-card">
            <div className="section-title">
              <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Spending — {monthName}
            </div>
            <div className="bar-chart">
              {spendGraph.map((d, i) => (
                <div className="bar-col" key={i}>
                  <div
                    className="bar spend"
                    style={{ height: `${(d.amount / maxSpend) * 100}%` }}
                    title={`Day ${d.day}: ${formatCurrency(d.amount)}`}
                  />
                  <div className="bar-label">{d.day}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card chart-card">
            <div className="section-title">
              <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Received — {monthName}
            </div>
            <div className="bar-chart">
              {receivedGraph.map((d, i) => (
                <div className="bar-col" key={i}>
                  <div
                    className="bar received"
                    style={{ height: `${(d.amount / maxReceived) * 100}%` }}
                    title={`Day ${d.day}: ${formatCurrency(d.amount)}`}
                  />
                  <div className="bar-label">{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Bills Table */}
      <div className="fade-in">
        <div className="section-title">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Pending Bills
        </div>
        <div className="glass-card data-table-wrapper">
          {pendingBills.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills.map((bill, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{bill.vendor_name}</td>
                    <td>{formatCurrency(bill.amount)}</td>
                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                    <td><span className="status-badge pending">Pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>No Pending Bills</h3>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Owed Bills Table */}
      <div className="fade-in">
        <div className="section-title">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Bills Owed to You
        </div>
        <div className="glass-card data-table-wrapper">
          {owedBills.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {owedBills.map((bill, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{bill.vendor_name}</td>
                    <td>{formatCurrency(bill.amount)}</td>
                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                    <td><span className="status-badge pending">Pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>No Owed Bills</h3>
              <p>Nobody owes you at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}