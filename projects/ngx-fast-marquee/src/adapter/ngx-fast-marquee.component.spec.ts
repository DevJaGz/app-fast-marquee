import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Direction, MarqueeEngine, Speed } from '../core';
import { NgxFastMarqueeComponent } from './ngx-fast-marquee.component';
import { NgxFastMarqueeModule } from './ngx-fast-marquee.module';

const settle = async (fixture: ComponentFixture<unknown>) => {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise(resolve => setTimeout(resolve, 50));
  fixture.detectChanges();
};

const marqueeHost = (fixture: ComponentFixture<unknown>) =>
  fixture.nativeElement.querySelector('ngx-fast-marquee') as HTMLElement;

const marqueeInner = (fixture: ComponentFixture<unknown>) =>
  fixture.nativeElement.querySelector('.ngx-fast-marquee__inner') as HTMLElement;

/**
 * Test hosts are deliberately `Default` change detection, not `OnPush` — this exercises
 * `NgxFastMarqueeComponent`'s own `OnPush` behavior as the child under test, while avoiding an
 * unrelated Angular 12 TestBed limitation where a fixture whose *root* view is itself `OnPush`
 * doesn't reliably re-check on a second `detectChanges()` call for a plain property mutation
 * (confirmed in isolation against a trivial unrelated component; unaffected by the Angular 12.0.x
 * → 12.2.x patch range). Production consumers are unaffected: their own root is whatever change
 * detection strategy their app uses, and `NgxFastMarqueeComponent` itself stays `OnPush`.
 */
@Component({
  template: `
    <ngx-fast-marquee
      style="width: 1px; display: block"
      [direction]="direction"
      [speed]="speed"
      [useSystemReducedMotion]="useSystemReducedMotion"
      [autoFill]="autoFill"
      [maskStartPercentage]="maskStartPercentage"
      [maskEndPercentage]="maskEndPercentage"
      [maskPercentage]="maskPercentage"
      [play]="play"
      [pauseOnHover]="pauseOnHover"
      [pauseOnClick]="pauseOnClick"
      (mounted)="mountedCount = mountedCount + 1"
      (updated)="updatedCount = updatedCount + 1">
      <div class="item">One</div>
      <div class="item">Two</div>
    </ngx-fast-marquee>
  `,
})
class RawHostComponent {
  direction: Direction = 'left';
  speed: Speed = 'medium';
  useSystemReducedMotion = false;
  autoFill = true;
  maskStartPercentage = 0;
  maskEndPercentage = 0;
  maskPercentage = 0;
  play = true;
  pauseOnHover = false;
  pauseOnClick = false;
  mountedCount = 0;
  updatedCount = 0;
}

@Component({
  template: `
    <ngx-fast-marquee style="width: 1px; display: block" [direction]="'right'" [speed]="'slow'">
      <div class="module-item">Module item</div>
    </ngx-fast-marquee>
  `,
})
class ModuleHostComponent {}

describe('NgxFastMarqueeComponent', () => {
  it('raw component declaration (no NgxFastMarqueeModule) renders the marquee', async () => {
    TestBed.configureTestingModule({
      declarations: [RawHostComponent, NgxFastMarqueeComponent],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(RawHostComponent);
    await settle(fixture);

    expect(marqueeHost(fixture)).toBeTruthy();
    expect(marqueeInner(fixture)).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.item:not([aria-hidden="true"])').length).toBe(2);
    expect(marqueeHost(fixture).getAttribute('data-masked')).toBe('false');
    fixture.destroy();
  });

  it('NgxFastMarqueeModule import renders the marquee', async () => {
    TestBed.configureTestingModule({
      declarations: [ModuleHostComponent],
      imports: [NgxFastMarqueeModule],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(ModuleHostComponent);
    await settle(fixture);

    expect(marqueeHost(fixture)).toBeTruthy();
    expect(marqueeInner(fixture)).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.module-item')).toBeTruthy();
    fixture.destroy();
  });

  describe('with the raw component declaration', () => {
    let fixture: ComponentFixture<RawHostComponent>;
    let host: RawHostComponent;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        declarations: [RawHostComponent, NgxFastMarqueeComponent],
      });
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(RawHostComponent);
      host = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('template surface parity: every binding lands on the DOM', async () => {
      host.direction = 'right';
      host.speed = 'fast';
      host.play = false;
      host.pauseOnHover = true;
      host.pauseOnClick = true;
      host.autoFill = false;
      host.maskPercentage = 40;
      host.maskStartPercentage = 10;
      await settle(fixture);

      const marqueeHostEl = marqueeHost(fixture);
      const marqueeInnerEl = marqueeInner(fixture);

      expect(marqueeHostEl.getAttribute('data-direction')).toBe('right');
      expect(marqueeHostEl.getAttribute('data-animated')).toBe('true');
      expect(marqueeHostEl.getAttribute('data-use-system-reduced-motion')).toBe('false');
      expect(marqueeHostEl.style.getPropertyValue('--_mask-start-percentage')).toBe('10%');
      expect(marqueeHostEl.style.getPropertyValue('--_mask-end-percentage')).toBe('40%');
      expect(marqueeHostEl.getAttribute('data-masked')).toBe('true');

      expect(marqueeInnerEl.getAttribute('data-speed')).toBe('fast');
      expect(marqueeInnerEl.getAttribute('data-pause-on-hover')).toBe('true');
      expect(marqueeInnerEl.getAttribute('data-pause-on-click')).toBe('true');
      expect(marqueeInnerEl.style.getPropertyValue('--_animation-play-state')).toBe('paused');
      expect(marqueeHostEl.getAttribute('data-auto-fill')).toBe('false');
    });

    it('numeric speed removes the qualitative data-speed attribute', async () => {
      host.speed = 200;
      await settle(fixture);
      expect(marqueeInner(fixture).getAttribute('data-speed')).toBeNull();

      host.play = true;
      await settle(fixture);
      expect(marqueeInner(fixture).style.getPropertyValue('--_animation-play-state')).toBe('running');

      host.speed = 0;
      await settle(fixture);
      expect(marqueeInner(fixture).style.getPropertyValue('--_animation-play-state')).toBe('paused');
    });

    it('post-init input changes apply live', async () => {
      await settle(fixture);

      host.direction = 'up';
      host.maskPercentage = 30;
      await settle(fixture);

      expect(marqueeHost(fixture).getAttribute('data-direction')).toBe('up');
      expect(marqueeHost(fixture).style.getPropertyValue('--_mask-start-percentage')).toBe('30%');
      expect(marqueeHost(fixture).getAttribute('data-masked')).toBe('true');
    });

    it('mounted emits exactly once', async () => {
      await settle(fixture);
      expect(host.mountedCount).toBe(1);

      await settle(fixture);
      await settle(fixture);
      expect(host.mountedCount).toBe(1);
    });

    it('creating the fixture performs no DOM measurement before the first change detection', () => {
      const rectSpy = spyOn(Element.prototype, 'getBoundingClientRect').and.callThrough();
      expect(rectSpy).not.toHaveBeenCalled();
    });

    it('an input change schedules exactly one engine replan', async () => {
      const replanSpy = spyOn(MarqueeEngine.prototype, 'requestReplan').and.callThrough();
      await settle(fixture);
      // ResizeObserver fires a mandatory first notification after .observe() regardless of an
      // actual resize, debounced 50ms by the engine — wait it out before establishing baseline so
      // it isn't miscounted against the input-driven replan below.
      await new Promise(resolve => setTimeout(resolve, 100));

      replanSpy.calls.reset();
      host.autoFill = false;
      // A single detectChanges() commits the ngOnChanges-driven replan once; settle()'s extra
      // trailing detectChanges() (needed elsewhere to observe async engine state) would otherwise
      // re-diff the same already-committed change here.
      fixture.detectChanges();
      await fixture.whenStable();

      expect(replanSpy).toHaveBeenCalledTimes(1);
    });

    it('no repeated-change-detection error on back-to-back detectChanges calls', async () => {
      await settle(fixture);

      host.direction = 'down';
      host.speed = 'slow';
      host.play = false;
      host.maskPercentage = 25;
      host.autoFill = false;

      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('pure-visual input changes do not emit updated', async () => {
      await settle(fixture);
      const baseline = host.updatedCount;

      host.play = false;
      await settle(fixture);
      host.maskPercentage = 50;
      await settle(fixture);
      host.pauseOnHover = true;
      await settle(fixture);
      host.speed = 'fast';
      await settle(fixture);

      expect(host.updatedCount).toBe(baseline);
    });
  });
});
