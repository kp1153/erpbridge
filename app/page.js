import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-blue-400 mb-4">ERPBridge</h1>
      <p className="text-xl text-gray-400 mb-8">One Bridge. All ERPs.</p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
          Login
        </Link>
        <Link href="/dashboard" className="border border-blue-600 hover:bg-blue-600 text-blue-400 hover:text-white px-6 py-3 rounded-lg font-semibold transition">
          Dashboard
        </Link>
      </div>
    </main>
  );
}