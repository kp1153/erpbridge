"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function OutstandingPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [aging, setAging] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("outstanding");
  const [waLoading, setWaLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, [from, to]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const [outRes, agingRes] = await Promise.all([
        fetch(`/api/outstanding?${params.toString()}`),
        fetch("/api/outstanding/aging"),
      ]);

      if (!outRes.ok || !agingRes.ok) throw new Error("API error");

      const outJson = await outRes.json();
      const agingJson = await agingRes.json();

      setData(outJson.outstanding || []);
      setSummary(outJson.summary || null);
      setAging(agingJson.aging || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function sendWhatsApp(party, balance, phone = "") {
    setWaLoading(party);
    try {
      const res = await fetch("/api/outstanding/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party, balance, phone }),
      });
      const json = await res.json();
      if (json.waUrl) {
        window.open(json.waUrl, "_blank");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(null);
    }
  }

  function formatINR(n) {
    const num = Number(n);
    if (!n || isNaN(num)) return "₹0";
    return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }

  function daysSince(dateStr) {
    if (!dateStr) return "—";
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days === 0) return "आज";
    return `${days} दिन पहले`;
  }

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
    tab: (a) => ({
      padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
      fontSize: 14, background: a ? "#2563eb" : "#e2e8f0",
      color: a ? "#fff" : "#475569", fontWeight: a ? 600 : 400,
    }),
    table:   { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    th:      { background: "#f1f5f9", padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" },
    td:      { padding: "12px 16px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
    badge: (c) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c + "22", color: c }),
    waBtn:   { padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: "#25d366", color: "#fff" },
    empty:   { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 },
  };

  return (
    <div style={s.page}>

      <div style={s.header}>
        <div style={s.title}>💰 Outstanding / उधारी</div>
        <Link href="/dashboard" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </div>

      {summary && (
        <div style={s.cards}>
          <div style={s.card}>
            <div style={s.label}>कुल Parties</div>
            <div style={s.value}>{summary.total_parties || 0}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>कुल Sales</div>
            <div style={{ ...s.value, color: "#2563eb" }}>{formatINR(summary.total_sales)}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>Received</div>
            <div style={{ ...s.value, color: "#16a34a" }}>{formatINR(summary.total_received)}</div>
          </div>
          <div style={{ ...s.card, border: "2px solid #fca5a5" }}>
            <div style={s.label}>Outstanding बाकी</div>
            <div style={{ ...s.value, color: "#dc2626" }}>{formatINR(summary.total_outstanding)}</div>
          </div>
        </div>
      )}

      <div style={s.filters}>
        <span style={{ fontSize: 14, color: "#64748b" }}>Period:</span>
        <input type="date" style={s.input} value={from} onChange={(e) => setFrom(e.target.value)} />
        <span style={{ fontSize: 14, color: "#94a3b8" }}>से</span>
        <input type="date" style={s.input} value={to} onChange={(e) => setTo(e.target.value)} />
        <button
          onClick={() => { setFrom(""); setTo(""); }}
          style={{ ...s.input, cursor: "pointer", background: "#f1f5f9", color: "#475569" }}
        >
          Reset
        </button>
      </div>

      <div style={s.tabs}>
        <button style={s.tab(activeTab === "outstanding")} onClick={() => setActiveTab("outstanding")}>
          Party-wise Outstanding
        </button>
        <button style={s.tab(activeTab === "aging")} onClick={() => setActiveTab("aging")}>
          Aging Analysis
        </button>
      </div>

      {loading ? (
        <div style={s.empty}>लोड हो रहा है...</div>
      ) : activeTab === "outstanding" ? (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Party Name</th>
              <th style={s.th}>Total Sales</th>
              <th style={s.th}>Received</th>
              <th style={s.th}>Outstanding</th>
              <th style={s.th}>Invoices</th>
              <th style={s.th}>Last Transaction</th>
              <th style={s.th}>WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} style={s.empty}>कोई outstanding नहीं मिला ✓</td>
              </tr>
            ) : data.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                <td style={{ ...s.td, fontWeight: 600 }}>{row.party}</td>
                <td style={s.td}>{formatINR(row.total_sales)}</td>
                <td style={{ ...s.td, color: "#16a34a" }}>{formatINR(row.total_received)}</td>
                <td style={s.td}>
                  <span style={s.badge("#dc2626")}>{formatINR(row.balance)}</span>
                </td>
                <td style={s.td}>{row.invoice_count}</td>
                <td style={{ ...s.td, color: "#64748b", fontSize: 13 }}>{daysSince(row.last_transaction)}</td>
                <td style={s.td}>
                  <button
                    style={{
                      ...s.waBtn,
                      opacity: waLoading === row.party ? 0.6 : 1,
                    }}
                    disabled={waLoading === row.party}
                    onClick={() => sendWhatsApp(row.party, row.balance)}
                  >
                    {waLoading === row.party ? "..." : "📲 Send"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Party Name</th>
              <th style={{ ...s.th, color: "#16a34a" }}>0–30 दिन</th>
              <th style={{ ...s.th, color: "#ca8a04" }}>31–60 दिन</th>
              <th style={{ ...s.th, color: "#ea580c" }}>61–90 दिन</th>
              <th style={{ ...s.th, color: "#dc2626" }}>90+ दिन</th>
              <th style={s.th}>Outstanding</th>
              <th style={s.th}>WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {aging.length === 0 ? (
              <tr>
                <td colSpan={7} style={s.empty}>कोई aging data नहीं</td>
              </tr>
            ) : aging.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                <td style={{ ...s.td, fontWeight: 600 }}>{row.party}</td>
                <td style={{ ...s.td, color: "#16a34a" }}>{formatINR(row.days_0_30)}</td>
                <td style={{ ...s.td, color: "#ca8a04" }}>{formatINR(row.days_31_60)}</td>
                <td style={{ ...s.td, color: "#ea580c" }}>{formatINR(row.days_61_90)}</td>
                <td style={{ ...s.td, color: "#dc2626" }}>{formatINR(row.days_90_plus)}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{formatINR(row.outstanding)}</td>
                <td style={s.td}>
                  <button
                    style={{
                      ...s.waBtn,
                      opacity: waLoading === row.party ? 0.6 : 1,
                    }}
                    disabled={waLoading === row.party}
                    onClick={() => sendWhatsApp(row.party, row.outstanding)}
                  >
                    {waLoading === row.party ? "..." : "📲 Send"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}