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
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let partywise;
    let monthly;

    if (from && to) {
      partywise = await sql`
        SELECT
          party,
          SUM(COALESCE(amount, 0)) AS total_purchase,
          COUNT(*) AS invoice_count,
          MAX(date) AS last_purchase,
          MIN(date) AS first_purchase
        FROM transactions
        WHERE type = 'purchase'
          AND date >= ${from}::date AND date <= ${to}::date
        GROUP BY party
        ORDER BY total_purchase DESC
      `;
      monthly = await sql`
        SELECT
          TO_CHAR(date, 'YYYY-MM') AS month,
          SUM(COALESCE(amount, 0)) AS total_purchase,
          COUNT(*) AS invoice_count
        FROM transactions
        WHERE type = 'purchase'
          AND date >= ${from}::date AND date <= ${to}::date
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month ASC
      `;
    } else {
      partywise = await sql`
        SELECT
          party,
          SUM(COALESCE(amount, 0)) AS total_purchase,
          COUNT(*) AS invoice_count,
          MAX(date) AS last_purchase,
          MIN(date) AS first_purchase
        FROM transactions
        WHERE type = 'purchase'
        GROUP BY party
        ORDER BY total_purchase DESC
      `;
      monthly = await sql`
        SELECT
          TO_CHAR(date, 'YYYY-MM') AS month,
          SUM(COALESCE(amount, 0)) AS total_purchase,
          COUNT(*) AS invoice_count
        FROM transactions
        WHERE type = 'purchase'
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month ASC
      `;
    }

    const summary = await sql`
      SELECT
        SUM(COALESCE(amount, 0)) AS total_purchase,
        COUNT(*) AS total_invoices,
        COUNT(DISTINCT party) AS total_suppliers,
        AVG(COALESCE(amount, 0)) AS avg_purchase
      FROM transactions
      WHERE type = 'purchase'
    `;

    return NextResponse.json({ partywise, monthly, summary: summary[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}