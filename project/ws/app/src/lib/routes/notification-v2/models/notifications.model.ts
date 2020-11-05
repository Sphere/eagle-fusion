export interface INotificationsQueryParams {
  [key: string]: string | string[]
}

export interface INotificationData {
  data: INotification[]
  page: string
}

export interface INotification {
  classifiedAs: ENotificationType
  eventId: ENotificationEvent
  message: string
  notificationId: string
  receivedOn: Date
  seen: boolean
  seenOn: Date
  targetData: any
  userId: string
}

export enum ENotificationType {
  Action = 'Action',
  Information = 'Information',
}

export enum ENotificationEvent {
  // Learning Events
  ShareContent = 'share_content',
  SharePlaylist = 'share_playlist',
  ShareGoal = 'share_goal',

  // Authoring Events
  AddContributor = 'add_contributor',
  SendContent = 'send_content',
  RejectContent = 'reject_content',
  PublishContent = 'publish_content',
  DelegateContent = 'delegate_content',
  ApproveContent = 'approve_content',
  ContentFeedback = 'content_feedback_response',
}
