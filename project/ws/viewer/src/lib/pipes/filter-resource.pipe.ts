import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    standalone: false,
    name: 'filterResource',
    
})
export class FilterResourcePipe implements PipeTransform {

  transform(resourcesList: any, searchCourseQuery: string): any {
    const filteredResources = resourcesList.filter(
      (playlist: { name: string; }) =>
        playlist.name.toLowerCase().includes((searchCourseQuery || '').toLowerCase()),
    )

    return filteredResources.length ? filteredResources : undefined
  }

}
