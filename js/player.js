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
          // Additionally, only snap if the player's horizontal center is over the platform
          // This prevents snapping when walking off the edge into a gap
          const playerCenterX = this.x + this.w / 2;
          if (playerCenterX >= plat.x && playerCenterX <= plat.x + plat.w) {
            // Snap player to platform top
            this.y = plat.y - this.h;
            this.vy = 0;
            this.grounded = true;
            // Update bounds for subsequent checks
            playerBounds.y = this.y;
          }
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
   * Render the player using the groom.png sprite.
   * Falls back to a colored rectangle if the image hasn't loaded yet.
   * When facing left, the sprite is flipped via ctx.scale(-1, 1).
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {{x: number, y: number}} camera - Camera offset
   */
  render(ctx, camera) {
    const screenX = this.x - camera.x;
    let screenY = this.y;

    // Bob effect: subtle bounce while running to simulate movement
    if (this.animState === 'run') {
      screenY += Math.sin(this.animTimer * 16) * 1.5;
    }

    ctx.save();

    // Apply horizontal flip when facing left
    if (this.facing === -1) {
      ctx.translate(screenX + this.w / 2, screenY + this.h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(this.w / 2), -(this.h / 2));
    } else {
      ctx.translate(screenX, screenY);
    }

    // Use groomfacing.png for idle, groom.png for run/jump
    const useIdleSprite = (this.animState === 'idle') && Player._spriteFacingLoaded;
    const useRunSprite = Player._spriteLoaded;

    if (useIdleSprite && Player._spriteFacing) {
      // Draw the facing/idle sprite using its natural aspect ratio (no stretching)
      ctx.imageSmoothingEnabled = false;
      const img = Player._spriteFacing;
      const targetH = this.h * 1.45;
      const naturalRatio = img.width / img.height;
      const drawW = targetH * naturalRatio;
      const drawH = targetH;
      const offsetX = -(drawW - this.w) / 2;
      const offsetY = -(drawH - this.h) * 0.7;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.imageSmoothingEnabled = false;
    } else if (useRunSprite && Player._sprite) {
      // Use nearest-neighbor (no smoothing) for crisp pixel art
      ctx.imageSmoothingEnabled = false;

      const img = Player._sprite;
      const aspectRatio = img.width / img.height;

      if (aspectRatio > 2) {
        // Wide image = likely a spritesheet with frames side by side
        const frameCount = 6;
        const frameW = img.width / frameCount;
        const frameH = img.height;
        let frameIndex = 0;
        if (this.animState === 'run') {
          frameIndex = 1 + (this.animFrame % 4);
        } else if (this.animState === 'jump') {
          frameIndex = 5;
        }
        ctx.drawImage(img, frameIndex * frameW, 0, frameW, frameH, 0, 0, this.w, this.h);
      } else {
        // Single image — draw slightly oversized to account for transparent padding
        // Offset upward so the character's feet align with the bottom of the hitbox
        const drawW = this.w * 1.4;
        const drawH = this.h * 1.4;
        const offsetX = -(drawW - this.w) / 2;
        const offsetY = -(drawH - this.h) * 0.7; // shift up so feet meet platform
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      }

      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.fillStyle = '#3355ff';
      ctx.fillRect(0, 0, this.w, this.h);
    }

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

// Load the groom sprites (static, shared across all Player instances)
Player._sprite = new Image();
Player._spriteLoaded = false;
Player._sprite.onload = function() { Player._spriteLoaded = true; };
Player._sprite.src = 'assets/sprites/groom.png';

// Idle/facing sprite — used when the player is standing still
Player._spriteFacing = new Image();
Player._spriteFacingLoaded = false;
Player._spriteFacing.onload = function() { Player._spriteFacingLoaded = true; };
Player._spriteFacing.src = 'assets/sprites/groomfacing.png';
