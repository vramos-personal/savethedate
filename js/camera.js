/**
 * Camera — Handles horizontal viewport scrolling to follow the player.
 *
 * The camera keeps the player at approximately 30% from the left edge of the
 * viewport and clamps to level boundaries so no area beyond start/end is shown.
 * There is no vertical scrolling (single-height level).
 *
 * Validates: Requirements 7.1, 7.2, 7.3
 */
class Camera {
  /**
   * @param {number} viewWidth  - Viewport width in virtual pixels (default 320)
   * @param {number} viewHeight - Viewport height in virtual pixels (default 180)
   * @param {number} levelWidth - Total level width in virtual pixels
   */
  constructor(viewWidth, viewHeight, levelWidth) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.levelWidth = levelWidth;
    this.x = 0;
  }

  /**
   * Update camera position to follow the player horizontally.
   * Places the player at ~30% from the left edge of the viewport.
   * Clamps so the camera never shows past level boundaries.
   *
   * @param {number} playerX - The player's current x position in world space
   */
  follow(playerX) {
    const target = playerX - (this.viewWidth * 0.3);
    this.x = Math.max(0, Math.min(target, this.levelWidth - this.viewWidth));
  }

  /**
   * Get the current camera offset for rendering.
   * Subtract offset.x from world positions to get screen positions.
   *
   * @returns {{x: number, y: number}}
   */
  getOffset() {
    return { x: this.x, y: 0 };
  }

  /**
   * Reset camera to the starting position (x = 0).
   */
  reset() {
    this.x = 0;
  }
}
