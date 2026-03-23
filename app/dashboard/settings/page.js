"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [business, setBusiness] = useState("");
  const [erp, setErp] = useState("");
  const [status, setStatus] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setBusiness(d.settings.business_name || "");
          setErp(d.settings.erp_type || "");
        }
      });
  }, []);

  async function handleSave() {
    setStatus("Saving...");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_name: business, erp_type: erp }),
    });
    const data = await res.json();
    setStatus(data.message || "Saved");
    setTimeout(() => setStatus(""), 3000);
  }

  async function handleClear() {
    if (!confirm("Are you sure? This will delete all uploaded transaction data permanently.")) return;
    setClearing(true);
    const res = await fetch("/api/settings", { method: "DELETE" });
    const data = await res.json();
    setStatus(data.message || "Cleared");
    setClearing(false);
    setTimeout(() => setStatus(""), 3000);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .settings-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; }
        .settings-sub { font-size: 13px; color: #706e6a; font-weight: 300; margin-bottom: 32px; }
        .settings-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 36px; max-width: 520px; }
        .field { margin-bottom: 24px; }
        .field-label { font-size: 12px; color: #706e6a; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; font-weight: 400; }
        .field-input { width: 100%; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.1); color: #f0ede8; border-radius: 6px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .field-input:focus { border-color: rgba(245,200,66,0.4); }
        .field-select { width: 100%; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.1); color: #f0ede8; border-radius: 6px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; appearance: none; }
        .field-select:focus { border-color: rgba(245,200,66,0.4); }
        .save-btn { background: #f5c842; color: #0a0a0f; border: none; padding: 12px 32px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .save-btn:hover { background: #ffd966; transform: translateY(-1px); }
        .danger-box { background: #13131a; border: 1px solid rgba(255,107,107,0.2); border-radius: 10px; padding: 36px; max-width: 520px; margin-top: 24px; }
        .danger-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #ff6b6b; margin-bottom: 8px; }
        .danger-sub { font-size: 13px; color: #706e6a; font-weight: 300; margin-bottom: 24px; }
        .clear-btn { background: transparent; color: #ff6b6b; border: 1px solid rgba(255,107,107,0.4); padding: 12px 32px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .clear-btn:hover { background: rgba(255,107,107,0.08); border-color: #ff6b6b; }
        .clear-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .status-msg { margin-top: 16px; font-size: 13px; color: #4ecb71; font-weight: 300; }
      `}</style>

      <div className="settings-title">Settings</div>
      <div className="settings-sub">Configure your business profile.</div>

      <div className="settings-box">
        <div className="field">
          <div className="field-label">Business Name</div>
          <input
            type="text"
            className="field-input"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="e.g. Sharma Hardware Store"
          />
        </div>
        <div className="field">
          <div className="field-label">ERP Software</div>
          <select className="field-select" value={erp} onChange={(e) => setErp(e.target.value)}>
            <option value="">Select ERP</option>
            <option value="tally">Tally Prime</option>
            <option value="tallyerp9">Tally ERP 9</option>
            <option value="busy">Busy Accounting</option>
            <option value="marg">Marg ERP</option>
            <option value="zoho">Zoho Books</option>
          </select>
        </div>
        <button className="save-btn" onClick={handleSave}>Save Settings</button>
        {status && <div className="status-msg">{status}</div>}
      </div>

      <div className="danger-box">
        <div className="danger-title">Danger Zone</div>
        <div className="danger-sub">This will permanently delete all uploaded transaction data. This action cannot be undone.</div>
        <button className="clear-btn" onClick={handleClear} disabled={clearing}>
          {clearing ? "Clearing..." : "Clear All Data"}
        </button>
      </div>
    </div>
  );
}