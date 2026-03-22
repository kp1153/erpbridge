"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReportPage() {
  const { type } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/reports/${type}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [type]);

  const titles = {
    sales: "Sales Report",
    purchase: "Purchase Report",
    ledger: "Party Ledger",
    pnl: "P&L Statement",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .report-header { margin-bottom: 28px; }
        .report-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; text-transform: capitalize; }
        .report-sub { font-size: 13px; color: #706e6a; font-weight: 300; }
        .report-box { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; }
        .report-table { width: 100%; border-collapse: collapse; }
        .report-table th { font-size: 11px; color: #706e6a; letter-spacing: 1.5px; text-transform: uppercase; padding: 16px 20px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.07); font-weight: 400; }
        .report-table td { font-size: 14px; color: #f0ede8; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); font-weight: 300; }
        .report-table tr:last-child td { border-bottom: none; }
        .report-table tr:hover td { background: rgba(245,200,66,0.03); }
        .amount { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #f5c842; }
        .amount.red { color: #ff6b6b; }
        .amount.green { color: #4ecb71; }
        .empty { padding: 60px; text-align: center; color: #706e6a; font-size: 14px; font-weight: 300; }
        .loading { padding: 60px; text-align: center; color: #706e6a; font-size: 14px; }
        .back-btn { display: inline-block; margin-bottom: 20px; font-size: 13px; color: #f5c842; cursor: pointer; }
        .back-btn:hover { text-decoration: underline; }
        .summary-row { display: flex; gap: 16px; margin-bottom: 20px; }
        .summary-card { background: #13131a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px 24px; flex: 1; }
        .summary-label { font-size: 11px; color: #706e6a; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }
        .summary-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; }
      `}</style>

      <div className="back-btn" onClick={() => window.location.href = "/dashboard/reports"}>
        &larr; Back to Reports
      </div>

      <div className="report-header">
        <div className="report-title">{titles[type] || type + " Report"}</div>
        <div className="report-sub">{data.length} records found</div>
      </div>

      {type === "pnl" && !loading && data.length > 0 && (() => {
        const sales = data.find((r) => r.type === "sales");
        const purchase = data.find((r) => r.type === "purchase");
        const salesAmt = parseFloat(sales?.total || 0);
        const purchaseAmt = parseFloat(purchase?.total || 0);
        const profit = salesAmt - purchaseAmt;
        return (
          <div className="summary-row">
            <div className="summary-card">
              <div className="summary-label">Total Sales</div>
              <div className="summary-value" style={{ color: "#f5c842" }}>Rs. {(salesAmt / 100000).toFixed(2)}L</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Purchase</div>
              <div className="summary-value" style={{ color: "#f0ede8" }}>Rs. {(purchaseAmt / 100000).toFixed(2)}L</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Net Profit</div>
              <div className="summary-value" style={{ color: profit >= 0 ? "#4ecb71" : "#ff6b6b" }}>Rs. {(profit / 100000).toFixed(2)}L</div>
            </div>
          </div>
        );
      })()}

      <div className="report-box">
        {loading && <div className="loading">Loading...</div>}
        {!loading && error && <div className="empty">Error: {error}</div>}
        {!loading && !error && data.length === 0 && (
          <div className="empty">No data found. Upload a file first.</div>
        )}
        {!loading && !error && data.length > 0 && (
          <table className="report-table">
            <thead>
              <tr>
                {type === "sales" || type === "purchase" ? (
                  <>
                    <th>Party</th>
                    <th>Total Amount</th>
                    <th>Transactions</th>
                    <th>Last Date</th>
                  </>
                ) : type === "ledger" ? (
                  <>
                    <th>Party</th>
                    <th>Sales</th>
                    <th>Purchase</th>
                    <th>Balance</th>
                  </>
                ) : (
                  <>
                    <th>Type</th>
                    <th>Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {type === "sales" || type === "purchase" ? (
                    <>
                      <td>{row.party || "Unknown"}</td>
                      <td><span className="amount">Rs. {parseFloat(row.total).toLocaleString("en-IN")}</span></td>
                      <td>{row.count}</td>
                      <td>{row.last_date ? new Date(row.last_date).toLocaleDateString("en-IN") : "-"}</td>
                    </>
                  ) : type === "ledger" ? (
                    <>
                      <td>{row.party || "Unknown"}</td>
                      <td><span className="amount green">Rs. {parseFloat(row.sales).toLocaleString("en-IN")}</span></td>
                      <td><span className="amount red">Rs. {parseFloat(row.purchase).toLocaleString("en-IN")}</span></td>
                      <td><span className={`amount ${parseFloat(row.balance) >= 0 ? "green" : "red"}`}>Rs. {parseFloat(row.balance).toLocaleString("en-IN")}</span></td>
                    </>
                  ) : (
                    <>
                      <td style={{ textTransform: "capitalize" }}>{row.type}</td>
                      <td><span className="amount">Rs. {parseFloat(row.total).toLocaleString("en-IN")}</span></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}