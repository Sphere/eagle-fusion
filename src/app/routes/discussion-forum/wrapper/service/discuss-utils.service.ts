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
    return colour
  }

  /*Get text contrast by passing background hex color*/
  getContrast(_hexcolor: any) {
    // right now going with harcoded approach
    return 'rgba(255, 255, 255, 80%)'
  }

  setDiscussionConfig(config: any) {
    this.discussionCnfig = config
  }

  getDiscussionConfig() {
    return this.discussionCnfig
  }
}
