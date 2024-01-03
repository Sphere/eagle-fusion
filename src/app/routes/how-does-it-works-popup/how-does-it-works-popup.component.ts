// video-popup.component.ts
import { Component, Input, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'app-video-popup',
  templateUrl: './how-does-it-works-popup.component.html',
  styleUrls: ['./how-does-it-works-popup.component.scss']
})
export class VideoPopupComponent {

  constructor(
    public dialogRef: MatDialogRef<VideoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
    // dialogRef.disableClose = true
  }
  @Input() videoUrl!: any
  videoLink!: any
  public isOpen = false;
  videoUrls = ['https://www.youtube.com/embed/1fqlys8mkHg', 'https://www.youtube.com/embed/Kl28R7m2k50', 'https://www.youtube.com/embed/JTGzCkEXlmU'
  ]
  ngOnInit() {
    console.log("videoUrl", this.data.number)
    if (this.videoUrls.length) {
      this.videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrls[this.data.number])
      console.log("videoLink", this.videoLink, this.videoUrl, this.videoUrls)
    }
  }
  close() {
    this.dialogRef.close()
  }
}
