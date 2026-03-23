import Link from "next/link";

const tallyReports = [
  { type: "sales", name: "Sales Report", icon: "📈" },
  { type: "purchase", name: "Purchase Report", icon: "📦" },
  { type: "ledger", name: "Party Ledger", icon: "👥" },
  { type: "pnl", name: "P&L Statement", icon: "💰" },
];

const fmcgReports = [
  { type: "fmcg-party", name: "Party-wise Sales", icon: "🏪" },
  { type: "fmcg-product", name: "Product-wise Sales", icon: "🛒" },
  { type: "fmcg-so", name: "SO Performance", icon: "👤" },
  { type: "fmcg-asm", name: "ASM Performance", icon: "🏆" },
  { type: "fmcg-city", name: "City-wise Sales", icon: "🏙️" },
];

export default function ReportsPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: #706e6a; font-weight: 300; margin-bottom: 32px; }
        .section-label { font-size: 11px; color: #f5c842; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; margin-top: 28px; font-weight: 400; }
        .reports-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px; }
        .report-card { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 24px; text-decoration: none; display: block; transition: border-color 0.2s; }
        .report-card:hover { border-color: rgba(245,200,66,0.3); }
        .report-icon { font-size: 28px; margin-bottom: 12px; }
        .report-name { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: #f0ede8; }
        @media (max-width: 768px) { .reports-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="page-title">Reports</div>
      <div className="page-sub">View and export all your business reports.</div>

      <div className="section-label">Tally / ERP Reports</div>
      <div className="reports-grid">
        {tallyReports.map((r) => (
          <Link key={r.type} href={`/dashboard/reports/${r.type}`} className="report-card">
            <div className="report-icon">{r.icon}</div>
            <div className="report-name">{r.name}</div>
          </Link>
        ))}
      </div>

      <div className="section-label">FMCG Reports</div>
      <div className="reports-grid">
        {fmcgReports.map((r) => (
          <Link key={r.type} href={`/dashboard/reports/${r.type}`} className="report-card">
            <div className="report-icon">{r.icon}</div>
            <div className="report-name">{r.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}