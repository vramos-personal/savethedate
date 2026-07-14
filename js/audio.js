// AudioManager — handles background music, sound effects, and mute state
// Uses HTMLAudioElement for simplicity. Gracefully handles missing audio files.

class AudioManager {
  constructor() {
    this._muted = false;
    this._unlocked = false;
    this._currentMusic = null;
    this._currentMusicKey = null;
    this._queuedMusic = null;
    this._sounds = {};
  }

  /**
   * Preload all audio files as Audio elements.
   * Called once during game initialization.
   */
  preload() {
    const manifest = {
      bgm: 'assets/audio/bgm.mp3',
      jump: 'assets/audio/jump.mp3',
      collect: 'assets/audio/collect.mp3',
      win: 'assets/audio/win.mp3',
      lose: 'assets/audio/lose.mp3'
    };

    for (const [key, src] of Object.entries(manifest)) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;
      this._sounds[key] = audio;
    }

    // Register user interaction listeners to unlock audio
    this._registerUnlockListeners();
  }

  /**
   * Start looping music by key (e.g. 'bgm').
   * If audio is not yet unlocked by user interaction, queues the music
   * to start once unlocked.
   */
  playMusic(key) {
    if (this._muted) return;

    if (!this._unlocked) {
      this._queuedMusic = key;
      return;
    }

    this._startMusic(key);
  }

  /**
   * Stop the currently playing music.
   */
  stopMusic() {
    if (this._currentMusic) {
      this._currentMusic.pause();
      this._currentMusic.currentTime = 0;
      this._currentMusic = null;
      this._currentMusicKey = null;
    }
    this._queuedMusic = null;
  }

  /**
   * Play a one-shot sound effect by key (e.g. 'jump', 'collect', 'win', 'lose').
   * Clones the audio element to allow overlapping playback.
   */
  playSFX(key) {
    if (this._muted) return;
    if (!this._unlocked) return;

    const source = this._sounds[key];
    if (!source) return;

    // Clone for overlapping playback
    const sfx = source.cloneNode();
    sfx.volume = source.volume;
    try {
      sfx.play().catch(() => {});
    } catch (e) {
      // Silently ignore play errors (missing files, etc.)
    }
  }

  /**
   * Set mute state. When muted, immediately stops all audio.
   * @param {boolean} muted
   */
  setMuted(muted) {
    this._muted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  /**
   * Get current mute state.
   * @returns {boolean}
   */
  isMuted() {
    return this._muted;
  }

  /**
   * Convenience toggle for mute state.
   * @returns {boolean} new mute state
   */
  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  }

  /**
   * Call on first user interaction to satisfy browser autoplay policy.
   * Resumes any queued music.
   */
  unlockAudio() {
    if (this._unlocked) return;
    this._unlocked = true;

    // Start any queued music
    if (this._queuedMusic && !this._muted) {
      this._startMusic(this._queuedMusic);
      this._queuedMusic = null;
    }
  }

  // --- Private methods ---

  /**
   * Internal: actually start playing music with looping.
   */
  _startMusic(key) {
    // Don't restart if already playing the same track
    if (this._currentMusicKey === key && this._currentMusic && !this._currentMusic.paused) {
      return;
    }

    // Stop any current music first
    if (this._currentMusic) {
      this._currentMusic.pause();
      this._currentMusic.currentTime = 0;
    }

    const audio = this._sounds[key];
    if (!audio) return;

    audio.loop = true;
    audio.currentTime = 0;
    this._currentMusic = audio;
    this._currentMusicKey = key;

    try {
      audio.play().catch(() => {});
    } catch (e) {
      // Silently ignore play errors
    }
  }

  /**
   * Register event listeners that unlock audio on first user interaction.
   */
  _registerUnlockListeners() {
    const events = ['pointerdown', 'click', 'keydown'];
    const handler = () => {
      this.unlockAudio();
      // Remove listeners after first interaction
      events.forEach(evt => document.removeEventListener(evt, handler));
    };
    events.forEach(evt => document.addEventListener(evt, handler, { once: false }));
  }
}
