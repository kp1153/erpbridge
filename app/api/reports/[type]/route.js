import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request, { params }) {
  const { type } = await params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const sql = neon(process.env.DATABASE_URL);
    let data = [];

    if (type === "sales" || type === "purchase") {
      data = await sql`
        SELECT party,
               SUM(amount) as total,
               COUNT(*) as count,
               MAX(date) as last_date
        FROM transactions
        WHERE type = ${type}
        ${from ? sql`AND date >= ${from}` : sql``}
        ${to ? sql`AND date <= ${to}` : sql``}
        GROUP BY party
        ORDER BY total DESC
      `;
    } else if (type === "ledger") {
      data = await sql`
        SELECT party,
               SUM(CASE WHEN type = 'sales' THEN amount ELSE 0 END) as sales,
               SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END) as purchase,
               SUM(CASE WHEN type = 'sales' THEN amount ELSE -amount END) as balance
        FROM transactions
        WHERE 1=1
        ${from ? sql`AND date >= ${from}` : sql``}
        ${to ? sql`AND date <= ${to}` : sql``}
        GROUP BY party
        ORDER BY party
      `;
    } else if (type === "pnl") {
      data = await sql`
        SELECT type,
               SUM(amount) as total
        FROM transactions
        WHERE type IN ('sales', 'purchase')
        ${from ? sql`AND date >= ${from}` : sql``}
        ${to ? sql`AND date <= ${to}` : sql``}
        GROUP BY type
      `;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}