const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_PLATFORM_POOL_MAX || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
};

const platformDbName = process.env.DB_PLATFORM_NAME || 'campuscorp_platform';

// Central Platform Database Pool
const platformPool = mysql.createPool({
  ...dbConfig,
  database: platformDbName,
});

/**
 * Execute query against the central platform database
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
async function queryPlatform(sql, params = []) {
  const [results] = await platformPool.execute(sql, params);
  return results;
}

/**
 * Health check for central platform database
 * @returns {Promise<{ status: string, database: string, latencyMs: number }>}
 */
async function checkPlatformHealth() {
  const startTime = Date.now();
  try {
    const [rows] = await platformPool.query('SELECT 1 AS alive');
    const latencyMs = Date.now() - startTime;
    return {
      status: rows && rows[0]?.alive === 1 ? 'UP' : 'DOWN',
      database: platformDbName,
      latencyMs,
      connected: true,
    };
  } catch (err) {
    return {
      status: 'DOWN',
      database: platformDbName,
      latencyMs: Date.now() - startTime,
      connected: false,
      error: err.message,
    };
  }
}

/**
 * Dynamically test connectivity to a college database registry target
 * @param {object} connectionInfo - { host, port, user, password, database }
 * @returns {Promise<{ healthy: boolean, latencyMs: number, error?: string, tableCount?: number }>}
 */
async function testCollegeDbConnection({ host, port, user, password, database }) {
  const startTime = Date.now();
  let conn;
  try {
    conn = await mysql.createConnection({
      host: host || dbConfig.host,
      port: parseInt(port || dbConfig.port, 10),
      user: user || dbConfig.user,
      password: password !== undefined ? password : dbConfig.password,
      database: database,
      connectTimeout: 5000,
    });

    const [testRows] = await conn.query('SELECT 1 AS ping');
    const latencyMs = Date.now() - startTime;

    // Check table count
    let tableCount = 0;
    try {
      const [tableRows] = await conn.query(
        'SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = ?',
        [database]
      );
      tableCount = tableRows[0]?.total_tables || 0;
    } catch {
      // Ignored if information_schema query lacks grant
    }

    await conn.end();

    return {
      healthy: testRows && testRows[0]?.ping === 1,
      latencyMs,
      tableCount,
    };
  } catch (err) {
    if (conn) {
      try {
        await conn.end();
      } catch {
        // ignore end error
      }
    }
    return {
      healthy: false,
      latencyMs: Date.now() - startTime,
      error: err.message,
    };
  }
}

module.exports = {
  platformPool,
  queryPlatform,
  checkPlatformHealth,
  testCollegeDbConnection,
  platformDbName,
};

