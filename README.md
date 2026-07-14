# Run to the Altar! 🎮💒

A portrait-format browser game where the groom races to the church, jumping over gaps and collecting a bouquet and ring along the way. When the player reaches the church, a thank-you screen appears followed by the wedding invitation with all the event details.

There's no losing — if the player falls, they respawn on the nearest platform and keep going. Everyone gets to see the invitation!

## Quick Start

1. Open `index.html` in any modern browser
2. Press **Play** to start
3. Use **A/D** or **Arrow keys** to move, **Space** to jump
4. Reach the church to reveal the wedding invitation!

No server, no build step, no dependencies. Just open the file and play.

---

## Game Flow

1. **Title Screen** — "SAVE THE DATE" with couple names and Play button
2. **Loading** — Ring animation (2 seconds, auto-advances)
3. **Quest** — "Your mission: Help the groom reach the wedding church!" (2.5 seconds, auto-advances with fade)
4. **Gameplay** — Side-scrolling platformer in portrait orientation
5. **Thank You** — "Mission accomplished! Thank you for guiding the groom..." (3.5 seconds, auto-advances)
6. **Invitation** — Full wedding details (date, time, venue, RSVP) with couple and church sprites

---

## Controls

| Action | Keyboard | Touch (Mobile) |
|--------|----------|----------------|
| Move left | A / ← | ◀ button (bottom-left) |
| Move right | D / → | ▶ button (bottom-left) |
| Jump | Space | ⬆ button (bottom-right) |
| Mute toggle | M | Tap speaker icon |

---

## Customization Guide

Everything is customizable through `js/config.js`. Open the file and edit the values:

### Title Screen

```javascript
titleLabel: "SAVE THE DATE",        // Small text above names
couple: "Gica & Vho",              // Couple names (large)
titleTagline: "Game to Forever",   // Tagline below names
titleBackgroundColor: '#f5e6f0',   // Background color
titleAccentColor: '#f2a7c3',       // Border/accent color
titleBackgroundImage: null,        // Optional: 'assets/title-bg.png'
coupleImage: null,                 // Optional: 'assets/couple.png'
```

### Loading Screen

```javascript
loadingText: "Loading...",         // Text shown during loading
```

### Quest Screen

```javascript
questLabel: "Hi Guest, your quest:",                           // Label text
questText: "Help the groom reach\nthe wedding church!", // Mission description
```

### Thank You Screen (after finishing the game)

```javascript
thankyouTitle: "Mission accomplished!",                              // Banner text
thankyouMessage: "Thank you for guiding the groom to his happily ever after.", // Message
```

### Invitation/Finish Screen

```javascript
heading: "You're Invited!",                    // Main heading
date: "Sunday, February 7, 2027",             // Wedding date
time: "10:00 AM",                              // Ceremony time
venue: "San Antonio De Padua Parish\nPooc 2\nSilang, Cavite", // Venue (use \n for lines)
message: "Dinner & dancing to follow",        // Additional info
rsvp: "RSVP by July 1st to email@example.com", // RSVP details
headingColor: '#8B0000',                       // Heading color
textColor: '#333333',                          // Body text color
backgroundColor: '#FFF8F0',                    // Background color
backgroundImage: null,                         // Optional: 'assets/invite-bg.jpg'
replayText: "Play Again",                      // Replay button text
```

### Using Custom Background Images

1. Place your image in `assets/` (e.g., `assets/title-bg.png`)
2. Set the corresponding config option: `titleBackgroundImage: 'assets/title-bg.png'`
3. Supported formats: JPG, PNG, WebP. Keep under 1 MB.

---

## Sprite Assets

The game uses colored rectangles and emoji as placeholders. Replace them with real pixel art for a polished look.

### Asset File Structure

```
assets/
├── sprites/
│   ├── groom.png          # Player character spritesheet
│   ├── bride.png          # Bride sprite (thank-you screen + invitation)
│   ├── couple.png         # Couple together (invitation screen bottom-left)
│   ├── tiles.png          # Platform tile atlas
│   ├── collectibles.png   # Bouquet + ring sprites
│   └── church.png         # Church sprite (gameplay + invitation bottom-right)
├── audio/
│   ├── bgm.mp3            # Background music (looping)
│   ├── jump.mp3           # Jump sound effect
│   ├── collect.mp3        # Item pickup sound
│   └── win.mp3            # Victory jingle
└── title-bg.png           # Optional title screen background
```

### Sprite Specifications

#### groom.png — Player Spritesheet

| Property | Value |
|----------|-------|
| Frame size | 16×24 pixels |
| Layout | Horizontal strip |
| Frames | Idle (1), Run (4), Jump (1) = 6 total |
| Total size | 96×24 pixels |
| Format | PNG with transparency |

Frame layout: `[Idle] [Run1] [Run2] [Run3] [Run4] [Jump]`

#### bride.png — Bride Character

| Property | Value |
|----------|-------|
| Size | 32×48 pixels (or larger for thank-you screen) |
| Format | PNG with transparency |
| Used on | Thank You screen, Invitation screen |
| Notes | Front-facing, cheerful pose |

#### couple.png — Bride & Groom Together

| Property | Value |
|----------|-------|
| Size | 64×48 pixels |
| Format | PNG with transparency |
| Used on | Title screen (optional), Invitation screen (bottom-left) |
| Notes | Side by side, facing forward |

#### tiles.png — Platform Tiles

| Property | Value |
|----------|-------|
| Tile size | 16×16 pixels |
| Tiles needed | Grass top, dirt middle, dirt bottom |
| Format | PNG with transparency |

#### collectibles.png — Pickup Items

| Property | Value |
|----------|-------|
| Frame size | 16×16 pixels |
| Items | Bouquet, Ring |
| Total size | 32×16 pixels |
| Format | PNG with transparency |

#### church.png — Church/Chapel

| Property | Value |
|----------|-------|
| Size | 40×48 pixels |
| Format | PNG with transparency |
| Used on | Gameplay (finish line), Invitation screen (bottom-right) |
| Notes | Include steeple/cross on top |

---

## Generating Sprites with AI Image Tools

Use these prompts with AI image generators (DALL-E, Midjourney, Stable Diffusion) to create sprites. Resize to exact dimensions after generation.

### Prompt 1: Groom Spritesheet

```
Pixel art spritesheet of a cartoon groom character for a 2D platformer game.
16x24 pixel frame size, 6 frames in a horizontal strip (96x24 total).
Black tuxedo with white shirt and boutonniere.
Frames: standing idle, 4 running frames (legs alternating), 1 jumping frame.
Transparent background, clean pixel edges, no anti-aliasing.
Bright cheerful style, side view facing right.
```

### Prompt 2: Bride Character

```
Pixel art bride character, front-facing, 32x48 pixels.
White wedding dress, veil, holding a small bouquet.
Happy expression, cheerful and warm style.
Transparent background, clean pixel art, no anti-aliasing.
Suitable for a cute wedding-themed game.
```

### Prompt 3: Couple Together

```
Pixel art bride and groom standing side by side, 64x48 pixels.
Bride in white dress on the left, groom in black tuxedo on the right.
Both facing forward with happy expressions.
Wedding theme, cheerful colors, transparent background.
Clean pixel art style, no anti-aliasing.
```

### Prompt 4: Platform Tiles

```
Pixel art tileset for a 2D platformer, 16x16 pixel tiles.
3 tiles: grass top (green with blade details), dirt middle (brown),
dirt bottom (darker brown with rocks).
Outdoor wedding garden theme, cheerful colors.
Transparent background, seamless horizontal tiling.
```

### Prompt 5: Collectibles

```
Pixel art items, each 16x16 pixels, two items side by side (32x16 total).
Left: pink/red flower bouquet with green stems and white ribbon.
Right: gold wedding ring with diamond sparkle.
Transparent background, bright colors, clean pixel art.
```

### Prompt 6: Church

```
Pixel art small church, 40x48 pixels.
White chapel with peaked roof, cross on steeple, arched doorway,
small round window. Cheerful wedding day style.
Transparent background, clean pixel art, no anti-aliasing.
```

### Tips for AI-Generated Sprites

1. **Resize after generation**: Scale down to exact pixel dimensions using nearest-neighbor resampling (not bilinear/smooth)
2. **Remove backgrounds**: Use [remove.bg](https://www.remove.bg) or Photoshop's magic wand
3. **Touch up**: Use [Piskel](https://www.piskelapp.com), [Aseprite](https://www.aseprite.org), or [Lospec Pixel Editor](https://lospec.com/pixel-editor)
4. **Consistent palette**: Use 8–12 colors across all sprites
5. **Test at 1x**: Preview at actual size before scaling up

---

## Audio Assets

| File | Purpose | Duration | Notes |
|------|---------|----------|-------|
| `bgm.mp3` | Background music | 30–60s | Must loop cleanly |
| `jump.mp3` | Jump sound | <0.5s | Short blip/boing |
| `collect.mp3` | Item pickup | <0.5s | Bright chime |
| `win.mp3` | Victory jingle | 2–4s | Celebratory |

**Format**: MP3 | **Size limit**: Under 1 MB each

**Free tools**: [BeepBox](https://www.beepbox.co), [jsfxr](https://sfxr.me), [Bosca Ceoil](https://boscaceoil.net)

---

## Running Locally

### Option 1: Just Open the File

Double-click `index.html` — works in Chrome, Edge, Firefox.

### Option 2: Local HTTP Server (Recommended)

**Python**:
```bash
cd invitegame
python -m http.server 8000
```
Open http://localhost:8000

**Node.js**:
```bash
npx serve invitegame
```

**VS Code**: Install "Live Server" extension → right-click `index.html` → "Open with Live Server"

---

## Deploying to GitHub Pages

```bash
cd invitegame
git init
git add .
git commit -m "Wedding invitation game"
git remote add origin https://github.com/YOUR_USERNAME/run-to-the-altar.git
git branch -M main
git push -u origin main
```

Then on GitHub: **Settings** → **Pages** → Source: `main` branch, folder: `/ (root)` → **Save**

Your game will be live at: `https://YOUR_USERNAME.github.io/run-to-the-altar/`

---

## Project Structure

```
invitegame/
├── index.html           # Entry point
├── css/
│   └── style.css        # All styles (overlays, touch controls, screens)
├── js/
│   ├── config.js        # ← EDIT THIS for wedding details & text
│   ├── constants.js     # Game physics and canvas size
│   ├── engine.js        # Game loop, canvas scaling
│   ├── input.js         # Keyboard + touch input
│   ├── player.js        # Player physics and animation
│   ├── level.js         # Platform layout, collectibles
│   ├── camera.js        # Viewport scrolling
│   ├── hud.js           # Mute button
│   ├── screens.js       # All screens (title, loading, quest, gameplay, thankyou, win)
│   ├── audio.js         # Audio manager
│   ├── storage.js       # LocalStorage persistence
│   └── main.js          # Bootstrap
└── assets/
    ├── sprites/         # Sprite PNGs
    └── audio/           # Sound files (MP3)
```

---

## Technical Details

- **Orientation**: Portrait (9:16 aspect ratio)
- **Virtual resolution**: 144×256 pixels, scaled to fill viewport
- **Target FPS**: 60 on desktop, 30 minimum on mobile
- **Level**: ~1010px wide, 7 platforms with 25px gaps
- **No dependencies**: Pure vanilla JavaScript + Canvas 2D
- **Total size**: ~50 KB without assets (under 10 MB budget with assets)

---

## License

This game was created as a personal wedding invitation project.
