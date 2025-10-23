/**
 * Shared constants for Pitch Height Tracker Pro
 */

/**
 * YUV Color space constants for yellow ball detection
 */
export const YELLOW_DETECTION = {
  // YUV thresholds for yellow ball detection
  Y_MIN: 150, // Luminance minimum (0-255)
  Y_MAX: 255, // Luminance maximum
  U_MIN: -120, // Blue-difference chroma minimum (-128 to 127)
  U_MAX: -80, // Blue-difference chroma maximum
  V_MIN: 20, // Red-difference chroma minimum (-128 to 127)
  V_MAX: 80, // Red-difference chroma maximum
  MIN_PIXEL_THRESHOLD: 50, // Minimum pixels to consider detection valid
  CONFIDENCE_THRESHOLD: 0.7, // 0-1, minimum confidence for detection

  // Legacy HSV values (kept for reference)
  HUE_MIN: 30, // Hue angle in degrees
  HUE_MAX: 60,
  SATURATION_MIN: 0.5, // 0-1
  VALUE_MIN: 0.5, // 0-1
};

/**
 * Default calibration parameters
 */
export const CALIBRATION = {
  REFERENCE_HEIGHT: 55, // Standard baseball mound height in inches
  DEFAULT_UNCERTAINTY: 0.5, // ±0.5 feet
  MIN_CALIBRATION_QUALITY: 0.8, // Minimum quality score for valid calibration
  CALIBRATION_SAMPLES: 10, // Number of samples for calibration
};

/**
 * Frame processing parameters
 */
export const FRAME_PROCESSING = {
  TARGET_FPS: 30,
  MIN_FPS: 20,
  FRAME_BUFFER_SIZE: 5,
};

/**
 * ROI defaults
 */
export const ROI_DEFAULTS = {
  DEFAULT_WIDTH_PERCENT: 0.8,
  DEFAULT_HEIGHT_PERCENT: 0.6,
  MIN_WIDTH: 100,
  MIN_HEIGHT: 100,
};

/**
 * Uncertainty calculation weights
 */
export const UNCERTAINTY = {
  CALIBRATION_WEIGHT: 0.4,
  DETECTION_WEIGHT: 0.3,
  TRACKING_WEIGHT: 0.3,
};

/**
 * Database constants
 */
export const DATABASE = {
  NAME: 'slowpitched.db',
  VERSION: 1,
};

/**
 * Storage keys for AsyncStorage
 */
export const STORAGE_KEYS = {
  LAST_SESSION: 'slowpitched_last_session',
  ROI_POSITION: 'slowpitched_roi_position',
  CALIBRATION_DATA: 'slowpitched_calibration_data',
  USER_PREFERENCES: 'slowpitched_user_preferences',
};

/**
 * Screen names for navigation
 */
export const SCREEN_NAMES = {
  TRACKING: 'TrackingScreen',
  DASHBOARD: 'DashboardScreen',
  SESSION_DETAIL: 'SessionDetailScreen',
  SETTINGS: 'SettingsScreen',
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  CAMERA_PERMISSION_DENIED: 'Camera permission denied. Please enable camera access in settings.',
  INVALID_CALIBRATION: 'Calibration failed. Please try again.',
  DATABASE_ERROR: 'Database error. Please try again.',
  INVALID_PITCH_DATA: 'Invalid pitch data format.',
  SESSION_NOT_FOUND: 'Session not found.',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  PITCH_RECORDED: 'Pitch recorded successfully',
  CALIBRATION_COMPLETE: 'Calibration complete',
  DATA_EXPORTED: 'Data exported successfully',
  SESSION_SAVED: 'Session saved successfully',
};

/**
 * Measurement units
 */
export const UNITS = {
  FEET: 'ft',
  INCHES: 'in',
  PIXELS: 'px',
};
