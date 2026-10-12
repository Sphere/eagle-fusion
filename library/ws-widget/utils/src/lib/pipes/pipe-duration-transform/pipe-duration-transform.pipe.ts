import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    standalone: false,
    name: 'pipeDurationTransform',
    
})
export class PipeDurationTransformPipe implements PipeTransform {

  transform(data: number, type: 'time24' | 'hms' | 'hour' | 'mnts'): any {
    if (data <= 0) {
      return ''
    }
    const h = Math.floor(data / 3600)
    const m = Math.floor((data % 3600) / 60)
    const s = Math.floor((data % 3600) % 60)

    switch (type) {
      case 'time24':
        return this.defaultDuration(h, m, s)
      case 'mnts':
        return this.mntsDuration(h, m, s)
      case 'hms':
        return this.hmsDuration(h, m, s)
      case 'hour':
        return this.hourDuration(h)
      default:
        return this.defaultDuration(h, m, s)
    }
  }

  private mntsDuration(h: number, m: number, s: number): string {
    let duration = ''
    let space = ''
    if (h > 0) {
      duration += `${h}`
    }
    if (m > 0) {
      if (h > 0) {
        space = ' '
      }
      duration += `${space}${m}`
    }
    if (s > 0 && h === 0) {
      if (m > 0) {
        space = ' '
      }
      duration += `${space}${s}`
    }
    return duration
  }

  private hmsDuration(h: number, m: number, s: number): string {
    let duration = ''
    let space = ''
    if (h > 0) {
      duration += `${h}h`
    }
    if (m > 0) {
      if (h > 0) {
        space = ' '
      }
      duration += `${space}${m}m`
    }
    if (s > 0 && h === 0) {
      if (m > 0) {
        space = ' '
      }
      duration += `${space}${s}s`
    }
    return duration
  }

  private hourDuration(h: number): string {
    if (h === 0) {
      return 'less than an hour'
    }
    if (h === 1) {
      return `${h} hour`
    }
    if (h > 1) {
      return `${h} hours`
    }
    return ''
  }

  defaultDuration(h: number, m: number, s: number) {
    let duration = ''
    duration += h > 0 ? `${h.toString().padStart(2)}:` : ''
    duration += m > 0 ? `${m.toString().padStart(2)}:` : '00:'
    duration += s > 0 ? s.toString().padStart(2) : '00'
    return duration
  }

}
