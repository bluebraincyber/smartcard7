import { Pool, types } from 'pg';
import 'dotenv/config';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Parse numeric types as JavaScript numbers instead of strings
types.setTypeParser(types.builtins.INT8, (val) => parseInt(val, 10));
types.setTypeParser(types.builtins.FLOAT8, (val) => parseFloat(val));
types.setTypeParser(types.builtins.NUMERIC, (val) => parseFloat(val));

async function checkDatabase() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found in environment variables');
    console.log('Please set either DATABASE_URL or POSTGRES_URL in your .env.local file');
    process.exit(1);
  }

  console.log('🔍 Database connection details:');
  console.log(`- Connection string: ${connectionString.split('@')[1]}`);
  console.log(`- Node environment: ${process.env.NODE_ENV || 'development'}`);
  
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { 
      rejectUnauthorized: false 
    } : false,
    connectionTimeoutMillis: 5000, // 5 seconds timeout
  });

  try {
    // Test database connection
    console.log('\n🔌 Testing database connection...');
    const startTime = Date.now();
    const client = await pool.connect();
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Connected to database in ${connectionTime}ms`);
    
    try {
      // Get database version
      const versionResult = await client.query('SELECT version()');
      console.log(`\n📊 Database version: ${versionResult.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
      
      // Check if users table exists
      console.log('\n🔍 Checking users table...');
      const tableExists = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        )`
      );

      if (!tableExists.rows[0].exists) {
        console.error('❌ Users table does not exist in the public schema');
        return;
      }

      // Get table structure
      const tableResult = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      console.log('\n📋 Users table structure:');
      console.table(
        tableResult.rows.map(row => ({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES' ? '✅' : '❌',
          default: row.column_default || 'NULL',
          max_length: row.character_maximum_length || 'N/A'
        }))
      );

      // Check user count
      const countResult = await client.query('SELECT COUNT(*) as user_count FROM users');
      const userCount = parseInt(countResult.rows[0].user_count, 10);
      console.log(`\n👥 Total users in database: ${userCount}`);

      // Get sample users if any exist
      if (userCount > 0) {
        const usersResult = await client.query(
          'SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );
        
        console.log('\n👤 Latest users:');
        console.table(
          usersResult.rows.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name || 'N/A',
            created: new Date(user.created_at).toLocaleDateString()
          }))
        );
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('\n❌ Database check failed:');
    console.error('Error:', error instanceof Error ? error.message : error);
    
    interface DatabaseError extends Error {
      code?: string;
    }
    
    const dbError = error as DatabaseError;
    if (dbError.code) {
      console.error('Error code:', dbError.code);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('- Check if the database server is running');
    console.error('- Verify the connection string in your .env.local file');
    console.error('- Ensure the database user has the correct permissions');
    console.error('- Check if the database hostname is correct and accessible');
    
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkDatabase()
  .then(() => console.log('\n✨ Database check completed successfully!'))
  .catch((err) => {
    console.error('\n❌ An unexpected error occurred:', err);
    process.exit(1);
  });
