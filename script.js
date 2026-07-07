import {
  COLORS, getTimeDisplay, getDigitWidths, getTextOffset,
  DIGIT_HEIGHT_RATIO, GLOW_BLUR,
} from './clock.js';

const canvas = document.getElementById('clockCanvas');
if (!canvas) {
  console.warn('Canvas element not found');
  throw new Error('Canvas element missing from DOM');
}
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Canvas not supported');
const pmDot = document.getElementById('pmDot');
const pmLabel = document.querySelector('.pm-label');
if (!pmDot) console.warn('PM dot element not found');
if (!pmLabel) console.warn('PM label element not found');

let cssW, cssH;
let cachedLayout;
let centers, yOffset, digitTopY;
let textOffset, shift1;
let prevTimeStr;
let timerId, resizeTimerId;

function getLayout() {
  if (!cachedLayout) {
    cachedLayout = getDigitWidths(cssW, cssH);
  }
  return cachedLayout;
}

function resolveLayout() {
  const { digitH, digitW, gap, colonW, startX, digitY } = getLayout();
  digitTopY = digitY;
  const cx = startX + 2 * digitW + 2 * gap + colonW / 2;
  centers = [
    startX + digitW / 2,
    startX + digitW + gap + digitW / 2,
    cx,
    cx + colonW / 2 + gap + digitW / 2,
    cx + colonW / 2 + gap + digitW + gap + digitW / 2,
  ];
  yOffset = digitY + digitH / 2 + textOffset;
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
  if (cssW === 0 || cssH === 0 || !pmDot) return;
  const { hourStr, minStr, isPM } = getTimeDisplay();
  const timeStr = hourStr + minStr;
  if (timeStr === prevTimeStr) return;
  prevTimeStr = timeStr;

  ctx.clearRect(0, 0, cssW, cssH);
  const chars = [hourStr[0], hourStr[1], ':', minStr[0], minStr[1]];

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.inactive;
  for (let i = 0; i < 5; i++) {
    ctx.fillText(i === 2 ? ':' : '8', centers[i], yOffset);
  }

  ctx.fillStyle = COLORS.active;
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = GLOW_BLUR;
  for (let i = 0; i < 5; i++) {
    ctx.fillText(chars[i], centers[i] + (chars[i] === '1' ? shift1 : 0), yOffset);
  }

  pmDot.classList.toggle('active', isPM);
}

function positionPM() {
  if (!pmLabel || !pmDot) return;
  const digitTop = canvas.offsetTop + digitTopY;
  pmLabel.style.marginTop = `${digitTop}px`;

  const pmFontSize = parseFloat(getComputedStyle(pmLabel).fontSize);
  const dotHeight = parseFloat(getComputedStyle(pmDot).height);
  pmDot.style.top = `${digitTop + (pmFontSize - dotHeight) / 2}px`;
}

function resize() {
  clearTimeout(timerId);
  clearTimeout(resizeTimerId);
  resizeTimerId = setTimeout(doResize, 80);
}

function doResize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  cssW = rect.width;
  cssH = rect.height;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  cachedLayout = null;
  const fontSize = Math.round(cssH * DIGIT_HEIGHT_RATIO);
  ctx.font = `${fontSize}px Digital`;
  textOffset = getTextOffset(ctx, fontSize);

  const m8 = ctx.measureText('8');
  const m1 = ctx.measureText('1');
  shift1 = m8.actualBoundingBoxRight - m1.actualBoundingBoxRight;

  resolveLayout();
  prevTimeStr = null;
  positionPM();
  draw();
  scheduleTick();
}

window.addEventListener('resize', resize);

document.fonts.ready.then(() => {
  resize();
});
