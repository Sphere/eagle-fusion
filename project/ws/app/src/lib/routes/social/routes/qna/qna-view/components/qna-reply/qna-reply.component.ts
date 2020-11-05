import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { DialogSocialDeletePostComponent, NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { NsSocial } from '../../../../../models/social.model'
import { WsSocialService } from '../../../../../services/ws-social.service'

@Component({
  selector: 'ws-app-qna-reply',
  templateUrl: './qna-reply.component.html',
  styleUrls: ['./qna-reply.component.scss'],
})
export class QnaReplyComponent implements OnInit {

  @Input() item!: NsDiscussionForum.ITimelineResult
  @Input() parentPostCreatorId!: string
  @Input() isAcceptedAnswer = false

  @Output() acceptAnswerEvent = new EventEmitter<string>()
  @Output() deleteSuccess = new EventEmitter<{ isAccepted: boolean; id: string }>()
  isAcceptingAnswerInProgress = false
  commentConversationRequest: NsDiscussionForum.IPostRequest = {
    postId: '',
    userId: '',
    answerId: '',
    postKind: [NsDiscussionForum.EPostKind.COMMENT],
    sessionId: Date.now(),
    pgNo: 0,
    pgSize: 5,
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
  }
  commentAddRequest: NsDiscussionForum.IPostCommentRequest = {
    postKind: NsDiscussionForum.EReplyKind.COMMENT,
    parentId: '',
    postCreator: '',
    postContent: {
      body: '',
    },
    source: {
      id: '',
      name: NsDiscussionForum.EDiscussionType.SOCIAL,
    },
  }

  commentData: NsDiscussionForum.IPostResult | undefined
  commentFetchStatus: TFetchStatus | undefined
  isPostingComment = false

  showSocialLike = false
  editMode = false
  replyPostEnabled = false
  updatedBody: string | undefined
  userId = ''
  constructor(
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
    private socialSvc: WsSocialService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.commentConversationRequest.userId = this.userId
    this.commentAddRequest.postCreator = this.userId
  }

  ngOnInit() {
    if (this.item && this.item.id) {
      this.commentConversationRequest.postId = this.item.id
      this.commentAddRequest.parentId = this.item.id
      this.fetchQuestionComments()
    }
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false

  }

  postComment() {
    this.isPostingComment = true
    this.discussionSvc.publishPost(this.commentAddRequest).subscribe(
      () => {
        this.isPostingComment = false
        this.commentAddRequest.postContent.body = ''
        this.fetchQuestionComments(true)
      },
      () => {
        this.isPostingComment = false
      },
    )
  }

  fetchQuestionComments(forceNew = false) {
    if (!this.commentConversationRequest.postId) {
      this.commentConversationRequest.postId = this.item.id
    }
    if (forceNew) {
      this.commentConversationRequest.pgNo = 0
      this.commentConversationRequest.sessionId = Date.now()
      if (this.commentData) {
        this.commentData.replyPost = []
      }
    }
    this.commentFetchStatus = 'fetching'
    this.discussionSvc.fetchPost(this.commentConversationRequest).subscribe(
      data => {
        if (data && data.replyPost) {
          if (!this.commentData) {
            this.commentData = data
          } else {
            this.commentData.newPostCount = data.newPostCount
            this.commentData.postCount = data.postCount
            this.commentData.replyPost = [...this.commentData.replyPost, ...data.replyPost]
          }
        }
        (this.commentConversationRequest.pgNo as number) += 1
        this.commentFetchStatus = 'done'
      },
      () => {
        this.commentFetchStatus = 'error'
      },
    )
  }

  acceptAnswer(acceptAnswerMsg: string) {
    if (this.userId === this.item.postCreator.postCreatorId) {
      this.snackBar.open(acceptAnswerMsg)
      return
    }
    if (this.isAcceptingAnswerInProgress || this.isAcceptedAnswer) {
      return
    }
    this.isAcceptingAnswerInProgress = true
    const requestBody: NsSocial.IAcceptAnswer = {
      acceptedAnswer: this.item.id,
      userId: this.userId,
    }
    this.socialSvc.acceptAnswer(requestBody).subscribe(_ => {
      this.isAcceptedAnswer = true
      this.isAcceptingAnswerInProgress = false
      this.acceptAnswerEvent.emit(this.item.id)
    })
  }

  deleteReply(failMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.item.id },
    })
    dialogRef.afterClosed().subscribe(
      data => {
        if (data) {
          this.deleteSuccess.emit({ isAccepted: this.isAcceptedAnswer, id: this.item.id })
        }
      },
      () => {
        this.snackBar.open(failMsg)
      },
    )
  }

  editReply(failMsg: string) {
    this.item.postContent.body = this.updatedBody || ''
    this.editMode = false
    const postUpdateRequest: NsDiscussionForum.IPostUpdateRequest = {
      editor: this.userId,
      id: this.item.id,
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

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.replyPostEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
  }

}
