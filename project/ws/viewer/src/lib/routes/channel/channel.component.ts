import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { NsContent } from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
  selector: 'viewer-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent implements OnInit, OnDestroy {
  private routeDataSubscription: Subscription | null = null
  isFetchingDataComplete = false
  isErrorOccured = false
  channelData: NsContent.IContent | null = null
  channelManifest: any
  forPreview = window.location.href.includes('/author/')
  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private viewerSvc: ViewerUtilService,
  ) { }

  ngOnInit() {
    this.routeDataSubscription = this.viewerSvc
      .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
      .subscribe(
        async data => {
          this.channelData = data
          this.channelManifest = await this.transformHandsOn(this.channelData)
          if (this.channelData && this.channelManifest) {
            this.isFetchingDataComplete = true
            this.channelManifest = this.viewerSvc.replaceToAuthUrl(this.channelManifest)
          } else {
            this.isErrorOccured = true
          }
        },
        () => {
          this.isErrorOccured = true
        },
      )
  }

  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe()
    }
  }

  private async transformHandsOn(_content: NsContent.IContent) {
    let manifestFile = null
    if (this.channelData && this.channelData.artifactUrl) {
      manifestFile = await this.http
        .get<any>(this.viewerSvc.getAuthoringUrl(this.channelData.artifactUrl))
        .toPromise()
        .catch((_err: any) => { })
    }
    return manifestFile
  }
}
