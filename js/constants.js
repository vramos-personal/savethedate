// Virtual canvas dimensions (pixel-art resolution) — PORTRAIT 9:16
const VIRTUAL_WIDTH = 144;
const VIRTUAL_HEIGHT = 256;

// Physics
const GRAVITY = 980;        // px/s²
const MOVE_SPEED = 100;     // px/s
const JUMP_IMPULSE = -260;  // px/s (negative = upward)

// Player dimensions
const PLAYER_W = 16;
const PLAYER_H = 24;

// Gameplay
const TIMER_DURATION = 30;  // seconds (generous, no lose condition anyway)

// Delta-time cap to prevent physics explosion on slow frames
const MAX_DT = 1 / 30;

// Accessibility — high-contrast mode localStorage key
const HC_KEY = 'rta_highContrast';

// Screen transition duration (seconds)
const TRANSITION_DURATION = 0.15;
