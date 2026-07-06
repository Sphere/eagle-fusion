import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    standalone: false,
    name: 'pipeHtmlTagRemoval',
    
})
export class PipeHtmlTagRemovalPipe implements PipeTransform {

  transform(htmlString: string): string {
    return htmlString ? String(htmlString).replace(/<[^>]+>/gm, '') : ''
  }

}
