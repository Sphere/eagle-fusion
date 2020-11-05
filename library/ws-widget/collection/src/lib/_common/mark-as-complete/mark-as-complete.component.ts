import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { AppTocService } from '@ws/app/src/lib/routes/app-toc/services/app-toc.service'
import { NsContent } from '../../_services/widget-content.model'
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'
import { IReqMarkAsComplete } from './mark-as-complete.model'
import { WidgetContentService } from '../../_services/widget-content.service'

@Component({
  selector: 'ws-widget-mark-as-complete',
  templateUrl: './mark-as-complete.component.html',
  styleUrls: ['./mark-as-complete.component.scss'],
})
export class MarkAsCompleteComponent implements OnInit, OnChanges {
  @Input()
  content!: NsContent.IContent
  reqBody!: IReqMarkAsComplete
  @Input() forPreview = false

  constructor(
    public dialog: MatDialog,
    private appTocSvc: AppTocService,
    private contentSvc: WidgetContentService,
  ) { }

  confirm(): void {
    if (!this.forPreview) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '450px',
        data: {
          body: this.reqBody,
          contentId: this.content.identifier,
        },
      })

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'Marked' && this.content.progress) {
          this.content.progress.progressStatus = 'completed'
          this.content.progress.showMarkAsComplete = false
          this.content.progress.markAsCompleteReason = 'already.completed'
        }
      })
    }
  }

  get showStart() {
    return this.appTocSvc.showStartButton(this.content)
  }

  ngOnInit() {
  }

  ngOnChanges(props: SimpleChanges) {
    for (const prop in props) {
      if (prop === 'content') {
        if (this.content) {
          if (!this.forPreview) {
            this.contentSvc
              .fetchMarkAsCompleteMeta(this.content.identifier)
              .then(progress => {
                this.content.progress = progress
              })
              .catch(() => { })
            this.reqBody = {
              content_type: this.content.contentType,
              current: ['1'],
              max_size: 1,
              mime_type: this.content.mimeType,
              user_id_type: 'uuid',
            }
          }
        }
      }
    }
  }
}
