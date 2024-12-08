import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MutationObserverService {
  private observers = new Map<Element, MutationObserver>();

  /**
   * Observe an element for mutations and execute a callback when a mutation occurs.
   * @param element - The target element to observe.
   * @param callback - Function to call when a mutation occurs.
   * @param options - MutationObserverInit options for the observer.
   */
  observe(
    element: Element,
    callback: MutationCallback,
    options: MutationObserverInit,
  ): void {
    if (this.observers.has(element)) {
      throw new Error('MutationObserver is already observing this element.');
    }

    const mutationObserver = new MutationObserver(callback);
    mutationObserver.observe(element, options);
    this.observers.set(element, mutationObserver);
  }

  /**
   * Stop observing a specific element.
   * @param element - The target element to stop observing.
   */
  unobserve(element: Element): void {
    const mutationObserver = this.observers.get(element);
    if (mutationObserver) {
      mutationObserver.disconnect();
      this.observers.delete(element);
    }
  }

  /**
   * Stop observing all elements and clean up observers.
   */
  disconnectAll(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}
