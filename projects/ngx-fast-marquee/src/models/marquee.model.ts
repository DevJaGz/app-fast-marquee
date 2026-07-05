import { Renderer2, Signal } from '@angular/core';
import { Direction, Speed } from '../types';

export abstract class MarqueeModel {
  abstract speed: Signal<Speed>;
  abstract direction: Signal<Direction>;
  abstract autoFill: Signal<boolean>;
  abstract useSystemReducedMotion: Signal<boolean>;
  abstract maskStartPercentage: Signal<number>;
  abstract maskEndPercentage: Signal<number>;
  abstract maskPercentage: Signal<number>;
  abstract pauseOnHover: Signal<boolean>;
  abstract pauseOnClick: Signal<boolean>;
  abstract play: Signal<boolean>;
  abstract renderer: Renderer2;
  abstract marqueeItems: HTMLCollection;
  abstract get marqueeElement(): HTMLElement;
  abstract get marqueeInnerElement(): HTMLElement;
  abstract get numberOfMarqueeItems(): number;
}
