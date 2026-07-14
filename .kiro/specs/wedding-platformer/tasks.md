# Implementation Plan: Wedding Platformer — "Run to the Altar!"

## Overview

Build a complete 2D pixel-art side-scrolling platformer using vanilla JavaScript and Canvas 2D. Implementation proceeds bottom-up: core engine and rendering first, then physics and input, then gameplay systems, then screens/UI, and finally polish. Each step produces runnable code that can be tested by opening index.html in a browser.

## Tasks

- [x] 1. Project scaffold and game loop
  - [x] 1.1 Create HTML entry point and CSS layout
    - Create `index.html` with two canvas elements (virtual 320×180 and display), link CSS and JS files
    - Create `css/style.css` with body centering, black background, safe-area padding, overflow hidden
    - Create `js/constants.js` with all shared constants (VIRTUAL_WIDTH, VIRTUAL_HEIGHT, GRAVITY, MOVE_SPEED, JUMP_IMPULSE, PLAYER_W, PLAYER_H, TIMER_DURATION)
    - _Requirements: 1.3, 11.1, 11.2_

  - [x] 1.2 Implement GameEngine with game loop and scaling
    - Create `js/engine.js` with GameEngine class
    - Implement `requestAnimationFrame` loop with delta-time calculation and MAX_DT cap (1/30)
    - Implement `resize()` method: calculate integer scale factor, set display canvas size, maintain 16:9 aspect ratio
    - Set `imageSmoothingEnabled = false` on display context for nearest-neighbor scaling
    - Implement pause/resume on `visibilitychange` event
    - _Requirements: 1.3, 1.4, 1.5, 11.1_

  - [x] 1.3 Create main.js entry point
    - Create `js/main.js` that instantiates GameEngine and calls `start()`
    - Verify the game loop runs (draw a colored rectangle on the virtual canvas as a smoke test)
    - _Requirements: 1.4_

- [x] 2. Input system
  - [x] 2.1 Implement keyboard input handling
    - Create `js/input.js` with InputSystem class
    - Track keydown/keyup state for A/D, Arrow keys, Space, Escape, Enter, R
    - Implement `poll()` method returning unified input state object (left, right, jump, jumpHeld, mute, pause, confirm)
    - Handle edge-triggered vs level-triggered inputs (jump = edge, jumpHeld = level)
    - _Requirements: 6.3, 6.5_

  - [x] 2.2 Implement touch input handling
    - Add touch control HTML elements (left, right, jump buttons) positioned with CSS
    - Use pointer events (pointerdown, pointerup, pointermove, pointercancel) for multi-touch support
    - Track active pointer IDs per button for multi-touch independence
    - Set button sizes to minimum 48×48 CSS pixels (64×64 preferred)
    - Implement `isTouchDevice()` detection and `showTouchControls()` / `hideTouchControls()`
    - Merge touch state into the same input state object returned by `poll()`
    - _Requirements: 6.1, 6.2, 6.4, 6.5_

  - [ ]* 2.3 Write property test for multi-touch independence
    - **Property 10: Input system multi-touch independence**
    - **Validates: Requirements 6.2, 6.5**

- [x] 3. Player physics and movement
  - [x] 3.1 Implement Player class with physics
    - Create `js/player.js` with Player class
    - Implement position (x, y), velocity (vx, vy), dimensions, grounded state
    - Implement `update(dt, input, platforms)`: apply horizontal movement from input, apply gravity (vy += GRAVITY * dt), apply jump impulse when grounded and jump pressed, update position (x += vx*dt, y += vy*dt)
    - Implement `getBounds()` returning AABB {x, y, w, h}
    - Implement `reset(x, y)` to restore starting state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.2 Implement AABB collision detection and platform resolution
    - Add `aabbOverlap(a, b)` utility function
    - In Player.update, after position update: iterate platforms, check overlap, resolve by snapping y to platform top when falling, set grounded=true, vy=0
    - Check previous-frame position to only resolve when player was above platform
    - _Requirements: 3.2, 2.5_

  - [x] 3.3 Implement fall and finish detection
    - In Player.update or gameplay screen: check if player.y > VIRTUAL_HEIGHT → trigger lose
    - Check overlap with finish area AABB → trigger win
    - _Requirements: 3.3, 3.5, 4.4_

  - [ ]* 3.4 Write property tests for physics system
    - **Property 1: Delta-time physics consistency**
    - **Property 2: Platform collision prevents fall-through**
    - **Property 3: Jump gating invariant**
    - **Property 7: AABB overlap symmetry**
    - **Validates: Requirements 1.4, 2.3, 2.4, 2.5, 2.6, 3.2, 5.2**

- [x] 4. Checkpoint - Core mechanics verification
  - Ensure player can move left/right, jump, land on platforms, and fall through gaps. Open index.html and verify with keyboard. Ask the user if questions arise.

- [x] 5. Level generation
  - [x] 5.1 Implement Level class with platform and collectible data
    - Create `js/level.js` with Level class
    - Define platform array: series of AABB rectangles ({x, y, w, h}) with gaps between them
    - Total level width ~1600 virtual pixels, platforms at y=156, gaps of 32–48px
    - Place church finish area at end of level
    - Place bouquet and ring collectibles at specific positions along the path
    - Implement `getPlatforms()`, `getCollectibles()`, `getFinishArea()`, `getLevelWidth()`, `collectItem(index)`, `reset()`
    - _Requirements: 3.1, 3.4, 5.1_

  - [x] 5.2 Implement collectible pickup logic
    - In gameplay update: check AABB overlap between player and each uncollected collectible
    - On overlap: mark collected, trigger audio SFX, update HUD state
    - _Requirements: 5.2, 5.3_

- [x] 6. Camera system
  - [x] 6.1 Implement Camera class
    - Create `js/camera.js` with Camera class
    - Constructor takes viewWidth (320), viewHeight (180), levelWidth
    - `follow(playerX)`: set camera x so player is at ~30% from left edge
    - Clamp: camera.x >= 0, camera.x + viewWidth <= levelWidth
    - `getOffset()` returns {x, y:0}
    - Apply camera offset when rendering all game objects (subtract offset from world positions)
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 6.2 Write property test for camera clamping
    - **Property 4: Camera clamping within bounds**
    - **Validates: Requirements 7.2**

- [ ] 7. HUD and timer
  - [x] 7.1 Implement timer countdown
    - In gameplay screen: track elapsed time, compute remaining = 20 - elapsed
    - When remaining <= 0: trigger lose condition with "Time's Up!" message
    - _Requirements: 4.1, 4.3_

  - [x] 7.2 Implement HUD rendering
    - Create `js/hud.js` with HUD class
    - Render timer at top-center (remaining seconds with one decimal: "12.3")
    - Render collectible indicators (bouquet icon, ring icon — filled/empty based on collected state)
    - Render mute button at top-right (48×48 touch target area)
    - Handle mute button click detection via coordinate check
    - _Requirements: 4.2, 5.4, 9.6, 11.4_

  - [ ]* 7.3 Write property test for timer
    - **Property 6: Timer monotonic decrease**
    - **Validates: Requirements 4.1, 4.3**

- [x] 8. Screen flow and state management
  - [x] 8.1 Implement ScreenManager and screen classes
    - Create `js/screens.js` with ScreenManager class and screen objects (TitleScreen, GameplayScreen, WinScreen, LoseScreen)
    - Each screen has `enter(data)`, `update(dt, input)`, `render(ctx)`, `exit()` methods
    - ScreenManager.switchTo(name, data) handles transitions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 8.2 Implement Title Screen
    - Display game title "Run to the Altar!" centered
    - Display "Play" button (clickable area)
    - Display best time if one exists (from StorageManager)
    - On confirm/click: transition to Gameplay
    - _Requirements: 8.1, 8.2, 10.2_

  - [x] 8.3 Implement Gameplay Screen
    - Instantiate/reset Player, Level, Camera, HUD, Timer
    - Wire update loop: input → player.update → camera.follow → collectible checks → timer check → win/lose checks
    - Wire render: clear → level.render → player.render → hud.render (all offset by camera)
    - _Requirements: 8.2_

  - [x] 8.4 Implement Win and Lose Screens
    - Win Screen: show elapsed time, collectibles count, "New Best!" flag, Play Again button
    - Lose Screen: show failure reason ("Time's Up!" or "You Fell!"), Retry button
    - On button press: reset and transition to Gameplay
    - _Requirements: 8.3, 8.4, 8.5, 4.3, 4.4, 4.5, 5.5_

  - [x] 8.5 Implement orientation warning overlay
    - Detect portrait orientation via `window.matchMedia('(orientation: portrait)')`
    - Show overlay with message and "Continue Anyway" button
    - _Requirements: 8.6_

  - [ ]* 8.6 Write property test for screen state machine
    - **Property 9: Screen state machine valid transitions**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 9. Checkpoint - Full gameplay loop
  - Ensure complete flow: Title → Gameplay → Win/Lose → Replay works. Timer counts down, collectibles work, camera scrolls. Ask the user if questions arise.

- [x] 10. Audio integration
  - [x] 10.1 Implement AudioManager
    - Create `js/audio.js` with AudioManager class
    - Preload audio files (bgm, jump, collect, win, lose) as Audio elements
    - Implement `playMusic(key)` with looping, `stopMusic()`, `playSFX(key)` for one-shot
    - Implement `setMuted(bool)` and `isMuted()` with immediate stop on mute
    - Handle browser autoplay policy: queue music start until first user interaction
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_

  - [x] 10.2 Wire audio events into gameplay
    - Play BGM on Gameplay screen enter, stop on exit
    - Play jump SFX in Player.update when jump triggers
    - Play collect SFX when collectible picked up
    - Play win/lose SFX on respective screen transitions
    - Wire mute button in HUD to AudioManager.setMuted()
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 11. Persistence with LocalStorage
  - [x] 11.1 Implement StorageManager
    - Create `js/storage.js` with StorageManager class
    - `getBestTime()`: read from localStorage, return number or null, handle parse errors gracefully
    - `setBestTime(time)`: compare with existing, only save if better (lower)
    - `getMuteState()` / `setMuteState(muted)`: persist mute preference
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 11.2 Wire StorageManager into screens
    - On win: call setBestTime with elapsed time
    - On Title Screen: display best time from getBestTime
    - On Win Screen: compare current time to best, show "New Best!" if applicable
    - On mute toggle: persist via setMuteState, restore on load via getMuteState
    - _Requirements: 10.1, 10.2, 10.3, 9.7_

  - [ ]* 11.3 Write property test for storage best-time
    - **Property 8: Storage best-time monotonic improvement**
    - **Validates: Requirements 10.1, 10.3**

- [x] 12. Player animations
  - [x] 12.1 Implement sprite animation system
    - Add animation state tracking to Player (idle, run, jump)
    - Determine animation state from physics: grounded+stationary=idle, grounded+moving=run, airborne=jump
    - Track facing direction, flip sprite horizontally when direction changes
    - Implement frame cycling for run animation (e.g., 4 frames at 8fps)
    - Render correct sprite frame from spritesheet using drawImage source-rect
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 12.2 Write property test for animation state
    - **Property 11: Animation state matches physics state**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [x] 13. Responsive design and accessibility polish
  - [x] 13.1 Implement responsive scaling refinements
    - Use integer scaling (Math.floor) to prevent sub-pixel blurring
    - Handle ResizeObserver for dynamic viewport changes
    - Test letterboxing at various aspect ratios
    - _Requirements: 11.1_

  - [x] 13.2 Implement high-contrast mode
    - Add a toggle in HUD or Title screen for high-contrast mode
    - When enabled: increase text size, add outlines to sprites, use brighter colors for UI elements
    - Store preference in localStorage
    - _Requirements: 11.3_

  - [x] 13.3 Verify touch target sizes and safe areas
    - Audit all interactive elements for 48×48 minimum touch target
    - Verify CSS safe-area-insets are applied correctly
    - _Requirements: 11.2, 11.4_

- [x] 14. Level rendering and visual polish
  - [x] 14.1 Implement level rendering
    - Draw platform tiles from sprite atlas
    - Draw background (sky gradient or simple color)
    - Draw church sprite at finish area
    - Draw collectible sprites (with bobbing animation)
    - All rendering uses camera offset for world-space positioning
    - _Requirements: 3.1, 3.4, 5.1_

  - [x] 14.2 Add visual polish
    - Add parallax background layer (optional simple clouds)
    - Add particle effects on collectible pickup (optional)
    - Ensure smooth screen transitions (simple fade or cut)
    - _Requirements: 8.3, 8.4_

- [x] 15. Checkpoint - Feature complete
  - Ensure all features work together: full gameplay loop, audio, persistence, responsive scaling, touch + keyboard, animations. Run through on both desktop browser and mobile emulator. Ask the user if questions arise.

- [ ]* 16. Write collectible state property test
  - **Property 5: Collectible state consistency**
  - **Validates: Requirements 5.2, 5.4**

- [x] 17. Final verification and optimization
  - [x] 17.1 Performance check
    - Profile in Chrome DevTools on throttled CPU
    - Ensure no memory leaks (no growing arrays per frame)
    - Verify asset total is under 10 MB
    - _Requirements: 1.1, 1.2, 11.5_

  - [x] 17.2 Cross-browser and device testing
    - Test in Chrome, Firefox, Safari, Edge
    - Test on mobile (Android Chrome, iOS Safari) via device emulation
    - Verify touch controls, orientation warning, safe areas
    - _Requirements: 6.1, 6.2, 8.6, 11.2_

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- All code is vanilla JavaScript with no build step — just open `index.html` in a browser
- Placeholder colored rectangles can stand in for sprite art until real assets are ready
- Audio files can be placeholder (short beeps) initially; replace with final assets later
- Each checkpoint is a natural stopping point where the game should be playable in some form
