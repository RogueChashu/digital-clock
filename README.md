# Digital Clock

A retro 80s-style alarm clock rendered on HTML Canvas with a custom digital font, red glow effects, and a dim ghost display. Responsive across all screen sizes.

## Features

- **12-hour clock** with leading zeros, PM indicator (label + dot), updates every second
- **Custom `digital-7.ttf` font** via `@font-face` — authentic 7-segment digit shapes
- **Two-pass canvas rendering**: dim `"88:88"` ghost in `#160000`, then active digits in `#ff2020` with red glow (`shadowBlur: 3`)
- **Asymmetric colon dots** positioned to align with upper/lower digit halves
- **DPR-aware** canvas scaling for sharp rendering on HiDPI displays
- **Responsive**: fluid `clamp()` sizing, `max-width: 1200px`, minimum 250px canvas width, no scrollbars

## Layout

| Ratio | Value |
|-------|-------|
| Canvas aspect | 3:1 |
| Digit fill | 80% of canvas height |
| Digit width | 55% of digit height |
| Digit gap | 20% of digit width |
| Colon width | 50% of digit width |
| Colon radius | 12% of digit width |

## Project Structure

```
├── index.html          # Entry point
├── style.css           # Layout, @font-face, dark theme, PM indicator
├── script.js           # Canvas draw loop, resize, PM positioning
├── clock.js            # Exports: COLORS, layout, colon rendering
├── favicon.svg         # SVG favicon (two 7-segment "8" shapes)
├── fonts/
│   └── digital-7.ttf   # Custom digital clock font
├── __tests__/
│   └── clock.test.js   # 57 unit tests
├── specs.md            # Full specification document
└── README.md
```

## Local Development

No build step. Serve the directory with any HTTP server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

```sh
npm test
```

57 tests cover all exported functions, layout ratios, rendering passes, edge cases, and color constants.

---

Built with OpenCode using the Big Pickle model.
