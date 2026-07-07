# Digital Clock — Specifications

## Canvas & Layout

- **Aspect ratio**: `3 / 1` (width:height)
- **Digit height**: `cssH * 0.8` (fills 80% of canvas height)
- **Digit width**: `digitH * 0.55`
- **Digit gap**: `digitW * 0.20`
- **Colon width**: `digitW * 0.50`
- **Total content width**: `4 × digitW + 3 × gap + colonW`
- **Horizontal centering**: `startX = (cssW - totalW) / 2`
- **Vertical centering**: `digitY = (cssH - digitH) / 2`, `cy = digitY + digitH / 2`

### Canvas Minimum Width

The clock canvas must never render below **250px** in width. Enforced by:

- `body` `padding`: `clamp(32px, 8vw, 80px)` — prevents clock from touching viewport edges
- `body` `min-width`: `calc(250px + 2 × clamp(2px, 4vw, 48px) + 2 × clamp(32px, 8vw, 80px))`
- `.clock` `min-width`: `calc(250px + 2 × clamp(2px, 4vw, 48px))`
- No overflow — body min-width prevents viewport shrinkage; `overflow: hidden` on body suppresses any scrollbars

## Font & Rendering (`clock.js`)

### Font

- Custom `Digital` TrueType font (`fonts/digital-7.ttf`)
- Loaded via `@font-face` in CSS; `document.fonts.ready` gate in JS

### Vertical Adjustment

- `FONT_ADJUST = 0.1` — compensates for glyphs sitting high in the em square
- Applied as `yOffset = cy + fontSize * FONT_ADJUST` to vertically center digit glyphs

### Two-Pass Rendering

1. **Ghost pass** (background): current time digits in `COLORS.inactive` (`#160000`) — dim underlay matching the active digit shapes
2. **Foreground pass** (active): actual time digits in `COLORS.active` (`#ff2020`) with `shadowColor: COLORS.glow` (`#ff0000`), `shadowBlur: 3`

### Colors

| Token     | Value      | Usage                    |
|-----------|------------|--------------------------|
| `active`  | `#ff2020`  | Foreground digits & dots |
| `inactive`| `#160000`  | Ghost/background digits  |
| `glow`    | `#ff0000`  | Shadow for glow effect   |

### Colon Dots (`drawColonDots`)

- Two arcs at explicit y positions (asymmetric)
- `y1 = cy - digitH * 0.25` — midpoint of upper digit half
- `y2 = cy + digitH * 0.17` — raised slightly from midpoint of lower digit half
- `radius = digitW * COLON_RADIUS_RATIO` where `COLON_RADIUS_RATIO = 0.12`
- Optional `glow` parameter (default `true`): when `true`, applies `shadowColor: COLORS.glow`, `shadowBlur: 3` and resets to `transparent` / `0` after drawing; when `false`, shadow state is left unchanged
- Ghost pass calls with `glow=false` to avoid unnecessary shadow manipulation

## Time Formatting

- **12-hour format** with leading zeros: `01`–`12`
- `hourStr`, `minStr` always 2 characters
- `isPM` = `hours >= 12`; AM = `hours < 12`
- `rawHours` preserves original 24h value
- Updates every second via recursive `setTimeout` aligned to the next second boundary (`1000 - Date.now() % 1000`), eliminating cumulative drift

## PM Indicator

- **Label** ("PM"): outside `.clock`, in `.clock-wrapper` flex container on the left
  - `font-size: clamp(12px, 4.5vw, 32px)`
  - `margin-right: clamp(6px, 1.5vw, 18px)`
  - Vertical alignment via `margin-top` set by JS `positionPM()` to match digit top
- **Dot** (inside `.clock`): absolute positioned at top-left
  - `width / height: clamp(10px, 2.5vw, 24px)`
  - `left: clamp(6px, 1vw, 14px)`
  - `box-shadow: 0 0 clamp(0px, 0.8vw, 6px) rgba(255, 32, 32, 0.9)`
  - `opacity: 0` → `1` (`.active` class toggle via JS)
  - `transition: opacity 0.3s ease`

## Responsive Layout

- `.clock-wrapper` `max-width: 1200px`, `width: 100%`
- `.clock` `width: 100%` (fills wrapper)
- All spacing uses `clamp()` for fluid scaling
- `.clock` padding:
  - top/bottom: `clamp(2px, 1.2vw, 12px)`
  - left/right: `clamp(2px, 4vw, 48px)`
- `.clock` `border-radius: 0` (sharp corners, period-accurate)
- `.clock` background: `radial-gradient(ellipse at 50% 50%, #110404 0%, #080102 70%, #000000 100%)`
- `.clock` ambient glow:
  - `0 0 40px rgba(120, 0, 0, 0.035)` — outer bleed
  - `inset 0 0 80px rgba(80, 0, 0, 0.03)` — inner bloom
  - `inset 0 0 120px rgba(180, 0, 0, 0.06)` — large soft glow
- `.clock::after` — dark translucent overlay (`rgba(0,0,0,0.2)`, `inset: 0`, `pointer-events: none`) for a dimmer overall look

## Favicon

- `favicon.svg` — 32×32 SVG favicon in the project root
- Two simplified 7-segment "8" digits drawn as SVG rects, matching the app's red-on-dark color scheme
- Left digit's left-side segments use `#1c0000` (inactive color) to echo the ghost-pass aesthetic
- Linked in `<head>` via `<link rel="icon" type="image/svg+xml" href="favicon.svg">`

## DPR (Device Pixel Ratio)

- Canvas physical resolution scaled by `window.devicePixelRatio`
- CSS size vs physical size decoupled for sharp rendering on HiDPI
- `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` before draw
- `dpr` read dynamically from `window.devicePixelRatio` on every resize, supporting multi-monitor setups with different pixel ratios

## Layout Caching

- `getDigitWidths()` result cached in `cachedLayout` after first computation
- Cache invalidated (`cachedLayout = null`) only on `resize()`
- `positionPM()` reads from the same cache via `getLayout()`
- Avoids 60+ redundant layout recalculations per minute

## Timer Management

- Recursive `setTimeout` (not `setInterval`) schedules the next tick at the next second boundary
- `clearTimeout(timerId)` called on resize to prevent double-draw (immediate draw + stale timer tick)
- Canvas context null-guarded: throws `'Canvas not supported'` if `getContext('2d')` returns `null`
