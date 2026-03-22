import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const salesResult = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'sales'`;
    const purchaseResult = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'purchase'`;
    const outstandingResult = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'outstanding'`;

    const sales = parseFloat(salesResult[0].total);
    const purchase = parseFloat(purchaseResult[0].total);
    const outstanding = parseFloat(outstandingResult[0].total);
    const profit = sales - purchase;

    const chartResult = await sql`
      SELECT EXTRACT(MONTH FROM date) as month, SUM(amount) as total
      FROM transactions
      WHERE type = 'sales'
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month
    `;

    return NextResponse.json({
      stats: { sales, purchase, outstanding, profit },
      chart: chartResult.map((r) => ({ month: parseInt(r.month), total: parseFloat(r.total) })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}