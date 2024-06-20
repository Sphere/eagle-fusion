// window.service.ts
import { Injectable } from '@angular/core'

function _window(): any {
  return window
}

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  get nativeWindow(): any {
    return _window()
  }
}
