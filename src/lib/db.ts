import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default pool;
export { pool };

// Export sql template literal function for convenience
export const sql = (strings: TemplateStringsArray, ...values: []) => {
  let query = '';
  const params: [] = [];
  
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      query += `${params.length}`;
    }
  }
  
  return { text: query, values: params };
};