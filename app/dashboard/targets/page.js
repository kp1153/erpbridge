"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function TargetsPage() {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [alertLoading, setAlertLoading] = useState(null);

  // Set target modal state
  const [showModal, setShowModal] = useState(false);
  const [soName, setSoName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchPerformance(); }, [month]);

  async function fetchPerformance() {
    setLoading(true);
    try {
      const res = await fetch(`/api/targets/performance?month=${month}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setPerformance(json.performance || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveTarget() {
    if (!soName || !month) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          so_name: soName,
          month,
          target_amount: Number(targetAmount) || 0,
          target_qty: Number(targetQty) || 0,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg("✅ " + json.message);
        setSoName("");
        setTargetAmount("");
        setTargetQty("");
        fetchPerformance();
        setTimeout(() => { setShowModal(false); setMsg(""); }, 1500);
      } else {
        setMsg("❌ " + json.error);
      }
    } catch (e) {
      setMsg("❌ Error हुआ");
    } finally {
      setSaving(false);
    }
  }

  async function sendAlert(row) {
    setAlertLoading(row.so_name);
    try {
      const res = await fetch("/api/targets/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          so_name: row.so_name,
          actual_amount: row.actual_amount,
          target_amount: row.target_amount,
          amount_pct: row.amount_pct,
          month,
        }),
      });
      const json = await res.json();
      if (json.waUrl) window.open(json.waUrl, "_blank");
    } catch (e) {
      console.error(e);
    } finally {
      setAlertLoading(null);
    }
  }

  function formatINR(n) {
    const num = Number(n);
    if (!n || isNaN(num)) return "₹0";
    return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }

  function statusStyle(status) {
    if (status === "achieved") return { bg: "#dcfce7", color: "#16a34a", label: "✅ Achieved" };
    if (status === "near")     return { bg: "#fef9c3", color: "#ca8a04", label: "⚡ Near" };
    if (status === "behind")   return { bg: "#fee2e2", color: "#dc2626", label: "⚠️ Behind" };
    return                            { bg: "#f1f5f9", color: "#64748b", label: "— No Target" };
  }

  const s = {
    page:    { fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "24px" },
    header:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
    title:   { fontSize: 22, fontWeight: 700, color: "#1e293b" },
    btn:     { padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: "#2563eb", color: "#fff" },
    table:   { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    th:      { background: "#f1f5f9", padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" },
    td:      { padding: "12px 16px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
    empty:   { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 },
    input:   { padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", width: "100%" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
    modal:   { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
    waBtn:   { padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: "#25d366", color: "#fff" },
  };

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.title}>🎯 SO Target Tracker</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="month" value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ ...s.input, width: 160 }}
          />
          <button style={s.btn} onClick={() => setShowModal(true)}>+ Target Set करें</button>
          <Link href="/dashboard" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none" }}>← Dashboard</Link>
        </div>
      </div>

      {/* Summary cards */}
      {performance.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total SO", value: performance.length, color: "#1e293b" },
            { label: "Target Achieved", value: performance.filter((p) => p.status === "achieved").length, color: "#16a34a" },
            { label: "Near Target", value: performance.filter((p) => p.status === "near").length, color: "#ca8a04" },
            { label: "Behind", value: performance.filter((p) => p.status === "behind").length, color: "#dc2626" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Table */}
      {loading ? (
        <div style={s.empty}>लोड हो रहा है...</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>SO Name</th>
              <th style={s.th}>Target (₹)</th>
              <th style={s.th}>Achieved (₹)</th>
              <th style={s.th}>Achievement %</th>
              <th style={s.th}>Progress</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {performance.length === 0 ? (
              <tr><td colSpan={7} style={s.empty}>कोई data नहीं — पहले target set करें</td></tr>
            ) : performance.map((row, i) => {
              const st = statusStyle(row.status);
              const pct = row.amount_pct || 0;
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{row.so_name}</td>
                  <td style={{ ...s.td, color: "#2563eb" }}>{formatINR(row.target_amount)}</td>
                  <td style={{ ...s.td, color: "#16a34a", fontWeight: 600 }}>{formatINR(row.actual_amount)}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: pct >= 100 ? "#16a34a" : pct >= 75 ? "#ca8a04" : "#dc2626" }}>
                    {row.amount_pct !== null ? `${pct}%` : "—"}
                  </td>
                  <td style={s.td}>
                    <div style={{ background: "#f1f5f9", borderRadius: 6, height: 10, width: 120, overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.min(pct, 100)}%`,
                        height: "100%",
                        borderRadius: 6,
                        background: pct >= 100 ? "#16a34a" : pct >= 75 ? "#ca8a04" : "#dc2626",
                        transition: "width 0.3s",
                        minWidth: pct > 0 ? 4 : 0,
                      }} />
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button
                      style={{ ...s.waBtn, opacity: alertLoading === row.so_name ? 0.6 : 1 }}
                      disabled={alertLoading === row.so_name}
                      onClick={() => sendAlert(row)}
                    >
                      {alertLoading === row.so_name ? "..." : "📲 Alert"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Set Target Modal */}
      {showModal && (
        <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={s.modal}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>🎯 Target Set करें</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>SO Name</label>
              <input style={s.input} placeholder="Sales Officer का नाम" value={soName} onChange={(e) => setSoName(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Month</label>
              <input type="month" style={s.input} value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Amount Target (₹)</label>
              <input type="number" style={s.input} placeholder="जैसे: 500000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Quantity Target (boxes/units)</label>
              <input type="number" style={s.input} placeholder="जैसे: 200" value={targetQty} onChange={(e) => setTargetQty(e.target.value)} />
            </div>

            {msg && (
              <div style={{ marginBottom: 14, fontSize: 14, color: msg.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{msg}</div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{ ...s.btn, flex: 1, opacity: saving ? 0.6 : 1 }}
                onClick={saveTarget}
                disabled={saving}
              >
                {saving ? "Save हो रहा है..." : "Save करें"}
              </button>
              <button
                style={{ ...s.btn, background: "#f1f5f9", color: "#475569" }}
                onClick={() => { setShowModal(false); setMsg(""); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}