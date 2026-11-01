import { readFile } from "node:fs/promises";
import { Pool } from "pg";

export const createPool = async (connectionString: string): Promise<Pool> => {
  const pool = new Pool({ connectionString });
  try {
    const schema = await readFile(
      new URL("../../sql/schema.sql", import.meta.url),
      "utf8",
    );
    await pool.query(schema);
    return pool;
  } catch (error) {
    await pool.end();
    throw error;
  }
};
