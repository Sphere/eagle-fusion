import { WindowRef } from './WindowRef'

export class BrowserWindowRef extends WindowRef {
  constructor() {
    super()
  }

  get nativeWindow(): Window | Object {
    return window
  }
}
