import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'pipeHtmlTagRemoval',
})
export class PipeHtmlTagRemovalPipe implements PipeTransform {

  transform(htmlString: string): string {
    return htmlString ? String(htmlString).replace(/<[^>]+>/gm, '') : ''
  }

}
