export namespace NsDiscussionForum {
  export enum EActivityType {
    DOWNVOTE = 'downvote',
    UPVOTE = 'upvote',
    LIKE = 'like',
  }
  export enum EPostKind {
    BLOG = 'Blog',
    LEADERSHIP_BLOG = 'Leadership-Blog',
    POLL = 'Poll',
    QUERY = 'Query',
    REPLY = 'Reply',
    COMMENT = 'Comment',
  }
  export enum ETimelineType {
    ALL = 'all',
    MY_TIMELINE = 'myTimeline',
    PEOPLE = 'people',
    TAGS = 'tags',
    GROUPS = 'groups',
    UNANSWERED = 'unanswered',
    MY_DRAFTS = 'myDrafts',
    DISCUSSION_FORUM = 'discussionForum',
  }
  export enum EPostStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    DRAFT = 'Draft',
  }
  export enum EPostCommentType {
    PRE_DEFINED = 'pre-defined',
    CUSTOM = 'custom',
  }
  export enum EReplyKind {
    COMMENT = 'Comment',
    REPLY = 'Reply',
  }
  export enum EConversationSortOrder {
    EARLIEST_ASC = 'earliest-asc',
    EARLIEST_DESC = 'earliest-desc',
    LATEST_ASC = 'latest-asc',
    LATEST_DESC = 'latest-desc',
  }
  export enum EDiscussionType {
    LEARNING = 'Learning',
    SOCIAL = 'Social',
  }
  export interface IPostActivity {
    activityData: {
      like: number
      upVote: number
      downVote: number
      flag: number
    }
    userActivity: {
      like: boolean
      upVote: boolean
      downVote: boolean
      flag: boolean
    }
  }
  export interface IPostActivityUpdateRequest {
    id: string
    userId: string
    activityType: EActivityType
  }

  export interface IDialogActivityUsers {
    postId: string
    activityType: EActivityType
  }

  export interface IActivityUsers {
    postId: string
    activityType: EActivityType
    pgNo?: number
    pgSize?: number
  }

  export interface IActivityUsersResult {
    total: number
    users: IActivityUserDetails[]
  }
  export interface IActivityUserDetails {
    id: string
    name: string
    email: string
  }

  export interface IUserFollow {
    followers: IUserFollowEntity[]
    following: IUserFollowEntity[]
  }

  export interface IUserFollowEntity {
    email: string
    id: string
    firstname: string
  }

  export interface IPostDeleteRequest {
    id: string
    userId: string
  }

  export interface IPostFlagActivityUpdateRequest extends IPostActivityUpdateRequest {
    userComments: {
      commentType: EPostCommentType
      comment: string
    }
  }

  export interface IDiscussionForumInput extends ITimelinePostSource {
    initialPostCount?: number
    title?: string
    description?: string
    isLoggedInUserRestricted?: boolean
    isDisabled?: boolean
  }
  export interface ITimelinePostSource {
    id: string
    name: EDiscussionType
  }
  export interface ITimelineRequest {
    type: ETimelineType
    postKind: EPostKind[]
    userId: string
    sessionId: number
    pgNo?: number
    pgSize?: number
    source?: ITimelinePostSource
  }
  export interface ITimeline {
    hits: number
    result: ITimelineResult[]
    newDataCount?: number
    sessionId?: number
  }
  export interface ITimelineResult {
    org: string
    rootOrg: string
    id: string
    postKind: EPostKind
    dtCreated: string
    dtPublished: string
    dtLastModified: string
    lastEdited: {
      dtLastEdited: string
      editorId: string
    }
    activity: IPostActivity
    activityEndDate: string
    options: any[]
    postCreator: IPostCreator
    recipients: any[]
    status: EPostStatus
    postContent: IPostContent
    tags: IPostTag[]
    threadContributors: IThreadContributor[]
    hasAcceptedAnswer: boolean
    acceptedAnswers?: string
    replyCount: number
    latestReply: ITimelineResult
    source: ITimelinePostSource
  }
  export interface IPostCreator {
    postCreatorId: string
    name: string
    emailId: string
  }
  export interface IPostContent {
    title: string
    abstract: string
    body: string
  }
  export interface IPostTag {
    id: string
    name: string
  }
  export interface IThreadContributor {
    threadContributorId: string
    name: string
    emailId: string
  }
  export interface IPostPublishRequest {
    postKind: NsDiscussionForum.EPostKind
    postCreator: string
    postContent: NsDiscussionForum.IPostContent
    tags?: NsDiscussionForum.IPostTag[]
    id?: string
    pgNo?: number
    pgSize?: number
    dateCreated?: string
    source: ITimelinePostSource
  }
  export interface IPostCommentRequest {
    postKind: EReplyKind
    parentId: string
    postCreator: string
    postContent: {
      body: string
    }
    source: ITimelinePostSource
  }
  export interface IPostRequest {
    postId: string
    userId: string
    answerId: string
    sessionId: number
    postKind: NsDiscussionForum.EPostKind[]
    sortOrder?: EConversationSortOrder
    pgNo?: number
    pgSize?: number
  }

  export interface IPostRequestV2 {
    postId: string[]
    userId: string
    answerId: string
    sessionId: number
    postKind: NsDiscussionForum.EPostKind[]
    sortOrder?: EConversationSortOrder
    pgNo?: number
    pgSize?: number
  }

  export interface IPostResult {
    acceptedAnswer: ITimelineResult | null
    idsList: string[]
    postCount: number
    newPostCount: number
    mainPost: ITimelineResult
    replyPost: ITimelineResult[]
  }

  export interface IPostResultV2 {
    [key: string]: IPostResult
  }

  export interface IPostUpdateRequest {
    addTags?: NsDiscussionForum.IPostTag[]
    editor: string
    id?: string
    postKind: NsDiscussionForum.EPostKind
    meta: NsDiscussionForum.IPostContent
    removeTags?: NsDiscussionForum.IPostTag[]

  }

  export interface IPostUpdateRequestV2 {
    postKind: NsDiscussionForum.EPostKind
    postCreator?: string
    postContent: NsDiscussionForum.IPostContent
    tags?: string[]
    source: IPostTag
  }
}
