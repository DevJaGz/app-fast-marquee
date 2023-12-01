import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';
import { BrandCardComponent } from './components/brand-card/brand-card.component';
import { BRAND_IMAGES } from '@core';
import { FileNamePipe } from '../../pipes';

@Component({
  selector: 'app-marquee-brand-images',
  standalone: true,
  imports: [
    CommonModule,
    NgxFastMarqueeModule,
    BrandCardComponent,
    FileNamePipe,
  ],
  providers: [FileNamePipe],
  templateUrl: './marquee-brand-images.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeBrandImagesComponent {
  fileNamePipe = inject(FileNamePipe);
  brandImages: WritableSignal<string[]> = signal(BRAND_IMAGES);
  brandImageNames = this.brandImages().map((brandImage) =>
    this.fileNamePipe.transform(brandImage),
  );
}
