import sql from "./db";

export async function getAllTransactions() {
  const rows = await sql`SELECT * FROM transactions ORDER BY date DESC`;
  return rows;
}

export async function insertTransaction(data) {
  const { type, party, amount, date } = data;
  const rows = await sql`
    INSERT INTO transactions (type, party, amount, date)
    VALUES (${type}, ${party}, ${amount}, ${date})
    RETURNING *
  `;
  return rows[0];
}