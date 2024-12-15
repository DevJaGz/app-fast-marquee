import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverHelper {
  private observers = new Map<Element, ResizeObserver>();

  /**
   * Observe an element for resize changes and execute a callback when resized.
   * @param element - The target element to observe.
   * @param callback - Function to call when the element is resized.
   */
  observe(element: Element, callback: ResizeObserverCallback): void {
    if (this.observers.has(element)) {
      throw new Error('ResizeObserver is already observing this element.');
    }

    const resizeObserver = new ResizeObserver(callback);
    resizeObserver.observe(element);
    this.observers.set(element, resizeObserver);
  }

  /**
   * Stop observing an element.
   * @param element - The target element to stop observing.
   */
  unobserve(element: Element): void {
    const resizeObserver = this.observers.get(element);
    if (resizeObserver) {
      resizeObserver.unobserve(element);
      resizeObserver.disconnect();
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
