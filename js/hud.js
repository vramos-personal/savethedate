/**
 * HUD — Heads-Up Display for "Run to the Altar!"
 *
 * Draws directly on the virtual canvas (320×180) in screen-space (not affected by camera).
 * Displays: countdown timer, collectible indicators, and mute toggle button.
 */
class HUD {
  constructor() {
    /** @type {number} Elapsed time in seconds */
    this.elapsed = 0;

    // Mute button bounds (virtual canvas coordinates) — 144px wide canvas
    this.muteBtn = { x: 124, y: 4, w: 16, h: 16 };

    // High-contrast toggle button bounds (virtual canvas coordinates)
    this.hcBtn = { x: 104, y: 4, w: 16, h: 16 };

    /** @type {boolean} High-contrast mode state */
    this.highContrast = false;
  }

  /**
   * Update timer by accumulating elapsed time.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    this.elapsed += dt;
  }

  /**
   * Render the HUD elements on the virtual canvas.
   * @param {CanvasRenderingContext2D} ctx - Virtual canvas context (320×180)
   * @param {Array<{type: string, collected: boolean}>} collectibles - Collectible state array
   * @param {boolean} isMuted - Whether audio is currently muted
   */
  render(ctx, collectibles, isMuted) {
    this._renderCollectibles(ctx, collectibles);
    this._renderMuteButton(ctx, isMuted);
  }

  /**
   * Get seconds remaining on the countdown timer.
   * @returns {number}
   */
  getTimeRemaining() {
    return Math.max(0, TIMER_DURATION - this.elapsed);
  }

  /**
   * Get total elapsed seconds since timer started.
   * @returns {number}
   */
  getElapsedTime() {
    return this.elapsed;
  }

  /**
   * Check if the timer has expired (remaining <= 0).
   * @returns {boolean}
   */
  isTimerExpired() {
    return this.getTimeRemaining() <= 0;
  }

  /**
   * Reset the timer to zero elapsed.
   */
  reset() {
    this.elapsed = 0;
  }

  /**
   * Check if a click/tap hit the mute or HC button area.
   * @param {number} x - X coordinate in virtual canvas space
   * @param {number} y - Y coordinate in virtual canvas space
   * @returns {string|null} 'mute' if mute hit, 'hc' if HC hit, null otherwise
   */
  handleClick(x, y) {
    const btn = this.muteBtn;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      return 'mute';
    }
    const hc = this.hcBtn;
    if (x >= hc.x && x <= hc.x + hc.w && y >= hc.y && y <= hc.y + hc.h) {
      return 'hc';
    }
    return null;
  }

  /**
   * Render the countdown timer at top-center.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderTimer(ctx) {
    const remaining = this.getTimeRemaining();
    const text = remaining.toFixed(1);

    ctx.save();
    const fontSize = this.highContrast ? 12 : 10;
    ctx.font = 'bold ' + fontSize + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Red when less than 5 seconds remaining
    if (remaining < 5) {
      ctx.fillStyle = '#ff3333';
    } else {
      ctx.fillStyle = '#ffffff';
    }

    // High-contrast: black stroke outline for readability
    if (this.highContrast) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText(text, VIRTUAL_WIDTH / 2, 6);
    } else {
      // Drop shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 0;
    }

    ctx.fillText(text, VIRTUAL_WIDTH / 2, 6);
    ctx.restore();
  }

  /**
   * Render collectible indicators at top-left using sprite images.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<{type: string, collected: boolean}>} collectibles
   * @private
   */
  _renderCollectibles(ctx, collectibles) {
    ctx.save();

    // Load sprites if not already loaded
    if (typeof HUD._flowerSprite === 'undefined') {
      HUD._flowerSprite = new Image();
      HUD._flowerSpriteLoaded = false;
      HUD._flowerSprite.onload = function() { HUD._flowerSpriteLoaded = true; };
      HUD._flowerSprite.src = 'assets/sprites/flower.png';
    }
    if (typeof HUD._ringSprite === 'undefined') {
      HUD._ringSprite = new Image();
      HUD._ringSpriteLoaded = false;
      HUD._ringSprite.onload = function() { HUD._ringSpriteLoaded = true; };
      HUD._ringSprite.src = 'assets/sprites/ring.png';
    }

    // Bouquet indicator at x=6, y=4
    const bouquet = collectibles ? collectibles.find(c => c.type === 'bouquet') : null;
    const bouquetCollected = bouquet ? bouquet.collected : false;

    // Draw background circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(12, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    if (bouquetCollected && HUD._flowerSpriteLoaded && HUD._flowerSprite) {
      ctx.imageSmoothingEnabled = false;
      const s = 14;
      ctx.drawImage(HUD._flowerSprite, 12 - s / 2, 12 - s / 2, s, s);
      ctx.imageSmoothingEnabled = false;
    } else {
      // Empty outline
      ctx.strokeStyle = bouquetCollected ? '#ff69b4' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ring indicator at x=30, y=4
    const ring = collectibles ? collectibles.find(c => c.type === 'ring') : null;
    const ringCollected = ring ? ring.collected : false;

    // Draw background circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(34, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    if (ringCollected && HUD._ringSpriteLoaded && HUD._ringSprite) {
      ctx.imageSmoothingEnabled = false;
      const s = 14;
      ctx.drawImage(HUD._ringSprite, 34 - s / 2, 12 - s / 2, s, s);
      ctx.imageSmoothingEnabled = false;
    } else {
      // Empty outline
      ctx.strokeStyle = ringCollected ? '#ffd700' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(34, 12, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render the mute button at top-right.
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} isMuted
   * @private
   */
  _renderMuteButton(ctx, isMuted) {
    const btn = this.muteBtn;

    ctx.save();

    // Button background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

    // Speaker icon (simple geometric shape)
    const cx = btn.x + btn.w / 2;
    const cy = btn.y + btn.h / 2;

    // Speaker body (small rectangle)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 5, cy - 3, 4, 6);

    // Speaker cone (triangle)
    ctx.beginPath();
    ctx.moveTo(cx - 1, cy - 3);
    ctx.lineTo(cx + 4, cy - 6);
    ctx.lineTo(cx + 4, cy + 6);
    ctx.lineTo(cx - 1, cy + 3);
    ctx.closePath();
    ctx.fill();

    if (isMuted) {
      // Draw X over the speaker when muted
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(btn.x + 2, btn.y + 2);
      ctx.lineTo(btn.x + btn.w - 2, btn.y + btn.h - 2);
      ctx.moveTo(btn.x + btn.w - 2, btn.y + 2);
      ctx.lineTo(btn.x + 2, btn.y + btn.h - 2);
      ctx.stroke();
    } else {
      // Sound waves (small arcs)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx + 4, cy, 4, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render the high-contrast toggle button to the left of mute.
   * Drawn as "HC" text inside a small box; filled background when active.
   * @param {CanvasRenderingContext2D} ctx
   * @private
   */
  _renderHCButton(ctx) {
    const btn = this.hcBtn;

    ctx.save();

    // Button background — filled when active, semi-transparent when inactive
    if (this.highContrast) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    }
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

    // "HC" label
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.highContrast ? '#000000' : '#ffffff';
    ctx.fillText('HC', btn.x + btn.w / 2, btn.y + btn.h / 2);

    ctx.restore();
  }
}
