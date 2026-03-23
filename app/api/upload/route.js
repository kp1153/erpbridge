import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as XLSX from "xlsx";

function detectType(row) {
  const vchType = String(
    row["Vch Type"] || row["vch type"] || row["VCH TYPE"] ||
    row["Voucher Type"] || row["voucher type"] || ""
  ).trim().toLowerCase();

  if (vchType.includes("sales")) return "sales";
  if (vchType.includes("purchase")) return "purchase";
  if (vchType.includes("receipt") || vchType.includes("payment")) return "outstanding";

  const manualType = String(row["type"] || row["Type"] || row["TYPE"] || "").trim().toLowerCase();

  if (manualType === "sales") return "sales";
  if (manualType === "purchase") return "purchase";
  if (manualType === "outstanding") return "outstanding";

  return null;
}

function isFmcgFormat(headers) {
  return (
    headers.some((h) => h.toLowerCase().includes("invoice no")) &&
    headers.some((h) => h.toLowerCase() === "asm") &&
    headers.some((h) => h.toLowerCase().includes("sales officer") || h.toLowerCase() === "so")
  );
}

async function processFmcg(rows, sql) {
  const headers = Object.keys(rows[0]);
  const productCols = headers.filter((h) => {
    const l = h.toLowerCase();
    return !["date", "invoice no", "party name", "city", "state", "asm", "sales officer", "so", "invoice total qty", "district"].includes(l);
  });

  const invoiceValues = [];
  const itemValues = [];

  for (const row of rows) {
    const invoiceNo = String(row["Invoice No"] || row["invoice no"] || "").trim();
    const party = String(row["Party Name"] || row["party name"] || "").trim();
    const city = String(row["City"] || row["city"] || "").trim();
    const state = String(row["State"] || row["state"] || "").trim();
    const asm = String(row["ASM"] || row["asm"] || "").trim();
    const so = String(row["Sales Officer"] || row["sales officer"] || row["SO"] || row["so"] || "").trim();
    const totalQty = parseInt(row["Invoice Total Qty"] || row["invoice total qty"] || 0);

    const rawDate = row["Date"] || row["date"] || "";
    let date = null;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) date = parsed.toISOString().split("T")[0];
    }

    if (!invoiceNo || !party || !date) continue;

    const products = [];
    for (const product of productCols) {
      const qty = parseInt(row[product] || 0);
      if (qty > 0) products.push({ product, qty });
    }

    invoiceValues.push({ invoiceNo, date, party, city, state, asm, so, totalQty, products });
  }

  if (invoiceValues.length === 0) return { inserted: 0, skipped: 0 };

  const inserted_invoices = await sql`
    INSERT INTO invoices (invoice_no, date, party, city, state, asm, so, total_qty)
    SELECT * FROM json_to_recordset(${JSON.stringify(
      invoiceValues.map(v => ({
        invoice_no: v.invoiceNo,
        date: v.date,
        party: v.party,
        city: v.city,
        state: v.state,
        asm: v.asm,
        so: v.so,
        total_qty: v.totalQty,
      }))
    )}::json) AS t(invoice_no text, date date, party text, city text, state text, asm text, so text, total_qty int)
    ON CONFLICT DO NOTHING
    RETURNING id, invoice_no
  `;

  const invoiceMap = {};
  for (const inv of inserted_invoices) {
    invoiceMap[inv.invoice_no] = inv.id;
  }

  for (const v of invoiceValues) {
    const invoiceId = invoiceMap[v.invoiceNo];
    if (!invoiceId) continue;
    for (const { product, qty } of v.products) {
      itemValues.push({ invoice_id: invoiceId, product, qty });
    }
  }

  if (itemValues.length > 0) {
    await sql`
      INSERT INTO invoice_items (invoice_id, product, qty)
      SELECT * FROM json_to_recordset(${JSON.stringify(itemValues)}::json)
      AS t(invoice_id int, product text, qty int)
    `;
  }

  const skipped = invoiceValues.length - inserted_invoices.length;
  return { inserted: inserted_invoices.length, skipped };
}

async function processTally(rows, sql) {
  const validRows = [];

  for (const row of rows) {
    const type = detectType(row);
    const party = String(
      row["party"] || row["Party"] || row["PARTY"] ||
      row["name"] || row["Name"] || row["Particulars"] || row["particulars"] || ""
    ).trim();
    const amount = parseFloat(
      row["amount"] || row["Amount"] || row["AMOUNT"] ||
      row["Debit"] || row["debit"] || row["Credit"] || row["credit"] || 0
    );
    const rawDate = row["date"] || row["Date"] || row["DATE"] || row["Voucher Date"] || row["voucher date"] || "";

    let date = null;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) date = parsed.toISOString().split("T")[0];
    }

    if (!type || !amount || !date) continue;
    validRows.push({ type, party, amount, date });
  }

  if (validRows.length === 0) return { inserted: 0, skipped: rows.length };

  const result = await sql`
    INSERT INTO transactions (type, party, amount, date)
    SELECT * FROM json_to_recordset(${JSON.stringify(validRows)}::json)
    AS t(type text, party text, amount numeric, date date)
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  return { inserted: result.length, skipped: rows.length - result.length };
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames.find(
      (s) => s.toLowerCase().includes("sales") || s.toLowerCase().includes("invoice")
    ) || workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "File is empty or unreadable" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const headers = Object.keys(rows[0]);
    const fmcg = isFmcgFormat(headers);

    const { inserted, skipped } = fmcg
      ? await processFmcg(rows, sql)
      : await processTally(rows, sql);

    const formatLabel = fmcg ? "FMCG" : "Tally";

    return NextResponse.json({
      message: `${formatLabel} upload complete. ${inserted} records saved, ${skipped} skipped.`,
      inserted,
      skipped,
    });
  } catch (error) {
    return NextResponse.json({ message: "Upload failed: " + error.message }, { status: 500 });
  }
}