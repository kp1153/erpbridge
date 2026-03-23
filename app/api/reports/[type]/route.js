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
    } else if (type === "fmcg-party") {
      data = await sql`
        SELECT party,
               city,
               state,
               COUNT(*) as invoices,
               SUM(total_qty) as total_qty
        FROM invoices
        WHERE 1=1
        ${from ? sql`AND date >= ${from}` : sql``}
        ${to ? sql`AND date <= ${to}` : sql``}
        GROUP BY party, city, state
        ORDER BY total_qty DESC
      `;
    } else if (type === "fmcg-product") {
      data = await sql`
        SELECT ii.product,
               SUM(ii.qty) as total_qty,
               COUNT(DISTINCT i.id) as invoices
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE 1=1
        ${from ? sql`AND i.date >= ${from}` : sql``}
        ${to ? sql`AND i.date <= ${to}` : sql``}
        GROUP BY ii.product
        ORDER BY total_qty DESC
      `;
    } else if (type === "fmcg-so") {
      data = await sql`
        SELECT so,
               COUNT(*) as invoices,
               SUM(total_qty) as total_qty,
               COUNT(DISTINCT party) as parties
        FROM invoices
        WHERE 1=1
        ${from ? sql`AND date >= ${from}` : sql``}
        ${to ? sql`AND date <= ${to}` : sql``}
        GROUP BY so
        ORDER BY total_qty DESC
      `;
    } else if (type === "fmcg-asm") {
      data = await sql`
        SELECT asm,
               COUNT(*) as invoices,
               SUM(total_qty) as total_qty,
               COUNT(DISTINCT party) as parties,
               COUNT(DISTINCT so) as sos
        FROM invoices
        WHERE 1=1
        ${from ? sql`AND date >= ${from}` : sql``}
        ${to ? sql`AND date <= ${to}` : sql``}
        GROUP BY asm
        ORDER BY total_qty DESC
      `;
    } else if (type === "fmcg-city") {
      data = await sql`
        SELECT city,
               state,
               COUNT(*) as invoices,
               SUM(total_qty) as total_qty,
               COUNT(DISTINCT party) as parties
        FROM invoices
        WHERE 1=1
        ${from ? sql`AND date >= ${from}` : sql``}
        ${to ? sql`AND date <= ${to}` : sql``}
        GROUP BY city, state
        ORDER BY total_qty DESC
      `;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}