// import { NSSearch } from '@ws-widget/collection'
// import { IWidgetResolverDataConfigWithType } from '@ws-shared/widget-resolver'
// import { ICarousel } from '@ws-shared/widgets/src/lib/models/widget-slider.model'
import { NsContentStripMultiple } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'

export interface IWsLeader {
  designation: string
  disabled?: boolean
  emailId: string
  link: string
  name: string
  profileImage: string
  role: string
}

export interface IWsLeaderConfig {
  [name: string]: IWsLeaderData
}

export interface IWsLeaderData {
  tabs: IWsLeaderTabs[]
  mailMeta: IWsLeaderMailMeta
  profile: IWsLeader
  about: string
  twitterUrl: string
  articles: IWsLeaderArticle[]
  stripSearchRequest: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  >
  communicationSearchRequest: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  >
  // stripSearchRequest: IWidgetResolverDataConfigWithType<NSSearch.ISearchRequest>
  // communicationSearchRequest: IWidgetResolverDataConfigWithType<NSSearch.ISearchRequest>
  discussId: string
}

export interface IWsLeaderTabs {
  title: string
  // banners: IWidgetResolverDataConfigWithType<ICarousel[]>
}

export interface IWsLeaderArticle {
  title: string
  postedOn: string
  abstract: string
  iconUrl: string
  url: string
}

export interface IWsLeaderMailMeta {
  subject: string
  placeholder: string
  emailTo: string
  name: string
}

// Social model

export type TPostKind =
  | 'Blog'
  | 'Leadership-Blog'
  | 'Poll'
  | 'Query'
  | 'Reply'
  | 'Comment'
  | 'Unknown'
export type TTimelineType =
  | 'all'
  | 'myTimeline'
  | 'people'
  | 'tags'
  | 'groups'
  | 'unanswered'
  | 'myDrafts'
  | 'discussionForum'

export interface IWsTimelinePostSource {
  id: string
  name: string
}

export interface IWsDiscussionForumInput extends IWsTimelinePostSource {
  initialPostCount?: number
  title?: string
  description?: string
  isLoggedInUserRestricted?: boolean
}

export interface IWsTimelineRequestPartial {
  type: TTimelineType
  postKind: TPostKind[]
  userId: string
  sessionId: number
  pgNo?: number
  pgSize?: number
  source?: IWsTimelinePostSource
}

export interface IWsTimelineRequest extends IWsTimelineRequestPartial {
  org: string
  rootOrg: string
}

export interface IWsTimeline {
  hits: number
  result: IWsTimelineResult[]
  newDataCount?: number
  sessionId?: number
}

export type TPostStatus = 'Active' | 'Inactive' | 'Draft'

export interface IWsTimelineResult {
  org: string
  rootOrg: string
  id: string
  postKind: TPostKind
  dtCreated: string
  dtPublished: string
  dtLastModified: string
  lastEdited: {
    dtLastEdited: string;
    editorId: string;
  }
  activity: IWsPostActivity
  activityEndDate: string
  options: any[]
  postCreator: IWsPostCreator
  recipients: any[]
  status: TPostStatus
  postContent: IWsPostContent
  tags: IWsPostTag[]
  threadContributors: IWsThreadContributor[]
  hasAcceptedAnswer: boolean
  acceptedAnswers?: string
  replyCount: number
  latestReply: IWsTimelineResult
  source: IWsPostSource
}

export interface IWsPostActivity {
  activityData: {
    like: number;
    upVote: number;
    downVote: number;
    flag: number;
  }
  userActivity: {
    like: boolean;
    upVote: boolean;
    downVote: boolean;
    flag: boolean;
  }
}

export interface IWsPostSource {
  id: string
  name: string
}

export interface IWsThreadContributor {
  threadContributorId: string
  name: string
  emailId: string
}

export interface IWsPostCreator {
  postCreatorId: string
  name: string
  emailId: string
}

export interface IWsPostContent {
  title: string
  abstract: string
  body: string
}

export interface IWsPostTag {
  id: string
  name: string
}
