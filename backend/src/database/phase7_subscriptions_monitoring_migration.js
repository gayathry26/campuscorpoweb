const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const platformDbName = process.env.DB_PLATFORM_NAME || 'campuscorp_platform';

async function runPhase7Migration() {
  console.log('================================================================');
  console.log('💳 [PHASE 7 MIGRATION] Deploying Invoices & Monitoring Tables');
  console.log('================================================================');

  const platformConn = await mysql.createConnection({ ...dbConfig, database: platformDbName });

  try {
    // 1. Create college_invoices table
    console.log('Creating college_invoices table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS college_invoices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        college_id INT NOT NULL,
        plan_id INT NULL,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        amount_inr DECIMAL(10,2) NOT NULL,
        tax_inr DECIMAL(10,2) DEFAULT 0.00,
        total_inr DECIMAL(10,2) NOT NULL,
        status ENUM('PAID', 'PENDING', 'OVERDUE', 'CANCELLED') DEFAULT 'PAID',
        payment_method VARCHAR(50) DEFAULT 'BANK_TRANSFER',
        paid_at TIMESTAMP NULL,
        due_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_college (college_id),
        INDEX idx_status (status),
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ college_invoices table deployed.');

    // 2. Seed an initial invoice for Flagship college (id: 1) if colleges exist
    const [colleges] = await platformConn.query('SELECT id, name FROM colleges LIMIT 1');
    if (colleges.length > 0) {
      const collegeId = colleges[0].id;
      const [existingInv] = await platformConn.query('SELECT id FROM college_invoices WHERE college_id = ?', [collegeId]);
      if (existingInv.length === 0) {
        await platformConn.query(`
          INSERT INTO college_invoices 
            (college_id, plan_id, invoice_number, amount_inr, tax_inr, total_inr, status, payment_method, paid_at, due_date)
          VALUES 
            (?, 3, 'INV-2026-0001', 299999.00, 53999.82, 353998.82, 'PAID', 'WIRE_TRANSFER', NOW(), CURDATE())
        `, [collegeId]);
        console.log(`✓ Seeded initial invoice INV-2026-0001 for college ID ${collegeId}`);
      }
    }

    console.log('================================================================');
    console.log('🎉 [PHASE 7 MIGRATION COMPLETE] All Invoicing & Billing Schemas Ready!');
    console.log('================================================================');
    return true;
  } finally {
    await platformConn.end();
  }
}

if (require.main === module) {
  runPhase7Migration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal Phase 7 migration error:', err);
      process.exit(1);
    });
}

module.exports = { runPhase7Migration };

