"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PurchasePage() {
  const [partywise, setPartywise] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [summary, setSummary] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("party");

  useEffect(() => { fetchData(); }, [from, to]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/purchase?${params.toString()}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setPartywise(json.partywise || []);
      setMonthly(json.monthly || []);
      setSummary(json.summary || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatINR(n) {
    const num = Number(n);
    if (!n || isNaN(num)) return "₹0";
    return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }

  const maxMonthly = Math.max(...monthly.map((m) => Number(m.total_purchase)), 1);

  const s = {
    page:    { fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "24px" },
    header:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    title:   { fontSize: 22, fontWeight: 700, color: "#1e293b" },
    cards:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 24 },
    card:    { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    label:   { fontSize: 13, color: "#64748b", marginBottom: 6 },
    value:   { fontSize: 22, fontWeight: 700, color: "#1e293b" },
    filters: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
    input:   { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" },
    tabs:    { display: "flex", gap: 8, marginBottom: 20 },
    tab: (a) => ({ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, background: a ? "#2563eb" : "#e2e8f0", color: a ? "#fff" : "#475569", fontWeight: a ? 600 : 400 }),
    table:   { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    th:      { background: "#f1f5f9", padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" },
    td:      { padding: "12px 16px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
    empty:   { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>🛒 Purchase Insights</div>
        <Link href="/dashboard" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none" }}>← Dashboard</Link>
      </div>

      {summary && (
        <div style={s.cards}>
          <div style={s.card}>
            <div style={s.label}>Total Purchase</div>
            <div style={{ ...s.value, color: "#2563eb" }}>{formatINR(summary.total_purchase)}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>Total Invoices</div>
            <div style={s.value}>{summary.total_invoices || 0}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>Suppliers</div>
            <div style={s.value}>{summary.total_suppliers || 0}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>Avg per Invoice</div>
            <div style={{ ...s.value, color: "#7c3aed" }}>{formatINR(summary.avg_purchase)}</div>
          </div>
        </div>
      )}

      <div style={s.filters}>
        <input type="date" style={s.input} value={from} onChange={(e) => setFrom(e.target.value)} />
        <span style={{ fontSize: 14, color: "#94a3b8" }}>से</span>
        <input type="date" style={s.input} value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={() => { setFrom(""); setTo(""); }}
          style={{ ...s.input, cursor: "pointer", background: "#f1f5f9", color: "#475569" }}>Reset</button>
      </div>

      <div style={s.tabs}>
        <button style={s.tab(activeTab === "party")} onClick={() => setActiveTab("party")}>Supplier-wise</button>
        <button style={s.tab(activeTab === "monthly")} onClick={() => setActiveTab("monthly")}>Monthly Trend</button>
      </div>

      {loading ? (
        <div style={s.empty}>लोड हो रहा है...</div>
      ) : activeTab === "party" ? (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>#</th>
              <th style={s.th}>Supplier</th>
              <th style={s.th}>Total Purchase</th>
              <th style={s.th}>Invoices</th>
              <th style={s.th}>Last Purchase</th>
            </tr>
          </thead>
          <tbody>
            {partywise.length === 0 ? (
              <tr><td colSpan={5} style={s.empty}>कोई purchase data नहीं</td></tr>
            ) : partywise.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                <td style={{ ...s.td, color: "#94a3b8" }}>{i + 1}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{row.party}</td>
                <td style={{ ...s.td, color: "#2563eb", fontWeight: 600 }}>{formatINR(row.total_purchase)}</td>
                <td style={s.td}>{row.invoice_count}</td>
                <td style={{ ...s.td, color: "#64748b", fontSize: 13 }}>
                  {row.last_purchase ? new Date(row.last_purchase).toLocaleDateString("en-IN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {monthly.length === 0 ? (
            <div style={s.empty}>कोई monthly data नहीं</div>
          ) : monthly.map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 80, fontSize: 13, color: "#64748b", flexShrink: 0 }}>{row.month}</div>
              <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 6, height: 28, overflow: "hidden" }}>
                <div style={{
                  width: `${(Number(row.total_purchase) / maxMonthly) * 100}%`,
                  background: "#2563eb", height: "100%", borderRadius: 6,
                  minWidth: 4, transition: "width 0.3s",
                }} />
              </div>
              <div style={{ width: 110, fontSize: 13, fontWeight: 600, color: "#1e293b", textAlign: "right", flexShrink: 0 }}>
                {formatINR(row.total_purchase)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}