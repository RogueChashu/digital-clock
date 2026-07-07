export const COLORS = {
  active: '#ff2020',
  inactive: '#160000',
  glow: '#ff0000',
};

export const DIGIT_HEIGHT_RATIO = 0.8;
export const DIGIT_WIDTH_RATIO = 0.55;
export const GAP_RATIO = 0.20;
export const COLON_WIDTH_RATIO = 0.50;
export const GLOW_BLUR = 3;

export function getTimeDisplay(date = new Date()) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;
  const rawHours = hours;
  hours = hours % 12 || 12;
  return {
    hours,
    minutes,
    isPM,
    rawHours,
    hourStr: String(hours).padStart(2, '0'),
    minStr: String(minutes).padStart(2, '0'),
  };
}

export function getDigitWidths(cssW, cssH) {
  const digitH = cssH * DIGIT_HEIGHT_RATIO;
  const digitW = digitH * DIGIT_WIDTH_RATIO;
  const gap = digitW * GAP_RATIO;
  const colonW = digitW * COLON_WIDTH_RATIO;
  const totalW = 4 * digitW + 3 * gap + colonW;
  const startX = (cssW - totalW) / 2;
  const digitY = (cssH - digitH) / 2;
  return { digitH, digitW, gap, colonW, totalW, startX, digitY };
}

export function getTextOffset(ctx, fontSize) {
  ctx.font = `${fontSize}px Digital`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const m = ctx.measureText('8');
  return (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
}
