/**
 * main.js — Bootstrap entry point for "Run to the Altar!"
 *
 * Instantiates the GameEngine, InputSystem, StorageManager, and ScreenManager.
 * Wires the game loop to the ScreenManager for update/render delegation.
 */

// Create core systems
const input = new InputSystem();
const engine = new GameEngine(input);

// StorageManager — persists best time and mute preference
const storage = new StorageManager();

// AudioManager — handles BGM and SFX
const audio = new AudioManager();
audio.preload();

// Restore mute state from storage on boot
audio.setMuted(storage.getMuteState());

// Create the screen manager — this registers all screens and starts on Title
const screenManager = new ScreenManager(engine, input, audio, storage);

// Wire engine update to poll input and drive the active screen
engine.update = function (dt) {
  const inputState = input.poll();
  screenManager.update(dt, inputState);
};

// Wire engine render to delegate to the active screen
engine.render = function (ctx) {
  screenManager.render(ctx);
};

// Initialize orientation warning overlay (mobile only)
const orientationWarning = new OrientationWarning();

// Start the game loop
engine.start();
