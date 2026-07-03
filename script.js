import {
  COLORS, getTimeDisplay, getDigitWidths, getColonLayout,
  drawDigitChar, drawColonDots, mapFontChar, FONT_ADJUST,
} from './clock.js';

const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const pmDot = document.getElementById('pmDot');
const pmLabel = document.querySelector('.pm-label');

const DPR = window.devicePixelRatio || 1;
let cssW, cssH;

function draw() {
  const w = cssW;
  const h = cssH;

  ctx.clearRect(0, 0, w, h);

  const { digitH, digitW, gap, colonW, startX, digitY } = getDigitWidths(cssW, cssH);
  const { hourStr, minStr, isPM } = getTimeDisplay();

  const fontSize = digitH;
  const x0 = startX;
  const x1 = startX + digitW + gap;
  const cx = startX + 2 * digitW + 2 * gap + colonW / 2;
  const x2 = cx + colonW / 2 + gap;
  const x3 = x2 + digitW + gap;

  const centers = [
    x0 + digitW / 2,
    x1 + digitW / 2,
    x2 + digitW / 2,
    x3 + digitW / 2,
  ];
  const cy = digitY + digitH / 2;
  const chars = [...hourStr, ...minStr].map(mapFontChar);

  const { y1: colonY1, y2: colonY2, radius: colonR } = getColonLayout(cy, digitH, digitW);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.fillStyle = COLORS.inactive;
  drawColonDots(ctx, cx, colonY1, colonY2, colonR, COLORS.inactive);
  ['8', '8', '8', '8'].forEach((ch, i) => {
    drawDigitChar(ctx, ch, centers[i], cy, fontSize);
  });

  ctx.fillStyle = COLORS.active;
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = 3;
  chars.forEach((ch, i) => {
    if (ch === 'I') {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(fontSize)}px Digital`;
      ctx.fillText(ch, centers[i] + digitW / 2, cy + fontSize * FONT_ADJUST);
    } else {
      drawDigitChar(ctx, ch, centers[i], cy, fontSize);
    }
  });
  drawColonDots(ctx, cx, colonY1, colonY2, colonR, COLORS.active);

  pmDot.classList.toggle('active', isPM);
}

function positionPM() {
  const { digitY } = getDigitWidths(cssW, cssH);
  const digitTop = canvas.offsetTop + digitY;
  pmLabel.style.marginTop = `${digitTop}px`;

  const pmFontSize = parseFloat(getComputedStyle(pmLabel).fontSize);
  const dotHeight = parseFloat(getComputedStyle(pmDot).height);
  pmDot.style.top = `${digitTop + (pmFontSize - dotHeight) / 2}px`;
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  cssW = rect.width;
  cssH = rect.height;
  canvas.width = cssW * DPR;
  canvas.height = cssH * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  positionPM();
  draw();
}

window.addEventListener('resize', resize);

document.fonts.ready.then(() => {
  resize();
  setInterval(draw, 1000);
});
