"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/upload", label: "Upload" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 gap-2">
      <h1 className="text-xl font-bold text-blue-400 mb-6">ERPBridge</h1>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-lg transition ${
            pathname === link.href
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}