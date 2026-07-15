import { axisOf, middleSize, sizeAlongAxis } from './measurement';

describe('axisOf', () => {
  it('maps left and right to horizontal', () => {
    expect(axisOf('left')).toBe('horizontal');
    expect(axisOf('right')).toBe('horizontal');
  });

  it('maps up and down to vertical', () => {
    expect(axisOf('up')).toBe('vertical');
    expect(axisOf('down')).toBe('vertical');
  });
});

describe('sizeAlongAxis', () => {
  const size = { width: 300, height: 100 };

  it('returns width for horizontal axis', () => {
    expect(sizeAlongAxis(size, 'horizontal')).toBe(300);
  });

  it('returns height for vertical axis', () => {
    expect(sizeAlongAxis(size, 'vertical')).toBe(100);
  });
});

describe('middleSize', () => {
  it('returns half the track size', () => {
    expect(middleSize(1000)).toBe(500);
  });
});
