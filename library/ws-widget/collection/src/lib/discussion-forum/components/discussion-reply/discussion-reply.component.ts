import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { DialogSocialDeletePostComponent } from '../../dialog/dialog-social-delete-post/dialog-social-delete-post.component'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { map } from 'rxjs/operators'

@Component({
  selector: 'ws-widget-discussion-reply',
  templateUrl: './discussion-reply.component.html',
  styleUrls: ['./discussion-reply.component.scss'],
})
export class DiscussionReplyComponent implements OnInit {

  @Input() reply!: NsDiscussionForum.ITimelineResult
  @Output() deleteSuccess = new EventEmitter<boolean>()
  userId = ''
  editMode = false
  replyPostEnabled = false
  updatedBody: string | undefined
  isSmall = false
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private discussionSvc: WsDiscussionForumService,
    private breakpointObserver: BreakpointObserver,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  isSmallScreen$ = this.breakpointObserver
    .observe(Breakpoints.XSmall)
    .pipe(map(breakPointState => breakPointState.matches))

  ngOnInit() {
    this.isSmallScreen$.subscribe(isSmall => {
      this.isSmall = isSmall
    })
  }

  deletePost(failMsg: string) {
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

  editReply(failMsg: string) {
    this.reply.postContent.body = this.updatedBody || ''
    this.editMode = false
    const postUpdateRequest: NsDiscussionForum.IPostUpdateRequest = {
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
      _ => {
        this.updatedBody = undefined
        if (this.reply.lastEdited) {
          this.reply.lastEdited.dtLastEdited = Date.now().toString()
        }
        this.reply.dtLastModified = Date.now().toString()
      },
      () => {
        this.editMode = true
        this.snackBar.open(failMsg)
      },
    )
  }

  onReplyTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.replyPostEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
  }

  cancelReply() {
    this.editMode = false
    this.reply.postContent.body = ''
  }
}
