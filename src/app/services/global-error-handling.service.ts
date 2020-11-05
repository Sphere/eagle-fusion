import { Injectable, ErrorHandler } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlingService implements ErrorHandler {

  constructor() { }

  handleError(error: any): void {
    const chunkFailedMessage = /ChunkLoadError/
    if (chunkFailedMessage.test(error.message)) {
      window.location.reload()
    } else {
      throw error
    }
  }
}
