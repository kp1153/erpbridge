"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: "#0a0a0f", color: "#f0ede8", minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 24px 48px; display: flex; justify-content: space-between; align-items: center; transition: all 0.4s; }
        .nav.scrolled { background: rgba(10,10,15,0.95); padding: 16px 48px; border-bottom: 1px solid rgba(255,200,100,0.1); backdrop-filter: blur(12px); }
        .logo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #f0ede8; }
        .logo span { color: #f5c842; }
        .nav-btn { background: #f5c842; color: #0a0a0f; padding: 10px 24px; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.2s; letter-spacing: 0.3px; }
        .nav-btn:hover { background: #ffd966; transform: translateY(-1px); }
        .hero { min-height: 100vh; display: flex; align-items: center; padding: 120px 48px 80px; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -200px; right: -200px; width: 700px; height: 700px; background: radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%); pointer-events: none; }
        .hero::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,200,66,0.3), transparent); }
        .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hero-tag { display: inline-block; background: rgba(245,200,66,0.1); border: 1px solid rgba(245,200,66,0.3); color: #f5c842; padding: 6px 16px; border-radius: 2px; font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(42px, 5vw, 68px); font-weight: 900; line-height: 1.1; margin-bottom: 24px; letter-spacing: -1px; }
        .hero-title em { font-style: italic; color: #f5c842; }
        .hero-sub { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 300; color: #a09e9a; line-height: 1.7; margin-bottom: 40px; }
        .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        .btn-primary { background: #f5c842; color: #0a0a0f; padding: 16px 36px; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; text-decoration: none; transition: all 0.2s; display: inline-block; }
        .btn-primary:hover { background: #ffd966; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(245,200,66,0.25); }
        .btn-ghost { border: 1px solid rgba(240,237,232,0.2); color: #f0ede8; padding: 16px 36px; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 300; text-decoration: none; transition: all 0.2s; display: inline-block; }
        .btn-ghost:hover { border-color: rgba(245,200,66,0.4); color: #f5c842; }
        .price-tag { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #706e6a; margin-top: 16px; }
        .price-tag strong { color: #f0ede8; }
        .dashboard-mock { background: #13131a; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,200,66,0.05); }
        .mock-bar { display: flex; gap: 6px; margin-bottom: 16px; }
        .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mock-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .mock-card { background: #1a1a24; border-radius: 8px; padding: 14px; border: 1px solid rgba(255,255,255,0.05); }
        .mock-label { font-family: 'DM Sans', sans-serif; font-size: 10px; color: #706e6a; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase; }
        .mock-value { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #f0ede8; }
        .mock-value.gold { color: #f5c842; }
        .mock-chart { background: #1a1a24; border-radius: 8px; padding: 14px; border: 1px solid rgba(255,255,255,0.05); height: 90px; display: flex; align-items: flex-end; gap: 6px; overflow: hidden; }
        .bar { background: linear-gradient(180deg, #f5c842, rgba(245,200,66,0.3)); border-radius: 3px 3px 0 0; flex: 1; }
        .section { padding: 100px 48px; max-width: 1200px; margin: 0 auto; }
        .section-tag { font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #f5c842; margin-bottom: 16px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 700; line-height: 1.15; margin-bottom: 16px; }
        .section-sub { font-family: 'DM Sans', sans-serif; font-size: 17px; color: #706e6a; font-weight: 300; line-height: 1.7; max-width: 520px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 60px; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
        .feature { padding: 40px 32px; background: #0e0e16; transition: background 0.3s; }
        .feature:hover { background: #13131e; }
        .feature-icon { font-size: 28px; margin-bottom: 20px; font-style: normal; }
        .feature-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 10px; color: #f0ede8; }
        .feature-desc { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #706e6a; line-height: 1.7; font-weight: 300; }
        .erp-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 60px; }
        .erp-chip { background: #13131a; border: 1px solid rgba(255,255,255,0.08); padding: 10px 20px; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #a09e9a; }
        .pricing-box { margin-top: 60px; background: #0e0e16; border: 1px solid rgba(245,200,66,0.2); border-radius: 12px; padding: 60px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 40px; position: relative; overflow: hidden; }
        .pricing-box::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(245,200,66,0.05) 0%, transparent 70%); pointer-events: none; }
        .pricing-amount { font-family: 'Playfair Display', serif; font-size: 72px; font-weight: 900; color: #f5c842; line-height: 1; }
        .pricing-period { font-family: 'DM Sans', sans-serif; font-size: 16px; color: #706e6a; margin-top: 8px; }
        .pricing-renewal { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #a09e9a; margin-top: 4px; }
        .pricing-features { list-style: none; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #a09e9a; line-height: 2; font-weight: 300; }
        .pricing-features li::before { content: '+ '; color: #f5c842; }
        .compare { background: rgba(245,200,66,0.06); border: 1px solid rgba(245,200,66,0.15); border-radius: 8px; padding: 16px 24px; margin-top: 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #a09e9a; }
        .compare strong { color: #f5c842; }
        .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 40px 48px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: #f0ede8; }
        .footer-logo span { color: #f5c842; }
        .footer-text { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #4a4846; }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,200,66,0.15), transparent); }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .features-grid { grid-template-columns: 1fr; }
          .pricing-box { flex-direction: column; padding: 40px; }
          .nav { padding: 20px 24px; }
          .hero { padding: 100px 24px 60px; }
          .section { padding: 60px 24px; }
          .footer { padding: 32px 24px; }
        }
      `}</style>

      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">ERP<span>Bridge</span></div>
        <Link href="/login" className="nav-btn">Start Free Trial</Link>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-tag">Business Intelligence SaaS</div>
            <h1 className="hero-title">
              Your ERP Data,<br />
              <em>Finally Intelligent</em>
            </h1>
            <p className="hero-sub">
              Upload data from Tally, Busy, or Marg. Get instant Sales, Purchase, P&amp;L and Party Ledger reports, all in one place.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn-primary">Start Free - 7 Days</Link>
              <Link href="/dashboard" className="btn-ghost">View Dashboard</Link>
            </div>
            <p className="price-tag">Free for 7 days. Then <strong>Rs. 11,999/year</strong>. Renewal at <strong>Rs. 4,999/year</strong>.</p>
          </div>
          <div className="dashboard-mock">
            <div className="mock-bar">
              <div className="mock-dot" style={{background:"#ff5f57"}}></div>
              <div className="mock-dot" style={{background:"#febc2e"}}></div>
              <div className="mock-dot" style={{background:"#28c840"}}></div>
            </div>
            <div className="mock-grid">
              <div className="mock-card">
                <div className="mock-label">Total Sales</div>
                <div className="mock-value gold">Rs. 48.2L</div>
              </div>
              <div className="mock-card">
                <div className="mock-label">Outstanding</div>
                <div className="mock-value">Rs. 6.8L</div>
              </div>
              <div className="mock-card">
                <div className="mock-label">Purchase</div>
                <div className="mock-value">Rs. 31.5L</div>
              </div>
              <div className="mock-card">
                <div className="mock-label">Net Profit</div>
                <div className="mock-value gold">Rs. 16.7L</div>
              </div>
            </div>
            <div className="mock-chart">
              {[40,65,45,80,60,90,55,75,85,70,95,88].map((h,i) => (
                <div key={i} className="bar" style={{height:`${h}%`}}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      <div className="section">
        <div className="section-tag">Why ERPBridge</div>
        <h2 className="section-title">What Tally Cannot Show,<br />We Do</h2>
        <p className="section-sub">Your ERP handles data entry. ERPBridge turns that data into business intelligence.</p>
        <div className="features-grid">
          {[
            { icon: "[+]", title: "Real-time Reports", desc: "Sales, Purchase, P&L, Party Ledger - all live. No manual calculations, no waiting." },
            { icon: "[F]", title: "Any ERP, Any File", desc: "Tally, Busy, Marg, Zoho - upload any CSV or Excel file. Ready in 2 minutes." },
            { icon: "[^]", title: "Visual Analytics", desc: "Charts and graphs that make trends obvious at a glance. No spreadsheet skills needed." },
            { icon: "[S]", title: "Secure and Private", desc: "Your business data stays yours. Encrypted storage, secure login via Google." },
            { icon: "[C]", title: "Works Everywhere", desc: "Access your dashboard from any device - laptop, phone, or tablet." },
            { icon: "[*]", title: "Instant Setup", desc: "No installation. No IT team needed. Upload a file and you are live." },
          ].map((f) => (
            <div key={f.title} className="feature">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider"></div>

      <div className="section">
        <div className="section-tag">Compatibility</div>
        <h2 className="section-title">Works With Your ERP</h2>
        <p className="section-sub">Already using an ERP? ERPBridge connects to it without any integration or IT work.</p>
        <div className="erp-row">
          {["Tally Prime", "Tally ERP 9", "Busy Accounting", "Marg ERP", "Zoho Books", "Microsoft Excel", "CSV Export"].map((e) => (
            <div key={e} className="erp-chip">{e}</div>
          ))}
        </div>
      </div>

      <div className="divider"></div>

      <div className="section">
        <div className="section-tag">Pricing</div>
        <h2 className="section-title">One Price. Everything Included.</h2>
        <div className="pricing-box">
          <div>
            <div className="pricing-amount">Rs. 11,999</div>
            <div className="pricing-period">per year - first time</div>
            <div className="pricing-renewal">Renewal: Rs. 4,999/year</div>
            <div className="compare">Magenta BI charges <strong>Rs. 36,000/year</strong>. We charge <strong>Rs. 11,999</strong>.</div>
          </div>
          <div>
            <ul className="pricing-features">
              <li>7-day free trial, no card needed</li>
              <li>Unlimited reports</li>
              <li>All ERP formats supported</li>
              <li>Sales, Purchase, P&amp;L, Ledger</li>
              <li>Secure Google login</li>
              <li>Access from any device</li>
            </ul>
            <Link href="/login" className="btn-primary" style={{marginTop: "28px", display: "inline-block"}}>Start Free Trial</Link>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-logo">ERP<span>Bridge</span></div>
        <div className="footer-text">ERPBridge - Business Intelligence for Indian Businesses</div>
      </footer>

    </main>
  );
}