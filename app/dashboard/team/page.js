"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("accountant");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setMembers(json.members || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addMember() {
    if (!email) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_email: email, role }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg("✅ " + json.message);
        setEmail("");
        fetchMembers();
      } else {
        setMsg("❌ " + json.error);
      }
    } catch (e) {
      setMsg("❌ Error हुआ");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(id) {
    if (!confirm("इस member को हटाएं?")) return;
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchMembers();
    } catch (e) {
      console.error(e);
    }
  }

  const roleLabel = { owner: "Owner", accountant: "Accountant", viewer: "Viewer" };
  const roleColor = { owner: "#7c3aed", accountant: "#2563eb", viewer: "#64748b" };

  const s = {
    page:   { fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "24px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    title:  { fontSize: 22, fontWeight: 700, color: "#1e293b" },
    box:    { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: 24 },
    label:  { fontSize: 13, color: "#64748b", marginBottom: 6, display: "block" },
    input:  { padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", width: "100%" },
    select: { padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fff" },
    btn:    { padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: "#2563eb", color: "#fff" },
    table:  { width: "100%", borderCollapse: "collapse" },
    th:     { background: "#f1f5f9", padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" },
    td:     { padding: "12px 16px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
    badge: (c) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c + "22", color: c }),
    delBtn: { padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, background: "#fee2e2", color: "#dc2626", fontWeight: 600 },
    empty:  { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>👥 Team / Roles & Rights</div>
        <Link href="/dashboard" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={s.box}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>नया Member जोड़ें</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={s.label}>Email Address</label>
            <input type="email" style={s.input} placeholder="member@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>Role</label>
            <select style={s.select} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="accountant">Accountant</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button style={{ ...s.btn, opacity: saving ? 0.6 : 1 }} onClick={addMember} disabled={saving}>
            {saving ? "..." : "Add"}
          </button>
        </div>
        {msg && <div style={{ marginTop: 12, fontSize: 14, color: msg.startsWith("✅") ? "#16a34a" : "#dc2626" }}>{msg}</div>}
      </div>

      <div style={s.box}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>Team Members</div>
        {loading ? (
          <div style={s.empty}>लोड हो रहा है...</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Added</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={4} style={s.empty}>अभी कोई member नहीं है</td></tr>
              ) : members.map((m) => (
                <tr key={m.id}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{m.member_email}</td>
                  <td style={s.td}>
                    <span style={s.badge(roleColor[m.role] || "#64748b")}>
                      {roleLabel[m.role] || m.role}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: "#64748b", fontSize: 13 }}>
                    {new Date(m.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td style={s.td}>
                    <button style={s.delBtn} onClick={() => removeMember(m.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}