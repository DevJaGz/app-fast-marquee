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
