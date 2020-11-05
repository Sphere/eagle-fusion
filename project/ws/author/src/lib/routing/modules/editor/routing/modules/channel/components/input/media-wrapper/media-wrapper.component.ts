import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core'
import { IWidgetWrapperMedia } from '@ws-widget/collection/src/lib/video-wrapper/video-wrapper.model'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { MatDialog } from '@angular/material'

@Component({
  selector: 'ws-auth-media-wrapper',
  templateUrl: './media-wrapper.component.html',
  styleUrls: ['./media-wrapper.component.scss'],
})
export class MediaWrapperComponent implements OnInit, OnChanges {
  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() content!: IWidgetWrapperMedia
  @Input() isVideo = false
  @Output() data = new EventEmitter<{ content: IWidgetWrapperMedia; isValid: boolean }>()
  inputType: 'upload' | 'id' | 'external' = 'upload'
  backUpType: 'upload' | 'id' | 'external' = 'upload'

  constructor(private matDialog: MatDialog) { }

  ngOnInit() {

  }

  ngOnChanges() {
    if (this.content.externalData && this.content.externalData.iframeSrc) {
      this.inputType = 'external'
    } else if (this.content.videoData && this.content.videoData.identifier) {
      this.inputType = 'id'
    } else if (!(this.content.videoData && this.content.videoData.identifier)) {
      this.inputType = 'upload'
    }
    this.backUpType = this.inputType
  }

  onSelectionChange() {

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: 'dialog',
    })
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.content.externalData = {
          title: '',
          iframeSrc: '',
        }
        this.content.videoData = {}
        this.data.emit({
          content: this.content,
          isValid: this.content.videoData.url || this.content.videoData.identifier ? true : false,
        })
      } else {
        this.inputType = this.backUpType
      }
      this.backUpType = this.inputType
    })
  }
}
