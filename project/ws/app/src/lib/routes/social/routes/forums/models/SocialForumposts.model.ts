import { IThreadContributor } from '../../../../search/models/search.model'

export namespace SocialForum {

  export interface ITimeline {
    hits: number
    result: ITimelineResult[]
    newDataCount?: number
    sessionId?: number
    filters: IForumFilter[]

  }
  export interface IPostContent {
    title: string
    abstract: string
    body: string
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
    // to be used for frontend
    flagReason?: EFlagReason
    thumbnail?: string
  }

  export interface IForumFilter {
    displayName: string
    type: string
    content: IForumFilterContent[]
    checked?: boolean
  }
  export interface IForumFilterContent {
    displayName: string
    type: string
    count?: number
    checked?: boolean

  }
  export interface IPostCreator {
    postCreatorId: string
    name: string
    emailId?: string
  }
  export interface IPostTag {
    id: string
    name: string
  }
  export interface ITimelinePostSource {
    id: string
    name: EDiscussionType
    forumName?: string
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
  export interface INavBackground {
    color: 'primary' | 'accent' | 'warn' | 'default'
    styles: { [id: string]: string }
  }
  export interface ISearchRequest {
    filters: {
      [key: string]: string[]
    }

    postKind: EPostKind[]
    isStandAlone?: boolean
    instanceCatalog?: boolean
    pgNo?: number
    pgSize?: number
    // sortBy?: 'lastUpdatedOn'
    // sortOrder?: 'ASC' | 'DESC'
    type: ETimelineType
    source?: ISourceElement// This is controversial

  }
  export interface ISourceElement {
    id: string
    name: string
  }

  export interface ITimelineRequest {
    type: ETimelineType
    postKind: EPostKind[]
    userId?: string
    sessionId: number
    pgNo?: number
    pgSize?: number
    source?: ITimelinePostSource
    filters?: {
      [key: string]: string[]
    }
  }
  export interface ISearchTab {
    titleKey: string
    title: string
    searchQuery: {
      filters: {
        [key: string]: string[]
      }
      advancedFilters: {
        title: string
        filters: {
          [type: string]: string[]
        }
      }[]
      isStandAlone: boolean
    }
  }
  export interface ISearchV6ApiResult {
    totalHits: number
    result: SocialForum.IContent[]
    filtersUsed: string[]
    notVisibleFilters: string[]
    filters: IFilterUnitResponse[]
    queryUsed?: string
  }
  export interface IContent {
    displayName: string
    type: string
    count: number

  }

  export interface IFilterUnitResponse {
    id?: string
    type: string
    displayName: string
    content: IFilterUnitContent[]

  }
  export interface IFilterUnitContent {
    type?: string
    id?: any
    displayName: string
    count: number

    children?: IFilterUnitContent[]
  }
  export interface IFilterUnitItem {
    type?: string
    id?: string
    displayName: string
    count: number
    children?: IFilterUnitItem[]
    // added for UI
    checked?: boolean
    from?: string
    to?: string
    isExpanded?: boolean
  }
  export interface IFlagRequest {
    id: string

    userComment?: IFlagComment
    activityType: EUserActivity
  }
  export interface IFlagComment {
    commentType: EModeratorReactComment,
    comment: string
  }
  // INTERFACES FOR MODERATOR
  export interface IModeratorTimeline {

    hits: number
    result: IModeratorTimelineResult[]
    newDataCount?: number
    sessionId?: number
    filters: IForumFilter[]
  }
  export interface IModeratorBtnRequest {

    postId: string
    action: EModeratorAction
    userComment?: IModeratorComment
  }
  export interface IModeratorTimelineRequest {
    pgNo: number,
    pgSize: number,
    postKind: EPostKind[],
    sessionId: number,
    type: ETimelineType,
    source: IModeratorRequestSource
  }
  export interface IModeratorRequestSource {
    id: string[]
    name: EDiscussionType
  }
  export interface IModeratorComment {
    type: EModeratorReactComment
    comment: string
  }

  export interface IModeratorTimelineResult {
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
    thumbnail: string
    hashTags: string[],

    accessPaths: string[],

    hidden?: boolean
  }
  // interfaces for admin
  export interface IAdminTimelineRequest {
    pgNo: number,
    pgSize: number,
    postKind: EPostKind[],
    sessionId: number,
    type: ETimelineType,

  }
  export interface IAdminTimeline {
    hits: number,
    result: IAdminTimelineResult[]

  }
  export interface IAdminRevivePostRequest {
    reactivateReason: string,
    id: string
  }
  export interface IAdminBtnRequest {

    id: string

    userComment?: IAdminComment
  }
  export interface IAdminComment {

    comment: string
  }
  export interface IAdminTimelineResult {

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
    thumbnail: string
    hashTags: string[],
    isAdminDeleted: boolean,
    adminDateDeletion: string,
    accessPaths: string[],
    activity: IPostActivity,
    hidden?: boolean,
    isFlagged: boolean,
    commentCount: number,
    postEditor: string[],
    isAcceptedAnswer: boolean,
    parentId: string
  }
  // interf
  // interfaces for forum view
  export interface IForumViewRequest {
    sessionId: number
    forumKind: EForumKind,
    pgNo: number,
    pgSize: number,
    type: EForumViewType
  }
  export interface IForumViewResponse {
    hits: number,
    result: IForumViewResult[]
  }
  export interface IForumViewResult {

    id: string,
    name: string,
    dtCreated: string,
    dtLastModified: string,
    dtRejected: string,
    dtReactivated: string,
    dtEdited: string,
    status: string,
    accessPaths: string[],
    description: string,
    forumCreator: {
      forumCreatorId: string,
      name: string
    },
    forumModerator: IForumViewModerator[],
    forumReactivator: {
      forumReactivatorId: string,
      name: string,
      reactivationReason: string
    },
    forumRejector: {
      forumRejectorId: string,
      name: string,
      rejectionReason: string
    },

    forumEditor: {
      forumEditorId: string,
      name: string
    },
    forumKind: EForumKind,
    moderationLevel: 'nomoderation',
    thumbnail: string,
    followerCount: number,
    postCount: number
  }
  export interface IForumViewModerator {
    forumModeratorId: string,
    name: string
  }
  // Interfaces for social search
  export interface ISocialSearchRequest {
    query: String,												// The search text
    pageNo: number,
    pageSize: number,
    postKind: EPostKind,
    sessionId?: number									// The postKind on which search to be done, Possible Values: Query, Blog, Forum
    filters?: {
      [key: string]: string[]
    }
  }
  export interface IDateFilter {
    from: string,
    to: string
  }
  export interface ISocialSearchTimeline {
    total: number
    result: ISocialTimelineResult[]
    newDataCount?: number
    sessionId?: number
    filters: IForumFilter[]

  }
  export interface ISocialTimelineResult {
    rootOrg: string,
    thumbnail: string,
    org: string,
    hasAcceptedAnswer: boolean,
    source: ITimelinePostSource,
    threadContributors: IThreadContributor[],

    likeCount: 0,
    dtPublished: string,
    dtLastModified: string
    lastEdited: {
      dtLastEdited: string
      editorId: string
    }
    abstract: string,
    body: string,
    title: string,
    postKind: EPostKind,
    tags: IPostTag[]
    activity: IPostActivity
    activityEndDate: string
    highlight: string[],

    postCreator: IPostCreator
    recipients: any[]
    status: EPostStatus
    postContent: IPostContent

    // acceptedAnswers?: string
    // replyCount: number
    // latestReply: ITimelineResult

    // // to be used for frontend
    // flagReason?: EFlagReason

  }

  //
  // Enums
  export enum EForumModerationLevel {
    NO_MODERATION = 'nomoderation',
    POST_LEVEL = 'postlevel',
    THREAD_LEVEL = 'threadlevel',
  }
  export enum EPostStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    DRAFT = 'Draft',
    INREVIEW = 'InReview',
  }
  export enum EPostKind {
    BLOG = 'Blog',
    LEADERSHIP_BLOG = 'Leadership-Blog',
    POLL = 'Poll',
    QUERY = 'Query',
    REPLY = 'Reply',
    COMMENT = 'Comment',
    FORUM = 'Forum',
  }
  export enum EDiscussionType {
    LEARNING = 'Learning',
    SOCIAL = 'Social',
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
    MODERATOR_TIMELINE = 'moderatorTimeline',
    MY_CONTRIBUTIONS = 'myContributions',
    MY_PUBLISHED = 'myPublished',
    MY_IN_REVIEW = 'myInReview',
    MY_REJECTED = 'myRejected',
    ADMIN_TIMELINE = 'adminFlaggedTimeline',
    ADMIN_DELETED_TIMELINE = 'adminDeletedTimeline',

  }
  export enum EModeratorReactComment {
    PREDEFINED = 'predefined',
    CUSTOM = 'custom',
  }
  export enum EModeratorAction {
    ACCEPT = 'accept',
    REJECT = 'reject',
  }
  export enum EUserActivity {
    FLAG = 'flag',
  }
  export enum EFlagReason {
    INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
    CONTENT_NOT_ORIGINAL = 'CONTENT_NOT_ORIGINAL',
    IRRELEVANT_CONTENT = 'IRRELEVANT_CONTENT',
    SPAM = 'SPAM',
  }

  export enum EForumViewType {
    ACTIVEALL = 'activeall',
    INACTIVEALL = 'inactiveall',
    CREATEDBYME = 'createdbyme',
    DELETEDBYME = 'deletedbyme',
    REACTIVATEDBYME = 'reactivatedbyme',
    MODERATEDBYME = 'moderatedbyme',
    MODERATED = 'moderated',
    NONMODERATED = 'nonmoderated',
    FORUMSIFOLLOW = 'forumsifollow',
  }
  export enum EForumKind {
    FORUM = 'forum',
    BLOG = 'blog',
  }

}
