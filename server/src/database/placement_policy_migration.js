const { queryCommon } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Migration to extend `placement_policies` table to function as a full
 * document management system for real college placement policy PDFs.
 */
async function runPlacementPolicyMigration() {
  console.log('🚀 [MIGRATION] Checking and extending `placement_policies` table...');

  // Ensure policy upload directory exists
  const policiesDir = path.join(__dirname, '../../uploads/policies');
  if (!fs.existsSync(policiesDir)) {
    fs.mkdirSync(policiesDir, { recursive: true });
    console.log(`📁 Created policies uploads directory at: ${policiesDir}`);
  }

  // 1. Get existing columns in placement_policies
  const existingColsRows = await queryCommon('SHOW COLUMNS FROM placement_policies');
  const existingCols = new Set(existingColsRows.map((r) => r.Field.toLowerCase()));

  // 2. Add missing columns safely
  const columnsToAdd = [
    { name: 'title', def: 'VARCHAR(255) NULL' },
    { name: 'description', def: 'TEXT NULL' },
    { name: 'file_url', def: 'VARCHAR(500) NULL' },
    { name: 'file_name', def: 'VARCHAR(255) NULL' },
    { name: 'file_size', def: 'INT NULL' },
    { name: 'mime_type', def: "VARCHAR(100) DEFAULT 'application/pdf'" },
    { name: 'department_id', def: 'INT NULL' },
    { name: 'department_code', def: 'VARCHAR(20) NULL' },
    { name: 'effective_date', def: 'DATE NULL' },
    { name: 'status', def: "ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'PUBLISHED'" },
    { name: 'uploaded_by', def: 'INT NULL' },
    { name: 'updated_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
  ];

  for (const col of columnsToAdd) {
    if (!existingCols.has(col.name.toLowerCase())) {
      console.log(`Adding column \`${col.name}\` to placement_policies...`);
      await queryCommon(`ALTER TABLE placement_policies ADD COLUMN ${col.name} ${col.def}`);
    }
  }

  // 3. Add foreign key constraints safely (ignore if already exists)
  try {
    await queryCommon(`
      ALTER TABLE placement_policies 
      ADD CONSTRAINT fk_policy_dept 
      FOREIGN KEY (department_id) REFERENCES department_databases(id) ON DELETE SET NULL
    `);
    console.log('✓ Added foreign key constraint fk_policy_dept');
  } catch (err) {
    // Constraint might already exist
    if (!err.message?.includes('Duplicate foreign key') && !err.message?.includes('already exists') && err.code !== 'ER_FK_DUP_NAME') {
      console.log('FK policy dept notice:', err.message);
    }
  }

  try {
    await queryCommon(`
      ALTER TABLE placement_policies 
      ADD CONSTRAINT fk_policy_uploader 
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('✓ Added foreign key constraint fk_policy_uploader');
  } catch (err) {
    if (!err.message?.includes('Duplicate foreign key') && !err.message?.includes('already exists') && err.code !== 'ER_FK_DUP_NAME') {
      console.log('FK policy uploader notice:', err.message);
    }
  }

  // 4. Add index on department_code, academic_year, status
  try {
    await queryCommon(`
      ALTER TABLE placement_policies 
      ADD INDEX idx_policy_dept_year_status (department_code, academic_year, status)
    `);
    console.log('✓ Added composite index idx_policy_dept_year_status');
  } catch (err) {
    // Index might already exist
  }

  // 5. Backfill existing rows if any
  await queryCommon(`
    UPDATE placement_policies 
    SET title = COALESCE(title, policy_name),
        status = COALESCE(status, IF(is_active = 1, 'PUBLISHED', 'ARCHIVED')),
        effective_date = COALESCE(effective_date, DATE(created_at))
    WHERE title IS NULL OR status IS NULL OR effective_date IS NULL
  `);

  console.log('✅ [MIGRATION COMPLETE] `placement_policies` table extended successfully!');
}

if (require.main === module) {
  runPlacementPolicyMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runPlacementPolicyMigration };
