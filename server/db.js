import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

let isPostgres = false;
let pool = null;
let sqliteDb = null;

if (DATABASE_URL) {
  isPostgres = true;
  console.log('[+] Initializing PostgreSQL client using DATABASE_URL...');
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });
} else {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'loosr.db');
  console.log(`[+] Initializing SQLite database client at: ${dbPath}`);
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
}

// Convert SQLite '?' parameters to PostgreSQL '$1, $2...'
function formatQuery(sql, isPg) {
  if (!isPg) return sql;
  let index = 1;
  let formatted = sql.replace(/\?/g, () => `$${index++}`);
  // If INSERT query without RETURNING, append RETURNING *
  if (/^\s*INSERT\s+INTO/i.test(formatted) && !/RETURNING/i.test(formatted)) {
    formatted += ' RETURNING *';
  }
  return formatted;
}

// Ensure database tables exist
async function initSchema() {
  if (isPostgres) {
    try {
      // Safe migration for carts table if cart_id column is missing
      try {
        const check = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'carts' AND column_name = 'cart_id'
        `);
        if (check.rows.length === 0) {
          await pool.query('DROP TABLE IF EXISTS carts CASCADE;');
          console.log('[+] Migrating carts table to universal cart_id schema...');
        }
      } catch (checkErr) {
        console.error('Carts migration check notice:', checkErr);
      }

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          phone TEXT DEFAULT '',
          address TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          order_number TEXT NOT NULL,
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          delivery_address TEXT,
          total REAL NOT NULL,
          payment_method TEXT DEFAULT 'cod',
          items_json TEXT NOT NULL,
          status TEXT DEFAULT 'CONFIRMED',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS carts (
          cart_id TEXT PRIMARY KEY,
          user_id INTEGER,
          session_id TEXT,
          items_json TEXT NOT NULL DEFAULT '[]',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
        CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
      `);
      console.log('[✓] PostgreSQL production schema confirmed.');
    } catch (err) {
      console.error('PostgreSQL schema creation warning:', err);
    }
  } else {
    try {
      // Check SQLite carts table schema
      try {
        const pragma = sqliteDb.pragma('table_info(carts)');
        const hasCartId = pragma.some((c) => c.name === 'cart_id');
        if (!hasCartId && pragma.length > 0) {
          sqliteDb.exec('DROP TABLE IF EXISTS carts;');
          console.log('[+] Migrating SQLite carts table to universal cart_id schema...');
        }
      } catch (checkErr) {}

      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          phone TEXT DEFAULT '',
          address TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          order_number TEXT NOT NULL,
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          delivery_address TEXT,
          total REAL NOT NULL,
          payment_method TEXT DEFAULT 'cod',
          items_json TEXT NOT NULL,
          status TEXT DEFAULT 'CONFIRMED',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS carts (
          cart_id TEXT PRIMARY KEY,
          user_id INTEGER,
          session_id TEXT,
          items_json TEXT NOT NULL DEFAULT '[]',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('[✓] SQLite local schema confirmed.');
    } catch (err) {
      console.error('SQLite schema creation warning:', err);
    }
  }
}

initSchema();

const db = {
  isPostgres,
  async get(sql, params = []) {
    if (isPostgres) {
      const pgSql = formatQuery(sql, true);
      const res = await pool.query(pgSql, params);
      return res.rows[0] || null;
    } else {
      return sqliteDb.prepare(sql).get(...params) || null;
    }
  },
  async all(sql, params = []) {
    if (isPostgres) {
      const pgSql = formatQuery(sql, true);
      const res = await pool.query(pgSql, params);
      return res.rows;
    } else {
      return sqliteDb.prepare(sql).all(...params);
    }
  },
  async run(sql, params = []) {
    if (isPostgres) {
      const pgSql = formatQuery(sql, true);
      const res = await pool.query(pgSql, params);
      return {
        lastInsertRowid: res.rows[0]?.id || res.rows[0]?.user_id || null,
        changes: res.rowCount,
      };
    } else {
      const info = sqliteDb.prepare(sql).run(...params);
      return info;
    }
  },
};

export default db;
