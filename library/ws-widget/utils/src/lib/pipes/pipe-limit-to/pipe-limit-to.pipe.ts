import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'pipeLimitTo',
})
export class PipeLimitToPipe implements PipeTransform {

  transform(data: any, limit: number = 5): any {
    if (!data || !data.length) {
      return null
    }
    if (Array.isArray(data)) {
      return data.slice(0, limit)
    }
    if (typeof data === 'string') {
      const slicedString = data.substr(0, limit)
      if (limit < data.length) {
        return `${slicedString}...`
      }
      return slicedString
    }
    return null
  }

}
