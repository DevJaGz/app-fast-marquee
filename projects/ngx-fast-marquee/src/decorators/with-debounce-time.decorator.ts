/**
 * Decorator to debounce a function execution.
 *
 * @example
 * ```ts
 * class MyClass {
 *   @withDebounceTime(250)
 *   myMethod(arg1: string, arg2: number): void {
 *     // ...
 *   }
 *
 *   constructor() {
 *     const interval = setInterval(() => {
 *       this.myMethod('arg1', 1); // It will be invoked once only after 500ms = intervals duration (250ms) + debounce time (250ms)
 *     }, 50);
 *
 *     setTimeout(() => {
 *       clearInterval(interval);
 *     }, 250);
 *   }
 *
 * }
 * ```
 *
 * @param delayMs - Time in milliseconds to debounce the function execution
 * @returns - Decoratored function
 */
export function withDebounceTime(delayMs: number) {
  const debounceTimers = new WeakMap<
    object,
    Map<string, ReturnType<typeof setTimeout> | null>
  >();
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      // Ensure the correct 'this' context is preserved
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context = this;
      // Get or create the timers map for this instance
      let instanceTimers = debounceTimers.get(context);
      if (!instanceTimers) {
        instanceTimers = new Map();
        debounceTimers.set(context, instanceTimers);
      }

      // Get or create the timer for this specific method
      const existingTimer = instanceTimers.get(propertyKey);

      // Clear any existing timer
      if (existingTimer !== null && existingTimer !== undefined) {
        clearTimeout(existingTimer);
      }

      // Set a new timer
      const newTimer = setTimeout(() => {
        // Call the original method with the most recent arguments
        originalMethod.apply(context, args);

        // Remove the timer
        instanceTimers!.set(propertyKey, null);
      }, delayMs);

      // Store the new timer
      instanceTimers.set(propertyKey, newTimer);
    };

    return descriptor;
  };
}
