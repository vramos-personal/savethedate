/**
 * AABB overlap test — returns true if two axis-aligned bounding boxes intersect.
 * Each box is an object with {x, y, w, h}.
 *
 * @param {{x: number, y: number, w: number, h: number}} a
 * @param {{x: number, y: number, w: number, h: number}} b
 * @returns {boolean}
 */
function aabbOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

/**
 * Player — Handles groom character physics, state, and rendering.
 *
 * Uses constants from constants.js:
 *   GRAVITY, MOVE_SPEED, JUMP_IMPULSE, PLAYER_W, PLAYER_H
 *
 * Input object (from InputSystem.poll()):
 *   left (bool)     — level-triggered
 *   right (bool)    — level-triggered
 *   jump (bool)     — edge-triggered (true only on frame of press)
 *   jumpHeld (bool) — level-triggered
 */
class Player {
  /**
   * @param {number} x - Starting x position (left edge)
   * @param {number} y - Starting y position (top edge)
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = PLAYER_W;
    this.h = PLAYER_H;
    this.grounded = false;
    /** @type {boolean} True on the frame a jump was initiated */
    this.jumped = false;

    // Animation state
    /** @type {'idle'|'run'|'jump'} Current animation state */
    this.animState = 'idle';
    /** @type {1|-1} Facing direction: 1 = right, -1 = left */
    this.facing = 1;
    /** @type {number} Current frame index for run animation */
    this.animFrame = 0;
    /** @type {number} Accumulator for frame timing (seconds) */
    this.animTimer = 0;
  }

  /**
   * Update player physics and state for a single frame.
   *
   * @param {number} dt - Delta time in seconds
   * @param {{left: boolean, right: boolean, jump: boolean, jumpHeld: boolean}} input - Input state
   * @param {Array<{x: number, y: number, w: number, h: number}>} platforms - Platform AABBs
   */
  update(dt, input, platforms) {
    // Save previous grounded state for jump gating (set by last frame's collision)
    const wasGrounded = this.grounded;

    // 0. Reset grounded — will be set true by collision resolution if standing on a platform
    this.grounded = false;

    // Save previous y for one-way platform resolution
    const prevY = this.y;

    // 1. Horizontal movement
    if (input.left) {
      this.vx = -MOVE_SPEED;
    } else if (input.right) {
      this.vx = MOVE_SPEED;
    } else {
      this.vx = 0;
    }

    // 2. Apply gravity
    this.vy += GRAVITY * dt;

    // 3. Apply jump impulse (only when grounded last frame and jump edge-triggered)
    this.jumped = false;
    if (input.jump && wasGrounded) {
      this.vy = JUMP_IMPULSE;
      this.jumped = true;
    }

    // 4. Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 5. Platform collision resolution
    const playerBounds = this.getBounds();
    for (let i = 0; i < platforms.length; i++) {
      const plat = platforms[i];
      if (aabbOverlap(playerBounds, plat)) {
        // Only resolve if player was above the platform top in the previous frame
        const prevBottom = prevY + this.h;
        if (prevBottom <= plat.y) {
          // Snap player to platform top
          this.y = plat.y - this.h;
          this.vy = 0;
          this.grounded = true;
          // Update bounds for subsequent checks
          playerBounds.y = this.y;
        }
      }
    }

    // 6. Determine animation state from physics
    if (!this.grounded) {
      this.animState = 'jump';
    } else if (this.vx !== 0) {
      this.animState = 'run';
    } else {
      this.animState = 'idle';
    }

    // 7. Track facing direction (only update when moving)
    if (this.vx > 0) this.facing = 1;
    else if (this.vx < 0) this.facing = -1;

    // 8. Run animation frame cycling
    const RUN_FRAME_COUNT = 4;
    const RUN_FPS = 8;
    if (this.animState === 'run') {
      this.animTimer += dt;
      if (this.animTimer >= 1 / RUN_FPS) {
        this.animTimer -= 1 / RUN_FPS;
        this.animFrame = (this.animFrame + 1) % RUN_FRAME_COUNT;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }

  /**
   * Render the player with animation-state-based visuals.
   * Uses color-coded rectangles as sprite placeholders:
   *   - Idle: solid blue #3355ff
   *   - Run: cycling blue shades (simulates running frames)
   *   - Jump: light blue #6699ff, vertically stretched appearance
   *
   * A small white triangle indicates facing direction.
   * When facing left, the sprite is flipped via ctx.scale(-1, 1).
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {{x: number, y: number}} camera - Camera offset
   */
  render(ctx, camera) {
    const screenX = this.x - camera.x;
    const screenY = this.y;

    ctx.save();

    // Apply horizontal flip when facing left
    if (this.facing === -1) {
      // Translate to player center, flip, translate back
      ctx.translate(screenX + this.w / 2, screenY + this.h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(this.w / 2), -(this.h / 2));
    } else {
      ctx.translate(screenX, screenY);
    }

    // Draw body based on animation state
    if (this.animState === 'idle') {
      ctx.fillStyle = '#3355ff';
      ctx.fillRect(0, 0, this.w, this.h);
    } else if (this.animState === 'run') {
      // Cycle between blue shades to simulate running
      const runColors = ['#3355ff', '#2244dd', '#4466ff', '#2244dd'];
      ctx.fillStyle = runColors[this.animFrame];
      ctx.fillRect(0, 0, this.w, this.h);

      // Draw "leg" indicators that alternate with frames
      ctx.fillStyle = '#1a1a4e';
      if (this.animFrame % 2 === 0) {
        ctx.fillRect(2, this.h - 6, 4, 6);   // Left leg forward
        ctx.fillRect(10, this.h - 4, 4, 4);  // Right leg back
      } else {
        ctx.fillRect(2, this.h - 4, 4, 4);   // Left leg back
        ctx.fillRect(10, this.h - 6, 4, 6);  // Right leg forward
      }
    } else if (this.animState === 'jump') {
      ctx.fillStyle = '#6699ff';
      // Draw slightly stretched vertically (2px taller, offset up)
      ctx.fillRect(0, -2, this.w, this.h + 2);
    }

    // Draw facing direction indicator (small white triangle on front)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // Arrow pointing right (will be flipped by ctx.scale when facing left)
    const arrowX = this.w - 2;
    const arrowY = this.h / 2;
    ctx.moveTo(arrowX, arrowY - 3);
    ctx.lineTo(arrowX + 3, arrowY);
    ctx.lineTo(arrowX, arrowY + 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Reset the player to a given position with zeroed velocity and animation state.
   *
   * @param {number} x - Reset x position
   * @param {number} y - Reset y position
   */
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.animState = 'idle';
    this.facing = 1;
    this.animFrame = 0;
    this.animTimer = 0;
  }

  /**
   * Check if the player has fallen below the visible area.
   * @returns {boolean}
   */
  hasFallen() {
    return this.y > VIRTUAL_HEIGHT;
  }

  /**
   * Get the axis-aligned bounding box for this player.
   *
   * @returns {{x: number, y: number, w: number, h: number}}
   */
  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
