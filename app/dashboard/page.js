"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ sales: 0, purchase: 0, outstanding: 0, profit: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));

    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setChartData(d.chart);
      });
  }, []);

  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const maxBar = chartData.length > 0 ? Math.max(...chartData.map((c) => c.total)) : 1;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .dash-header { margin-bottom: 32px; }
        .dash-greeting { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; }
        .dash-sub { font-size: 14px; color: #706e6a; font-weight: 300; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 24px; transition: border-color 0.2s; }
        .stat-box:hover { border-color: rgba(245,200,66,0.2); }
        .stat-label { font-size: 11px; color: #706e6a; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; line-height: 1; }
        .chart-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 28px; margin-bottom: 28px; }
        .chart-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #f0ede8; margin-bottom: 24px; }
        .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 160px; }
        .chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
        .chart-bar { width: 100%; background: linear-gradient(180deg, #f5c842, rgba(245,200,66,0.2)); border-radius: 3px 3px 0 0; transition: height 0.4s ease; }
        .chart-month { font-size: 10px; color: #706e6a; letter-spacing: 0.5px; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .bottom-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 28px; }
        .bottom-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #f0ede8; margin-bottom: 20px; }
        .upload-hint { border: 2px dashed rgba(245,200,66,0.2); border-radius: 8px; padding: 32px; text-align: center; color: #706e6a; font-size: 14px; font-weight: 300; cursor: pointer; transition: border-color 0.2s; }
        .upload-hint:hover { border-color: rgba(245,200,66,0.5); color: #f5c842; }
        .report-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .report-row:last-child { border-bottom: none; }
        .report-name { font-size: 14px; color: #f0ede8; font-weight: 400; }
        .report-link { font-size: 12px; color: #f5c842; cursor: pointer; }
        .report-link:hover { text-decoration: underline; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-header">
        <div className="dash-greeting">
          {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
        </div>
        <div className="dash-sub">Here is your business overview for today.</div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value" style={{ color: "#f5c842" }}>Rs. {(stats.sales / 100000).toFixed(1)}L</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Purchase</div>
          <div className="stat-value" style={{ color: "#f0ede8" }}>Rs. {(stats.purchase / 100000).toFixed(1)}L</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value" style={{ color: "#ff6b6b" }}>Rs. {(stats.outstanding / 100000).toFixed(1)}L</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Net Profit</div>
          <div className="stat-value" style={{ color: "#4ecb71" }}>Rs. {(stats.profit / 100000).toFixed(1)}L</div>
        </div>
      </div>

      <div className="chart-box">
        <div className="chart-title">Monthly Sales Overview</div>
        <div className="chart-bars">
          {months.map((m, i) => {
            const found = chartData.find((c) => c.month === i + 4 || c.month === i - 8);
            const h = found ? (found.total / maxBar) * 100 : 4;
            return (
              <div key={m} className="chart-col">
                <div className="chart-bar" style={{ height: `${h}%` }}></div>
                <div className="chart-month">{m}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="bottom-box">
          <div className="bottom-title">Upload Data</div>
          <div className="upload-hint" onClick={() => window.location.href = "/dashboard/upload"}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>[+]</div>
            <div>Drop your CSV or Excel file here</div>
            <div style={{ fontSize: "12px", marginTop: "6px" }}>Tally, Busy, Marg supported</div>
          </div>
        </div>
        <div className="bottom-box">
          <div className="bottom-title">Quick Reports</div>
          {[
            { name: "Sales Report", href: "/dashboard/reports/sales" },
            { name: "Purchase Report", href: "/dashboard/reports/purchase" },
            { name: "Party Ledger", href: "/dashboard/reports/ledger" },
            { name: "P&L Statement", href: "/dashboard/reports/pnl" },
          ].map((r) => (
            <div key={r.name} className="report-row">
              <div className="report-name">{r.name}</div>
              <div className="report-link" onClick={() => window.location.href = r.href}>View &rarr;</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}