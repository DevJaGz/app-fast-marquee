import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
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

@Component({
  imports: [NgxFastMarqueeComponent],
  template: `
    <ngx-fast-marquee
      [direction]="direction()"
      [speed]="speed()"
      [useSystemReducedMotion]="useSystemReducedMotion()"
      [autoFill]="autoFill()"
      [maskStartPercentage]="maskStartPercentage()"
      [maskEndPercentage]="maskEndPercentage()"
      [maskPercentage]="maskPercentage()"
      [play]="play()"
      [pauseOnHover]="pauseOnHover()"
      [pauseOnClick]="pauseOnClick()"
      (mounted)="mountedCount.set(mountedCount() + 1)"
      (updated)="updatedCount.set(updatedCount() + 1)">
      <div class="item">One</div>
      <div class="item">Two</div>
    </ngx-fast-marquee>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StandaloneHostComponent {
  readonly direction = signal<Direction>('left');
  readonly speed = signal<Speed>('medium');
  readonly useSystemReducedMotion = signal(false);
  readonly autoFill = signal(true);
  readonly maskStartPercentage = signal(0);
  readonly maskEndPercentage = signal(0);
  readonly maskPercentage = signal(0);
  readonly play = signal(true);
  readonly pauseOnHover = signal(false);
  readonly pauseOnClick = signal(false);
  readonly mountedCount = signal(0);
  readonly updatedCount = signal(0);
}

@Component({
  imports: [NgxFastMarqueeModule],
  template: `
    <ngx-fast-marquee [direction]="'right'" [speed]="'slow'">
      <div class="module-item">Module item</div>
    </ngx-fast-marquee>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ModuleHostComponent {}

describe('NgxFastMarqueeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('standalone direct import renders the marquee', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(StandaloneHostComponent);
    await settle(fixture);

    expect(marqueeHost(fixture)).toBeTruthy();
    expect(marqueeInner(fixture)).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.item')).toHaveLength(2);
    expect(marqueeHost(fixture).getAttribute('data-masked')).toBe('false');
  });

  it('NgxFastMarqueeModule import renders the marquee', async () => {
    TestBed.configureTestingModule({
      imports: [ModuleHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(ModuleHostComponent);
    await settle(fixture);

    expect(marqueeHost(fixture)).toBeTruthy();
    expect(marqueeInner(fixture)).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.module-item')).toBeTruthy();
  });

  it('template surface parity: every binding lands on the DOM', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(StandaloneHostComponent);
    const host = fixture.componentInstance;
    host.direction.set('right');
    host.speed.set('fast');
    host.play.set(false);
    host.pauseOnHover.set(true);
    host.pauseOnClick.set(true);
    host.autoFill.set(false);
    host.maskPercentage.set(40);
    host.maskStartPercentage.set(10);
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
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(StandaloneHostComponent);
    const host = fixture.componentInstance;

    host.speed.set(200);
    await settle(fixture);
    expect(marqueeInner(fixture).getAttribute('data-speed')).toBeNull();

    host.play.set(true);
    await settle(fixture);
    expect(marqueeInner(fixture).style.getPropertyValue('--_animation-play-state')).toBe('running');

    host.speed.set(0);
    await settle(fixture);
    expect(marqueeInner(fixture).style.getPropertyValue('--_animation-play-state')).toBe('paused');
  });

  it('post-init input changes apply live', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(StandaloneHostComponent);
    const host = fixture.componentInstance;
    await settle(fixture);

    host.direction.set('up');
    host.maskPercentage.set(30);
    await settle(fixture);

    expect(marqueeHost(fixture).getAttribute('data-direction')).toBe('up');
    expect(marqueeHost(fixture).style.getPropertyValue('--_mask-start-percentage')).toBe('30%');
    expect(marqueeHost(fixture).getAttribute('data-masked')).toBe('true');
  });

  it('mounted emits exactly once', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(StandaloneHostComponent);
    const host = fixture.componentInstance;
    await settle(fixture);

    expect(host.mountedCount()).toBe(1);

    await settle(fixture);
    await settle(fixture);
    expect(host.mountedCount()).toBe(1);
  });

  it('construction performs no DOM measurement before afterNextRender', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect');
    try {
      const fixture = TestBed.createComponent(StandaloneHostComponent);
      expect(rectSpy).not.toHaveBeenCalled();

      await settle(fixture);
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('an input change schedules exactly one engine replan', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const replanSpy = vi.spyOn(MarqueeEngine.prototype, 'requestReplan');
    try {
      const fixture = TestBed.createComponent(StandaloneHostComponent);
      const host = fixture.componentInstance;
      await settle(fixture);

      replanSpy.mockClear();
      host.autoFill.set(false);
      await settle(fixture);

      expect(replanSpy).toHaveBeenCalledTimes(1);
    } finally {
      replanSpy.mockRestore();
    }
  });

  it('no ExpressionChangedAfterItHasBeenChecked-style error on repeated change detection', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(StandaloneHostComponent);
    const host = fixture.componentInstance;
    await settle(fixture);

    host.direction.set('down');
    host.speed.set('slow');
    host.play.set(false);
    host.maskPercentage.set(25);
    host.autoFill.set(false);

    expect(() => {
      fixture.detectChanges();
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('pure-visual input changes do not emit updated', async () => {
    TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(StandaloneHostComponent);
    const host = fixture.componentInstance;
    await settle(fixture);

    const baseline = host.updatedCount();

    host.play.set(false);
    await settle(fixture);
    host.maskPercentage.set(50);
    await settle(fixture);
    host.pauseOnHover.set(true);
    await settle(fixture);
    host.speed.set('fast');
    await settle(fixture);

    expect(host.updatedCount()).toBe(baseline);
  });
});
