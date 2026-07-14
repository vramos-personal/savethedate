/**
 * StorageManager — LocalStorage wrapper for "Run to the Altar!"
 *
 * Persists best completion time and mute preference.
 * Uses 'rta_' prefix on keys to avoid collisions.
 * Handles missing/corrupted data and unavailable localStorage gracefully.
 */
class StorageManager {
  constructor() {
    this._keyBestTime = 'rta_bestTime';
    this._keyMuted = 'rta_muted';
  }

  /**
   * Returns the best (lowest) completion time, or null if none stored.
   * @returns {number|null}
   */
  getBestTime() {
    try {
      const raw = localStorage.getItem(this._keyBestTime);
      if (raw === null) return null;
      const parsed = parseFloat(raw);
      if (isNaN(parsed)) return null;
      return parsed;
    } catch (e) {
      // localStorage unavailable (private browsing, quota exceeded, etc.)
      return null;
    }
  }

  /**
   * Saves the time only if it is better (lower) than the existing best.
   * If no existing best, saves unconditionally.
   * @param {number} time — completion time in seconds
   */
  setBestTime(time) {
    try {
      if (typeof time !== 'number' || isNaN(time)) return;
      const current = this.getBestTime();
      if (current === null || time < current) {
        localStorage.setItem(this._keyBestTime, time.toString());
      }
    } catch (e) {
      // localStorage unavailable — silently ignore
    }
  }

  /**
   * Alias for setBestTime, used by ScreenManager/screens.js.
   * @param {number} time
   */
  saveBestTime(time) {
    this.setBestTime(time);
  }

  /**
   * Returns the persisted mute state, defaulting to false.
   * @returns {boolean}
   */
  getMuteState() {
    try {
      const raw = localStorage.getItem(this._keyMuted);
      return raw === 'true';
    } catch (e) {
      return false;
    }
  }

  /**
   * Persists the mute preference.
   * @param {boolean} muted
   */
  setMuteState(muted) {
    try {
      localStorage.setItem(this._keyMuted, muted ? 'true' : 'false');
    } catch (e) {
      // localStorage unavailable — silently ignore
    }
  }

  /**
   * Returns the persisted high-contrast mode state, defaulting to false.
   * @returns {boolean}
   */
  getHighContrast() {
    try {
      const raw = localStorage.getItem(HC_KEY);
      return raw === 'true';
    } catch (e) {
      return false;
    }
  }

  /**
   * Persists the high-contrast mode preference.
   * @param {boolean} enabled
   */
  setHighContrast(enabled) {
    try {
      localStorage.setItem(HC_KEY, enabled ? 'true' : 'false');
    } catch (e) {
      // localStorage unavailable — silently ignore
    }
  }
}
