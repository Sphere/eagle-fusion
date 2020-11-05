import { Component, Input } from '@angular/core'
// import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser'
// import { CertificationService } from './certification.service'
import { NsContent } from '@ws-widget/collection'
// import { ConfigurationsService } from '@ws-widget/utils';

@Component({
  selector: 'viewer-plugin-certification',
  templateUrl: './certification.component.html',
  styleUrls: ['./certification.component.scss'],
})
export class CertificationComponent {
  @Input() certificationContent: NsContent.IContent | null = null
  // certificateContent: NsContent.IContent | null = null
  // iframeUrl: SafeResourceUrl | null = null
  // screenSizeIssue = false
  // showPreloadMessage = false
  // startTimerSeconds = 15
  // startInterval: any
  // proctoringWarning = false
  // proctoringStarted = false
  // certificationStatus: 'loading' | 'passed' | 'eligible' | 'failed' | 'error' =
  //   'loading'
  // constructor(
  //   private domSanitizer: DomSanitizer,
  //   // private certificationSvc: CertificationService,
  // ) { }

  // ngOnChanges(changes: SimpleChanges) {
  //   for (const property in changes) {
  //     if (property === 'certificationContent' && this.certificationContent) {
  //       this.certificationStatus = 'loading'
  //       // this.certificationSvc.fetchCertifications({
  //       //   tracks: [],
  //       //   sortOrder: 'desc',
  //       // }).subscribe(data => {
  //       //     data.cannotAttemptList.forEach((certificate: { identifier: string; }) => {
  //       //       if (
  //       //         certificate.identifier ===
  //       //         (this.certificationContent && this.certificationContent.identifier)
  //       //       ) {
  //       //         this.certificationStatus = 'failed'
  //       //         this.certificateContent = this.certificationContent
  //       //         return
  //       //       }
  //       //     })
  //       //     data.passedList.forEach((certificate: { identifier: string; }) => {
  //       //       if (
  //       //         certificate.identifier ===
  //       //         (this.certificationContent && this.certificationContent.identifier)
  //       //       ) {
  //       //         this.certificationStatus = 'passed'
  //       //         this.certificateContent = this.certificationContent
  //       //         return
  //       //       }
  //       //     })
  //       //     if (
  //       //       this.certificationStatus !== 'failed' &&
  //       //       this.certificationStatus !== 'passed'
  //       //     ) {
  //       //       this.certificationStatus = 'eligible'
  //       //       this.reset()
  //       //       this.checkContainerSize()
  //       //     }
  //       //   },
  //       //   (_err: any) => {
  //       //     this.certificationStatus = 'error'
  //       //   },
  //       // )
  //     }
  //   }
  // }

  // ngAfterViewInit() {
  //   window.addEventListener('message', event => {
  //     if (!event.data) {
  //       //console.log('data unavailable')
  //       return
  //     }
  //     if (
  //       event.data.functionToExecute &&
  //       event.data.functionToExecute === 'turnOnProctoring'
  //     ) {
  //       this.turnOnProctoring()
  //       this.proctoringStarted = true
  //     } else if (
  //       event.data.functionToExecute &&
  //       event.data.functionToExecute === 'turnOffProctoring'
  //     ) {
  //       this.turnOffProctoring()
  //       this.proctoringStarted = false
  //     }
  //   })
  // }
  // ngOnDestroy() {
  //   if (this.proctoringStarted) {
  //     this.turnOffProctoring()
  //   }
  // }
  // private reset() {
  //   this.screenSizeIssue = false
  //   this.showPreloadMessage = false
  //   this.startTimerSeconds = 15

  //   this.iframeUrl = null
  // }

  // private checkContainerSize() {
  //   let elemWidth
  //   const certificationWidth = document.getElementById('certification-width')
  //   if (certificationWidth) {
  //     elemWidth = certificationWidth.offsetWidth
  //   }
  //   const screenWidth = screen.width / (elemWidth ? elemWidth : 1)
  //   let idealScreenSize
  //   try {
  //     if (this.certificationContent) {
  //       idealScreenSize =
  //         parseInt(this.certificationContent.idealScreenSize ? this.certificationContent.idealScreenSize : '', 10) || 10
  //     }
  //   } catch (e) {
  //     idealScreenSize = 10
  //   }
  //   if (screenWidth < (idealScreenSize ? idealScreenSize : 0)) {
  //     this.screenSizeIssue = true
  //   } else {
  //     this.initiateLoad()
  //   }
  // }

  // private initiateLoad() {
  //   this.showPreloadMessage = true
  //   this.startInterval = setInterval(() => {
  //     this.startTimerSeconds -= 1
  //     if (this.startTimerSeconds === 0) {
  //       clearInterval(this.startInterval)
  //       this.loadContent()
  //     }
  //   },                               1000)
  // }

  // private loadContent() {
  //   this.showPreloadMessage = false
  //   if (this.startInterval) {
  //     clearInterval(this.startInterval)
  //   }
  //   if (
  //     this.certificationContent &&
  //     this.certificationContent.artifactUrl
  //   ) {
  //     this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
  //       this.certificationContent.artifactUrl,
  //     )
  //   } else {
  //     this.iframeUrl = null
  //   }
  // }

  // private turnOnProctoring() {
  //   this.sendProctoringInfo('none')
  //   this.sendProctoringInfo('fullScreen')

  //   window.addEventListener('contextmenu', this.contextCheck)
  //   window.addEventListener('beforeunload', this.beforeUnload)
  //   window.addEventListener('keydown', this.keydownCheck)
  //   document.body.addEventListener('copy', this.copyCheck)
  //   document.body.addEventListener('cut', this.cutCheck)
  //   document.body.addEventListener('paste', this.pasteCheck)
  //   document.addEventListener('visibilitychange', this.visibilityCheck)
  //   document.addEventListener(
  //     'webkitfullscreenchange',
  //     this.fullscreenCheck,
  //     false,
  //   )
  //   document.addEventListener(
  //     'mozfullscreenchange',
  //     this.fullscreenCheck,
  //     false,
  //   )
  //   document.addEventListener(
  //     'msfullscreenchange',
  //     this.fullscreenCheck,
  //     false,
  //   )
  //   document.addEventListener('fullscreenchange', this.fullscreenCheck, false)
  // }

  // private sendProctoringInfo(event: string) {
  //   const iframeElem = (<HTMLIFrameElement>(
  //     document.getElementById('certification-iframe')
  //   )).contentWindow
  //   const dataToSend = {
  //     proctoring: event,
  //   }
  //   if (iframeElem) {
  //     iframeElem.postMessage(dataToSend, '*')
  //   }
  //   // //console.log('event at posting:', event)
  //   if (event === 'esc' || event === 'fullScreen') {
  //     this.proctoringWarning = true
  //   }
  // }

  // enterFullScreen() {
  //   this.proctoringWarning = false

  //   const elem = document.getElementById('certification-iframe')
  //   if (elem) {
  //     if (elem.requestFullscreen) {
  //       elem.requestFullscreen()
  //     } else if (elem['mozRequestFullScreen']) {
  //       /* Firefox */
  //       elem['mozRequestFullScreen']()
  //     } else if (elem['webkitRequestFullscreen']) {
  //       /* Chrome, Safari and Opera */
  //       elem['webkitRequestFullscreen']()
  //     } else if (elem['msRequestFullscreen']) {
  //       /* IE/Edge */
  //       elem['msRequestFullscreen']()
  //     }
  //   }
  // }

  // private exitFullscreen() {
  //   if (document.exitFullscreen) {
  //     document.exitFullscreen()
  //   } else if (document['mozCancelFullScreen']) {
  //     /* Firefox */
  //     document['mozCancelFullScreen']()
  //   } else if (document['webkitExitFullscreen']) {
  //     /* Chrome, Safari and Opera */
  //     document['webkitExitFullscreen']()
  //   } else if (document['msExitFullscreen']) {
  //     /* IE/Edge */
  //     document['msExitFullscreen']()
  //   }
  // }

  // private turnOffProctoring() {
  //   // //console.log('turnOffProctoring called')
  //   window.removeEventListener('contextmenu', this.contextCheck)
  //   window.removeEventListener('beforeunload', this.beforeUnload)
  //   window.removeEventListener('keydown', this.keydownCheck)
  //   document.body.removeEventListener('copy', this.copyCheck)
  //   document.body.removeEventListener('cut', this.cutCheck)
  //   document.body.removeEventListener('paste', this.pasteCheck)
  //   document.removeEventListener('visibilitychange', this.visibilityCheck)
  //   document.removeEventListener(
  //     'webkitfullscreenchange',
  //     this.fullscreenCheck,
  //   )
  //   document.removeEventListener('fullscreenchange', this.fullscreenCheck)
  //   document.removeEventListener('mozfullscreenchange', this.fullscreenCheck)
  //   document.removeEventListener('msfullscreenchange', this.fullscreenCheck)

  //   // if (document.webkitExitFullscreen) {
  //   //   document.webkitExitFullscreen();
  //   // }
  //   // if (document.exitFullscreen) {
  //   //   document.exitFullscreen();
  //   // }
  //   this.exitFullscreen()
  //   this.proctoringWarning = false
  // }

  // contextCheck = (e: { preventDefault: () => void; }) => {
  //   this.sendProctoringInfo('rightClick')
  //   e.preventDefault()
  // }
  // beforeUnload = (e: { returnValue: string; }) => {
  //   this.sendProctoringInfo('beforeunload')
  //   e.returnValue = 'You are not allowed to close window.'
  // }
  // visibilityCheck = () => {
  //   //console.log('document.visibilityState >', document.visibilityState)
  //   this.sendProctoringInfo('visibilitychange')
  // }
  // fullscreenCheck = () => {
  //   // //console.log('FS call')
  //   this.sendProctoringInfo('fullScreen')
  // }
  // keydownCheck = (e: KeyboardEvent) => {
  //   // //console.log('key pressed e >', e)
  //   if (e.altKey) {
  //     this.sendProctoringInfo('alt')
  //     e.preventDefault()
  //   } else if (e.ctrlKey) {
  //     this.sendProctoringInfo('ctrl')
  //     e.preventDefault()
  //   } else if (e.key === 'tab') {
  //     this.sendProctoringInfo('tab')
  //     e.preventDefault()
  //   } else if (e.key === 'esc') {
  //     this.sendProctoringInfo('esc')
  //     e.preventDefault()
  //   } else if (e.key === 'window') {
  //     this.sendProctoringInfo('window')
  //     e.preventDefault()
  //   } else if (e.key === 'f1') {
  //     this.sendProctoringInfo('f1')
  //     e.preventDefault()
  //   } else if (e.key === 'f8') {
  //     this.sendProctoringInfo('f8')
  //     e.preventDefault()
  //   } else if (e.key === 'f12') {
  //     this.sendProctoringInfo('f12')
  //     e.preventDefault()
  //   }
  //   // else if (e.keyCode === 9) {
  //   //   this.sendProctoringInfo('tab')
  //   //   e.preventDefault()
  //   // } else if (e.keyCode === 27) {
  //   //   this.sendProctoringInfo('esc')
  //   //   e.preventDefault()
  //   // } else if (e.keyCode === 91) {
  //   //   this.sendProctoringInfo('window')
  //   //   e.preventDefault()
  //   // } else if (e.keyCode === 112) {
  //   //   this.sendProctoringInfo('f1')
  //   //   e.preventDefault()
  //   // } else if (e.keyCode === 119) {
  //   //   this.sendProctoringInfo('f8')
  //   //   e.preventDefault()
  //   // } else if (e.keyCode === 123) {
  //   //   this.sendProctoringInfo('f12')
  //   //   e.preventDefault()
  //   // }
  // }

  // copyCheck = (e: { preventDefault: () => void; }) => {
  //   this.sendProctoringInfo('copy')
  //   e.preventDefault()
  // }
  // cutCheck = (e: { preventDefault: () => void; }) => {
  //   this.sendProctoringInfo('cut')
  //   e.preventDefault()
  // }
  // pasteCheck = (e: { preventDefault: () => void; }) => {
  //   this.sendProctoringInfo('paste')
  //   e.preventDefault()
  // }

}
