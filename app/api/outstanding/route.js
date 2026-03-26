import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(atob(session.value));
    const sql = neon(process.env.DATABASE_URL);

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || null;
    const to = searchParams.get("to") || null;

    // Party-wise outstanding — sales minus receipts
    let outstanding;
    if (from && to) {
      outstanding = await sql`
        SELECT
          party,
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS total_sales,
          SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END) AS total_received,
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) -
          SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END) AS balance,
          MAX(date) AS last_transaction,
          COUNT(CASE WHEN type = 'sales' THEN 1 END) AS invoice_count
        FROM transactions
        WHERE date >= ${from}::date AND date <= ${to}::date
        GROUP BY party
        HAVING (
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) -
          SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END)
        ) > 0
        ORDER BY balance DESC
      `;
    } else {
      outstanding = await sql`
        SELECT
          party,
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS total_sales,
          SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END) AS total_received,
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) -
          SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END) AS balance,
          MAX(date) AS last_transaction,
          COUNT(CASE WHEN type = 'sales' THEN 1 END) AS invoice_count
        FROM transactions
        GROUP BY party
        HAVING (
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) -
          SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END)
        ) > 0
        ORDER BY balance DESC
      `;
    }

    const summary = await sql`
      SELECT
        COUNT(DISTINCT party) AS total_parties,
        SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS total_sales,
        SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END) AS total_received,
        SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) -
        SUM(CASE WHEN type = 'receipt' THEN COALESCE(amount, 0) ELSE 0 END) AS total_outstanding
      FROM transactions
    `;

    return NextResponse.json({
      outstanding,
      summary: summary[0] || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}