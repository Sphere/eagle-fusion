import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { SafeResourceUrl } from '@angular/platform-browser'
import { SafeResourceUrlService } from '@ws-widget/utils'

@Component({
    standalone: false,
    selector: 'app-video-popup',
    templateUrl: './how-does-it-works-popup.component.html',
    styleUrls: ['./how-does-it-works-popup.component.scss'],
})
export class VideoPopupComponent implements OnInit {
  autoplayUrl: SafeResourceUrl | null = null
  public isOpen = false

  constructor(
    public dialogRef: MatDialogRef<VideoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private safeResourceUrlSvc: SafeResourceUrlService,
  ) { }

  private static readonly ALLOWED_VIDEO_HOSTS = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com']

  ngOnInit() {
    const raw = typeof this.data?.url === 'string'
      ? this.data.url
      : this.data?.url?.changingThisBreaksApplicationSecurity || ''
    if (!raw) {
      return
    }
    this.autoplayUrl = this.safeResourceUrlSvc.trustFromAllowlist(
      raw + '?autoplay=1',
      VideoPopupComponent.ALLOWED_VIDEO_HOSTS,
    )
  }

  close() {
    this.dialogRef.close()
  }
}
