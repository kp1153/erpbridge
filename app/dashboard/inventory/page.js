"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function InventoryPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, [from, to]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json.inventory || []);
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

  function stockStatus(stock) {
    if (stock <= 0) return { label: "Out of Stock", color: "#dc2626" };
    if (stock < 5000) return { label: "Low Stock", color: "#ca8a04" };
    return { label: "In Stock", color: "#16a34a" };
  }

  const filtered = data.filter((r) =>
    r.item?.toLowerCase().includes(search.toLowerCase())
  );

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
    table:   { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    th:      { background: "#f1f5f9", padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" },
    td:      { padding: "12px 16px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
    badge: (c) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c + "22", color: c }),
    empty:   { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>📦 Inventory / स्टॉक</div>
        <Link href="/dashboard" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none" }}>← Dashboard</Link>
      </div>

      {summary && (
        <div style={s.cards}>
          <div style={s.card}>
            <div style={s.label}>Total Items</div>
            <div style={s.value}>{summary.total_items || 0}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>Total Purchase</div>
            <div style={{ ...s.value, color: "#2563eb" }}>{formatINR(summary.total_purchase)}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>Total Sales</div>
            <div style={{ ...s.value, color: "#16a34a" }}>{formatINR(summary.total_sales)}</div>
          </div>
          <div style={s.card}>
            <div style={s.label}>Net Stock Value</div>
            <div style={{ ...s.value, color: "#7c3aed" }}>{formatINR(summary.net_stock)}</div>
          </div>
        </div>
      )}

      <div style={s.filters}>
        <input
          type="text" placeholder="Search item..." style={{ ...s.input, width: 200 }}
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <input type="date" style={s.input} value={from} onChange={(e) => setFrom(e.target.value)} />
        <span style={{ fontSize: 14, color: "#94a3b8" }}>से</span>
        <input type="date" style={s.input} value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={() => { setFrom(""); setTo(""); setSearch(""); }}
          style={{ ...s.input, cursor: "pointer", background: "#f1f5f9", color: "#475569" }}>
          Reset
        </button>
      </div>

      {loading ? (
        <div style={s.empty}>लोड हो रहा है...</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Item / Party</th>
              <th style={s.th}>Purchase</th>
              <th style={s.th}>Sales</th>
              <th style={s.th}>Stock Value</th>
              <th style={s.th}>Sales Count</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={s.empty}>कोई data नहीं मिला</td></tr>
            ) : filtered.map((row, i) => {
              const st = stockStatus(Number(row.stock_value));
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{row.item}</td>
                  <td style={{ ...s.td, color: "#2563eb" }}>{formatINR(row.total_purchase)}</td>
                  <td style={{ ...s.td, color: "#16a34a" }}>{formatINR(row.total_sales)}</td>
                  <td style={s.td}>{formatINR(row.stock_value)}</td>
                  <td style={s.td}>{row.sales_count}</td>
                  <td style={s.td}><span style={s.badge(st.color)}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}