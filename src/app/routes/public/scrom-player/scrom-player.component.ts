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
    console.log('>>>>>>>>>>>', scormUrl, this.route.snapshot.queryParamMap)
    this.createIframeUrl(scormUrl)
    const req: any = {
      request: {
        userId: this.route.snapshot.queryParamMap.get('userId') || '',
        batchId: this.route.snapshot.queryParamMap.get('batchId') || '',
        courseId: this.route.snapshot.queryParamMap.get('courseId') || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    const header = {
      Authorization: this.route.snapshot.queryParamMap.get('Authorization'),
      userToken: this.route.snapshot.queryParamMap.get('userToken'),
    }



    this.scormAdapterService.loadDataV2(req, header)
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
    this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(scormUrl)
    // this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
    //   'http://localhost:3000/apis/proxies/v8/getContents/content/html/do_11363377478112870411138-latest/index_lms.html'
    // )
    // this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
    //   'http://localhost:3000/public/scrom-player?scormUrl=https:%2F%2Fsphere.aastrika.org%2Fapis%2Fpublic%2Fv8%2FmobileApp%2FgetContents%2Fcontent%2Fhtml%2Fdo_11364358413983744011210-latest%2Findex_lms.html%20ELDERLY%20CARE_%20Chapter%201&userId=04121b76-2599-46e1-be01-78bf54dd6053&courseId=do_11364358413983744011210&bathcId=01364577008224665629&Authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTNHNNVFdjZUZqYkxUWGxiczkzUzk4dmFtODBhdkRPUiJ9.nPOCY0-bVX28iNcxxnYbGpihY3ZzfNwx0-SFCnJwjas&userToken=userToken'
    // )
  }

  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    console.log('msg=>', msg)
  }
}
