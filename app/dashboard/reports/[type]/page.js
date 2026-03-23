"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";

export default function ReportPage() {
  const { type } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function fetchData(fromDate, toDate) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    fetch(`/api/reports/${type}${query}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchData("", "");
  }, [type]);

  const titles = {
    sales: "Sales Report",
    purchase: "Purchase Report",
    ledger: "Party Ledger",
    pnl: "P&L Statement",
    "fmcg-party": "Party-wise Sales",
    "fmcg-product": "Product-wise Sales",
    "fmcg-so": "SO Performance",
    "fmcg-asm": "ASM Performance",
    "fmcg-city": "City-wise Sales",
  };

  function handleExport() {
    let exportData = [];
    if (type === "sales" || type === "purchase") {
      exportData = data.map((row) => ({
        Party: row.party || "Unknown",
        "Total Amount": parseFloat(row.total),
        Transactions: row.count,
        "Last Date": row.last_date ? new Date(row.last_date).toLocaleDateString("en-IN") : "-",
      }));
    } else if (type === "ledger") {
      exportData = data.map((row) => ({
        Party: row.party || "Unknown",
        Sales: parseFloat(row.sales),
        Purchase: parseFloat(row.purchase),
        Balance: parseFloat(row.balance),
      }));
    } else if (type === "pnl") {
      exportData = data.map((row) => ({
        Type: row.type,
        Total: parseFloat(row.total),
      }));
    } else if (type === "fmcg-party") {
      exportData = data.map((row) => ({
        Party: row.party,
        City: row.city,
        State: row.state,
        Invoices: row.invoices,
        "Total Qty": row.total_qty,
      }));
    } else if (type === "fmcg-product") {
      exportData = data.map((row) => ({
        Product: row.product,
        "Total Qty": row.total_qty,
        Invoices: row.invoices,
      }));
    } else if (type === "fmcg-so") {
      exportData = data.map((row) => ({
        "Sales Officer": row.so,
        Invoices: row.invoices,
        "Total Qty": row.total_qty,
        Parties: row.parties,
      }));
    } else if (type === "fmcg-asm") {
      exportData = data.map((row) => ({
        ASM: row.asm,
        Invoices: row.invoices,
        "Total Qty": row.total_qty,
        Parties: row.parties,
        SOs: row.sos,
      }));
    } else if (type === "fmcg-city") {
      exportData = data.map((row) => ({
        City: row.city,
        State: row.state,
        Invoices: row.invoices,
        "Total Qty": row.total_qty,
        Parties: row.parties,
      }));
    }
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, titles[type] || type);
    XLSX.writeFile(workbook, `${titles[type] || type}.xlsx`);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .report-header { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
        .report-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; text-transform: capitalize; }
        .report-sub { font-size: 13px; color: #706e6a; font-weight: 300; }
        .export-btn { background: transparent; border: 1px solid rgba(245,200,66,0.4); color: #f5c842; padding: 10px 24px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 400; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .export-btn:hover { background: rgba(245,200,66,0.08); border-color: #f5c842; }
        .filter-row { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-field { display: flex; flex-direction: column; gap: 6px; }
        .filter-label { font-size: 11px; color: #706e6a; letter-spacing: 1px; text-transform: uppercase; font-weight: 400; }
        .filter-input { background: #13131a; border: 1px solid rgba(255,255,255,0.1); color: #f0ede8; border-radius: 6px; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .filter-input:focus { border-color: rgba(245,200,66,0.4); }
        .filter-btn { background: #f5c842; color: #0a0a0f; border: none; padding: 10px 24px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { background: #ffd966; }
        .reset-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #706e6a; padding: 10px 20px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .reset-btn:hover { border-color: rgba(255,255,255,0.3); color: #f0ede8; }
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
        <div>
          <div className="report-title">{titles[type] || type + " Report"}</div>
          <div className="report-sub">{data.length} records found</div>
        </div>
        {!loading && !error && data.length > 0 && (
          <button className="export-btn" onClick={handleExport}>Export to Excel</button>
        )}
      </div>

      <div className="filter-row">
        <div className="filter-field">
          <div className="filter-label">From</div>
          <input type="date" className="filter-input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="filter-field">
          <div className="filter-label">To</div>
          <input type="date" className="filter-input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button className="filter-btn" onClick={() => fetchData(from, to)}>Apply</button>
        <button className="reset-btn" onClick={() => { setFrom(""); setTo(""); fetchData("", ""); }}>Reset</button>
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
                ) : type === "pnl" ? (
                  <>
                    <th>Type</th>
                    <th>Total</th>
                  </>
                ) : type === "fmcg-party" ? (
                  <>
                    <th>Party</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Invoices</th>
                    <th>Total Qty</th>
                  </>
                ) : type === "fmcg-product" ? (
                  <>
                    <th>Product</th>
                    <th>Total Qty</th>
                    <th>Invoices</th>
                  </>
                ) : type === "fmcg-so" ? (
                  <>
                    <th>Sales Officer</th>
                    <th>Invoices</th>
                    <th>Total Qty</th>
                    <th>Parties</th>
                  </>
                ) : type === "fmcg-asm" ? (
                  <>
                    <th>ASM</th>
                    <th>Invoices</th>
                    <th>Total Qty</th>
                    <th>Parties</th>
                    <th>SOs</th>
                  </>
                ) : type === "fmcg-city" ? (
                  <>
                    <th>City</th>
                    <th>State</th>
                    <th>Invoices</th>
                    <th>Total Qty</th>
                    <th>Parties</th>
                  </>
                ) : null}
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
                  ) : type === "pnl" ? (
                    <>
                      <td style={{ textTransform: "capitalize" }}>{row.type}</td>
                      <td><span className="amount">Rs. {parseFloat(row.total).toLocaleString("en-IN")}</span></td>
                    </>
                  ) : type === "fmcg-party" ? (
                    <>
                      <td>{row.party}</td>
                      <td>{row.city}</td>
                      <td>{row.state}</td>
                      <td>{row.invoices}</td>
                      <td><span className="amount">{parseInt(row.total_qty).toLocaleString("en-IN")}</span></td>
                    </>
                  ) : type === "fmcg-product" ? (
                    <>
                      <td>{row.product}</td>
                      <td><span className="amount">{parseInt(row.total_qty).toLocaleString("en-IN")}</span></td>
                      <td>{row.invoices}</td>
                    </>
                  ) : type === "fmcg-so" ? (
                    <>
                      <td>{row.so}</td>
                      <td>{row.invoices}</td>
                      <td><span className="amount">{parseInt(row.total_qty).toLocaleString("en-IN")}</span></td>
                      <td>{row.parties}</td>
                    </>
                  ) : type === "fmcg-asm" ? (
                    <>
                      <td>{row.asm}</td>
                      <td>{row.invoices}</td>
                      <td><span className="amount">{parseInt(row.total_qty).toLocaleString("en-IN")}</span></td>
                      <td>{row.parties}</td>
                      <td>{row.sos}</td>
                    </>
                  ) : type === "fmcg-city" ? (
                    <>
                      <td>{row.city}</td>
                      <td>{row.state}</td>
                      <td>{row.invoices}</td>
                      <td><span className="amount">{parseInt(row.total_qty).toLocaleString("en-IN")}</span></td>
                      <td>{row.parties}</td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}