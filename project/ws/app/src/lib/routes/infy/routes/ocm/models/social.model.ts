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
