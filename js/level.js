/**
 * Level — Defines the platform layout, collectible positions, and finish area
 * for the single side-scrolling level.
 *
 * Level layout:
 *   Total width: ~1600 virtual pixels (5 screens at 320px viewport)
 *   Platforms at y=156, h=24 (extends to y=180, bottom of canvas)
 *   Gaps of 32–48px between platforms (easily jumpable)
 *   Church finish area at the far right end
 *   Bouquet collectible on Platform 3, Ring on Platform 5
 */
class Level {
  constructor() {
    // Portrait mode: canvas is 144×256, platforms near bottom (y=224, h=12)
    // Platforms are thin so gaps between them create holes the player can fall through.
    /** @type {Array<{x: number, y: number, w: number, h: number}>} */
    this.platforms = [
      { x: 0,   y: 224, w: 144, h: 12 },   // Platform 1 — starting area
      { x: 180, y: 224, w: 96,  h: 12 },   // Platform 2 (gap = 36px)
      { x: 312, y: 224, w: 96,  h: 12 },   // Platform 3 (gap = 36px)
      { x: 444, y: 224, w: 96,  h: 12 },   // Platform 4 (gap = 36px)
      { x: 576, y: 224, w: 112, h: 12 },   // Platform 5 (gap = 36px)
      { x: 724, y: 224, w: 300, h: 12 }    // Platform 6 — continuous to church (no gap)
    ];

    /** @type {Array<{x: number, y: number, w: number, h: number, type: string, collected: boolean}>} */
    this.collectibles = [
      // Bouquet on Platform 3
      { x: 320, y: 204, w: 16, h: 16, type: 'bouquet', collected: false },
      // Ring on Platform 5
      { x: 585, y: 204, w: 16, h: 16, type: 'ring', collected: false }
    ];

    /** @type {{x: number, y: number, w: number, h: number}} */
    this.finishArea = { x: 960, y: 184, w: 40, h: 48 };

    /** @type {number} */
    this.levelWidth = 1030;
  }

  /**
   * Get all platform rectangles for collision detection.
   * @returns {Array<{x: number, y: number, w: number, h: number}>}
   */
  getPlatforms() {
    return this.platforms;
  }

  /**
   * Get all collectibles with their current state.
   * @returns {Array<{x: number, y: number, w: number, h: number, type: string, collected: boolean}>}
   */
  getCollectibles() {
    return this.collectibles;
  }

  /**
   * Get the church finish area bounding box.
   * @returns {{x: number, y: number, w: number, h: number}}
   */
  getFinishArea() {
    return this.finishArea;
  }

  /**
   * Get the total level width in virtual pixels.
   * @returns {number}
   */
  getLevelWidth() {
    return this.levelWidth;
  }

  /**
   * Mark a collectible as collected by index.
   * @param {number} index - Index into the collectibles array
   */
  collectItem(index) {
    if (index >= 0 && index < this.collectibles.length) {
      this.collectibles[index].collected = true;
    }
  }

  /**
   * Reset all collectibles to uncollected state.
   */
  reset() {
    for (let i = 0; i < this.collectibles.length; i++) {
      this.collectibles[i].collected = false;
    }
  }
}

/**
 * Check and resolve collectible pickups for the current frame.
 * Iterates all uncollected collectibles, checks AABB overlap with the player,
 * and marks overlapping items as collected.
 *
 * @param {{getBounds: () => {x:number, y:number, w:number, h:number}}} player
 * @param {Level} level
 * @param {function|null} [onCollect] - Optional callback called with (collectible, index) on pickup.
 *        Use this to trigger audio SFX and update HUD state.
 * @returns {number} Number of items collected this frame
 */
function checkCollectibles(player, level, onCollect) {
  const bounds = player.getBounds();
  const collectibles = level.getCollectibles();
  let collected = 0;

  for (let i = 0; i < collectibles.length; i++) {
    const item = collectibles[i];
    if (!item.collected && aabbOverlap(bounds, item)) {
      level.collectItem(i);
      collected++;
      if (onCollect) {
        onCollect(item, i);
      }
    }
  }

  return collected;
}
