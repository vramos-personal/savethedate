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

### How Sprites Work in This Game

The game supports **two approaches** for the player sprite:

| Approach | Image Type | How the Code Handles It |
|----------|------------|------------------------|
| **Single image** | One pose, square-ish (e.g. 256×256) | Draws the whole image for all states |
| **Spritesheet** | Multiple frames in a wide horizontal strip (aspect ratio > 2:1) | Slices into 6 equal frames and animates |

The code auto-detects which type you're using based on the image aspect ratio.

### Asset File Structure

```
assets/
├── sprites/
│   ├── groom.png          # Player character (single image OR spritesheet)
│   ├── bride.png          # Bride sprite (thank-you + invitation screens)
│   ├── couple.png         # Couple together (invitation screen)
│   ├── tiles.png          # Platform tile atlas
│   ├── collectibles.png   # Bouquet + ring sprites
│   └── church.png         # Church sprite (gameplay + invitation)
├── audio/
│   ├── bgm.mp3            # Background music (looping)
│   ├── jump.mp3           # Jump sound effect
│   ├── collect.mp3        # Item pickup sound
│   └── win.mp3            # Victory jingle
└── title-bg.png           # Optional title screen background
```

---

## Using Spritesheets (Animated Player)

If you want the groom to have different poses for idle/running/jumping, you need a spritesheet — a single image with all frames laid out side by side.

### Spritesheet Requirements

| Property | Value |
|----------|-------|
| Layout | **6 frames in a horizontal row** |
| Frame order | `[Idle] [Run1] [Run2] [Run3] [Run4] [Jump]` |
| Aspect ratio | Must be wider than 2:1 (e.g. 6:1 for square frames) |
| Format | PNG with transparent background |
| Max size | Under 1 MB |

Example dimensions that work:
- 192×32 (32px frames)
- 384×64 (64px frames)
- 768×128 (128px frames)
- 1536×256 (256px frames)

The key rule: **width must be exactly 6× the height** (or close to it).

### Step-by-Step: Creating a Spritesheet with ChatGPT

ChatGPT/DALL-E struggles with precise pixel-art spritesheets at tiny sizes. Here's the best workflow:

**Step 1: Generate individual frames**

Generate each frame as a separate image. Use this prompt for each:

```
Pixel art character of a cute chibi groom for a 2D platformer game.
Single character only, full body, facing right.
Black tuxedo, white shirt, short dark hair.
[POSE DESCRIPTION - see below]
Square image, character centered, transparent/white background.
Cute 16-bit pixel art style like Stardew Valley.
256x256 pixels, clean pixel edges.
```

Replace `[POSE DESCRIPTION]` with:
- Frame 1 (Idle): `Standing still in a relaxed pose`
- Frame 2 (Run1): `Running pose, left foot forward, right arm forward`
- Frame 3 (Run2): `Running pose, feet together mid-stride`
- Frame 4 (Run3): `Running pose, right foot forward, left arm forward`
- Frame 5 (Run4): `Running pose, feet together mid-stride (mirror of frame 3)`
- Frame 6 (Jump): `Jumping pose, knees tucked up, arms raised`

**Step 2: Remove backgrounds**

For each generated image:
1. Go to [remove.bg](https://www.remove.bg) and upload the image
2. Download the transparent PNG
3. OR use Photoshop/GIMP: Select white background → Delete → Save as PNG

**Step 3: Assemble the spritesheet**

Use one of these free tools to combine 6 images into one horizontal strip:

- **Piskel** (browser): [piskelapp.com](https://www.piskelapp.com) — Import frames, export as spritesheet
- **TexturePacker** (free tier): [texturepacker.com](https://www.texturepacker.com)
- **ShoeBox** (free): [renderhjs.net/shoebox](https://renderhjs.net/shoebox/)
- **Manual with GIMP/Photoshop**:
  1. Create new image: width = frame_width × 6, height = frame_height
  2. Paste each frame side by side
  3. Export as PNG

**Step 4: Resize (if needed)**

If the final spritesheet is too large (e.g. 1536×256), resize it down:
- Use **nearest-neighbor** resampling (not bilinear!) to keep pixel edges crisp
- Good target size: 384×64 (64px frames) or 192×32 (32px frames)
- In GIMP: Image → Scale Image → Interpolation: None
- In Photoshop: Image → Image Size → Resample: Nearest Neighbor

**Step 5: Save and replace**

Save as `assets/sprites/groom.png` and refresh the game.

### Alternative: Single Image Approach (Easier)

If you just want a static character (no animation), use a single square image:

```
Pixel art character of a cute chibi groom for a 2D platformer game.
ONE character only, running pose facing right.
Full body visible head to feet, chibi proportions.
Black tuxedo, white shirt.
Transparent background, square canvas, 256x256 pixels.
Cute pixel art style like Stardew Valley or Undertale.
No text, no labels, no extra elements.
```

Save as `groom.png` — the code will use it for all states (idle, run, jump) with horizontal flipping for direction.

---

## Other Sprite Specifications

#### bride.png — Bride Character

| Property | Value |
|----------|-------|
| Size | 256×256 pixels (or any square) |
| Format | PNG with transparency |
| Used on | Thank You screen, Invitation screen |
| Notes | Front-facing, cheerful pose, white dress + veil |

#### couple.png — Bride & Groom Together

| Property | Value |
|----------|-------|
| Size | 512×256 pixels (or any wide rectangle) |
| Format | PNG with transparency |
| Used on | Title screen (optional), Invitation screen (bottom-left) |
| Notes | Side by side, facing forward |

#### tiles.png — Platform Tiles

| Property | Value |
|----------|-------|
| Tile size | 16×16 pixels (or 32×32 for higher detail) |
| Tiles needed | Grass top, dirt middle, dirt bottom |
| Format | PNG with transparency |

#### collectibles.png — Pickup Items

| Property | Value |
|----------|-------|
| Items | Bouquet (left), Ring (right) |
| Size | Any size, two items side by side |
| Format | PNG with transparency |

#### church.png — Church/Chapel

| Property | Value |
|----------|-------|
| Size | 256×256 pixels (or any square/tall) |
| Format | PNG with transparency |
| Used on | Gameplay finish line, Invitation screen (bottom-right) |

---

## Generating Sprites with ChatGPT (DALL-E)

### Best Practices for ChatGPT Image Generation

1. **Ask for ONE character per image** — don't ask for spritesheets directly
2. **Specify "pixel art" and "chibi"** — this gives the best game-like results
3. **Always say "transparent background"** — though you may still need to remove it manually
4. **Request square dimensions** — ChatGPT handles 256×256 and 512×512 best
5. **Include style references** — "like Stardew Valley" or "like Undertale" helps

### Prompt: Groom (Single Image)

```
Pixel art character of a cute chibi groom for a 2D side-scrolling game.
ONE character only, running pose facing right, full body head to feet.
Black tuxedo, white shirt, short dark hair, happy expression.
Transparent background, 256x256 square image, centered.
Cute 16-bit pixel art style like Stardew Valley.
No text, no labels, clean pixel edges.
```

### Prompt: Bride

```
Pixel art character of a cute chibi bride for a 2D game.
ONE character only, front-facing, standing pose, full body.
White wedding dress with veil, holding a small bouquet.
Happy expression, transparent background, 256x256 square.
Cute pixel art style like Stardew Valley.
```

### Prompt: Couple Together

```
Pixel art of a cute chibi bride and groom standing side by side.
Bride in white dress on left, groom in black tuxedo on right.
Both facing forward, happy expressions, full body visible.
Transparent background, 512x256 pixels.
Cute pixel art style, wedding theme.
```

### Prompt: Church

```
Pixel art small wedding chapel for a 2D game.
White church with pointed roof, cross on steeple, arched doorway.
Round stained glass window, cheerful and cute style.
Transparent background, 256x256 square.
Clean pixel art, no anti-aliasing.
```

### Prompt: Collectibles (Bouquet + Ring)

```
Pixel art of two wedding items for a game, side by side:
Left: a cute pink flower bouquet with green stems and white ribbon.
Right: a gold wedding ring with a sparkling diamond.
Both items on transparent background, 256x128 total image.
Cute pixel art style, bright cheerful colors.
```

### After Generating: Post-Processing Steps

1. **Remove background**: Upload to [remove.bg](https://www.remove.bg) → download transparent PNG
2. **Crop tightly**: Remove extra whitespace around the character
3. **Optional resize**: Scale down using nearest-neighbor for crispier pixels
4. **Save as PNG**: Keep transparency, save to `assets/sprites/`

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
