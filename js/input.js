/**
 * InputSystem — Keyboard + Touch input handling.
 *
 * Tracks keydown/keyup state and touch button pointer events, providing a
 * unified input snapshot each frame via the poll() method. Supports both
 * edge-triggered inputs (fire once per press) and level-triggered inputs
 * (true while held).
 *
 * Key mappings:
 *   A / ArrowLeft  → left (level)
 *   D / ArrowRight → right (level)
 *   Space          → jump (edge) / jumpHeld (level)
 *   Escape         → pause (edge)
 *   Enter          → confirm (edge)
 *   M              → mute (edge)
 *   R              → restart (edge, mapped to confirm)
 *
 * Touch buttons:
 *   btn-left  (◀)  → left (level)
 *   btn-right (▶)  → right (level)
 *   btn-jump  (⬆)  → jump (edge) / jumpHeld (level)
 */
class InputSystem {
  constructor() {
    /** @type {Set<string>} Keys currently held down */
    this.keys = new Set();

    /** @type {Set<string>} Keys pressed since last poll (for edge-triggered detection) */
    this.justPressed = new Set();

    // Touch state — each button tracks its active pointer IDs
    /** @type {Set<number>} */
    this._leftPointers = new Set();
    /** @type {Set<number>} */
    this._rightPointers = new Set();
    /** @type {Set<number>} */
    this._jumpPointers = new Set();

    /** @type {boolean} Whether jump button was active last frame (for edge detection) */
    this._jumpWasActive = false;

    /** @type {HTMLElement|null} Container for touch controls */
    this._touchContainer = null;

    /** @type {boolean} Whether touch controls are currently visible */
    this._touchVisible = false;

    // Bind event listeners
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * Handle keydown events. Adds key to held set and, if not a repeat,
   * adds to justPressed set for edge-triggered detection.
   * @param {KeyboardEvent} e
   */
  _onKeyDown(e) {
    const key = e.key;
    if (this._isGameKey(key)) {
      e.preventDefault();
    }

    // Only register edge trigger on initial press, not repeats
    if (!e.repeat) {
      this.justPressed.add(key);
    }
    this.keys.add(key);
  }

  /**
   * Handle keyup events. Removes key from held set.
   * @param {KeyboardEvent} e
   */
  _onKeyUp(e) {
    this.keys.delete(e.key);
  }

  /**
   * Check if a key is one of our game keys (for preventDefault).
   * @param {string} key
   * @returns {boolean}
   */
  _isGameKey(key) {
    return key === 'ArrowLeft' || key === 'ArrowRight' ||
           key === 'ArrowUp' || key === 'ArrowDown' ||
           key === ' ' || key === 'Escape' ||
           key === 'Enter' || key === 'r' || key === 'R' ||
           key === 'm' || key === 'M' ||
           key === 'a' || key === 'A' ||
           key === 'd' || key === 'D';
  }

  /**
   * Poll the current input state. Returns a snapshot of all input channels.
   * Touch state is OR'd with keyboard state so either input source works.
   *
   * @returns {{left: boolean, right: boolean, jump: boolean, jumpHeld: boolean, mute: boolean, pause: boolean, confirm: boolean}}
   */
  poll() {
    // Touch button active states
    const touchLeft = this._leftPointers.size > 0;
    const touchRight = this._rightPointers.size > 0;
    const touchJumpActive = this._jumpPointers.size > 0;

    // Edge-triggered jump for touch: active this frame but NOT last frame
    const touchJumpEdge = touchJumpActive && !this._jumpWasActive;

    const state = {
      // Level-triggered: true while held (keyboard OR touch)
      left: this.keys.has('a') || this.keys.has('A') ||
            this.keys.has('ArrowLeft') || touchLeft,
      right: this.keys.has('d') || this.keys.has('D') ||
             this.keys.has('ArrowRight') || touchRight,
      jumpHeld: this.keys.has(' ') || touchJumpActive,

      // Edge-triggered: true only on frame of first press (keyboard OR touch)
      jump: this.justPressed.has(' ') || touchJumpEdge,
      mute: this.justPressed.has('m') || this.justPressed.has('M'),
      pause: this.justPressed.has('Escape'),
      confirm: this.justPressed.has('Enter') ||
               this.justPressed.has('r') || this.justPressed.has('R')
    };

    // Update previous jump state for next frame edge detection
    this._jumpWasActive = touchJumpActive;

    // Clear edge-triggered set after reading
    this.justPressed.clear();

    return state;
  }

  /**
   * Returns true if a touch-capable device is detected.
   * @returns {boolean}
   */
  isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  /**
   * Create and display touch control buttons overlaid on the game canvas.
   * Buttons are HTML elements positioned with CSS so they respond to
   * native pointer events and accessibility tools.
   */
  showTouchControls() {
    if (this._touchVisible) return;

    // Create container
    this._touchContainer = document.createElement('div');
    this._touchContainer.id = 'touch-controls';
    this._touchContainer.setAttribute('aria-label', 'Touch controls');

    // Create buttons
    const btnLeft = this._createTouchButton('btn-left', '◀', 'Move left');
    const btnRight = this._createTouchButton('btn-right', '▶', 'Move right');
    const btnJump = this._createTouchButton('btn-jump', '⬆', 'Jump');

    // Group left/right in a sub-container
    const dpad = document.createElement('div');
    dpad.id = 'touch-dpad';
    dpad.appendChild(btnLeft);
    dpad.appendChild(btnRight);

    this._touchContainer.appendChild(dpad);
    this._touchContainer.appendChild(btnJump);

    document.body.appendChild(this._touchContainer);

    // Attach pointer event listeners
    this._attachPointerEvents(btnLeft, this._leftPointers);
    this._attachPointerEvents(btnRight, this._rightPointers);
    this._attachPointerEvents(btnJump, this._jumpPointers);

    this._touchVisible = true;
  }

  /**
   * Remove touch control buttons from the DOM.
   */
  hideTouchControls() {
    if (!this._touchVisible || !this._touchContainer) return;

    this._touchContainer.remove();
    this._touchContainer = null;

    // Clear any lingering pointer state
    this._leftPointers.clear();
    this._rightPointers.clear();
    this._jumpPointers.clear();

    this._touchVisible = false;
  }

  /**
   * Create a single touch button element.
   * @param {string} id - Element ID
   * @param {string} label - Display text
   * @param {string} ariaLabel - Accessible label
   * @returns {HTMLButtonElement}
   */
  _createTouchButton(id, label, ariaLabel) {
    const btn = document.createElement('button');
    btn.id = id;
    btn.className = 'touch-btn';
    btn.textContent = label;
    btn.setAttribute('aria-label', ariaLabel);
    // Prevent browser gestures (scroll, zoom) on touch buttons
    btn.style.touchAction = 'none';
    return btn;
  }

  /**
   * Attach pointer event listeners to a touch button for multi-touch tracking.
   * @param {HTMLElement} element - The button element
   * @param {Set<number>} pointerSet - The set to track active pointers for this button
   */
  _attachPointerEvents(element, pointerSet) {
    element.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      pointerSet.add(e.pointerId);
      element.setPointerCapture(e.pointerId);
      element.classList.add('active');
    });

    element.addEventListener('pointerup', (e) => {
      e.preventDefault();
      pointerSet.delete(e.pointerId);
      element.releasePointerCapture(e.pointerId);
      if (pointerSet.size === 0) {
        element.classList.remove('active');
      }
    });

    element.addEventListener('pointercancel', (e) => {
      pointerSet.delete(e.pointerId);
      if (pointerSet.size === 0) {
        element.classList.remove('active');
      }
    });

    // Also handle pointermove leaving the button while captured
    element.addEventListener('lostpointercapture', (e) => {
      pointerSet.delete(e.pointerId);
      if (pointerSet.size === 0) {
        element.classList.remove('active');
      }
    });
  }

  /**
   * Clear all input state — call this on pause/blur to prevent stuck keys.
   */
  clear() {
    this.keys.clear();
    this.justPressed.clear();
    this._leftPointers.clear();
    this._rightPointers.clear();
    this._jumpPointers.clear();
    this._jumpWasActive = false;
  }

  /**
   * Clean up event listeners and touch controls (for teardown if needed).
   */
  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.hideTouchControls();
  }
}
