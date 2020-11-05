import { Component, OnInit, Input } from '@angular/core'
import { NsDiscussionForum, DialogSocialDeletePostComponent } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import { MatSnackBar, MatDialog } from '@angular/material'

@Component({
  selector: 'ws-app-qna-item',
  templateUrl: './qna-item.component.html',
  styleUrls: ['./qna-item.component.scss'],
})
export class QnaItemComponent implements OnInit {

  @Input() item!: NsDiscussionForum.ITimelineResult
  userId = ''
  showSocialLike = false
  ePostStatus = NsDiscussionForum.EPostStatus
  isSocialLike = false
  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() {
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
  }

  deletePost(successMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.item.id },
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.snackBar.open(successMsg)
        this.item.status = NsDiscussionForum.EPostStatus.INACTIVE
      }
    })
  }
}
