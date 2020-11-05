import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils'
import { DialogSocialDeletePostComponent, NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-blog-reply',
  templateUrl: './blog-reply.component.html',
  styleUrls: ['./blog-reply.component.scss'],
})
export class BlogReplyComponent implements OnInit {
  @Input() reply: NsDiscussionForum.ITimelineResult | null = null
  @Output() deleteSuccess = new EventEmitter<boolean>()

  showSocialLike = false
  editMode = false
  replyPostEnabled = false
  updatedBody: string | undefined = ''
  userId = ''
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private discussionSvc: WsDiscussionForumService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() {

    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
  }

  deleteReply(failMsg: string) {
    if (this.reply) {
      const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
        data: { postId: this.reply.id },
      })
      dialogRef.afterClosed().subscribe(
        data => {
          if (data) {
            this.deleteSuccess.emit(true)
          }
        },
        () => {
          this.snackBar.open(failMsg)
        },
      )
    }
  }

  editReply(failMsg: string) {
    let postUpdateRequest: NsDiscussionForum.IPostUpdateRequest
    if (this.reply) {
      this.reply.postContent.body = this.updatedBody || ''
      this.editMode = false
      postUpdateRequest = {
        editor: this.userId,
        id: this.reply.id,
        meta: {
          abstract: '',
          body: this.updatedBody || '',
          title: '',
        },
        postKind: NsDiscussionForum.EPostKind.REPLY,
      }
      this.discussionSvc.updatePost(postUpdateRequest).subscribe(
        () => {
          this.updatedBody = undefined
        },
        () => {
          this.editMode = true
          this.snackBar.open(failMsg)
        },
      )
    }
  }

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.replyPostEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
  }
}
