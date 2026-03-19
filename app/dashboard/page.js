import StatCard from "@/components/StatCard";
import ChartWidget from "@/components/ChartWidget";

export default function DashboardPage() {
  const stats = [
    { label: "Total Sales", value: "0", prefix: "₹" },
    { label: "Total Purchase", value: "0", prefix: "₹" },
    { label: "Outstanding", value: "0", prefix: "₹" },
    { label: "Stock Items", value: "0", prefix: "" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} prefix={stat.prefix} />
        ))}
      </div>
      <div className="mt-8">
        <ChartWidget />
      </div>
    </div>
  );
}