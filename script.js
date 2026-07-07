import {
  COLORS, getTimeDisplay, getDigitWidths, getColonLayout,
  drawColonDots,
} from './clock.js';

const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Canvas not supported');
const pmDot = document.getElementById('pmDot');
const pmLabel = document.querySelector('.pm-label');

const GHOST_CHARS = ['8', '8', '8', '8'];

let cssW, cssH;
let cachedLayout;
let timerId;

function getLayout() {
  if (!cachedLayout) {
    cachedLayout = getDigitWidths(cssW, cssH);
  }
  return cachedLayout;
}

function scheduleTick() {
  const delay = 1000 - (Date.now() % 1000);
  timerId = setTimeout(tick, delay);
}

function tick() {
  draw();
  scheduleTick();
}

function draw() {
  const { digitH, digitW, gap, colonW, startX, digitY } = getLayout();
  const { hourStr, minStr, isPM } = getTimeDisplay();

  const fontSize = Math.round(digitH);
  const cx = startX + 2 * digitW + 2 * gap + colonW / 2;
  const centers = [
    startX + digitW / 2,
    startX + digitW + gap + digitW / 2,
    cx + colonW / 2 + gap + digitW / 2,
    cx + colonW / 2 + gap + digitW + gap + digitW / 2,
  ];
  const cy = digitY + digitH / 2;
  const { y1, y2, radius: colonR } = getColonLayout(cy, digitH, digitW);

  const chars = [hourStr[0], hourStr[1], minStr[0], minStr[1]];

  ctx.font = `${fontSize}px Digital`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const yOffset = cy;

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.inactive;
  drawColonDots(ctx, cx, y1, y2, colonR, COLORS.inactive, false);
  for (let i = 0; i < 4; i++) {
    ctx.fillText(GHOST_CHARS[i], centers[i], yOffset);
  }

  ctx.fillStyle = COLORS.active;
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = 3;
  for (let i = 0; i < 4; i++) {
    ctx.fillText(chars[i], centers[i], yOffset);
  }
  drawColonDots(ctx, cx, y1, y2, colonR, COLORS.active);

  pmDot.classList.toggle('active', isPM);
}

function positionPM() {
  const { digitY } = getLayout();
  const digitTop = canvas.offsetTop + digitY;
  pmLabel.style.marginTop = `${digitTop}px`;

  const pmFontSize = parseFloat(getComputedStyle(pmLabel).fontSize);
  const dotHeight = parseFloat(getComputedStyle(pmDot).height);
  pmDot.style.top = `${digitTop + (pmFontSize - dotHeight) / 2}px`;
}

function resize() {
  clearTimeout(timerId);
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  cssW = rect.width;
  cssH = rect.height;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cachedLayout = null;
  positionPM();
  draw();
  scheduleTick();
}

window.addEventListener('resize', resize);

document.fonts.ready.then(() => {
  resize();
});
