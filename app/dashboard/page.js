"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#f5c842", "#4e9ef5", "#4ecb71", "#ff6b6b", "#a78bfa", "#fb923c", "#34d399", "#f472b6"];

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ sales: 0, purchase: 0, outstanding: 0, profit: 0 });
  const [tally, setTally] = useState({ monthly: [], party: [], type: [] });
  const [fmcg, setFmcg] = useState({ invoices: 0, qty: 0, parties: 0, monthly: [], product: [], city: [] });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
    fetch("/api/stats").then((r) => r.json()).then((d) => {
      setStats(d.stats || { sales: 0, purchase: 0, outstanding: 0, profit: 0 });
      setTally(d.tally || { monthly: [], party: [], type: [] });
      setFmcg(d.fmcg || { invoices: 0, qty: 0, parties: 0, monthly: [], product: [], city: [] });
    });
  }, []);

  const hasTally = stats.sales > 0 || stats.purchase > 0 || stats.outstanding > 0;
  const hasFmcg = fmcg.invoices > 0;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .dash-greeting { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; }
        .dash-sub { font-size: 14px; color: #706e6a; font-weight: 300; margin-bottom: 32px; }
        .section-label { font-size: 11px; color: #f5c842; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; margin-top: 32px; font-weight: 400; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .stats-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 24px; transition: border-color 0.2s; }
        .stat-box:hover { border-color: rgba(245,200,66,0.2); }
        .stat-label { font-size: 11px; color: #706e6a; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; line-height: 1; }
        .chart-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 28px; margin-bottom: 20px; }
        .chart-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #f0ede8; margin-bottom: 20px; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
        .bottom-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 28px; }
        .bottom-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #f0ede8; margin-bottom: 20px; }
        .upload-hint { border: 2px dashed rgba(245,200,66,0.2); border-radius: 8px; padding: 32px; text-align: center; color: #706e6a; font-size: 14px; font-weight: 300; cursor: pointer; transition: border-color 0.2s; }
        .upload-hint:hover { border-color: rgba(245,200,66,0.5); color: #f5c842; }
        .report-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .report-row:last-child { border-bottom: none; }
        .report-name { font-size: 14px; color: #f0ede8; font-weight: 400; }
        .report-link { font-size: 12px; color: #f5c842; cursor: pointer; }
        .report-link:hover { text-decoration: underline; }
        .empty-state { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 48px; text-align: center; color: #706e6a; font-size: 14px; font-weight: 300; margin-bottom: 20px; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stats-grid-3 { grid-template-columns: 1fr 1fr; }
          .charts-grid { grid-template-columns: 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-greeting">
        {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
      </div>
      <div className="dash-sub">Here is your business overview for today.</div>

      <div className="section-label">Tally / ERP Data</div>
      {hasTally ? (
        <>
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
            <div className="chart-title">Monthly Sales vs Purchase</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={tally.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#706e6a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#706e6a" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0ede8" }} formatter={(v) => [`Rs. ${(v / 100000).toFixed(2)}L`]} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#f5c842" strokeWidth={2} dot={false} name="Sales" />
                <Line type="monotone" dataKey="purchase" stroke="#4e9ef5" strokeWidth={2} dot={false} name="Purchase" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="charts-grid">
            <div className="chart-box">
              <div className="chart-title">Top 10 Parties — Sales</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={tally.party} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#706e6a" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="party" stroke="#706e6a" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0ede8" }} formatter={(v) => [`Rs. ${(v / 100000).toFixed(2)}L`]} />
                  <Bar dataKey="total" fill="#f5c842" radius={[0, 4, 4, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <div className="chart-title">Sales / Purchase / Outstanding</div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={tally.type} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {tally.type.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0ede8" }} formatter={(v) => [`Rs. ${(v / 100000).toFixed(2)}L`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">No Tally data uploaded yet. Upload a file to see stats.</div>
      )}

      <div className="section-label">FMCG Sales Data</div>
      {hasFmcg ? (
        <>
          <div className="stats-grid-3">
            <div className="stat-box">
              <div className="stat-label">Total Invoices</div>
              <div className="stat-value" style={{ color: "#f5c842" }}>{fmcg.invoices.toLocaleString("en-IN")}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Qty (Boxes)</div>
              <div className="stat-value" style={{ color: "#f0ede8" }}>{fmcg.qty.toLocaleString("en-IN")}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Active Parties</div>
              <div className="stat-value" style={{ color: "#4ecb71" }}>{fmcg.parties.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div className="chart-box">
            <div className="chart-title">Monthly Invoice Volume & Qty</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={fmcg.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#706e6a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#706e6a" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0ede8" }} />
                <Legend />
                <Line type="monotone" dataKey="invoices" stroke="#4e9ef5" strokeWidth={2} dot={false} name="Invoices" />
                <Line type="monotone" dataKey="qty" stroke="#f5c842" strokeWidth={2} dot={false} name="Total Qty" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="charts-grid">
            <div className="chart-box">
              <div className="chart-title">Top 10 Products — Qty Sold</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={fmcg.product}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#706e6a" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis stroke="#706e6a" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0ede8" }} />
                  <Bar dataKey="value" fill="#4e9ef5" radius={[4, 4, 0, 0]} name="Qty" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <div className="chart-title">City-wise Sales Distribution</div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={fmcg.city} dataKey="total_qty" nameKey="city" cx="50%" cy="50%" outerRadius={80} label={({ city, percent }) => `${city} ${(percent * 100).toFixed(0)}%`}>
                    {fmcg.city.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0ede8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">No FMCG data uploaded yet. Upload FMCG Excel to see stats.</div>
      )}

      <div className="bottom-grid">
        <div className="bottom-box">
          <div className="bottom-title">Upload Data</div>
          <div className="upload-hint" onClick={() => window.location.href = "/dashboard/upload"}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>[+]</div>
            <div>Drop your CSV or Excel file here</div>
            <div style={{ fontSize: "12px", marginTop: "6px" }}>Tally, Busy, Marg, FMCG supported</div>
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