import bcrypt from 'bcryptjs';
import pool from './pool.js';

async function createUser() {
  const username = process.env.VITE_DEFAULT_USERNAME;
  const plainPassword = process.env.VITE_DEFAULT_PASSWORD; 

  const hashedPassword = bcrypt.hash(plainPassword, 10);

  try {
    await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      [username, hashedPassword]
    );
    console.log(`User '${username}' created successfully`);
  } catch (err) {
    console.error('Error creating user:', err);
  } finally {
    await pool.end();
  }
}

createUser();