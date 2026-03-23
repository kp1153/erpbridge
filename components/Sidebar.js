"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "[D]" },
  { href: "/dashboard/upload", label: "Upload", icon: "[U]" },
  { href: "/dashboard/reports", label: "Reports", icon: "[R]" },
  { href: "/dashboard/settings", label: "Settings", icon: "[S]" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "240px",
        background: "#0e0e16",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 20px",
        gap: "4px",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .sidebar-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: #f0ede8; margin-bottom: 40px; padding: 0 8px; }
        .sidebar-logo span { color: #f5c842; }
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400; color: #706e6a; text-decoration: none; transition: all 0.2s; }
        .nav-link:hover { color: #f0ede8; background: rgba(255,255,255,0.04); }
        .nav-link.active { color: #f5c842; background: rgba(245,200,66,0.08); border: 1px solid rgba(245,200,66,0.15); }
        .nav-icon { font-size: 12px; font-family: monospace; }
        .sidebar-footer { margin-top: auto; padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); font-family: 'DM Sans', sans-serif; font-size: 11px; color: #4a4846; }
      `}</style>

      <div className="sidebar-footer">Nishant ERPBridge v1.0</div>

      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`nav-link ${pathname === link.href ? "active" : ""}`}
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </Link>
      ))}

      <div className="sidebar-footer">Nishant ERPBridge v1.0</div>
    </aside>
  );
}
