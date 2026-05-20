import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running the seed script.");
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  INSERT INTO families (id, name, display_order)
  VALUES
    (1, '家庭 A', 1),
    (2, '家庭 B', 2),
    (3, '家庭 C', 3)
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      display_order = EXCLUDED.display_order
`;

await sql`SELECT setval(pg_get_serial_sequence('families', 'id'), COALESCE((SELECT MAX(id) FROM families), 1), true)`;

console.log("Seeded families: 家庭 A, 家庭 B, 家庭 C");
