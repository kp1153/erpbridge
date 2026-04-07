"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.replace("/login");
          return;
        }
        if (d.status === "expired") {
          router.replace("/expired");
          return;
        }
        if (d.status === "trial") {
          setTrialDaysLeft(d.daysLeft);
        }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      {trialDaysLeft !== null && (
        <div style={{ background: "#f5c842", color: "#0a0a0f", textAlign: "center", padding: "8px 16px", fontWeight: "700", fontSize: "14px" }}>
          ⚠️ Free Trial — {trialDaysLeft} दिन बाकी हैं।{" "}
          <a href="https://web-developer-kp.com/payment?software=erpbridge" style={{ textDecoration: "underline", color: "#0a0a0f" }}>
            अभी खरीदें →
          </a>
        </div>
      )}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-950">{children}</main>
      </div>
    </div>
  );
}