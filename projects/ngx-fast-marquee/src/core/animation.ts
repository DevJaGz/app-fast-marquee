/**
 * Input → CSS value mapping (single source of truth):
 *
 * | Input | CSS target |
 * | --- | --- |
 * | direction | `data-direction` (host) |
 * | qualitative speed | `data-speed` (inner) |
 * | numeric speed | `--_animation-duration` (inner) |
 * | autoFill travel | `data-auto-fill` (host) |
 * | masks | `--_mask-start-percentage` / `--_mask-end-percentage` (host) |
 * | mask gate | `data-masked` (host) |
 * | play | `--_animation-play-state` (inner) |
 * | pauseOnHover / pauseOnClick | `data-pause-on-hover` / `data-pause-on-click` (inner) |
 * | animated | `data-animated` (host) |
 * | item count | `--_number-of-marquee-items` (inner, engine-written) |
 */
import { middleSize } from './measurement';
import { QualitativeSpeed, ResolvedMask, Speed } from './types';

/** Written imperatively by the engine after each cycle; consumed by the stylesheet's qualitative-speed presets. */
export const NUMBER_OF_ITEMS_CSS_PROPERTY = '--_number-of-marquee-items';

export function resolveQualitativeSpeed(speed: Speed): QualitativeSpeed | null {
  return typeof speed === 'number' ? null : speed;
}

/** A numeric speed of 0 or less freezes the marquee regardless of `play`. */
export function isSpeedFrozen(speed: Speed): boolean {
  return typeof speed === 'number' && speed <= 0;
}

/** Duration in seconds for a positive numeric speed: (track size / 2) / speed. Null when not applicable. */
export function resolveNumericDurationSeconds(speed: Speed, measuredSizeInPx: number): number | null {
  if (typeof speed !== 'number' || speed <= 0 || measuredSizeInPx <= 0) return null;
  return middleSize(measuredSizeInPx) / speed;
}

export function resolvePlayState(play: boolean, speed: Speed): 'running' | 'paused' {
  return play && !isSpeedFrozen(speed) ? 'running' : 'paused';
}

/** An explicitly-set (greater than 0) edge percentage overrides the symmetric shorthand for its own edge. */
export function resolveMask(
  maskPercentage: number,
  maskStartPercentage: number,
  maskEndPercentage: number
): ResolvedMask {
  return {
    startPercentage: maskStartPercentage > 0 ? maskStartPercentage : maskPercentage,
    endPercentage: maskEndPercentage > 0 ? maskEndPercentage : maskPercentage,
  };
}

/** The mask only applies when at least one edge has a non-zero fade. */
export function isMaskEnabled(mask: ResolvedMask): boolean {
  return mask.startPercentage > 0 || mask.endPercentage > 0;
}

/** Animated unless the consumer opted into system reduced motion AND the system prefers it. */
export function resolveAnimated(useSystemReducedMotion: boolean, prefersReducedMotion: boolean): boolean {
  return !(useSystemReducedMotion && prefersReducedMotion);
}
