import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(atob(session.value));
    const sql = neon(process.env.DATABASE_URL);

    // Aging: only sales invoices grouped by how old they are
    // Parties with partial payment are still included correctly
    const aging = await sql`
      SELECT
        s.party,
        SUM(CASE WHEN CURRENT_DATE - s.date::date <= 30
          THEN COALESCE(s.amount, 0) ELSE 0 END) AS days_0_30,
        SUM(CASE WHEN CURRENT_DATE - s.date::date BETWEEN 31 AND 60
          THEN COALESCE(s.amount, 0) ELSE 0 END) AS days_31_60,
        SUM(CASE WHEN CURRENT_DATE - s.date::date BETWEEN 61 AND 90
          THEN COALESCE(s.amount, 0) ELSE 0 END) AS days_61_90,
        SUM(CASE WHEN CURRENT_DATE - s.date::date > 90
          THEN COALESCE(s.amount, 0) ELSE 0 END) AS days_90_plus,
        SUM(COALESCE(s.amount, 0)) AS total_sales,
        COALESCE(r.total_received, 0) AS total_received,
        SUM(COALESCE(s.amount, 0)) - COALESCE(r.total_received, 0) AS outstanding
      FROM transactions s
      LEFT JOIN (
        SELECT party, SUM(COALESCE(amount, 0)) AS total_received
        FROM transactions
        WHERE type = 'receipt'
        GROUP BY party
      ) r ON s.party = r.party
      WHERE s.type = 'sales'
      GROUP BY s.party, r.total_received
      HAVING SUM(COALESCE(s.amount, 0)) - COALESCE(r.total_received, 0) > 0
      ORDER BY outstanding DESC
    `;

    return NextResponse.json({ aging });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}