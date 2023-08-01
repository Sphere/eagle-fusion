import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { MobileScromAdapterService } from '../../../services/mobile-scrom-adapter.service'

@Component({
  selector: 'ws-scrom-player',
  templateUrl: './scrom-player.component.html',
  styleUrls: ['./scrom-player.component.scss']
})
export class ScromPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  iframeUrl: any
  isLandscapeModeEnforced: boolean = false;

  constructor(
    public route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private scormAdapterService: MobileScromAdapterService
  ) {
    (window as any).API = this.scormAdapterService
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    const scormUrl = this.route.snapshot.queryParamMap.get('scormUrl')
    console.log('>>>>>>>>>>>', scormUrl)
    this.createIframeUrl(scormUrl)
    this.scormAdapterService.loadDataV2()
  }

  ngAfterViewInit() {
    this.checkAndEnforceLandscapeMode()
  }

  ngOnDestroy() {
    //this.releaseLandscapeModeLock()
  }

  checkAndEnforceLandscapeMode() {
    if (window.innerWidth < 380 && !this.isLandscapeModeEnforced) {
      this.isLandscapeModeEnforced = true
      // Check if screen orientation API is available
      if (screen.orientation) {

        try {
          // Attempt to lock the screen orientation to landscape
          screen.orientation.lock('landscape').then(() => {
            console.log('Screen orientation is locked to landscape mode.')
          }).catch((err: any) => {
            console.error('Failed to lock the screen orientation:', err)
            this.isLandscapeModeEnforced = false // Reset the flag if locking fails
          })
        } catch (err) {
          console.error('Error while locking screen orientation:', err)
          this.isLandscapeModeEnforced = false // Reset the flag if an error occurs
        }
      } else {
        console.warn('Screen orientation API is not supported on this browser.')
        this.isLandscapeModeEnforced = false // Reset the flag if screen orientation API is not available
      }
    }
  }



  createIframeUrl(scormUrl: any) {
    console.log(scormUrl)
    this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
      'http://localhost:3000/apis/proxies/v8/getContents/content/html/do_11363377478112870411138-latest/index_lms.html'
    )
  }

  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    console.log('msg=>', msg)
  }
}
