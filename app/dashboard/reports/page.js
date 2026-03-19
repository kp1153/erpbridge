import Link from "next/link";

const reports = [
  { type: "sales", name: "Sales Report", icon: "📈" },
  { type: "purchase", name: "Purchase Report", icon: "📦" },
  { type: "ledger", name: "Party Ledger", icon: "👥" },
  { type: "pnl", name: "P&L Statement", icon: "💰" },
];

export default function ReportsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Link key={report.type} href={`/dashboard/reports/${report.type}`} className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-6 transition">
            <span className="text-3xl">{report.icon}</span>
            <h3 className="text-white font-semibold mt-2">{report.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}