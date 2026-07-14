/**
 * ScreenManager — Coordinates transitions between game screens.
 *
 * State machine:
 *   TITLE → GAMEPLAY (Play pressed)
 *   GAMEPLAY → WIN (reached church)
 *   GAMEPLAY → LOSE (timer expired OR fell)
 *   WIN → GAMEPLAY (Play Again)
 *   LOSE → GAMEPLAY (Retry)
 *
 * Each screen implements: enter(data), update(dt, input), render(ctx), exit()
 */
class ScreenManager {
  /**
   * @param {GameEngine} engine
   * @param {InputSystem} input
   * @param {object|null} audio - AudioManager (may be null)
   * @param {object|null} storage - StorageManager (may be null)
   */
  constructor(engine, input, audio, storage) {
    this.engine = engine;
    this.input = input;
    this.audio = audio;
    this.storage = storage;

    /** @type {object|null} Currently active screen */
    this.currentScreen = null;

    /** @type {number} Screen transition timer (counts down from TRANSITION_DURATION) */
    this._transitionTimer = 0;

    // Register all screens
    this.screens = {
      title: new TitleScreen(this),
      loading: new LoadingScreen(this),
      quest: new QuestScreen(this),
      gameplay: new GameplayScreen(this),
      thankyou: new ThankYouScreen(this),
      win: new WinScreen(this),
      lose: new LoseScreen(this)
    };

    // Start on the title screen
    this.switchTo('title');
  }

  /**
   * Transition to a new screen.
   * @param {string} screenName - Key into this.screens
   * @param {object} [data] - Optional data passed to the new screen's enter()
   */
  switchTo(screenName, data) {
    if (this.currentScreen && this.currentScreen.exit) {
      this.currentScreen.exit();
    }
    this.currentScreen = this.screens[screenName];
    if (this.currentScreen && this.currentScreen.enter) {
      this.currentScreen.enter(data || {});
    }
    // Trigger screen transition overlay
    this._transitionTimer = TRANSITION_DURATION;
  }

  /**
   * Update the active screen.
   * @param {number} dt - Delta time in seconds
   * @param {object} input - Input state from InputSystem.poll()
   */
  update(dt, input) {
    // Tick down the transition timer
    if (this._transitionTimer > 0) {
      this._transitionTimer = Math.max(0, this._transitionTimer - dt);
    }

    if (this.currentScreen && this.currentScreen.update) {
      this.currentScreen.update(dt, input);
    }
  }

  /**
   * Render the active screen, plus transition overlay if active.
   * @param {CanvasRenderingContext2D} ctx - Virtual canvas context
   */
  render(ctx) {
    if (this.currentScreen && this.currentScreen.render) {
      this.currentScreen.render(ctx);
    }

    // Render fade-from-black transition overlay
    if (this._transitionTimer > 0) {
      const alpha = this._transitionTimer / TRANSITION_DURATION;
      ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(2) + ')';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }
  }
}


/**
 * TitleScreen — Displays game title, play instruction, and best time.
 * Uses an HTML overlay for crisp text rendering at native resolution.
 *
 * Validates: Requirements 8.1, 8.2, 10.2
 */
class TitleScreen {
  /**
   * @param {ScreenManager} manager
   */
  constructor(manager) {
    this.manager = manager;
    this.overlay = document.getElementById('title-overlay');
    this._playBtn = this.overlay ? this.overlay.querySelector('.title-play-btn') : null;
    this._clickHandler = () => { this.manager.switchTo('loading'); };
  }

  enter(data) {
    if (!this.overlay) return;

    const cfg = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};

    // Populate title screen from config
    const label = this.overlay.querySelector('.title-label');
    const couple = this.overlay.querySelector('.title-couple');
    const tagline = this.overlay.querySelector('.title-tagline');
    const coupleImg = this.overlay.querySelector('.title-couple-image');
    const content = this.overlay.querySelector('.title-content');

    if (label) label.textContent = cfg.titleLabel || 'SAVE THE DATE';
    if (couple) couple.textContent = cfg.couple || 'Couple Names';
    if (tagline) tagline.textContent = cfg.titleTagline || 'Game to Forever';

    // Set couple image if provided
    if (coupleImg && cfg.coupleImage) {
      coupleImg.style.backgroundImage = 'url(' + cfg.coupleImage + ')';
    } else if (coupleImg) {
      coupleImg.style.display = 'none';
    }

    // Set background
    if (content) {
      if (cfg.titleBackgroundImage) {
        content.style.backgroundImage = 'url(' + cfg.titleBackgroundImage + ')';
      }
      if (cfg.titleBackgroundColor) {
        content.style.background = cfg.titleBackgroundColor;
      }
      if (cfg.titleAccentColor) {
        content.style.borderColor = cfg.titleAccentColor;
      }
    }

    // Show best time — removed, no longer displayed
    this.overlay.style.display = 'flex';
    if (this._playBtn) {
      this._playBtn.addEventListener('click', this._clickHandler);
    }
  }

  update(dt, input) {
    if (input.confirm) {
      this.manager.switchTo('loading');
    }
  }

  render(ctx) {
    // No canvas rendering — overlay handles it
  }

  exit() {
    if (this.overlay) this.overlay.style.display = 'none';
    if (this._playBtn) {
      this._playBtn.removeEventListener('click', this._clickHandler);
    }
  }
}


/**
 * LoadingScreen — Shows a "Loading..." screen with a ring animation for 2 seconds,
 * then transitions to the Quest screen.
 */
class LoadingScreen {
  constructor(manager) {
    this.manager = manager;
    this.overlay = document.getElementById('loading-overlay');
    this._timer = 0;
    this._duration = 2; // seconds
  }

  enter(data) {
    if (!this.overlay) return;

    const cfg = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};

    const textEl = this.overlay.querySelector('.loading-text');
    if (textEl) textEl.textContent = cfg.loadingText || 'Loading...';

    this.overlay.style.display = 'flex';
    this._timer = 0;
  }

  update(dt, input) {
    this._timer += dt;
    if (this._timer >= this._duration) {
      this.manager.switchTo('quest');
    }
  }

  render(ctx) {
    // No canvas rendering
  }

  exit() {
    if (this.overlay) this.overlay.style.display = 'none';
  }
}


/**
 * QuestScreen — Shows the player's mission/quest before starting gameplay.
 * Auto-advances to gameplay after 2 seconds with a smooth fade.
 * Configurable text from WEDDING_CONFIG.
 */
class QuestScreen {
  constructor(manager) {
    this.manager = manager;
    this.overlay = document.getElementById('quest-overlay');
    this._timer = 0;
    this._duration = 2.5; // seconds before auto-advancing
  }

  enter(data) {
    if (!this.overlay) return;

    const cfg = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};

    const label = this.overlay.querySelector('.quest-label');
    const text = this.overlay.querySelector('.quest-text');

    if (label) label.textContent = cfg.questLabel || 'Your mission:';
    if (text) text.textContent = cfg.questText || 'Help the groom reach\nthe wedding church!';

    this.overlay.style.display = 'flex';
    this.overlay.style.opacity = '1';
    this._timer = 0;
  }

  update(dt, input) {
    this._timer += dt;

    // Fade out in the last 0.5 seconds
    if (this._timer > this._duration - 0.5 && this.overlay) {
      const fade = 1 - ((this._timer - (this._duration - 0.5)) / 0.5);
      this.overlay.style.opacity = Math.max(0, fade).toString();
    }

    if (this._timer >= this._duration) {
      this.manager.switchTo('gameplay');
    }
  }

  render(ctx) {
    // No canvas rendering
  }

  exit() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
      this.overlay.style.opacity = '1';
    }
  }
}


/**
 * GameplayScreen — The main game loop screen.
 *
 * On enter: creates Player, Level, Camera, HUD.
 * Each frame: updates physics, checks collectibles, win/lose conditions.
 * Renders: sky, platforms, collectibles, church, player, HUD.
 *
 * Validates: Requirements 8.2 (all gameplay)
 */
class GameplayScreen {
  /**
   * @param {ScreenManager} manager
   */
  constructor(manager) {
    this.manager = manager;
    this.player = null;
    this.level = null;
    this.camera = null;
    this.hud = null;
    this.isMuted = false;
    this.collectiblesGathered = 0;
    this.finished = false;
    /** @type {string|null} Pending HUD click action for this frame */
    this._pendingHudAction = null;
    this._canvasClickHandler = this._onCanvasClick.bind(this);
  }

  /**
   * Called when transitioning to this screen. Initializes all gameplay objects.
   * @param {object} data
   */
  enter(data) {
    this.player = new Player(16, 176);
    this.player.grounded = true;
    this.level = new Level();
    this.level.reset();
    this.camera = new Camera(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, this.level.getLevelWidth());
    this.hud = new HUD();
    this.isMuted = false;
    this.collectiblesGathered = 0;
    this.finished = false;

    // Restore mute state from storage
    if (this.manager.storage) {
      this.isMuted = this.manager.storage.getMuteState();
    }

    // Restore high-contrast state from storage
    if (this.manager.storage) {
      this.hud.highContrast = this.manager.storage.getHighContrast();
    }

    // Start background music and apply mute state
    if (this.manager.audio) {
      this.manager.audio.setMuted(this.isMuted);
      this.manager.audio.playMusic('bgm');
    }

    // Show touch controls on touch devices
    if (this.manager.input.isTouchDevice()) {
      this.manager.input.showTouchControls();
    }

    // Listen for canvas clicks to detect HUD button taps
    this._pendingHudAction = null;
    const displayCanvas = document.getElementById('displayCanvas');
    if (displayCanvas) {
      displayCanvas.addEventListener('pointerup', this._canvasClickHandler);
    }
  }

  /**
   * Handle canvas pointer events for HUD button detection.
   * @param {PointerEvent} e
   * @private
   */
  _onCanvasClick(e) {
    const vCoords = this.manager.engine.displayToVirtual(e.clientX, e.clientY);
    if (this.hud) {
      const action = this.hud.handleClick(vCoords.x, vCoords.y);
      if (action) {
        this._pendingHudAction = action;
      }
    }
  }

  /**
   * Respawn the player on the nearest platform behind their current x position.
   * If no platform is behind them, respawn at the start.
   * @private
   */
  _respawnPlayer() {
    const platforms = this.level.getPlatforms();
    const px = this.player.x;

    // Find the last platform whose left edge is at or before the player's x
    let bestPlat = platforms[0]; // fallback: starting platform
    for (let i = 0; i < platforms.length; i++) {
      if (platforms[i].x <= px) {
        bestPlat = platforms[i];
      }
    }

    // Place player near the center of that platform, standing on top
    const spawnX = bestPlat.x + bestPlat.w / 2 - this.player.w / 2;
    const spawnY = bestPlat.y - this.player.h;
    this.player.reset(spawnX, spawnY);
    this.player.grounded = true;
  }

  /**
   * Update gameplay each frame.
   * @param {number} dt
   * @param {object} input
   */
  update(dt, input) {
    if (this.finished) return;

    // 1. Update HUD timer
    this.hud.update(dt);

    // 2. Update player physics
    this.player.update(dt, input, this.level.getPlatforms());

    // 2b. Jump SFX — player.jumped is set true on the frame a jump occurs
    if (this.player.jumped && this.manager.audio) {
      this.manager.audio.playSFX('jump');
    }

    // 3. Camera follows player
    this.camera.follow(this.player.x);

    // 4. Check collectibles
    checkCollectibles(this.player, this.level, (item, index) => {
      this.collectiblesGathered++;
      if (this.manager.audio) this.manager.audio.playSFX('collect');
    });

    // 5. Respawn: if player fell off screen, place back on the nearest platform
    if (this.player.hasFallen()) {
      this._respawnPlayer();
    }

    // 6. (Timer removed — no lose condition for time)

    // 7. Check win: reached finish area
    if (aabbOverlap(this.player.getBounds(), this.level.getFinishArea())) {
      this.finished = true;
      const elapsed = this.hud.getElapsedTime();
      this.manager.switchTo('thankyou', {
        time: elapsed,
        collectibles: this.collectiblesGathered,
        totalCollectibles: this.level.getCollectibles().length
      });
      return;
    }

    // 8. Mute toggle (keyboard M or canvas tap on mute button)
    if (input.mute || this._pendingHudAction === 'mute') {
      this.isMuted = !this.isMuted;
      if (this.manager.audio) {
        this.manager.audio.setMuted(this.isMuted);
      }
      if (this.manager.storage) {
        this.manager.storage.setMuteState(this.isMuted);
      }
    }

    // 9. High-contrast toggle (canvas tap on HC button)
    if (this._pendingHudAction === 'hc') {
      this.hud.highContrast = !this.hud.highContrast;
      if (this.manager.storage) {
        this.manager.storage.setHighContrast(this.hud.highContrast);
      }
    }

    // Clear pending HUD action after processing
    this._pendingHudAction = null;
  }

  /**
   * Render the gameplay scene.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const offset = this.camera.getOffset();
    const elapsed = this.hud.getElapsedTime();

    // 1. Sky background — gradient from light blue to white at horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(0.7, '#E0F7FA');
    skyGrad.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Clouds (simple white ovals at fixed world positions)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const cloudPositions = [
      { x: 60, y: 25, w: 30, h: 10 },
      { x: 180, y: 15, w: 25, h: 8 },
      { x: 350, y: 30, w: 35, h: 10 },
      { x: 520, y: 20, w: 28, h: 9 },
      { x: 700, y: 25, w: 32, h: 10 }
    ];
    for (let i = 0; i < cloudPositions.length; i++) {
      const cloud = cloudPositions[i];
      const cx = cloud.x - offset.x * 0.3; // parallax: clouds move slower
      ctx.beginPath();
      ctx.ellipse(cx, cloud.y, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Green ground strip at bottom
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(0, VIRTUAL_HEIGHT - 10, VIRTUAL_WIDTH, 10);

    // 2. Platforms — styled with grass top and dirt bottom
    const platforms = this.level.getPlatforms();
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      const px = p.x - offset.x;

      // Dirt/brown bottom strip (4px)
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(px, p.y + p.h - 4, p.w, 4);

      // Dark green base
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(px, p.y + 4, p.w, p.h - 8);

      // Light green grass top strip (4px)
      ctx.fillStyle = '#66BB6A';
      ctx.fillRect(px, p.y, p.w, 4);

      // Small decorative bushes/flowers on some platforms
      if (i % 2 === 0 && p.w > 30) {
        // Bush (small green circle)
        ctx.fillStyle = '#43A047';
        ctx.beginPath();
        ctx.arc(px + 10, p.y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        // Small flower
        ctx.fillStyle = '#F48FB1';
        ctx.beginPath();
        ctx.arc(px + p.w - 12, p.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Collectibles (with bobbing animation)
    const collectibles = this.level.getCollectibles();
    const bobOffset = Math.sin(elapsed * 4) * 2;

    for (let i = 0; i < collectibles.length; i++) {
      const c = collectibles[i];
      if (c.collected) continue;

      const cx = c.x + c.w / 2 - offset.x;
      const cy = c.y + c.h / 2 + bobOffset;

      if (c.type === 'bouquet') {
        // Green stem
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(cx - 1, cy + 2, 2, 5);
        // Pink/magenta flower circle
        ctx.fillStyle = '#E91E63';
        ctx.beginPath();
        ctx.arc(cx, cy, c.w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Lighter center
        ctx.fillStyle = '#F48FB1';
        ctx.beginPath();
        ctx.arc(cx, cy, c.w / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'ring') {
        // Gold ring circle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx, cy, c.w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Inner hole (darker gold)
        ctx.fillStyle = '#FFA000';
        ctx.beginPath();
        ctx.arc(cx, cy, c.w / 4, 0, Math.PI * 2);
        ctx.fill();
        // Sparkle (small white dot that appears/disappears)
        if (Math.sin(elapsed * 6 + i) > 0.3) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx + 3, cy - 3, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(cx, cy, c.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Church (finish area) — enhanced with glow, door, and window
    const finish = this.level.getFinishArea();
    const fx = finish.x - offset.x;

    // Light glow behind church
    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.fillRect(fx - 4, finish.y - 4, finish.w + 8, finish.h + 4);

    // Main church body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(fx, finish.y, finish.w, finish.h);

    // Steeple/roof triangle
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(fx + finish.w / 2, finish.y - 12);
    ctx.lineTo(fx, finish.y);
    ctx.lineTo(fx + finish.w, finish.y);
    ctx.closePath();
    ctx.fill();

    // Cross on top
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx + finish.w / 2 - 1, finish.y - 20, 2, 10);
    ctx.fillRect(fx + finish.w / 2 - 4, finish.y - 17, 8, 2);

    // White door at bottom center
    ctx.fillStyle = '#FFFFFF';
    const doorW = 8;
    const doorH = 12;
    ctx.fillRect(fx + finish.w / 2 - doorW / 2, finish.y + finish.h - doorH, doorW, doorH);

    // Small window (circle) above door
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(fx + finish.w / 2, finish.y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    // Window frame
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(fx + finish.w / 2, finish.y + 8, 3, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Player
    this.player.render(ctx, offset);

    // 6. HUD (screen-space, no camera offset)
    this.hud.render(ctx, collectibles, this.isMuted);
  }

  /**
   * Called when leaving this screen.
   */
  exit() {
    if (this.manager.audio) this.manager.audio.stopMusic();
    this.manager.input.hideTouchControls();

    // Remove canvas click listener
    const displayCanvas = document.getElementById('displayCanvas');
    if (displayCanvas) {
      displayCanvas.removeEventListener('pointerup', this._canvasClickHandler);
    }
  }
}


/**
 * ThankYouScreen — Shows after completing the game, before the invitation.
 * Displays the bride thanking the guest for guiding the groom.
 * Auto-advances to the invitation (win) screen after 3 seconds.
 */
class ThankYouScreen {
  constructor(manager) {
    this.manager = manager;
    this.overlay = document.getElementById('thankyou-overlay');
    this._timer = 0;
    this._duration = 3.5; // seconds before advancing
    this._data = {};
  }

  enter(data) {
    if (!this.overlay) return;
    this._data = data || {};
    this._timer = 0;

    const cfg = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};

    const title = this.overlay.querySelector('.thankyou-title');
    const message = this.overlay.querySelector('.thankyou-message');

    if (title) title.textContent = cfg.thankyouTitle || 'Mission accomplished!';
    if (message) message.textContent = cfg.thankyouMessage || 'Thank you for guiding the groom to his happily ever after.';

    // Play win SFX
    if (this.manager.audio) this.manager.audio.playSFX('win');

    this.overlay.style.display = 'flex';
    this.overlay.style.opacity = '1';
  }

  update(dt, input) {
    this._timer += dt;

    // Fade out in the last 0.5 seconds
    if (this._timer > this._duration - 0.5 && this.overlay) {
      const fade = 1 - ((this._timer - (this._duration - 0.5)) / 0.5);
      this.overlay.style.opacity = Math.max(0, fade).toString();
    }

    if (this._timer >= this._duration) {
      this.manager.switchTo('win', this._data);
    }
  }

  render(ctx) {
    // No canvas rendering
  }

  exit() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
      this.overlay.style.opacity = '1';
    }
  }
}


/**
 * WinScreen — Displayed when the player reaches the church.
 * Uses an HTML overlay for crisp text and customizable wedding invitation details.
 * Reads from WEDDING_CONFIG (js/config.js) for all displayed content.
 *
 * Validates: Requirements 8.3, 4.5, 5.5, 10.1, 10.3
 */
class WinScreen {
  /**
   * @param {ScreenManager} manager
   */
  constructor(manager) {
    this.manager = manager;
    this.overlay = document.getElementById('win-overlay');
    this._replayBtn = this.overlay ? this.overlay.querySelector('.win-replay-btn') : null;
    this._clickHandler = () => { this.manager.switchTo('gameplay'); };
  }

  enter(data) {
    if (!this.overlay) return;

    // Play win SFX
    if (this.manager.audio) this.manager.audio.playSFX('win');

    // Save best time
    const time = data.time || 0;
    const storage = this.manager.storage;
    if (storage && storage.saveBestTime) {
      storage.saveBestTime(time);
    }

    // Populate from WEDDING_CONFIG
    const cfg = (typeof WEDDING_CONFIG !== 'undefined') ? WEDDING_CONFIG : {};

    const heading = this.overlay.querySelector('.win-heading');
    const couple = this.overlay.querySelector('.win-couple');
    const dateEl = this.overlay.querySelector('.win-date');
    const timeEl = this.overlay.querySelector('.win-time');
    const venue = this.overlay.querySelector('.win-venue');
    const message = this.overlay.querySelector('.win-message');
    const rsvp = this.overlay.querySelector('.win-rsvp');
    const replayBtn = this.overlay.querySelector('.win-replay-btn');

    if (heading) heading.textContent = cfg.heading || "You're Invited!";
    if (couple) couple.textContent = cfg.couple || '';
    if (dateEl) dateEl.textContent = cfg.date || '';
    if (timeEl) timeEl.textContent = cfg.time || '';
    if (venue) venue.textContent = cfg.venue || '';
    if (message) message.textContent = cfg.message || '';
    if (rsvp) rsvp.textContent = cfg.rsvp || '';
    if (replayBtn) replayBtn.textContent = cfg.replayText || 'Play Again';

    // Apply colors
    if (heading) heading.style.color = cfg.headingColor || '#8B0000';
    this.overlay.querySelector('.win-content').style.color = cfg.textColor || '#333333';

    // Apply background
    if (cfg.backgroundImage) {
      this.overlay.style.backgroundImage = 'url(' + cfg.backgroundImage + ')';
      this.overlay.style.backgroundColor = 'transparent';
    } else {
      this.overlay.style.backgroundImage = 'none';
      this.overlay.style.backgroundColor = cfg.backgroundColor || '#FFF8F0';
    }

    this.overlay.style.display = 'flex';
    if (this._replayBtn) {
      this._replayBtn.addEventListener('click', this._clickHandler);
    }
  }

  update(dt, input) {
    if (input.confirm) {
      this.manager.switchTo('gameplay');
    }
  }

  render(ctx) {
    // No canvas rendering — HTML overlay handles it
  }

  exit() {
    if (this.overlay) this.overlay.style.display = 'none';
    if (this._replayBtn) {
      this._replayBtn.removeEventListener('click', this._clickHandler);
    }
  }
}


/**
 * LoseScreen — Displayed when the player fails (fell or timer expired).
 * Uses an HTML overlay for crisp text rendering.
 *
 * Validates: Requirements 8.4, 4.3, 4.4
 */
class LoseScreen {
  /**
   * @param {ScreenManager} manager
   */
  constructor(manager) {
    this.manager = manager;
    this.overlay = document.getElementById('lose-overlay');
    this._retryBtn = this.overlay ? this.overlay.querySelector('.lose-retry-btn') : null;
    this._clickHandler = () => { this.manager.switchTo('gameplay'); };
  }

  enter(data) {
    if (!this.overlay) return;

    // Play lose SFX
    if (this.manager.audio) this.manager.audio.playSFX('lose');

    const reasonEl = this.overlay.querySelector('.lose-reason');
    if (reasonEl) reasonEl.textContent = data.reason || 'Game Over';

    this.overlay.style.display = 'flex';
    if (this._retryBtn) {
      this._retryBtn.addEventListener('click', this._clickHandler);
    }
  }

  update(dt, input) {
    if (input.confirm) {
      this.manager.switchTo('gameplay');
    }
  }

  render(ctx) {
    // No canvas rendering — HTML overlay handles it
  }

  exit() {
    if (this.overlay) this.overlay.style.display = 'none';
    if (this._retryBtn) {
      this._retryBtn.removeEventListener('click', this._clickHandler);
    }
  }
}


/**
 * OrientationWarning — Disabled since the game is now portrait-first.
 * Kept as a no-op class so main.js doesn't break.
 */
class OrientationWarning {
  constructor() {
    // No-op — portrait is the intended orientation
  }
  dismiss() {}
  destroy() {}
}
