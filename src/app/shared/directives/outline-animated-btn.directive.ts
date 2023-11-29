import {
  Directive,
  HostListener,
  Renderer2,
  RendererStyleFlags2,
} from '@angular/core';

@Directive({
  selector: 'button a [appOutlineAnimatedBtn]',
  standalone: true,
})
export class OutlineAnimatedBtnDirective {
  constructor(private _renderer: Renderer2) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLButtonElement;
    const x = event.offsetX - target.offsetLeft;
    const y = event.offsetY - target.offsetTop;
    this._renderer.setStyle(
      target,
      '--_outline-animated-btn-x',
      `${x}px`,
      RendererStyleFlags2.DashCase,
    );
    this._renderer.setStyle(
      target,
      '--_outline-animated-btn-y',
      `${y}px`,
      RendererStyleFlags2.DashCase,
    );
  }
}
