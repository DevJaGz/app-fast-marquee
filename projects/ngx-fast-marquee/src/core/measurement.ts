import { Axis, Direction } from './types';

/** Returns the scroll axis implied by a marquee direction. */
export function axisOf(direction: Direction): Axis {
  return direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';
}

/** Returns width or height depending on the axis. */
export function sizeAlongAxis(size: { width: number; height: number }, axis: Axis): number {
  return axis === 'horizontal' ? size.width : size.height;
}

/** Measures an element's extent along the given axis via `getBoundingClientRect`. */
export function measureSizeAlongAxis(element: HTMLElement, axis: Axis): number {
  return sizeAlongAxis(element.getBoundingClientRect(), axis);
}

/** Half the animated track size — the distance one 50% travel covers (numeric-speed duration basis). */
export function middleSize(sizeInPx: number): number {
  return sizeInPx / 2;
}
