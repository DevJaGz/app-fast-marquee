import {
  AfterContentInit,
  Component,
  ElementRef,
  Renderer2,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  NgZone,
  HostListener,
  OnChanges,
  SimpleChanges,
  AfterContentChecked,
} from '@angular/core';
import { Direction, Speed } from '../../types';
import { MarqueeService } from '../../services/marquee.service';
import { MarqueeModel } from '../../models/marquee.model';
import { MarqueeDuplicationService } from '../../services/marquee-duplication.service';

@Component({
  selector: 'ngx-fast-marquee',
  templateUrl: './ngx-fast-marquee.component.html',
  styleUrls: ['./ngx-fast-marquee.component.scss'],
  providers: [MarqueeService, MarqueeDuplicationService],
})
export class NgxFastMarqueeComponent
  implements OnChanges, AfterContentInit, AfterContentChecked, MarqueeModel
{
  /**
   * Reference to the marquee inner element.
   */
  @ViewChild('marqueeInner', { static: true })
  marqueeInnerRef!: ElementRef<HTMLElement>;

  /**
   * Direction of the marquee.
   * @default 'left'
   */
  @Input()
  direction: Direction = 'left';

  /**
   * Speed of the marquee.
   * Can be qualitative as 'slow', 'medium' or 'fast' or quantitative as a number in pixels per second.
   * The quantitative speed is calculated based on the number of the marquee items.
   * @default 'medium'
   */
  @Input()
  speed: Speed = 'medium';

  /**
   * Whether to have into account the system reduced motion.
   * If true, the marquee will not be animated when the system has reduced motion.
   * @default false
   */
  @Input()
  useSystemReducedMotion = false;

  /**
   * Whether to fill the marquee with duplicated items.
   * If true, the marquee will be filled with duplicated items.
   * @default true
   */
  @Input()
  autoFill = true;

  /**
   * Start percentage of the mask.
   * Suitable Range: 0 - 100, where:
   * If direction is horizontal (left or right):
   *  - 0 is the left side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the top side of the marquee and 100 is the center of the marquee.
   * @default 0
   */
  @Input()
  maskStartPercentage!: number;

  /**
   * End percentage of the mask.
   * Suitable Range: 0 - 100, where:
   * If direction is horizontal (left or right):
   *  - 0 is the right side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the bottom side of the marquee and 100 is the center of the marquee.
   * @default 0
   */
  @Input()
  maskEndPercentage!: number;

  /**
   * Percentage of the mask.
   * Suitable Range: 0 - 100, where 0 is no mask and 100 is full mask from
   * start to center and end to the center.
   * @default 0
   */
  @Input()
  maskPercentage!: number;

  /**
   * Whether to play the marquee.
   * True to play the marquee animation, false to pause the marquee animation.
   * @default true
   */
  @Input()
  play = true;

  /**
   * Whether to pause the marquee when the mouse is over the marquee.
   * @default false
   */
  @Input()
  pauseOnHover = false;

  /**
   * Whether to pause the marquee when the mouse is clicked over the marquee.
   */
  @Input()
  pauseOnClick = false;

  /**
   * Event emitted when the marquee is mounted in the view.
   * Emitted once.
   */
  @Output()
  mounted = new EventEmitter<void>();

  /**
   * Event emitted when the marquee is mounted updated.
   * Emitted each time the marquee is updated.
   */
  @Output()
  updated = new EventEmitter<void>();

  /**
   * HTML Marquee Element.
   */
  get marqueeElement(): HTMLElement {
    return this._hostRef.nativeElement;
  }

  /**
   * HTML Marquee Inner Element.
   */
  get marqueeInnerElement(): HTMLElement {
    return this.marqueeInnerRef.nativeElement;
  }

  /**
   * Number of children inside the marquee inner element.
   */
  get numberOfMarqueeItems(): number {
    return this.marqueeInnerElement.children.length;
  }

  /**
   * Children inside the marquee inner element.
   */
  get marqueeItems(): HTMLCollection {
    return this.marqueeInnerElement.children;
  }

  constructor(
    private _hostRef: ElementRef<HTMLElement>,
    public renderer: Renderer2,
    private _marqueeService: MarqueeService,
    private _ngZone: NgZone,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this._marqueeService.updateOnInputChanges(changes);
  }

  ngAfterContentInit(): void {
    this._marqueeService.setMarqueeComponent(this);
    this.mounted.emit();
  }

  ngAfterContentChecked(): void {
    if (this._marqueeService.isMarqueeDirty()) {
      this._startMarqueeUpdeting();
    }
  }

  /**
   * Timeout to prevent the update of the marquee when the window is being resized.
   */
  private _preventUpdateOnResizingTimeout!: ReturnType<typeof setTimeout>;

  /**
   * Flag to check if the window is being resized. True if the window is being resized, false otherwise.
   */
  private _isOnResizing = false;

  /**
   * Update the marquee when the window is resized.
   */
  @HostListener('window:resize')
  private _onResize(): void {
    this._isOnResizing = true;
    this._ngZone.runOutsideAngular(() => {
      if (this._preventUpdateOnResizingTimeout) {
        clearTimeout(this._preventUpdateOnResizingTimeout);
      }
      this._preventUpdateOnResizingTimeout = setTimeout(() => {
        this._isOnResizing = false;
        this._startMarqueeUpdeting();
      }, 50);
    });
  }

  /**
   * Start the update of the marquee.
   */
  private _startMarqueeUpdeting(): void {
    if (this._isOnResizing) return;
    // TODO: Check why is needed to use a timeout here. Otherwise, the marquee is not updated at the first time.
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this._updateMarqueee();
      }, 0);
    });
  }

  private _updateMarqueee(): void {
    this._marqueeService.update();
    this.updated.emit();
  }
}
