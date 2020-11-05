import { Component, OnInit, Input } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { MatSnackBar, MatDialog } from '@angular/material'
import { DialogSocialActivityUserComponent } from '../../dialog/dialog-social-activity-user/dialog-social-activity-user.component'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'

@Component({
  selector: 'ws-widget-btn-social-like',
  templateUrl: './btn-social-like.component.html',
  styleUrls: ['./btn-social-like.component.scss'],
})
export class BtnSocialLikeComponent implements OnInit {
  @Input() postId = ''
  @Input() postCreatorId = ''
  @Input() activity: NsDiscussionForum.IPostActivity | null = null
  isUpdating = false
  userId = ''
  constructor(
    private configSvc: ConfigurationsService,
    private socialSvc: WsDiscussionForumService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() { }

  updateLike(invalidUserMsg: string) {
    if (this.postCreatorId === this.userId) {
      this.snackBar.open(invalidUserMsg)
      return
    }
    if (this.isUpdating) {
      return
    }
    this.isUpdating = true
    const request: NsDiscussionForum.IPostActivityUpdateRequest = {
      id: this.postId,
      userId: this.userId,
      activityType: NsDiscussionForum.EActivityType.LIKE,
    }
    this.socialSvc.updateActivity(request).subscribe(_ => {
      this.isUpdating = false
      if (this.activity) {
        if (this.activity.userActivity.like) {
          this.activity.userActivity.like = false
          this.activity.activityData.like -= 1
        } else {
          this.activity.userActivity.like = true
          this.activity.activityData.like += 1
        }
      }
    })
  }

  openLikesDialog() {
    const data: NsDiscussionForum.IDialogActivityUsers = { postId: this.postId, activityType: NsDiscussionForum.EActivityType.LIKE }
    this.dialog.open(DialogSocialActivityUserComponent, {
      data,
    })
  }
}
