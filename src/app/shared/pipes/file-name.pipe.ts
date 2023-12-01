import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName',
  standalone: true,
})
export class FileNamePipe implements PipeTransform {
  transform(path: string): string {
    const fileNameWithExt = path.split('/').pop();
    return fileNameWithExt?.split('.').shift() || '';
  }
}
