import { Injectable, ErrorHandler } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlingService implements ErrorHandler {

  constructor() { }

  handleError(error: any): void {
    const msg: string = error?.message || ''
    if (/ChunkLoadError/.test(msg)) {
      const reloadKey = 'chunk_reload_attempted'
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1')
        window.location.reload()
      } else {
        sessionStorage.removeItem(reloadKey)
        window.location.href = '/'
      }
    } else if (/NG0100/.test(msg) && /DiscussAllComponent/.test(msg)) {
      // NG0100 inside the discussions-ui-v8 package — dev-mode-only, safe to ignore
    } else {
      throw error
    }
  }
}
