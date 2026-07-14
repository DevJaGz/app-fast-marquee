/** Direction of the marquee. */
export type Direction = 'left' | 'right' | 'up' | 'down';

/** Speed of the marquee — qualitative ('slow', 'medium', 'fast') or quantitative (pixels per second). */
export type Speed = number | 'slow' | 'medium' | 'fast';

export type QualitativeSpeed = Exclude<Speed, number>;

export type Axis = 'horizontal' | 'vertical';

/** Snapshot of the marquee inputs the engine reads at the start of each measure/duplicate cycle. */
export interface EngineConfig {
  direction: Direction;
  autoFill: boolean;
  animated: boolean;
}

/** Resolved per-edge fade percentages after applying the explicit-edge-overrides-shorthand rule. */
export interface ResolvedMask {
  startPercentage: number;
  endPercentage: number;
}
