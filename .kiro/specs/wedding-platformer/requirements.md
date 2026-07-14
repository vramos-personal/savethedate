# Requirements Document

## Introduction

"Run to the Altar!" is a browser-based 2D pixel-art side-scrolling platformer game where the player controls a groom running to reach his wedding at the church. The game is a short, casual experience with a 20-second time limit, collectible items (bouquet and ring), and simple platforming mechanics (jumping over gaps). It targets mobile browsers primarily and desktop browsers secondarily, using pure HTML/CSS/JavaScript with Canvas 2D rendering.

## Glossary

- **Game_Engine**: The core game loop and rendering system using Canvas 2D and requestAnimationFrame
- **Player_Character**: The groom sprite controlled by the player, with idle/run/jump animations
- **Level**: The single side-scrolling level containing platforms, gaps, and collectibles leading to the church
- **HUD**: The heads-up display showing timer, collectible status, and control overlays
- **Input_System**: The module handling touch controls, keyboard input, and multi-touch support
- **Camera**: The horizontal-scrolling viewport that follows the Player_Character
- **Timer**: The countdown mechanism from 20 seconds that determines win/lose state
- **Collectible**: An item (bouquet or ring) placed in the level that the player can pick up
- **Screen_Manager**: The system controlling transitions between Title, Gameplay, Win, and Lose screens
- **Audio_Manager**: The system managing background music, sound effects, and mute state
- **Storage_Manager**: The module handling LocalStorage for best time and completion state

## Requirements

### Requirement 1: Game Loop and Rendering

**User Story:** As a player, I want the game to run smoothly at a consistent frame rate, so that I have a responsive and enjoyable gameplay experience.

#### Acceptance Criteria

1. THE Game_Engine SHALL render the game at 60 FPS on desktop and mid-range mobile devices
2. THE Game_Engine SHALL maintain a minimum of 30 FPS on low-end mobile devices
3. THE Game_Engine SHALL use a virtual canvas of 320x180 pixels scaled with nearest-neighbor interpolation
4. THE Game_Engine SHALL use requestAnimationFrame for the game loop with delta-time based updates
5. WHEN the browser tab loses focus, THE Game_Engine SHALL pause the game loop

### Requirement 2: Player Movement and Physics

**User Story:** As a player, I want to move and jump with responsive controls, so that I can navigate the level and avoid obstacles.

#### Acceptance Criteria

1. WHEN the player presses left input, THE Player_Character SHALL move left at a consistent horizontal speed
2. WHEN the player presses right input, THE Player_Character SHALL move right at a consistent horizontal speed
3. WHEN the player presses jump input while on a platform, THE Player_Character SHALL jump with a fixed vertical impulse and return to the platform via gravity
4. WHILE the Player_Character is airborne, THE Input_System SHALL prevent additional jump inputs
5. WHEN the Player_Character lands on a platform, THE Game_Engine SHALL reset the airborne state to allow jumping again
6. THE Game_Engine SHALL apply gravity to the Player_Character every frame using delta-time

### Requirement 3: Level Design and Collision

**User Story:** As a player, I want a level with platforms and gaps to traverse, so that I have a fun challenge to overcome.

#### Acceptance Criteria

1. THE Level SHALL consist of a series of platform segments with gaps between them
2. WHEN the Player_Character overlaps a platform surface, THE Game_Engine SHALL prevent the Player_Character from falling through
3. WHEN the Player_Character falls below the bottom of the virtual canvas, THE Game_Engine SHALL trigger the lose condition
4. THE Level SHALL include a church sprite at the end to serve as the finish line
5. WHEN the Player_Character overlaps the church finish area, THE Game_Engine SHALL trigger the win condition

### Requirement 4: Timer and Win/Lose Conditions

**User Story:** As a player, I want a time limit that creates urgency, so that the game feels exciting and replayable.

#### Acceptance Criteria

1. WHEN gameplay begins, THE Timer SHALL start counting down from 20 seconds
2. THE HUD SHALL display the remaining time in seconds with one decimal place at the top-center of the screen
3. WHEN the Timer reaches zero, THE Game_Engine SHALL trigger the lose condition with a "Time's Up!" message
4. WHEN the Player_Character falls into a gap, THE Game_Engine SHALL trigger the lose condition with a "You Fell!" message
5. WHEN the Player_Character reaches the church, THE Game_Engine SHALL trigger the win condition and record the elapsed time

### Requirement 5: Collectibles

**User Story:** As a player, I want to collect a bouquet and ring along the path, so that I have optional goals beyond just finishing the level.

#### Acceptance Criteria

1. THE Level SHALL contain exactly one flower bouquet collectible and one wedding ring collectible placed along the path
2. WHEN the Player_Character overlaps a Collectible, THE Game_Engine SHALL remove the Collectible from the level and mark it as collected
3. WHEN a Collectible is collected, THE Audio_Manager SHALL play a collection sound effect
4. THE HUD SHALL display indicators showing which collectibles have been collected during the current run
5. WHEN the win condition triggers, THE Screen_Manager SHALL display the number of collectibles found on the Win Screen

### Requirement 6: Input Controls

**User Story:** As a player, I want intuitive controls on both mobile and desktop, so that I can play the game on any device.

#### Acceptance Criteria

1. THE Input_System SHALL display touch control buttons on mobile devices with left/right buttons at bottom-left and a jump button at bottom-right
2. THE Input_System SHALL support multi-touch so the player can hold a direction while pressing jump simultaneously
3. THE Input_System SHALL accept keyboard input using A/D or Arrow keys for movement and Space for jump
4. THE Input_System SHALL render touch buttons at a minimum size of 48x48 CSS pixels for accessibility
5. WHEN both touch and keyboard inputs are available, THE Input_System SHALL accept input from either source without conflict

### Requirement 7: Camera and Scrolling

**User Story:** As a player, I want the camera to follow my character smoothly, so that I can see where I am going.

#### Acceptance Criteria

1. THE Camera SHALL follow the Player_Character horizontally, keeping the character near the left-center of the viewport
2. THE Camera SHALL clamp its position to prevent showing areas beyond the level boundaries
3. THE Camera SHALL NOT scroll vertically since the level is a single horizontal plane

### Requirement 8: Screen Flow and UI

**User Story:** As a player, I want clear screens for starting, winning, and losing, so that I understand the game state at all times.

#### Acceptance Criteria

1. WHEN the game loads, THE Screen_Manager SHALL display the Title Screen with the game title and a Play button
2. WHEN the player presses the Play button, THE Screen_Manager SHALL transition to the Gameplay Screen and start the level
3. WHEN the win condition triggers, THE Screen_Manager SHALL display the Win Screen with time taken, collectibles found, and a Play Again button
4. WHEN the lose condition triggers, THE Screen_Manager SHALL display the Lose Screen with the failure reason and a Retry button
5. WHEN the player presses Play Again or Retry, THE Screen_Manager SHALL reset the level and return to the Gameplay Screen
6. WHEN a mobile device is in portrait orientation, THE Screen_Manager SHALL display an orientation warning with a "Continue Anyway" button

### Requirement 9: Audio

**User Story:** As a player, I want cheerful audio feedback, so that the game feels polished and fun.

#### Acceptance Criteria

1. WHILE gameplay is active, THE Audio_Manager SHALL play an upbeat chiptune background music loop
2. WHEN the Player_Character jumps, THE Audio_Manager SHALL play a jump sound effect
3. WHEN a Collectible is collected, THE Audio_Manager SHALL play a collect sound effect
4. WHEN the win condition triggers, THE Audio_Manager SHALL play a win jingle
5. WHEN the lose condition triggers, THE Audio_Manager SHALL play a lose sound effect
6. THE HUD SHALL display a mute toggle button that silences all audio when activated
7. WHEN the mute toggle is activated, THE Audio_Manager SHALL immediately stop all audio output and persist the mute state

### Requirement 10: Persistence

**User Story:** As a player, I want my best time saved, so that I can try to beat my personal record.

#### Acceptance Criteria

1. WHEN the player completes the level, THE Storage_Manager SHALL save the completion time to LocalStorage if it is better than the existing best time
2. WHEN the Title Screen loads, THE Storage_Manager SHALL display the best time if one exists
3. WHEN the Win Screen displays, THE Storage_Manager SHALL show whether the current run is a new personal best

### Requirement 11: Responsive Design and Accessibility

**User Story:** As a player on any device, I want the game to adapt to my screen and be accessible, so that I can enjoy it regardless of hardware.

#### Acceptance Criteria

1. THE Game_Engine SHALL scale the virtual canvas to fill the available viewport while maintaining the 16:9 aspect ratio
2. THE Game_Engine SHALL respect CSS safe-area-inset values for devices with notches
3. THE HUD SHALL provide a high-contrast mode option for improved visibility
4. THE Input_System SHALL ensure all interactive elements meet a minimum touch target of 48x48 CSS pixels
5. THE Game_Engine SHALL keep the initial page download under 10 MB total

### Requirement 12: Player Character Animation

**User Story:** As a player, I want my character to have simple animations, so that the game feels alive and visually appealing.

#### Acceptance Criteria

1. WHILE the Player_Character is stationary on a platform, THE Game_Engine SHALL display the idle animation
2. WHILE the Player_Character is moving horizontally, THE Game_Engine SHALL display the run animation
3. WHILE the Player_Character is airborne, THE Game_Engine SHALL display the jump animation frame
4. WHEN the Player_Character changes direction, THE Game_Engine SHALL flip the sprite horizontally
