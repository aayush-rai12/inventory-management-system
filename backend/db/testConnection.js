import pool from './pool.js';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log(' Connected to Neon successfully!');
    console.log('Server time:', result.rows[0].current_time);
  } catch (err) {
    console.error(' Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();