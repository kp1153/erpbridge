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

    let inventory;
    if (from && to) {
      inventory = await sql`
        SELECT
          party AS item,
          SUM(CASE WHEN type = 'purchase' THEN COALESCE(amount, 0) ELSE 0 END) AS total_purchase,
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS total_sales,
          SUM(CASE WHEN type = 'purchase' THEN COALESCE(amount, 0) ELSE 0 END) -
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS stock_value,
          COUNT(CASE WHEN type = 'sales' THEN 1 END) AS sales_count,
          COUNT(CASE WHEN type = 'purchase' THEN 1 END) AS purchase_count,
          MAX(date) AS last_movement
        FROM transactions
        WHERE date >= ${from}::date AND date <= ${to}::date
        GROUP BY party
        ORDER BY total_sales DESC
      `;
    } else {
      inventory = await sql`
        SELECT
          party AS item,
          SUM(CASE WHEN type = 'purchase' THEN COALESCE(amount, 0) ELSE 0 END) AS total_purchase,
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS total_sales,
          SUM(CASE WHEN type = 'purchase' THEN COALESCE(amount, 0) ELSE 0 END) -
          SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS stock_value,
          COUNT(CASE WHEN type = 'sales' THEN 1 END) AS sales_count,
          COUNT(CASE WHEN type = 'purchase' THEN 1 END) AS purchase_count,
          MAX(date) AS last_movement
        FROM transactions
        GROUP BY party
        ORDER BY total_sales DESC
      `;
    }

    const summary = await sql`
      SELECT
        SUM(CASE WHEN type = 'purchase' THEN COALESCE(amount, 0) ELSE 0 END) AS total_purchase,
        SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS total_sales,
        SUM(CASE WHEN type = 'purchase' THEN COALESCE(amount, 0) ELSE 0 END) -
        SUM(CASE WHEN type = 'sales' THEN COALESCE(amount, 0) ELSE 0 END) AS net_stock,
        COUNT(DISTINCT party) AS total_items
      FROM transactions
    `;

    return NextResponse.json({ inventory, summary: summary[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}