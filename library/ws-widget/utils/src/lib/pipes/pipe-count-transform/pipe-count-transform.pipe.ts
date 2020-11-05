import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'pipeCountTransform',
})
export class PipeCountTransformPipe implements PipeTransform {

  transform(value: number): string {
    const thousand = 1000
    const million = 1000000
    if (value > 0) {
      if (value < thousand) {
        return String(value)
      }
      if (value >= thousand && value < million) {
        const views = (value / thousand).toFixed(1)
        if (views.endsWith('0')) {
          return `${views.split('.')[0]}K`
        }
        return `${views}K`
      }
      {
        const views = (value / million).toFixed(1)
        if (views.endsWith('0')) {
          return `${views.split('.')[0]}M`
        }
        return `${views}M`
      }
    }
    return '0'
  }
}
