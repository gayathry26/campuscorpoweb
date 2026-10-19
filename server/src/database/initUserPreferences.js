const { queryCommon } = require('../config/db');

async function initUserPreferences() {
  try {
    await queryCommon(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        theme_mode VARCHAR(10) DEFAULT 'light',
        notifications_enabled BOOLEAN DEFAULT TRUE,
        lms_alerts_enabled BOOLEAN DEFAULT TRUE,
        placement_alerts_enabled BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_pref_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure all existing users in users table have a default preferences row
    await queryCommon(`
      INSERT IGNORE INTO user_preferences (user_id, theme_mode, notifications_enabled, lms_alerts_enabled, placement_alerts_enabled)
      SELECT id, 'light', 1, 1, 1 FROM users;
    `);

    console.log('✓ [DATABASE] user_preferences table initialized and populated with defaults.');
  } catch (err) {
    console.error('❌ [DATABASE] Failed to initialize user_preferences table:', err.message);
  }
}

if (require.main === module) {
  initUserPreferences().then(() => process.exit(0));
}

module.exports = { initUserPreferences };
