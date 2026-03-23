import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { LoggerService } from '../../../../../library/ws-widget/utils/src/public-api'

@Injectable({
  providedIn: 'root'
})
export class ScreenSecurityService {

  private _isBlocked = new BehaviorSubject<boolean>(false)
  isBlocked$ = this._isBlocked.asObservable()
  isModalOpen = false

  constructor(
    private logger: LoggerService
  ) { }

  init() {
    document.addEventListener('visibilitychange', () => {
      this.logger.log("visibilitychange", event, document.hidden)
      if (this.isModalOpen) {
        if (document.hidden) this.block('Tab switch')
      }
    })

    window.addEventListener('blur', () => {
      this.logger.log("blur")
      this.block('Window blur')
    })
    window.addEventListener('focus', () => {
      this.logger.log("focus")
      this.unblock()
    })
    this.detectDevTools()
  }

  handleContextMenu = (event: MouseEvent) => {
    if (this.isModalOpen) {
      event.preventDefault()
      alert('Right-click is disabled while the modal is open.')
    } else {
      this.logger.log('Right-click detected')
    }
  }

  handleKeydown = (event: KeyboardEvent) => {
    const isPrintScreen = event.key === 'PrintScreen'

    const isMacScreenshot =
      event.metaKey && event.shiftKey

    const isDevToolsShortcut =
      (event.metaKey && event.key.toLowerCase() === 's') ||
      (event.metaKey && event.key.toLowerCase() === 'r')

    if (this.isModalOpen) {
      if (isPrintScreen || isMacScreenshot || isDevToolsShortcut) {
        event.preventDefault()
        this.block('Screen recording shortcut')
        setTimeout(() => {
          this.unblock()
        }, 2000)
      }
    } else {
      this.logger.log(`Key pressed: ${event.key}`)
    }
  }

  block(reason: string) {
    this.logger.log('Blocked:', reason)
    this._isBlocked.next(true)
  }

  unblock() {
    this.logger.log("unblock")
    this._isBlocked.next(false)
  }

  // Add event listeners dynamically
  openModal = () => {
    this.isModalOpen = true
    document.addEventListener('contextmenu', this.handleContextMenu)
    document.addEventListener('keydown', this.handleKeydown)
  }

  closeModal = () => {
    this.isModalOpen = false
    document.removeEventListener('contextmenu', this.handleContextMenu)
    document.removeEventListener('keydown', this.handleKeydown)
  }

  private detectDevTools() {
    this.logger.log("detectDevTools")
    setInterval(() => {
      if (window.outerWidth - window.innerWidth > 150) {
        this.block('DevTools')
      }
    }, 1000)
  }
}
