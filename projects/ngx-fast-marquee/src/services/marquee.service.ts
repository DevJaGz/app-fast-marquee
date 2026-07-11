import { inject, Injectable, RendererStyleFlags2 } from '@angular/core';
import { MarqueeModel } from '../models/marquee.model';
import { ReducedMotionService } from './reduced-motion.service';
import { MarqueeDuplicationService } from './marquee-duplication.service';
@Injectable()
export class MarqueeService {
  private readonly _reducedMotionService = inject(ReducedMotionService);
  private readonly _marqueeDuplicationService = inject(MarqueeDuplicationService);

  /**
   * Set the marquee component instance.
   * @param marqueeComponent - NGX Fast Marquee component instance.
   */
  setMarqueeComponent(marqueeComponent: MarqueeModel): void {
    this._marqueeComponent = marqueeComponent;
    this._marqueeDuplicationService.setMarqueeComponent(marqueeComponent);
  }

  /**
   * Check if the marquee need to be updated.
   * @returns True if the marquee need to be updated.
   */
  isMarqueeDirty(): boolean {
    return this._hasMarqueeNewItems() || this._hasMarqueeItemsWithChanges();
  }

  /**
   * Update the DOM and the CSS of the marquee.
   * The mask and the direction attribute are updated regardless of the animated state, so the
   * edge fade and the mask axis stay correct even while paused or while reduced motion is honored.
   */
  update(): void {
    const { useSystemReducedMotion, autoFill } = this._marqueeComponent;
    const shouldAnimate = !(useSystemReducedMotion() && this._reducedMotionService.hasSystemReducedMotion());

    this._setAsAnimated(shouldAnimate);
    this.updateDirection();
    this.updateMask();

    if (!shouldAnimate) {
      return;
    }

    if (autoFill()) {
      this._marqueeDuplicationService.duplicateItems();
      this._updateNumberOfMarqueeItems();
    }

    this.updateMovePercentage();
    this.updateSpeed();
    this.updatePauseOnHover();
    this.updatePauseOnClick();
    this.updatePlayState();
  }

  /**
   *  Update the speed of the marquee, setting the CSS property '--_animation-duration'.
   * A numeric speed of `0` or negative produces no motion: the marquee is frozen regardless
   * of `play`, until a positive numeric speed or a qualitative speed is set again.
   */
  updateSpeed(): void {
    const { speed, marqueeInnerElement, renderer } = this._marqueeComponent;
    const speedValue = speed();
    if (typeof speedValue === 'number') {
      this._isSpeedFrozen = speedValue <= 0;
      if (!this._isSpeedFrozen) {
        const middleSizeInPx = this._getMiddleMarqueeSizeInPx();
        renderer.setStyle(
          marqueeInnerElement,
          '--_animation-duration',
          `${middleSizeInPx / speedValue}s`,
          RendererStyleFlags2.DashCase
        );
      }
    } else {
      this._isSpeedFrozen = false;
      renderer.setAttribute(marqueeInnerElement, 'data-speed', speedValue);
    }
    this.updatePlayState();
  }

  private _getMiddleMarqueeSizeInPx(): number {
    const { marqueeInnerElement, direction } = this._marqueeComponent;
    const marqueeInnerElementSize = marqueeInnerElement.getBoundingClientRect();
    const directionValue = direction();
    const size =
      directionValue === 'left' || directionValue === 'right'
        ? marqueeInnerElementSize.width
        : marqueeInnerElementSize.height;
    return size / 2;
  }

  /**
   * Update the direction of the marquee. setting the data attribute 'data-direction'.
   */
  updateDirection(): void {
    const { direction, marqueeElement, renderer } = this._marqueeComponent;
    renderer.setAttribute(marqueeElement, 'data-direction', direction());
  }

  /**
   * Update the percentage of the marquee translation based on the autoFill input.
   * If autoFill is true, the percentage is 50% because the elements will be duplicated
   * until fill the screen (taking into account the animation repetition) and then translated 50%.
   * Otherwise is 100% because the elements will not be duplicated and then translated 100%.
   */
  updateMovePercentage(): void {
    const { autoFill } = this._marqueeComponent;
    if (!autoFill()) {
      this._updateMovePercentage(100);
      return;
    }
    this._updateMovePercentage(50);
  }

  /**
   * Update the mask of the marquee. `maskPercentage` is a symmetric shorthand fading both edges;
   * an explicitly-set (greater than `0`) `maskStartPercentage`/`maskEndPercentage` overrides the
   * shorthand for its own edge. All inputs default to `0` (opaque edges).
   */
  updateMask(): void {
    const { maskStartPercentage, maskEndPercentage, maskPercentage } = this._marqueeComponent;
    const shorthandPercentage = maskPercentage();
    const startPercentage = maskStartPercentage() > 0 ? maskStartPercentage() : shorthandPercentage;
    const endPercentage = maskEndPercentage() > 0 ? maskEndPercentage() : shorthandPercentage;
    this._updateMaskPercentages(startPercentage, endPercentage);
  }

  /**
   * Update the play state of the marquee animation setting the CSS property '--_animation-play-state'.
   * A `0`/negative numeric speed freezes the marquee regardless of `play`.
   */
  updatePlayState(): void {
    const { play, marqueeInnerElement, renderer } = this._marqueeComponent;
    renderer.setStyle(
      marqueeInnerElement,
      '--_animation-play-state',
      play() && !this._isSpeedFrozen ? 'running' : 'paused',
      RendererStyleFlags2.DashCase
    );
  }

  /**
   * Update the pause on hover of the marquee setting the data attribute 'data-pause-on-hover'.
   */
  updatePauseOnHover(): void {
    const { pauseOnHover, renderer, marqueeInnerElement } = this._marqueeComponent;
    renderer.setAttribute(marqueeInnerElement, 'data-pause-on-hover', String(pauseOnHover()));
  }

  /**
   * Update the pause on click of the marquee setting the data attribute 'data-pause-on-click'.
   */
  updatePauseOnClick(): void {
    const { pauseOnClick, renderer, marqueeInnerElement } = this._marqueeComponent;
    renderer.setAttribute(marqueeInnerElement, 'data-pause-on-click', String(pauseOnClick()));
  }

  /**
   * Private reference to the marquee component instance.
   */
  private _marqueeComponent!: MarqueeModel;

  private _currentNumberOfMarqueeItems = 0;

  /**
   * True when a numeric `speed` of `0` or negative should freeze the marquee regardless of `play`.
   */
  private _isSpeedFrozen = false;

  /**
   * Update the percentage of the marquee translation setting the CSS property '--_move-percentage'.
   * @param value - The value of the percentage.
   * @param sign - The sign of the percentage.
   */
  private _updateMovePercentage(value: number, sign = '-'): void {
    const { marqueeInnerElement, renderer } = this._marqueeComponent;
    renderer.setStyle(marqueeInnerElement, '--_move-percentage', `${sign}${value}%`, RendererStyleFlags2.DashCase);
  }

  /**
   * Update the number of marquee items setting the CSS property '--_number-of-marquee-items'
   * This is done in order to calculate speed from the predefined CSS calculation.
   */
  private _updateNumberOfMarqueeItems(): void {
    const { marqueeInnerElement, renderer, numberOfMarqueeItems } = this._marqueeComponent;
    this._currentNumberOfMarqueeItems = numberOfMarqueeItems;
    renderer.setStyle(
      marqueeInnerElement,
      '--_number-of-marquee-items',
      String(numberOfMarqueeItems),
      RendererStyleFlags2.DashCase
    );
  }

  /**
   * Set the resolved start/end mask percentages as the CSS custom properties consumed by the
   * mask gradient.
   * @param startPercentage - The resolved start-edge fade percentage.
   * @param endPercentage - The resolved end-edge fade percentage.
   */
  private _updateMaskPercentages(startPercentage: number, endPercentage: number): void {
    const { marqueeElement, renderer } = this._marqueeComponent;
    renderer.setStyle(marqueeElement, '--_mask-start-percentage', `${startPercentage}%`, RendererStyleFlags2.DashCase);
    renderer.setStyle(marqueeElement, '--_mask-end-percentage', `${endPercentage}%`, RendererStyleFlags2.DashCase);
  }

  /**
   * Check if the marquee has new items inside the marquee inner element.
   * @returns True if the marquee has new items.
   */
  private _hasMarqueeNewItems(): boolean {
    const { numberOfMarqueeItems } = this._marqueeComponent;
    return this._currentNumberOfMarqueeItems !== numberOfMarqueeItems;
  }

  /**
   * Check if the marquee has items with changes inside the marquee inner element.
   * @returns True if the marquee has items with changes.
   */
  private _hasMarqueeItemsWithChanges(): boolean {
    const { marqueeItems } = this._marqueeComponent;
    const marqueeItemsArray = Array.from(marqueeItems);
    const originalMarqueeItems: Element[] = [];
    const totalLenght = marqueeItemsArray.length;
    for (let i = 0; i < totalLenght; i++) {
      const hasAriaHidden = marqueeItemsArray[i].getAttribute('aria-hidden');
      if (!hasAriaHidden) {
        originalMarqueeItems.push(marqueeItemsArray[i]);
        continue;
      }
      break;
    }
    const marqueeItemsChunk = marqueeItemsArray.slice(originalMarqueeItems.length, 2 * originalMarqueeItems.length);
    return originalMarqueeItems.some((item, index) => {
      const marqueeItem = marqueeItemsChunk[index];
      if (!marqueeItem) return false;
      return item.innerHTML !== marqueeItem.innerHTML;
    });
  }

  /**
   * Set the marquee as animated or not setting the data attribute 'data-animated'.
   * @param value - True if the marquee is animated, false otherwise.
   */
  private _setAsAnimated(value: boolean): void {
    const { renderer, marqueeElement } = this._marqueeComponent;
    renderer.setAttribute(marqueeElement, 'data-animated', String(value));
  }
}
