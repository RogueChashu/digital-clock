import {
  COLORS, getTimeDisplay, getDigitWidths, getColonLayout,
  drawDigitChar, drawColonDots, mapFontChar,
  FONT_ADJUST, COLON_RADIUS_RATIO,
} from '../clock.js';

/**
 * ────────────────────────────────────────────
 *  CONSTANTS
 * ────────────────────────────────────────────
 */
describe('COLORS', () => {
  it('has all required color keys', () => {
    expect(COLORS).toMatchObject({
      active: expect.any(String),
      inactive: expect.any(String),
      glow: expect.any(String),
    });
  });

  it('active is bright red', () => {
    expect(COLORS.active).toBe('#ff2020');
  });

  it('inactive is dark red', () => {
    expect(COLORS.inactive).toBe('#160000');
  });

  it('glow is pure red', () => {
    expect(COLORS.glow).toBe('#ff0000');
  });

  it('active and inactive are different', () => {
    expect(COLORS.active).not.toBe(COLORS.inactive);
  });
});

/**
 * ────────────────────────────────────────────
 *  mapFontChar()
 * ────────────────────────────────────────────
 */
describe('mapFontChar()', () => {
  it('replaces "1" with "I"', () => {
    expect(mapFontChar('1')).toBe('I');
  });

  it('passes other digits through unchanged', () => {
    for (const d of '023456789') {
      expect(mapFontChar(d)).toBe(d);
    }
  });

  it('passes colon through unchanged', () => {
    expect(mapFontChar(':')).toBe(':');
  });

  it('passes letters through unchanged', () => {
    expect(mapFontChar('A')).toBe('A');
    expect(mapFontChar('z')).toBe('z');
  });

  it('is usable with Array.map on a time string', () => {
    const result = '10:30'.split('').map(mapFontChar).join('');
    expect(result).toBe('I0:30');
  });

  it('handles multiple "1"s in a string', () => {
    const result = '11:11'.split('').map(mapFontChar).join('');
    expect(result).toBe('II:II');
  });
});

/**
 * ────────────────────────────────────────────
 *  getTimeDisplay()
 * ────────────────────────────────────────────
 */
describe('getTimeDisplay()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns an object with required fields', () => {
    const td = getTimeDisplay();
    expect(td).toHaveProperty('hours');
    expect(td).toHaveProperty('minutes');
    expect(td).toHaveProperty('seconds');
    expect(td).toHaveProperty('isPM');
    expect(td).toHaveProperty('hourStr');
    expect(td).toHaveProperty('minStr');
    expect(td).toHaveProperty('secStr');
    expect(typeof td.hours).toBe('number');
    expect(typeof td.isPM).toBe('boolean');
    expect(typeof td.hourStr).toBe('string');
  });

  it('defaults to current date when no argument given', () => {
    const now = new Date();
    const td = getTimeDisplay();
    expect(td.hours).toBe(now.getHours() % 12 || 12);
    expect(td.minutes).toBe(now.getMinutes());
  });

  it('formats midnight (0:00) as 12:00 AM', () => {
    const d = new Date(2025, 0, 1, 0, 0, 0);
    const td = getTimeDisplay(d);
    expect(td.hours).toBe(12);
    expect(td.minutes).toBe(0);
    expect(td.hourStr).toBe('12');
    expect(td.minStr).toBe('00');
    expect(td.isPM).toBe(false);
  });

  it('formats noon (12:00) as 12:00 PM', () => {
    const d = new Date(2025, 0, 1, 12, 0, 0);
    const td = getTimeDisplay(d);
    expect(td.hours).toBe(12);
    expect(td.isPM).toBe(true);
    expect(td.hourStr).toBe('12');
    expect(td.minStr).toBe('00');
  });

  it('shows leading zero for single-digit hours (9 -> 09)', () => {
    const d = new Date(2025, 0, 1, 9, 5, 0);
    const td = getTimeDisplay(d);
    expect(td.hours).toBe(9);
    expect(td.hourStr).toBe('09');
  });

  it('shows leading zero for single-digit minutes', () => {
    const d = new Date(2025, 0, 1, 3, 4, 0);
    const td = getTimeDisplay(d);
    expect(td.minStr).toBe('04');
  });

  it('shows leading zero for single-digit seconds', () => {
    const d = new Date(2025, 0, 1, 3, 4, 5);
    const td = getTimeDisplay(d);
    expect(td.secStr).toBe('05');
  });

  it('converts 13:00 to 01:00 PM', () => {
    const d = new Date(2025, 0, 1, 13, 0, 0);
    const td = getTimeDisplay(d);
    expect(td.hours).toBe(1);
    expect(td.isPM).toBe(true);
    expect(td.hourStr).toBe('01');
  });

  it('converts 23:59 to 11:59 PM', () => {
    const d = new Date(2025, 0, 1, 23, 59, 0);
    const td = getTimeDisplay(d);
    expect(td.hours).toBe(11);
    expect(td.minutes).toBe(59);
    expect(td.isPM).toBe(true);
    expect(td.hourStr).toBe('11');
    expect(td.minStr).toBe('59');
  });

  it('isPM is false for AM hours', () => {
    for (let h = 0; h < 12; h++) {
      const d = new Date(2025, 0, 1, h, 0, 0);
      expect(getTimeDisplay(d).isPM).toBe(false);
    }
  });

  it('isPM is true for PM hours', () => {
    for (let h = 12; h < 24; h++) {
      const d = new Date(2025, 0, 1, h, 0, 0);
      expect(getTimeDisplay(d).isPM).toBe(true);
    }
  });

  it('hourStr and minStr are always exactly 2 characters', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 7) {
        const d = new Date(2025, 0, 1, h, m, 0);
        const td = getTimeDisplay(d);
        expect(td.hourStr).toHaveLength(2);
        expect(td.minStr).toHaveLength(2);
        expect(td.secStr).toHaveLength(2);
      }
    }
  });

  it('rawHours preserves the original 24h value', () => {
    const d = new Date(2025, 0, 1, 15, 30, 0);
    const td = getTimeDisplay(d);
    expect(td.rawHours).toBe(15);
  });

  it('handles leap year date correctly', () => {
    const d = new Date(2024, 1, 29, 14, 30, 0);
    const td = getTimeDisplay(d);
    expect(td.hourStr).toBe('02');
    expect(td.minStr).toBe('30');
    expect(td.isPM).toBe(true);
  });
});

/**
 * ────────────────────────────────────────────
 *  getDigitWidths()
 * ────────────────────────────────────────────
 */
describe('getDigitWidths()', () => {
  it('returns all required layout keys', () => {
    const l = getDigitWidths(500, 222);
    expect(l).toHaveProperty('digitH');
    expect(l).toHaveProperty('digitW');
    expect(l).toHaveProperty('gap');
    expect(l).toHaveProperty('colonW');
    expect(l).toHaveProperty('totalW');
    expect(l).toHaveProperty('startX');
    expect(l).toHaveProperty('digitY');
  });

  it('digit height is 80% of canvas height', () => {
    const l = getDigitWidths(500, 222);
    expect(l.digitH).toBeCloseTo(222 * 0.8, 5);
  });

  it('startX is positive when canvas is wide enough', () => {
    const l = getDigitWidths(500, 200);
    expect(l.startX).toBeGreaterThanOrEqual(0);
  });

  it('totalW never exceeds canvas width', () => {
    const l = getDigitWidths(500, 200);
    expect(l.totalW).toBeLessThanOrEqual(500);
  });

  it('all spacing values are positive', () => {
    const l = getDigitWidths(500, 200);
    expect(l.digitW).toBeGreaterThan(0);
    expect(l.gap).toBeGreaterThan(0);
    expect(l.colonW).toBeGreaterThan(0);
    expect(l.digitY).toBeGreaterThanOrEqual(0);
  });

  it('scales proportionally with different canvas sizes', () => {
    const small = getDigitWidths(250, 111);
    const large = getDigitWidths(500, 222);
    expect(large.digitH / small.digitH).toBeCloseTo(2, 1);
    expect(large.digitW / small.digitW).toBeCloseTo(2, 1);
  });

  it('digit height is exactly cssH * 0.8', () => {
    expect(getDigitWidths(400, 300).digitH).toBe(240);
  });

  it('digit width is exactly digitH * 0.55', () => {
    const l = getDigitWidths(500, 200);
    expect(l.digitW).toBeCloseTo(l.digitH * 0.55, 5);
  });

  it('gap is exactly digitW * 0.20', () => {
    const l = getDigitWidths(500, 200);
    expect(l.gap).toBeCloseTo(l.digitW * 0.20, 5);
  });

  it('colonW is exactly digitW * 0.50', () => {
    const l = getDigitWidths(500, 200);
    expect(l.colonW).toBeCloseTo(l.digitW * 0.50, 5);
  });

  it('totalW is sum of all digit/gap/colon widths', () => {
    const l = getDigitWidths(500, 200);
    const expected = 4 * l.digitW + 3 * l.gap + l.colonW;
    expect(l.totalW).toBeCloseTo(expected, 5);
  });

  it('digitY vertically centers the digit area', () => {
    const l = getDigitWidths(500, 200);
    expect(l.digitY).toBeCloseTo((200 - l.digitH) / 2, 5);
  });

  it('startX horizontally centers the content', () => {
    const l = getDigitWidths(500, 200);
    expect(l.startX).toBeCloseTo((500 - l.totalW) / 2, 5);
  });
});

/**
 * ────────────────────────────────────────────
 *  drawDigitChar()
 * ────────────────────────────────────────────
 */
describe('drawDigitChar()', () => {
  let ctx;

  beforeEach(() => {
    ctx = {
      font: null,
      textAlign: null,
      textBaseline: null,
      fillText: jest.fn(),
    };
  });

  it('sets font, textAlign, textBaseline and calls fillText', () => {
    drawDigitChar(ctx, '8', 100, 200, 50);
    expect(ctx.font).toBe('50px Digital');
    expect(ctx.textAlign).toBe('center');
    expect(ctx.textBaseline).toBe('middle');
    const [, , y] = ctx.fillText.mock.lastCall;
    expect(y).toBeCloseTo(200 + 50 * FONT_ADJUST, 5);
  });

  it('renders any digit character', () => {
    for (const ch of '0123456789') {
      drawDigitChar(ctx, ch, 0, 0, 30);
      const [c, x, y] = ctx.fillText.mock.lastCall;
      expect(c).toBe(ch);
      expect(x).toBe(0);
      expect(y).toBeCloseTo(30 * FONT_ADJUST, 5);
    }
  });

  it('renders colon character', () => {
    drawDigitChar(ctx, ':', 150, 250, 40);
    expect(ctx.font).toBe('40px Digital');
    const [, , y] = ctx.fillText.mock.lastCall;
    expect(y).toBeCloseTo(250 + 40 * FONT_ADJUST, 5);
  });

  it('rounds font size to integer', () => {
    drawDigitChar(ctx, '5', 0, 0, 49.7);
    expect(ctx.font).toBe('50px Digital');
  });

  it('accepts any character without throwing', () => {
    expect(() => drawDigitChar(ctx, '#', 0, 0, 24)).not.toThrow();
    expect(() => drawDigitChar(ctx, '@', 0, 0, 24)).not.toThrow();
  });
});

/**
 * ────────────────────────────────────────────
 *  drawColonDots()
 * ────────────────────────────────────────────
 */
describe('drawColonDots()', () => {
  let ctx;

  beforeEach(() => {
    ctx = {
      fillStyle: null,
      shadowColor: null,
      shadowBlur: null,
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
    };
  });

  it('draws two dots (upper + lower)', () => {
    drawColonDots(ctx, 100, 185, 215, 4, '#ff2020');
    expect(ctx.beginPath).toHaveBeenCalledTimes(2);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalledTimes(2);
  });

  it('uses the provided color', () => {
    drawColonDots(ctx, 100, 185, 215, 4, '#ff2020');
    expect(ctx.fillStyle).toBe('#ff2020');
  });

  it('sets glow during drawing', () => {
    let shadowColorLog = [];
    let shadowColorVal;
    Object.defineProperty(ctx, 'shadowColor', {
      get: () => shadowColorVal,
      set: (v) => { shadowColorVal = v; shadowColorLog.push(v); },
      configurable: true,
    });
    drawColonDots(ctx, 100, 185, 215, 4, '#ff2020');
    expect(shadowColorLog).toContain(COLORS.glow);
    expect(shadowColorLog).toContain('transparent');
  });

  it('draws dots at the given y1 and y2 positions', () => {
    drawColonDots(ctx, 100, 185, 215, 5, '#ff2020');
    expect(ctx.arc).toHaveBeenNthCalledWith(1, 100, 185, 5, 0, Math.PI * 2);
    expect(ctx.arc).toHaveBeenNthCalledWith(2, 100, 215, 5, 0, Math.PI * 2);
  });

  it('resets shadow after drawing', () => {
    drawColonDots(ctx, 100, 185, 215, 4, '#ff2020');
    expect(ctx.shadowColor).toBe('transparent');
    expect(ctx.shadowBlur).toBe(0);
  });

  it('works with inactive color for ghost pass', () => {
    drawColonDots(ctx, 100, 185, 215, 4, COLORS.inactive);
    expect(ctx.fillStyle).toBe(COLORS.inactive);
  });

  it('works with active color for foreground pass', () => {
    drawColonDots(ctx, 100, 185, 215, 4, COLORS.active);
    expect(ctx.fillStyle).toBe(COLORS.active);
  });
});

/**
 * ────────────────────────────────────────────
 *  CONSTANTS
 * ────────────────────────────────────────────
 */
describe('layout constants', () => {
  it('FONT_ADJUST is 0.06', () => {
    expect(FONT_ADJUST).toBe(0.06);
  });

  it('COLON_RADIUS_RATIO is 0.12', () => {
    expect(COLON_RADIUS_RATIO).toBe(0.12);
  });
});

/**
 * ────────────────────────────────────────────
 *  getColonLayout()
 * ────────────────────────────────────────────
 */
describe('getColonLayout()', () => {
  it('returns y1, y2, and radius', () => {
    const cl = getColonLayout(200, 160, 88);
    expect(cl).toHaveProperty('y1');
    expect(cl).toHaveProperty('y2');
    expect(cl).toHaveProperty('radius');
  });

  it('y1 is cy - digitH * 0.25', () => {
    expect(getColonLayout(200, 160, 88).y1).toBeCloseTo(200 - 160 * 0.25, 5);
  });

  it('y2 is cy + digitH * 0.17', () => {
    expect(getColonLayout(200, 160, 88).y2).toBeCloseTo(200 + 160 * 0.17, 5);
  });

  it('radius is digitW * COLON_RADIUS_RATIO', () => {
    expect(getColonLayout(200, 160, 100).radius).toBeCloseTo(100 * COLON_RADIUS_RATIO, 5);
  });

  it('handles zero dimensions', () => {
    expect(getColonLayout(0, 0, 0)).toEqual({ y1: 0, y2: 0, radius: 0 });
  });
});

/**
 * ────────────────────────────────────────────
 *  EDGE CASES
 * ────────────────────────────────────────────
 */
describe('edge cases', () => {
  describe('getTimeDisplay edge cases', () => {
    it('handles 0 seconds correctly', () => {
      const d = new Date(2025, 0, 1, 10, 30, 0);
      expect(getTimeDisplay(d).secStr).toBe('00');
    });

    it('handles 59 seconds correctly', () => {
      const d = new Date(2025, 0, 1, 10, 30, 59);
      expect(getTimeDisplay(d).secStr).toBe('59');
    });

    it('handles 0 minutes correctly', () => {
      const d = new Date(2025, 0, 1, 10, 0, 0);
      expect(getTimeDisplay(d).minStr).toBe('00');
    });

    it('handles invalid date by returning NaN-based strings', () => {
      const d = new Date('not-a-date');
      const td = getTimeDisplay(d);
      expect(isNaN(td.hours) || td.hours === 12).toBe(true);
    });
  });

  describe('getDigitWidths edge cases', () => {
    it('handles zero-size canvas gracefully', () => {
      const l = getDigitWidths(0, 0);
      expect(l.digitH).toBe(0);
      expect(l.digitW).toBe(0);
    });

    it('handles very tall narrow canvas (content may overflow)', () => {
      const l = getDigitWidths(100, 1000);
      expect(l.startX).toBeLessThan(0);
      expect(l.totalW).toBeGreaterThan(100);
    });

    it('handles very wide short canvas', () => {
      const l = getDigitWidths(1000, 100);
      expect(l.startX).toBeGreaterThanOrEqual(0);
    });
  });

  describe('drawDigitChar edge cases', () => {
    let ctx;

    beforeEach(() => {
      ctx = {
        font: null,
        textAlign: null,
        textBaseline: null,
        fillText: jest.fn(),
      };
    });

    it('handles zero font size', () => {
      drawDigitChar(ctx, '8', 100, 200, 0);
      expect(ctx.font).toBe('0px Digital');
      expect(ctx.fillText).toHaveBeenCalledWith('8', 100, 200);
    });

    it('handles very large font size', () => {
      drawDigitChar(ctx, '8', 100, 200, 1000);
      expect(ctx.font).toBe('1000px Digital');
      expect(ctx.fillText).toHaveBeenCalledWith('8', 100, 200 + 1000 * FONT_ADJUST);
    });

    it('handles negative position', () => {
      drawDigitChar(ctx, '1', -50, -100, 30);
      const [, x, y] = ctx.fillText.mock.lastCall;
      expect(x).toBe(-50);
      expect(y).toBeCloseTo(-100 + 30 * FONT_ADJUST, 5);
    });

    it('handles empty string', () => {
      drawDigitChar(ctx, '', 0, 0, 30);
      const [, x, y] = ctx.fillText.mock.lastCall;
      expect(x).toBe(0);
      expect(y).toBeCloseTo(30 * FONT_ADJUST, 5);
    });
  });

  describe('drawColonDots edge cases', () => {
    let ctx;

    beforeEach(() => {
      ctx = {
        fillStyle: null,
        shadowColor: null,
        shadowBlur: null,
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
      };
    });

    it('handles zero radius', () => {
      drawColonDots(ctx, 100, 200, 210, 0, '#ff2020');
      expect(ctx.arc).toHaveBeenNthCalledWith(1, 100, 200, 0, 0, Math.PI * 2);
      expect(ctx.arc).toHaveBeenNthCalledWith(2, 100, 210, 0, 0, Math.PI * 2);
    });

    it('handles identical y positions (dots overlap)', () => {
      drawColonDots(ctx, 100, 200, 200, 4, '#ff2020');
      expect(ctx.arc).toHaveBeenNthCalledWith(1, 100, 200, 4, 0, Math.PI * 2);
      expect(ctx.arc).toHaveBeenNthCalledWith(2, 100, 200, 4, 0, Math.PI * 2);
    });
  });
});
