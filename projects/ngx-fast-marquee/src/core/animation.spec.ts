import { describe, expect, it } from 'vitest';
import {
  isMaskEnabled,
  isSpeedFrozen,
  resolveAnimated,
  resolveMask,
  resolveNumericDurationSeconds,
  resolvePlayState,
  resolveQualitativeSpeed,
} from './animation';

describe('resolveQualitativeSpeed', () => {
  it('passes through qualitative speeds', () => {
    expect(resolveQualitativeSpeed('slow')).toBe('slow');
    expect(resolveQualitativeSpeed('medium')).toBe('medium');
    expect(resolveQualitativeSpeed('fast')).toBe('fast');
  });

  it('returns null for numeric speed', () => {
    expect(resolveQualitativeSpeed(200)).toBeNull();
  });
});

describe('isSpeedFrozen', () => {
  it('returns true for zero or negative numeric speeds', () => {
    expect(isSpeedFrozen(0)).toBe(true);
    expect(isSpeedFrozen(-50)).toBe(true);
  });

  it('returns false for positive numeric and qualitative speeds', () => {
    expect(isSpeedFrozen(5)).toBe(false);
    expect(isSpeedFrozen('slow')).toBe(false);
  });
});

describe('resolveNumericDurationSeconds', () => {
  it('computes duration as (track size / 2) / speed for positive numeric speed', () => {
    expect(resolveNumericDurationSeconds(200, 1000)).toBe(2.5);
  });

  it('returns null when speed is zero, negative, qualitative, or measured size is zero', () => {
    expect(resolveNumericDurationSeconds(0, 1000)).toBeNull();
    expect(resolveNumericDurationSeconds(-50, 1000)).toBeNull();
    expect(resolveNumericDurationSeconds('fast', 1000)).toBeNull();
    expect(resolveNumericDurationSeconds(200, 0)).toBeNull();
  });
});

describe('resolvePlayState', () => {
  it('returns running when play is true and speed is not frozen', () => {
    expect(resolvePlayState(true, 100)).toBe('running');
    expect(resolvePlayState(true, 'slow')).toBe('running');
  });

  it('returns paused when play is false or speed is frozen', () => {
    expect(resolvePlayState(true, 0)).toBe('paused');
    expect(resolvePlayState(true, -1)).toBe('paused');
    expect(resolvePlayState(false, 100)).toBe('paused');
  });
});

describe('resolveMask', () => {
  // Mask resolution is axis-independent; CSS applies the axis from direction.

  it('returns zero edges when all inputs are zero', () => {
    expect(resolveMask(0, 0, 0)).toEqual({ startPercentage: 0, endPercentage: 0 });
  });

  it('applies symmetric shorthand when independent edges are zero', () => {
    expect(resolveMask(40, 0, 0)).toEqual({ startPercentage: 40, endPercentage: 40 });
  });

  it('uses independent start percentage when greater than zero', () => {
    expect(resolveMask(0, 20, 0)).toEqual({ startPercentage: 20, endPercentage: 0 });
  });

  it('uses independent end percentage when greater than zero', () => {
    expect(resolveMask(0, 0, 60)).toEqual({ startPercentage: 0, endPercentage: 60 });
  });

  it('lets explicit start override shorthand', () => {
    expect(resolveMask(40, 10, 0)).toEqual({ startPercentage: 10, endPercentage: 40 });
  });

  it('lets explicit end override shorthand', () => {
    expect(resolveMask(40, 0, 60)).toEqual({ startPercentage: 40, endPercentage: 60 });
  });
});

describe('isMaskEnabled', () => {
  it('returns false when both edges are zero', () => {
    expect(isMaskEnabled({ startPercentage: 0, endPercentage: 0 })).toBe(false);
  });

  it('returns true when only the start percentage is greater than zero', () => {
    expect(isMaskEnabled({ startPercentage: 20, endPercentage: 0 })).toBe(true);
  });

  it('returns true when only the end percentage is greater than zero', () => {
    expect(isMaskEnabled({ startPercentage: 0, endPercentage: 20 })).toBe(true);
  });

  it('returns true when both edges are greater than zero', () => {
    expect(isMaskEnabled({ startPercentage: 20, endPercentage: 40 })).toBe(true);
  });
});

describe('resolveAnimated', () => {
  it('returns true unless both useSystemReducedMotion and prefersReducedMotion are true', () => {
    expect(resolveAnimated(false, false)).toBe(true);
    expect(resolveAnimated(false, true)).toBe(true);
    expect(resolveAnimated(true, false)).toBe(true);
    expect(resolveAnimated(true, true)).toBe(false);
  });
});
