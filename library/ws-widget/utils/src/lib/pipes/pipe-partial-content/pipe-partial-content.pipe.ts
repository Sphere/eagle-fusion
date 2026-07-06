import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    standalone: false,
    name: 'pipePartialContent',
    
})
export class PipePartialContentPipe implements PipeTransform {

  transform(value: any, keys: string[]): any {
    const result: { [key: string]: any } = {}
    for (const key of keys) {
      if (value[key]) {
        result[key] = value[key]
      }
    }
    return result
  }

}
