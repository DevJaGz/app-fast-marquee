/**
 * TypeScript 4.2.3 (this line's core-dialect floor, see `tsconfig.core-dialect.json`) predates the
 * standard-library `requestIdleCallback`/`cancelIdleCallback` DOM typings (added ~TS 4.4). Declared
 * here as a global augmentation so `core/` type-checks under the pinned compiler without widening
 * to `any`.
 */
interface IdleRequestOptions {
  timeout?: number;
}

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

interface Window {
  requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number;
  cancelIdleCallback(handle: number): void;
}
