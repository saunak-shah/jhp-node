// Import required libraries
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Connect to PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'jhp-db',
  password: '12345',
  port: 5432,
});

(async () => {
  const client = await pool.connect();
  try {
    // Begin a transaction
    await client.query('BEGIN');

    // Read SQL migration file
    const sqlFilePath = path.join(__dirname, 'migrations', '2024032801_add_column_to_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL query
    await client.query(sql);

    // Insert migration record into the migrations table
    await client.query('INSERT INTO migrations (version) VALUES ($1)', [2024032801]);

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Migration successful');
  } catch (err) {
    // Rollback the transaction in case of any error
    await client.query('ROLLBACK');
    console.error('Error executing migration:', err);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the pool
    await pool.end();
  }
})();
