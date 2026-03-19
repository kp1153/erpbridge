export default async function ReportPage({ params }) {
  const { type } = await params;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 capitalize">{type} Report</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400">No data yet. Upload a file first.</p>
      </div>
    </div>
  );
}