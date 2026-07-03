export const COLORS = {
  active: '#ff2020',
  inactive: '#160000',
  glow: '#ff0000',
};

export function getTimeDisplay(date = new Date()) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const isPM = hours >= 12;
  const rawHours = hours;
  hours = hours % 12 || 12;
  return {
    hours,
    minutes,
    seconds,
    isPM,
    rawHours,
    hourStr: String(hours).padStart(2, '0'),
    minStr: String(minutes).padStart(2, '0'),
    secStr: String(seconds).padStart(2, '0'),
  };
}

export function getDigitWidths(cssW, cssH) {
  const digitH = cssH * 0.8;
  const digitW = digitH * 0.55;
  const gap = digitW * 0.20;
  const colonW = digitW * 0.50;
  const totalW = 4 * digitW + 3 * gap + colonW;
  const startX = (cssW - totalW) / 2;
  const digitY = (cssH - digitH) / 2;
  return { digitH, digitW, gap, colonW, totalW, startX, digitY };
}

export function mapFontChar(ch) {
  return ch === '1' ? 'I' : ch;
}

export const FONT_ADJUST = 0.06;

export function drawDigitChar(ctx, ch, cx, cy, fontSize) {
  ctx.font = `${Math.round(fontSize)}px Digital`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ch, cx, cy + fontSize * FONT_ADJUST);
}

export const COLON_RADIUS_RATIO = 0.12;

export function getColonLayout(cy, digitH, digitW) {
  return {
    y1: cy - digitH * 0.25,
    y2: cy + digitH * 0.17,
    radius: digitW * COLON_RADIUS_RATIO,
  };
}

export function drawColonDots(ctx, cx, y1, y2, r, color) {
  ctx.fillStyle = color;
  ctx.shadowColor = COLORS.glow;
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(cx, y1, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, y2, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
