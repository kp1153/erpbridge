import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const fromDate = `${month}-01`;
    const toDate = `${month}-31`;

    // Actual SO-wise sales from transactions
    const actual = await sql`
      SELECT
        so AS so_name,
        SUM(COALESCE(amount, 0)) AS actual_amount,
        COUNT(*) AS actual_invoices
      FROM transactions
      WHERE type = 'sales'
        AND date >= ${fromDate}::date
        AND date <= ${toDate}::date
        AND so IS NOT NULL
        AND so != ''
      GROUP BY so
    `;

    // Targets for this month
    const targets = await sql`
      SELECT so_name, target_amount, target_qty
      FROM so_targets
      WHERE month = ${month}
    `;

    // Merge actual + target
    const targetMap = {};
    targets.forEach((t) => { targetMap[t.so_name] = t; });

    const performance = actual.map((a) => {
      const t = targetMap[a.so_name] || { target_amount: 0, target_qty: 0 };
      const amt_pct = t.target_amount > 0
        ? Math.round((Number(a.actual_amount) / Number(t.target_amount)) * 100)
        : null;
      return {
        so_name: a.so_name,
        actual_amount: a.actual_amount,
        actual_invoices: a.actual_invoices,
        target_amount: t.target_amount,
        target_qty: t.target_qty,
        amount_pct: amt_pct,
        status: amt_pct === null ? "no_target"
               : amt_pct >= 100 ? "achieved"
               : amt_pct >= 75  ? "near"
               : "behind",
      };
    });

    // Also add SO who have targets but no sales yet
    targets.forEach((t) => {
      if (!actual.find((a) => a.so_name === t.so_name)) {
        performance.push({
          so_name: t.so_name,
          actual_amount: 0,
          actual_invoices: 0,
          target_amount: t.target_amount,
          target_qty: t.target_qty,
          amount_pct: 0,
          status: "behind",
        });
      }
    });

    performance.sort((a, b) => (b.amount_pct || 0) - (a.amount_pct || 0));

    return NextResponse.json({ performance, month });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}