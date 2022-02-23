import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class DiscussUtilsService {
  discussionCnfig: any

  constructor() { }

  /*Get color Hex code by passing a string*/
  stringToColor(str: string) {
    let hash = 0
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < str.length; i++) {
      // tslint:disable-next-line: no-bitwise
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash % 360)
    // tslint:disable-next-line: prefer-template
    const colour = 'hsl(' + hue + ',100%,30%)'
    // tslint:disable-next-line: prefer-template
    // const colour = 'hsl(' + hue + ',100%,80%)'
    return colour
  }

  /*Get text contrast by passing background hex color*/
  getContrast(_hexcolor: any) {
    // right now going with harcoded approach
    // const r = parseInt(hexcolor.substr(1, 2), 16)
    // const g = parseInt(hexcolor.substr(3, 2), 16)
    // const b = parseInt(hexcolor.substr(5, 2), 16)
    // const color = ((r * 299) + (g * 587) + (b * 114)) / 1000
    // return (color >= 160) ? '#000000' : '#ffffff'
    return 'rgba(255, 255, 255, 80%)'
  }

  setDiscussionConfig(config: any) {
    this.discussionCnfig = config
  }

  getDiscussionConfig() {
    return this.discussionCnfig
  }
}
