"use client";
import { useEffect, useState } from "react";

export default function ExpiredPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.email) setEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  const paymentUrl = `https://nishantsoftwares.in/payment?software=erpbridge${email ? "&email=" + encodeURIComponent(email) : ""}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          background: "#13131a",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "40px 32px",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#f0ede8",
            marginBottom: "8px",
          }}
        >
          Subscription Expired
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#706e6a",
            marginBottom: "28px",
            lineHeight: "1.6",
          }}
        >
          Your ERPBridge trial or subscription has ended. Renew to continue
          accessing your business data.
        </p>
        <div
          style={{
            background: "#1a1a24",
            border: "1px solid rgba(245,200,66,0.2)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#706e6a",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            ERPBridge License
          </p>
          <p
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#f5c842",
              marginBottom: "2px",
            }}
          >
            ₹4,999{" "}
            <span
              style={{ fontSize: "14px", fontWeight: "400", color: "#706e6a" }}
            >
              {" "}
              / year
            </span>
          </p>
        </div>
        <a
          href={paymentUrl}
          style={{
            display: "block",
            width: "100%",
            background: "#f5c842",
            color: "#0a0a0f",
            fontWeight: "700",
            padding: "14px",
            borderRadius: "10px",
            textDecoration: "none",
            marginBottom: "12px",
            fontSize: "15px",
          }}
        >
          Renew Now →
        </a>
        <a
          href="https://wa.me/919996865069"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            background: "#25d366",
            color: "#fff",
            fontWeight: "700",
            padding: "14px",
            borderRadius: "10px",
            textDecoration: "none",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        >
          💬 WhatsApp Support
        </a>
        <a
          href="/login"
          style={{
            fontSize: "13px",
            color: "#706e6a",
            textDecoration: "underline",
          }}
        >
          ← Back to Login
        </a>
      </div>
    </main>
  );
}
