import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { EditorQuillComponent } from '../../editor-quill/component/editor-quill/editor-quill.component'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'

@Component({
  selector: 'ws-widget-discussion-forum',
  templateUrl: './discussion-forum.component.html',
  styleUrls: ['./discussion-forum.component.scss'],
})
export class DiscussionForumComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsDiscussionForum.IDiscussionForumInput> {
  @Input() widgetData!: NsDiscussionForum.IDiscussionForumInput

  @ViewChild('editorQuill', { static: true }) editorQuill: EditorQuillComponent | null = null
  @ViewChild('postEnabled', { static: true }) postEnabled: ElementRef<
    HTMLInputElement
  > | null = null
  @ViewChild('postDisabled', { static: true }) postDisabled: ElementRef<
    HTMLInputElement
  > | null = null
  showCommentBox = false

  conversationRequest: NsDiscussionForum.IPostRequestV2 = {
    postId: [],
    userId: '',
    answerId: '',
    postKind: [],
    sessionId: Date.now(),
    sortOrder: NsDiscussionForum.EConversationSortOrder.LATEST_DESC,
    pgNo: 0,
    pgSize: 10,
  }
  isRestricted = true
  discussionConverstionResult: any

  discussionFetchStatus: TFetchStatus = 'none'
  discussionRequest: NsDiscussionForum.ITimelineRequest = {
    pgNo: 0,
    pgSize: 4,
    postKind: [],
    sessionId: Date.now(),
    type: NsDiscussionForum.ETimelineType.DISCUSSION_FORUM,
    userId: '',
    source: undefined,
  }
  isPostingDiscussion = false
  discussionResult: NsDiscussionForum.ITimeline = {
    hits: 0,
    result: [],
  }

  isValidPost = false
  editorText: undefined | string
  userEmail = ''
  userId = ''
  userName = ''
  constructor(
    private snackBar: MatSnackBar,
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
  ) {
    super()
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.userEmail = this.configSvc.userProfile.email || ''
      this.userName = this.configSvc.userProfile.userName || ''
    }
    this.discussionRequest.userId = this.userId
    this.conversationRequest.userId = this.userId
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        this.configSvc.restrictedFeatures.has('disscussionForum') ||
        this.configSvc.restrictedFeatures.has('disscussionForumTRPU')
    }
    if (!this.isRestricted && !this.widgetData.isDisabled) {
      if (this.widgetData.initialPostCount) {
        this.discussionRequest.pgSize = this.widgetData.initialPostCount
      }
      this.discussionRequest.source = {
        id: this.widgetData.id,
        name: this.widgetData.name,
      }
      this.fetchDiscussion()
    }
  }

  fetchDiscussion(refresh = false) {
    this.discussionFetchStatus = 'fetching'
    this.discussionRequest.postKind = [NsDiscussionForum.EPostKind.BLOG]
    if (refresh) {
      this.discussionRequest.sessionId = Date.now()
      this.discussionRequest.pgNo = 0
    }
    this.discussionSvc.fetchTimelineData(this.discussionRequest).subscribe(
      data => {
        if (data.hits && data.result) {
          if (refresh) {
            this.discussionResult = {
              hits: 0,
              result: [],
            }
          }
          this.discussionResult.hits = data.hits
          this.discussionResult.result = [...this.discussionResult.result, ...data.result]
          if (data.hits > this.discussionResult.result.length) {
            this.discussionFetchStatus = 'hasMore'
              // tslint:disable-next-line: whitespace
              ; (this.discussionRequest.pgNo as number) += 1
          } else {
            this.discussionFetchStatus = 'done'
            // this.fetchAllPosts()
          }
        } else if (!this.discussionResult.result.length) {
          this.discussionFetchStatus = 'none'
        }
      },
      _err => {
        this.discussionFetchStatus = 'error'
      },
    )
  }

  publishConversation(failMsg: string) {
    this.isPostingDiscussion = true
    const postPublishRequest: NsDiscussionForum.IPostPublishRequest = {
      postContent: {
        abstract: '',
        body: '',
        title: this.editorText || '',
      },
      postCreator: this.userId,
      postKind: NsDiscussionForum.EPostKind.BLOG,
      source: {
        id: this.widgetData.id,
        name: this.widgetData.name,
      },
    }
    this.discussionSvc.publishPost(postPublishRequest).subscribe(
      (_data: any) => {
        this.editorText = undefined
        this.isValidPost = false
        this.isPostingDiscussion = false
        if (this.editorQuill) {
          this.editorQuill.resetEditor()
        }
        this.fetchDiscussion(true)
      },
      () => {
        this.snackBar.open(failMsg)
        this.isPostingDiscussion = false
      },
    )
  }

  onDeletePost(replyIndex: number) {
    this.discussionResult.result.splice(replyIndex, 1)
    this.discussionResult.hits -= 1
    if (!this.discussionResult.result.length) {
      this.discussionFetchStatus = 'none'
    }
  }

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.isValidPost = eventData.isValid
    this.editorText = eventData.htmlText
  }

  fetchAllPosts() {
    const postIds: string[] = []
    this.discussionResult.result.forEach((post: NsDiscussionForum.ITimelineResult) =>
      postIds.push(post.id),
    )
    this.conversationRequest.sessionId = Date.now()
    this.conversationRequest.postId = postIds
    this.discussionSvc.fetchAllPosts(this.conversationRequest).subscribe(data => {
      this.discussionConverstionResult = Object.keys(data)
    })
  }

  cancelPost() {
    this.showCommentBox = !this.showCommentBox
    if (this.editorQuill) {
      this.editorQuill.resetEditor()
    }
  }
}
