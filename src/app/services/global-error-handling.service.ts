import { Injectable, ErrorHandler } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlingService implements ErrorHandler {

  constructor() { }

  handleError(error: any): void {
    const chunkFailedMessage = /ChunkLoadError/
    if (chunkFailedMessage.test(error.message)) {
      const reloadKey = 'chunk_reload_attempted'
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1')
        window.location.reload()
      } else {
        // Already tried reloading — clear the flag and navigate to root to avoid loop
        sessionStorage.removeItem(reloadKey)
        window.location.href = '/'
      }
    } else {
      throw error
    }
  }
}
