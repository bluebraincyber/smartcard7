import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
export { pool };

// Export sql template literal function for convenience
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((acc, part, i) => acc + '$' + (i + 1) + part);
  const result = await pool.query(query, values);
  return result;
};
