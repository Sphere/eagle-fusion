import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { MatDialog, MatSnackBar } from '@angular/material'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { EditorQuillComponent } from './../../editor-quill/component/editor-quill/editor-quill.component'
import { DialogSocialDeletePostComponent } from '../../dialog/dialog-social-delete-post/dialog-social-delete-post.component'

@Component({
  selector: 'ws-widget-discussion-post',
  templateUrl: './discussion-post.component.html',
  styleUrls: ['./discussion-post.component.scss'],
})
export class DiscussionPostComponent implements OnInit {

  @Input() post!: NsDiscussionForum.ITimelineResult
  @Output() deleteSuccess = new EventEmitter<boolean>()
  @ViewChild('discussionReplyEditor', { static: true }) discussionReplyEditor: EditorQuillComponent | null = null
  editMode = false
  postPublishEnabled = false
  updatedBody: undefined | string
  userId = ''
  userEmail = ''
  userName = ''
  replyPlaceholderToggler = false
  isValidReply = false
  replyBody: undefined | string
  isPostingReply = false
  replyFetchStatus: TFetchStatus = 'none'
  conversationRequest: NsDiscussionForum.IPostRequest = {
    postId: '',
    userId: '',
    answerId: '',
    postKind: [],
    sessionId: Date.now(),
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
    pgNo: 0,
    pgSize: 2,
  }
  postReplies: NsDiscussionForum.ITimelineResult[] = []
  isNewRepliesAvailable = false
  showReplies = false
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private discussionSvc: WsDiscussionForumService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.userEmail = this.configSvc.userProfile.email || ''
      this.userName = this.configSvc.userProfile.userName || ''
    }
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    this.conversationRequest.postId = this.post.id
    this.fetchPostReplies()
  }

  deletePost(failMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.post.id },
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

  editPost(failMsg: string) {
    this.post.postContent.title = this.updatedBody || ''
    this.editMode = false
    const postUpdateRequest: NsDiscussionForum.IPostUpdateRequest = {
      editor: this.userId,
      id: this.post.id,
      meta: {
        abstract: '',
        body: '',
        title: this.updatedBody || '',
      },
      postKind: NsDiscussionForum.EPostKind.BLOG,
    }
    this.discussionSvc.updatePost(postUpdateRequest).subscribe(
      _data => {
        this.updatedBody = undefined
        if (this.post.lastEdited) {
          this.post.lastEdited.dtLastEdited = Date.now().toString()
        }
        this.post.dtLastModified = Date.now().toString()
      },
      () => {
        this.editMode = true
        this.snackBar.open(failMsg)
      },
    )
  }

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.postPublishEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
  }

  publishReply(failureMsg: string) {
    this.isPostingReply = true
    const request: NsDiscussionForum.IPostCommentRequest = {
      parentId: this.post.id,
      postContent: {
        body: this.replyBody || '',
      },
      postCreator: this.userId,
      postKind: NsDiscussionForum.EReplyKind.REPLY,
      source: this.post.source,
    }
    this.discussionSvc.publishPost(request).subscribe(
      (_data: any) => {
        this.fetchPostReplies(true)
        this.isPostingReply = false
        this.replyPlaceholderToggler = !this.replyPlaceholderToggler
        if (this.discussionReplyEditor) {
          this.discussionReplyEditor.resetEditor()
        }
        this.isValidReply = false
        this.replyBody = undefined
      },
      () => {
        this.snackBar.open(failureMsg)
        this.isPostingReply = false
      },
    )
  }

  onReplyTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.isValidReply = eventData.isValid
    this.replyBody = eventData.htmlText
  }

  fetchPostReplies(forceNew = false) {
    if (this.replyFetchStatus === 'fetching') {
      return
    }
    if (forceNew) {
      this.conversationRequest.pgNo = 0
      this.conversationRequest.sessionId = Date.now()
    }
    this.replyFetchStatus = 'fetching'
    this.isNewRepliesAvailable = false
    this.discussionSvc.fetchPost(this.conversationRequest).subscribe(
      data => {
        if (data) {
          this.isNewRepliesAvailable = data.newPostCount ? true : false
          if (forceNew) {
            this.postReplies = []
          }
          this.postReplies = [...this.postReplies, ...(data.replyPost || [])]
          if (data.postCount) {
            this.replyFetchStatus = 'hasMore'
          } else {
            this.replyFetchStatus = this.postReplies.length ? 'done' : 'none'
          }
          (this.conversationRequest.pgNo as number) += 1
        }
      },
      _ => {
        this.replyFetchStatus = 'error'
      })
  }

  onDeleteReply(replyIndex: number) {
    this.postReplies.splice(replyIndex, 1)
  }

  cancelReply() {
    this.replyPlaceholderToggler = !this.replyPlaceholderToggler
    if (this.discussionReplyEditor) {
      this.discussionReplyEditor.resetEditor()
    }
  }
  toggleReplies() {
    this.showReplies = !this.showReplies
  }
  showCommentBox(el: HTMLElement) {
    this.replyPlaceholderToggler = !this.replyPlaceholderToggler
    setTimeout(() => {
      el.scrollIntoView()
    },         500)
  }
}
