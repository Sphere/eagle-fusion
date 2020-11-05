import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { LoggerService } from '@ws-widget/utils'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/public-api'

@Component({
  selector: 'viewer-plugin-iap',
  templateUrl: './iap.component.html',
  styleUrls: ['./iap.component.scss'],
})
export class IapComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() iapContent: NsContent.IContent | null = null
  iframeUrl: SafeResourceUrl | null = null
  proctoringWarning = false
  proctoringStarted = false
  constructor(
    private domSanitizer: DomSanitizer,
    private logger: LoggerService,
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    window.addEventListener('message', event => {
      if (!event.data) {
        this.logger.log('data unavailable')
        return
      }
      if (event.data.functionToExecute && event.data.functionToExecute === 'turnOnProctoring') {
        this.turnOnProctoring()
        this.proctoringStarted = true
      } else if (event.data.functionToExecute && event.data.functionToExecute === 'turnOffProctoring') {
        this.turnOffProctoring()
        this.proctoringStarted = false
      }
    })
  }
  ngOnChanges() {
    // //console.log(this.iapContent)
    if (this.iapContent && this.iapContent.artifactUrl) {
      this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.iapContent.artifactUrl)
    } else {
      this.iframeUrl = null
    }
  }
  ngOnDestroy() {
    if (this.proctoringStarted) {
      this.turnOffProctoring()
    }
  }

  private turnOnProctoring() {
    this.sendProctoringInfo('none')
    this.sendProctoringInfo('fullScreen')

    window.addEventListener('contextmenu', this.contextCheck)
    window.addEventListener('beforeunload', this.beforeUnload)
    window.addEventListener('keydown', this.keydownCheck)
    document.body.addEventListener('copy', this.copyCheck)
    document.body.addEventListener('cut', this.cutCheck)
    document.body.addEventListener('paste', this.pasteCheck)
    document.addEventListener('visibilitychange', this.visibilityCheck)
    document.addEventListener('webkitfullscreenchange', this.fullscreenCheck, false)
    document.addEventListener('mozfullscreenchange', this.fullscreenCheck, false)
    document.addEventListener('msfullscreenchange', this.fullscreenCheck, false)
    document.addEventListener('fullscreenchange', this.fullscreenCheck, false)
  }

  private sendProctoringInfo(event: string) {
    const iframeElem = (document.getElementById('iap-iframe') as HTMLIFrameElement).contentWindow
    const dataToSend = {
      proctoring: event,
    }
    if (iframeElem) {
      iframeElem.postMessage(dataToSend, '*')
    }
    // //console.log('event at posting:', event);
    if (event === 'esc' || event === 'fullScreen') {
      // //console.log('PROCTORING WARNING TURNED ON');
      this.proctoringWarning = true
    }
  }

  enterFullScreen() {
    this.proctoringWarning = false
    const elem = document.getElementById('iap-iframe')
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen()
      }
    }
  }

  private exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen()
    }
  }

  private turnOffProctoring() {
    // //console.log('turnOffProctoring called')
    window.removeEventListener('contextmenu', this.contextCheck)
    window.removeEventListener('beforeunload', this.beforeUnload)
    window.removeEventListener('keydown', this.keydownCheck)
    document.body.removeEventListener('copy', this.copyCheck)
    document.body.removeEventListener('cut', this.cutCheck)
    document.body.removeEventListener('paste', this.pasteCheck)
    document.removeEventListener('visibilitychange', this.visibilityCheck)
    document.removeEventListener('webkitfullscreenchange', this.fullscreenCheck)
    document.removeEventListener('fullscreenchange', this.fullscreenCheck)
    document.removeEventListener('mozfullscreenchange', this.fullscreenCheck)
    document.removeEventListener('msfullscreenchange', this.fullscreenCheck)

    // if (document.webkitExitFullscreen) {
    //   document.webkitExitFullscreen();
    // }
    // if (document.exitFullscreen) {
    //   document.exitFullscreen();
    // }
    this.exitFullscreen()
    this.proctoringWarning = false
  }

  contextCheck = (e: { preventDefault: () => void }) => {
    this.sendProctoringInfo('rightClick')
    e.preventDefault()
  }
  beforeUnload = (e: { returnValue: string }) => {
    this.sendProctoringInfo('beforeunload')
    e.returnValue = 'You are not allowed to close window.'
  }
  visibilityCheck = () => {
    this.logger.log('document.visibilityState >', document.visibilityState)
    this.sendProctoringInfo('visibilitychange')
  }
  fullscreenCheck = () => {
    // //console.log('FS called');
    this.sendProctoringInfo('fullScreen')
  }
  keydownCheck = (e: KeyboardEvent) => {
    // //console.log('key pressed e >', e)
    if (e.altKey) {
      this.sendProctoringInfo('alt')
      e.preventDefault()
    } else if (e.ctrlKey) {
      this.sendProctoringInfo('ctrl')
      e.preventDefault()
    } else if (e.key === 'tab') {
      this.sendProctoringInfo('tab')
      e.preventDefault()
    } else if (e.key === 'esc') {
      this.sendProctoringInfo('esc')
      e.preventDefault()
    } else if (e.key === 'window') {
      this.sendProctoringInfo('window')
      e.preventDefault()
    } else if (e.key === 'f1') {
      this.sendProctoringInfo('f1')
      e.preventDefault()
    } else if (e.key === 'f8') {
      this.sendProctoringInfo('f8')
      e.preventDefault()
    } else if (e.key === 'f12') {
      this.sendProctoringInfo('f12')
      e.preventDefault()
    }
    // else if (e.keyCode === 9) {
    //   this.sendProctoringInfo('tab')
    //   e.preventDefault()
    // } else if (e.keyCode === 27) {
    //   this.sendProctoringInfo('esc')
    //   e.preventDefault()
    // } else if (e.keyCode === 91) {
    //   this.sendProctoringInfo('window')
    //   e.preventDefault()
    // } else if (e.keyCode === 112) {
    //   this.sendProctoringInfo('f1')
    //   e.preventDefault()
    // } else if (e.keyCode === 119) {
    //   this.sendProctoringInfo('f8')
    //   e.preventDefault()
    // } else if (e.keyCode === 123) {
    //   this.sendProctoringInfo('f12')
    //   e.preventDefault()
    // }
  }

  copyCheck = (e: { preventDefault: () => void }) => {
    this.sendProctoringInfo('copy')
    e.preventDefault()
  }
  cutCheck = (e: { preventDefault: () => void }) => {
    this.sendProctoringInfo('cut')
    e.preventDefault()
  }
  pasteCheck = (e: { preventDefault: () => void }) => {
    this.sendProctoringInfo('paste')
    e.preventDefault()
  }
}
