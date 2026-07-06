import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

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
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    const raw = typeof this.data?.url === 'string'
      ? this.data.url
      : this.data?.url?.changingThisBreaksApplicationSecurity || ''
    this.autoplayUrl = this.sanitizer.bypassSecurityTrustResourceUrl(raw + '?autoplay=1')
  }

  close() {
    this.dialogRef.close()
  }
}
