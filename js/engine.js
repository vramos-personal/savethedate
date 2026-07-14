/**
 * GameEngine — Core game loop, canvas scaling, and visibility management.
 *
 * Manages:
 * - Virtual canvas (320×180) rendering
 * - Nearest-neighbor scaling to display canvas
 * - requestAnimationFrame loop with delta-time capping
 * - Pause/resume on browser tab visibility change
 * - Responsive integer scaling to maintain 16:9 aspect ratio
 */
class GameEngine {
  constructor() {
    // Canvas setup
    this.virtualCanvas = document.getElementById('virtualCanvas');
    this.displayCanvas = document.getElementById('displayCanvas');
    this.vctx = this.virtualCanvas.getContext('2d');
    this.dctx = this.displayCanvas.getContext('2d');

    // Timing state
    this.lastTime = 0;
    this.paused = false;
    this.running = false;

    // Bind tick so we can pass it to requestAnimationFrame
    this.tick = this.tick.bind(this);

    // Set up resize handling
    this.resize();
    window.addEventListener('resize', () => this.resize());
    new ResizeObserver(() => this.resize()).observe(document.body);

    // Set up visibility change for pause/resume
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  /**
   * Begin the game loop.
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  /**
   * Freeze updates (e.g. when tab loses focus).
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume updates after a pause.
   */
  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  /**
   * The main loop callback. Calculates delta-time, updates, renders,
   * and scales the virtual canvas to the display canvas.
   * @param {number} timestamp - High-resolution timestamp from requestAnimationFrame
   */
  tick(timestamp) {
    if (this.paused) return;

    // Calculate delta-time in seconds, clamped to MAX_DT
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (dt > MAX_DT) dt = MAX_DT;

    // Update game state (placeholder — will be wired to ScreenManager)
    this.update(dt);

    // Clear virtual canvas
    this.vctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Render game state to virtual canvas (placeholder)
    this.render(this.vctx);

    // Scale virtual canvas to display canvas with nearest-neighbor interpolation
    this.dctx.imageSmoothingEnabled = false;
    this.dctx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    this.dctx.drawImage(
      this.virtualCanvas,
      0, 0,
      this.displayCanvas.width, this.displayCanvas.height
    );

    // Schedule next frame
    requestAnimationFrame(this.tick);
  }

  /**
   * Update game logic. Placeholder — will delegate to ScreenManager.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Will be wired to: screenManager.update(dt, input)
  }

  /**
   * Render game visuals to the virtual canvas. Placeholder — will delegate to ScreenManager.
   * @param {CanvasRenderingContext2D} ctx - The virtual canvas context
   */
  render(ctx) {
    // Will be wired to: screenManager.render(ctx)
  }

  /**
   * Convert display canvas coordinates to virtual canvas coordinates.
   * Useful for mapping click/touch events on the scaled display canvas
   * back to the 320×180 virtual resolution for HUD interaction.
   * @param {number} displayX - X coordinate on the display canvas (client coords)
   * @param {number} displayY - Y coordinate on the display canvas (client coords)
   * @returns {{x: number, y: number}} Virtual canvas coordinates
   */
  displayToVirtual(displayX, displayY) {
    const rect = this.displayCanvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    return {
      x: (displayX - rect.left) * scaleX,
      y: (displayY - rect.top) * scaleY
    };
  }

  /**
   * Recalculate display canvas size to maintain 9:16 portrait aspect ratio.
   * Uses the full available space with smooth scaling.
   */
  resize() {
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;

    // Scale to fit viewport while maintaining 9:16 aspect ratio
    const scale = Math.min(maxW / VIRTUAL_WIDTH, maxH / VIRTUAL_HEIGHT);

    const displayW = Math.floor(VIRTUAL_WIDTH * scale);
    const displayH = Math.floor(VIRTUAL_HEIGHT * scale);

    this.displayCanvas.width = displayW;
    this.displayCanvas.height = displayH;

    this.displayCanvas.style.width = displayW + 'px';
    this.displayCanvas.style.height = displayH + 'px';

    this.dctx.imageSmoothingEnabled = false;
  }
}
