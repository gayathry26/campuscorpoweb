/**
 * ============================================================================
 * CampusCorpo — Liquid Curved Curtain Path Generator
 * ViewBox: 0 0 100 100
 * ============================================================================
 */

export const CURTAIN_CONFIG = {
  PAGE_MAX_CURVE: 18,      // Peak curve depth during page navigation
  SECTION_MAX_CURVE_DESKTOP: 16, // Peak curve depth during desktop scroll wipe
  SECTION_MAX_CURVE_MOBILE: 8,   // Reduced curve depth for mobile viewports
};

/**
 * Generates the SVG path for the COVER phase (curtain rising from bottom).
 * @param {number} y - Current leading edge height (100 -> 0)
 * @param {number} curve - Upward control point displacement (0 -> 18 -> 0)
 * @returns {string} SVG path string
 */
export function buildCoverPath(y, curve) {
  const safeY = Number(y).toFixed(2);
  const controlY = Number(y - curve).toFixed(2);
  return `M 0 100 L 0 ${safeY} Q 50 ${controlY} 100 ${safeY} L 100 100 Z`;
}

/**
 * Generates the SVG path for the REVEAL phase (curtain exiting through top).
 * @param {number} y2 - Current trailing edge height (100 -> 0)
 * @param {number} curve - Upward control point displacement (0 -> 18 -> 0)
 * @returns {string} SVG path string
 */
export function buildRevealPath(y2, curve) {
  const safeY = Number(y2).toFixed(2);
  const controlY = Number(y2 - curve).toFixed(2);
  return `M 0 0 L 100 0 L 100 ${safeY} Q 50 ${controlY} 0 ${safeY} Z`;
}

/**
 * Generates the full-screen covered state (0 0 to 100 100).
 */
export function buildFullScreenPath() {
  return 'M 0 0 L 100 0 L 100 100 L 0 100 Z';
}

/**
 * Generates the fully hidden resting path at the bottom.
 */
export function buildHiddenBottomPath() {
  return 'M 0 100 L 0 100 Q 50 100 100 100 L 100 100 Z';
}

/**
 * Builds the curved path for scroll-scrubbed SectionWipes from normalized progress (0 -> 1).
 * @param {number} progress - Scroll progress between 0 and 1
 * @param {number} maxCurve - Peak curve height in SVG units
 * @returns {string} SVG path string
 */
export function buildScrubPath(progress, maxCurve = CURTAIN_CONFIG.SECTION_MAX_CURVE_DESKTOP) {
  // Clamp progress to 0..1
  const p = Math.max(0, Math.min(1, progress));

  // Phase 1: COVER (0.00 -> 0.45)
  if (p < 0.45) {
    const localP = p / 0.45; // 0 -> 1
    const y = 100 * (1 - localP); // 100 -> 0
    const curve = Math.sin(localP * Math.PI) * maxCurve;
    return buildCoverPath(y, curve);
  }

  // Phase 2: HOLD / FULL BLACK (0.45 -> 0.55)
  if (p <= 0.55) {
    return buildFullScreenPath();
  }

  // Phase 3: REVEAL (0.55 -> 1.00)
  const localP = (p - 0.55) / 0.45; // 0 -> 1
  const y2 = 100 * (1 - localP); // 100 -> 0
  const curve = Math.sin(localP * Math.PI) * maxCurve;
  return buildRevealPath(y2, curve);
}

