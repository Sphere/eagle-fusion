import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    standalone: false,
    name: 'treeCatalogRoute',
    
})
export class TreeCatalogRoutePipe implements PipeTransform {

  transform(tag: string): string {
    return `/page/explore/${encodeURIComponent(tag)}`
  }

}
