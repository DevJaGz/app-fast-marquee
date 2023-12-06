import { Renderer2 } from '@angular/core';
import { Direction, Speed } from '../types';

export abstract class MarqueeModel {
  abstract speed: Speed;
  abstract direction: Direction;
  abstract autoFill: boolean;
  abstract useSystemReducedMotion: boolean;
  abstract maskStartPercentage: number;
  abstract maskEndPercentage: number;
  abstract maskPercentage: number;
  abstract pauseOnHover: boolean;
  abstract pauseOnClick: boolean;
  abstract play: boolean;
  abstract renderer: Renderer2;
  abstract marqueeItems: HTMLCollection;
  abstract get marqueeElement(): HTMLElement;
  abstract get marqueeInnerElement(): HTMLElement;
  abstract get numberOfMarqueeItems(): number;
}
