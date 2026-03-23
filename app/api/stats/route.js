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

    const tallyMonthly = await sql`
      SELECT EXTRACT(MONTH FROM date) as month,
             EXTRACT(YEAR FROM date) as year,
             SUM(CASE WHEN type = 'sales' THEN amount ELSE 0 END) as sales,
             SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END) as purchase
      FROM transactions
      GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
      ORDER BY year, month
    `;

    const tallyParty = await sql`
      SELECT party, SUM(amount) as total
      FROM transactions
      WHERE type = 'sales'
      GROUP BY party
      ORDER BY total DESC
      LIMIT 10
    `;

    const tallyType = await sql`
      SELECT type, SUM(amount) as total
      FROM transactions
      WHERE type IN ('sales', 'purchase', 'outstanding')
      GROUP BY type
    `;

    const fmcgInvoices = await sql`SELECT COALESCE(COUNT(*), 0) as total FROM invoices`;
    const fmcgQty = await sql`SELECT COALESCE(SUM(total_qty), 0) as total FROM invoices`;
    const fmcgParties = await sql`SELECT COALESCE(COUNT(DISTINCT party), 0) as total FROM invoices`;

    const fmcgMonthly = await sql`
      SELECT EXTRACT(MONTH FROM date) as month,
             EXTRACT(YEAR FROM date) as year,
             COUNT(*) as invoices,
             SUM(total_qty) as qty
      FROM invoices
      GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
      ORDER BY year, month
    `;

    const fmcgProduct = await sql`
      SELECT ii.product, SUM(ii.qty) as total_qty
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      GROUP BY ii.product
      ORDER BY total_qty DESC
      LIMIT 10
    `;

    const fmcgCity = await sql`
      SELECT city, SUM(total_qty) as total_qty
      FROM invoices
      GROUP BY city
      ORDER BY total_qty DESC
      LIMIT 8
    `;

    return NextResponse.json({
      stats: { sales, purchase, outstanding, profit },
      tally: {
        monthly: tallyMonthly.map((r) => ({
          month: `${parseInt(r.month)}/${parseInt(r.year)}`,
          sales: parseFloat(r.sales),
          purchase: parseFloat(r.purchase),
        })),
        party: tallyParty.map((r) => ({
          party: r.party,
          total: parseFloat(r.total),
        })),
        type: tallyType.map((r) => ({
          name: r.type,
          value: parseFloat(r.total),
        })),
      },
      fmcg: {
        invoices: parseInt(fmcgInvoices[0].total),
        qty: parseInt(fmcgQty[0].total),
        parties: parseInt(fmcgParties[0].total),
        monthly: fmcgMonthly.map((r) => ({
          month: `${parseInt(r.month)}/${parseInt(r.year)}`,
          invoices: parseInt(r.invoices),
          qty: parseInt(r.qty),
        })),
        product: fmcgProduct.map((r) => ({
          name: r.product,
          value: parseInt(r.total_qty),
        })),
        city: fmcgCity.map((r) => ({
          city: r.city,
          total_qty: parseInt(r.total_qty),
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}