const { queryCommon } = require('../config/db');

const VALID_MODES = ['light', 'dark'];

/**
 * GET /api/v1/users/preferences
 * Fetch saved settings & preferences for the authenticated user
 */
async function getUserPreferences(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const rows = await queryCommon(
      `SELECT theme_mode, notifications_enabled, lms_alerts_enabled, placement_alerts_enabled
       FROM user_preferences WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      // Create default preferences row
      await queryCommon(
        `INSERT IGNORE INTO user_preferences (user_id, theme_mode, notifications_enabled, lms_alerts_enabled, placement_alerts_enabled)
         VALUES (?, 'light', 1, 1, 1)`,
        [userId]
      );

      return res.json({
        success: true,
        preferences: {
          themeMode: 'light',
          notificationsEnabled: true,
          lmsAlertsEnabled: true,
          placementAlertsEnabled: true,
        },
      });
    }

    const pref = rows[0];
    return res.json({
      success: true,
      preferences: {
        themeMode: pref.theme_mode || 'light',
        notificationsEnabled: Boolean(pref.notifications_enabled),
        lmsAlertsEnabled: Boolean(pref.lms_alerts_enabled),
        placementAlertsEnabled: Boolean(pref.placement_alerts_enabled),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/users/preferences
 * Update preferences for the authenticated user
 */
async function updateUserPreferences(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const {
      themeMode,
      notificationsEnabled,
      lmsAlertsEnabled,
      placementAlertsEnabled,
    } = req.body;

    // Fetch existing preferences as baseline
    const existingRows = await queryCommon(
      `SELECT theme_mode, notifications_enabled, lms_alerts_enabled, placement_alerts_enabled
       FROM user_preferences WHERE user_id = ?`,
      [userId]
    );

    const current = existingRows[0] || {
      theme_mode: 'light',
      notifications_enabled: 1,
      lms_alerts_enabled: 1,
      placement_alerts_enabled: 1,
    };

    // Validate inputs
    let newMode = current.theme_mode;
    if (themeMode !== undefined) {
      if (!VALID_MODES.includes(themeMode)) {
        return res.status(400).json({
          success: false,
          message: `Invalid themeMode. Must be one of: ${VALID_MODES.join(', ')}`,
        });
      }
      newMode = themeMode;
    }

    const newNotifications = notificationsEnabled !== undefined
      ? (Boolean(notificationsEnabled) ? 1 : 0)
      : current.notifications_enabled;

    const newLmsAlerts = lmsAlertsEnabled !== undefined
      ? (Boolean(lmsAlertsEnabled) ? 1 : 0)
      : current.lms_alerts_enabled;

    const newPlacementAlerts = placementAlertsEnabled !== undefined
      ? (Boolean(placementAlertsEnabled) ? 1 : 0)
      : current.placement_alerts_enabled;

    await queryCommon(
      `INSERT INTO user_preferences (user_id, theme_mode, notifications_enabled, lms_alerts_enabled, placement_alerts_enabled)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         theme_mode = VALUES(theme_mode),
         notifications_enabled = VALUES(notifications_enabled),
         lms_alerts_enabled = VALUES(lms_alerts_enabled),
         placement_alerts_enabled = VALUES(placement_alerts_enabled)`,
      [userId, newMode, newNotifications, newLmsAlerts, newPlacementAlerts]
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully.',
      preferences: {
        themeMode: newMode,
        notificationsEnabled: Boolean(newNotifications),
        lmsAlertsEnabled: Boolean(newLmsAlerts),
        placementAlertsEnabled: Boolean(newPlacementAlerts),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserPreferences,
  updateUserPreferences,
};
