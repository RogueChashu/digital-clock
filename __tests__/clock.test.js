import {
  COLORS, getTimeDisplay, getDigitWidths,
  getTextOffset,
  DIGIT_HEIGHT_RATIO, DIGIT_WIDTH_RATIO, GAP_RATIO,
  COLON_WIDTH_RATIO, GLOW_BLUR,
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
 *  getTimeDisplay()
 * ────────────────────────────────────────────
 */
describe('getTimeDisplay()', () => {
  it('returns an object with required fields', () => {
    const td = getTimeDisplay(new Date(2025, 0, 1, 10, 30, 0));
    expect(td).toHaveProperty('hours');
    expect(td).toHaveProperty('minutes');
    expect(td).toHaveProperty('isPM');
    expect(td).toHaveProperty('hourStr');
    expect(td).toHaveProperty('minStr');
    expect(typeof td.hours).toBe('number');
    expect(typeof td.isPM).toBe('boolean');
    expect(typeof td.hourStr).toBe('string');
  });

  it('does not return seconds or secStr', () => {
    const td = getTimeDisplay(new Date(2025, 0, 1, 10, 30, 0));
    expect(td).not.toHaveProperty('seconds');
    expect(td).not.toHaveProperty('secStr');
  });

  it('defaults to current date when no argument given', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 11, 25, 8, 15, 0));
    const td = getTimeDisplay();
    expect(td.hours).toBe(8);
    expect(td.minutes).toBe(15);
    expect(td.hourStr).toBe('08');
    expect(td.minStr).toBe('15');
    expect(td.isPM).toBe(false);
    jest.useRealTimers();
  });

  it('uses default parameter when undefined is passed', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 11, 25, 20, 45, 0));
    const td = getTimeDisplay(undefined);
    expect(td.hours).toBe(8);
    expect(td.minutes).toBe(45);
    expect(td.hourStr).toBe('08');
    expect(td.minStr).toBe('45');
    expect(td.isPM).toBe(true);
    jest.useRealTimers();
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
      }
    }
  });

  it('rawHours preserves the original 24h value', () => {
    const d = new Date(2025, 0, 1, 15, 30, 0);
    const td = getTimeDisplay(d);
    expect(td.rawHours).toBe(15);
  });

  it('rawHours is 0 at midnight', () => {
    const d = new Date(2025, 0, 1, 0, 0, 0);
    expect(getTimeDisplay(d).rawHours).toBe(0);
  });

  it('rawHours is 12 at noon', () => {
    const d = new Date(2025, 0, 1, 12, 0, 0);
    expect(getTimeDisplay(d).rawHours).toBe(12);
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

  it('digit width never exceeds digit height', () => {
    const l = getDigitWidths(500, 200);
    expect(l.digitW).toBeLessThan(l.digitH);
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
 *  CONSTANTS
 * ────────────────────────────────────────────
 */
describe('getTextOffset()', () => {
  let ctx;

  beforeEach(() => {
    ctx = {
      font: '',
      textAlign: '',
      textBaseline: '',
      measureText: jest.fn().mockReturnValue({
        actualBoundingBoxAscent: 15,
        actualBoundingBoxDescent: 3,
      }),
    };
  });

  it('sets ctx.font, textAlign, and textBaseline', () => {
    getTextOffset(ctx, 100);
    expect(ctx.font).toBe('100px Digital');
    expect(ctx.textAlign).toBe('center');
    expect(ctx.textBaseline).toBe('middle');
  });

  it('calls measureText with "8"', () => {
    getTextOffset(ctx, 100);
    expect(ctx.measureText).toHaveBeenCalledWith('8');
  });

  it('returns (ascent - descent) / 2', () => {
    ctx.measureText.mockReturnValue({
      actualBoundingBoxAscent: 20,
      actualBoundingBoxDescent: 10,
    });
    expect(getTextOffset(ctx, 100)).toBe(5);
  });

  it('returns 0 when ascent equals descent', () => {
    ctx.measureText.mockReturnValue({
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 10,
    });
    expect(getTextOffset(ctx, 100)).toBe(0);
  });

  it('handles zero ascent/descent', () => {
    ctx.measureText.mockReturnValue({
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
    });
    expect(getTextOffset(ctx, 100)).toBe(0);
  });

  it('handles negative ascent', () => {
    ctx.measureText.mockReturnValue({
      actualBoundingBoxAscent: -5,
      actualBoundingBoxDescent: 10,
    });
    expect(getTextOffset(ctx, 100)).toBe(-7.5);
  });

  it('sets ctx properties even with fontSize 0', () => {
    getTextOffset(ctx, 0);
    expect(ctx.font).toBe('0px Digital');
    expect(ctx.textAlign).toBe('center');
    expect(ctx.textBaseline).toBe('middle');
  });

  it('works with different font sizes', () => {
    ctx.measureText.mockReturnValue({
      actualBoundingBoxAscent: 30,
      actualBoundingBoxDescent: 6,
    });
    expect(getTextOffset(ctx, 200)).toBe(12);
  });
});

/**
 * ────────────────────────────────────────────
 *  LAYOUT CONSTANTS
 * ────────────────────────────────────────────
 */
describe('layout constants', () => {
  it('DIGIT_HEIGHT_RATIO is 0.8', () => {
    expect(DIGIT_HEIGHT_RATIO).toBe(0.8);
  });

  it('DIGIT_WIDTH_RATIO is 0.55', () => {
    expect(DIGIT_WIDTH_RATIO).toBe(0.55);
  });

  it('GAP_RATIO is 0.20', () => {
    expect(GAP_RATIO).toBe(0.20);
  });

  it('COLON_WIDTH_RATIO is 0.50', () => {
    expect(COLON_WIDTH_RATIO).toBe(0.50);
  });

  it('GLOW_BLUR is 3', () => {
    expect(GLOW_BLUR).toBe(3);
  });
});

/**
 * ────────────────────────────────────────────
 *  EDGE CASES
 * ────────────────────────────────────────────
 */
describe('edge cases', () => {
  describe('getTimeDisplay edge cases', () => {
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

    it('handles negative dimensions without crashing', () => {
      const l = getDigitWidths(-100, -100);
      expect(l.digitH).toBeLessThan(0);
      expect(l.digitW).toBeLessThan(0);
      expect(typeof l.totalW).toBe('number');
      expect(isNaN(l.totalW)).toBe(false);
    });
  });
});
