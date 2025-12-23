import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
// import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'app-video-popup',
  templateUrl: './how-does-it-works-popup.component.html',
  styleUrls: ['./how-does-it-works-popup.component.scss']
})
export class VideoPopupComponent {

  constructor(
    public dialogRef: MatDialogRef<VideoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  public isOpen = false;

  ngOnInit() {
    console.log("videoUrl", this.data.url)
  }
  close() {
    this.dialogRef.close()
  }
}
