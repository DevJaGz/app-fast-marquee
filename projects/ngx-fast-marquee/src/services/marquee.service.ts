import { Injectable, RendererStyleFlags2, SimpleChanges } from '@angular/core';
import { MarqueeModel } from '../models/marquee.model';
import { ReducedMotionService } from './reduced-motion.service';
import { MarqueeDuplicationService } from './marquee-duplication.service';
@Injectable()
export class MarqueeService {
  /**
   * Set the marquee component instance.
   * @param marqueeComponent - NGX Fast Marquee component instance.
   */
  setMarqueeComponent(marqueeComponent: MarqueeModel): void {
    this._marqueeComponent = marqueeComponent;
    this._marqueeDuplicationService.setMarqueeComponent(marqueeComponent);
  }

  /**
   * Update the marquee on input changes.
   * @param changes - Input Changes
   */
  updateOnInputChanges(changes: SimpleChanges): void {
    if (!this._marqueeComponent) return;

    if (this._hasInputChange(changes, 'direction')) {
      this.updateDirection();
    }

    if (this._hasInputChange(changes, 'speed')) {
      this.updateSpeed();
    }

    if (this._hasInputChange(changes, 'play')) {
      this.updatePlayState();
    }

    if (this._hasInputChange(changes, 'maskPercentage')) {
      this.updateMask();
    }

    if (this._hasInputChange(changes, 'maskStartPercentage')) {
      this.updateMask();
    }

    if (this._hasInputChange(changes, 'maskEndPercentage')) {
      this.updateMask();
    }

    if (
      this._hasInputChange(changes, 'autoFill') ||
      this._hasInputChange(changes, 'useSystemReducedMotion')
    ) {
      this.update();
    }

    if (this._hasInputChange(changes, 'pauseOnHover')) {
      this.updatePauseOnHover();
    }

    if (this._hasInputChange(changes, 'pauseOnClick')) {
      this.updatePauseOnClick();
    }
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
   */
  update(): void {
    const { useSystemReducedMotion, autoFill } = this._marqueeComponent;
    if (
      useSystemReducedMotion &&
      this._reducedMotionService.hasSystemReducedMotion()
    ) {
      this._setAsAnimated(false);
      return;
    }

    this._setAsAnimated(true);

    if (autoFill) {
      this._marqueeDuplicationService.duplicateItems();
      this._updateNumberOfMarqueeItems();
    }

    this.updateMask();
    this.updateMovePercentage();
    this.updateDirection();
    this.updateSpeed();
    this.updatePauseOnHover();
    this.updatePauseOnClick();
    this.updatePlayState();
  }

  /**
   *  Update the speed of the marquee. setting the CSS property '--_animation-duration'.
   */
  updateSpeed(): void {
    const { speed, marqueeInnerElement, renderer } = this._marqueeComponent;
    if (typeof speed === 'number') {
      const middleSizeInPx = this._getMiddleMarqueeSizeInPx();
      renderer.setStyle(
        marqueeInnerElement,
        '--_animation-duration',
        `${middleSizeInPx / speed}s`,
        RendererStyleFlags2.DashCase,
      );
      return;
    }
    renderer.setAttribute(marqueeInnerElement, 'data-speed', speed);
  }

  private _getMiddleMarqueeSizeInPx(): number {
    const { marqueeInnerElement, direction } = this._marqueeComponent;
    const marqueeInnerElementSize = marqueeInnerElement.getBoundingClientRect();
    const size =
      direction === 'left' || direction === 'right'
        ? marqueeInnerElementSize.width
        : marqueeInnerElementSize.height;
    return size / 2;
  }

  /**
   * Update the direction of the marquee. setting the data attribute 'data-direction'.
   */
  updateDirection(): void {
    const { direction, marqueeElement, renderer } = this._marqueeComponent;
    renderer.setAttribute(marqueeElement, 'data-direction', direction);
  }

  /**
   * Update the percentage of the marquee translation based on the autoFill input.
   * If autoFill is true, the percentage is 50% because the elements will be duplicated
   * until fill the screen (taking into account the animation repetition) and then translated 50%.
   * Otherwise is 100% because the elements will not be duplicated and then translated 100%.
   */
  updateMovePercentage(): void {
    const { autoFill } = this._marqueeComponent;
    if (!autoFill) {
      this._updateMovePercentage(100);
      return;
    }
    this._updateMovePercentage(50);
  }

  /**
   * Update the mask of the marquee
   */
  updateMask(): void {
    const { maskEndPercentage, maskStartPercentage, maskPercentage } =
      this._marqueeComponent;
    if (maskStartPercentage != null || maskEndPercentage != null) {
      this._updateMaskFromStartToEndPercentage();
    }

    if (maskPercentage != null) {
      this._updateMaskFromPercentage();
    }
  }

  /**
   * Update the play state of the marquee animation setting the CSS property '--_animation-play-state'.
   */
  updatePlayState(): void {
    const { play, marqueeInnerElement, renderer } = this._marqueeComponent;
    renderer.setStyle(
      marqueeInnerElement,
      '--_animation-play-state',
      play ? 'running' : 'paused',
      RendererStyleFlags2.DashCase,
    );
  }

  /**
   * Update the pause on hover of the marquee setting the data attribute 'data-pause-on-hover'.
   */
  updatePauseOnHover(): void {
    const { pauseOnHover, renderer, marqueeInnerElement } =
      this._marqueeComponent;
    renderer.setAttribute(
      marqueeInnerElement,
      'data-pause-on-hover',
      String(pauseOnHover),
    );
  }

  /**
   * Update the pause on click of the marquee setting the data attribute 'data-pause-on-click'.
   */
  updatePauseOnClick(): void {
    const { pauseOnClick, renderer, marqueeInnerElement } =
      this._marqueeComponent;
    renderer.setAttribute(
      marqueeInnerElement,
      'data-pause-on-click',
      String(pauseOnClick),
    );
  }

  constructor(
    private _reducedMotionService: ReducedMotionService,
    private _marqueeDuplicationService: MarqueeDuplicationService,
  ) {}

  /**
   * Private reference to the marquee component instance.
   */
  private _marqueeComponent!: MarqueeModel;

  private _currentNumberOfMarqueeItems = 0;

  /**
   * Update the percentage of the marquee translation setting the CSS property '--_move-percentage'.
   * @param value - The value of the percentage.
   * @param sign - The sign of the percentage.
   */
  private _updateMovePercentage(value: number, sign = '-'): void {
    const { marqueeInnerElement, renderer } = this._marqueeComponent;
    renderer.setStyle(
      marqueeInnerElement,
      '--_move-percentage',
      `${sign}${value}%`,
      RendererStyleFlags2.DashCase,
    );
  }

  /**
   * Update the number of marquee items setting the CSS property '--_number-of-marquee-items'
   * This is done in order to calculate speed from the predefined CSS calculation.
   */
  private _updateNumberOfMarqueeItems(): void {
    const { marqueeInnerElement, renderer, numberOfMarqueeItems } =
      this._marqueeComponent;
    this._currentNumberOfMarqueeItems = numberOfMarqueeItems;
    renderer.setStyle(
      marqueeInnerElement,
      '--_number-of-marquee-items',
      String(numberOfMarqueeItems),
      RendererStyleFlags2.DashCase,
    );
  }

  /**
   * Update the mask of the marquee from start to end percentages.
   */
  private _updateMaskFromStartToEndPercentage(): void {
    const { maskStartPercentage, maskEndPercentage, marqueeElement, renderer } =
      this._marqueeComponent;
    renderer.setStyle(
      marqueeElement,
      '--_mask-start-percentage',
      `${maskStartPercentage}%`,
      RendererStyleFlags2.DashCase,
    );
    renderer.setStyle(
      marqueeElement,
      '--_mask-end-percentage',
      `${maskEndPercentage}%`,
      RendererStyleFlags2.DashCase,
    );
  }

  /**
   * Update the mask of the marquee from percentage.
   */
  private _updateMaskFromPercentage(): void {
    const { maskPercentage, marqueeElement, renderer } = this._marqueeComponent;
    renderer.setStyle(
      marqueeElement,
      '--_mask-start-percentage',
      `${maskPercentage}%`,
      RendererStyleFlags2.DashCase,
    );
    renderer.setStyle(
      marqueeElement,
      '--_mask-end-percentage',
      `${maskPercentage}%`,
      RendererStyleFlags2.DashCase,
    );
  }

  private _hasInputChange(changes: SimpleChanges, key: string): boolean {
    return (
      changes[key] &&
      !changes[key].firstChange &&
      changes[key].currentValue !== changes[key].previousValue
    );
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
    const marqueeItemsChunk = marqueeItemsArray.slice(
      originalMarqueeItems.length,
      2 * originalMarqueeItems.length,
    );
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
