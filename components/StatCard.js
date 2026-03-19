export default function StatCard({ label, value, prefix }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{prefix}{value}</p>
    </div>
  );
}