export interface IWsEmailTextRequest {
  emailTo: IWsEmailContact[]
  ccTo?: IWsEmailContact[]
  bccTo?: IWsEmailContact[]
  sharedBy: IWsEmailContact[]
  body: { text: string }
  timestamp: number
  appURL: string
  subject: string
}

export interface IWsEmailPlaylistGoalShareRequest {
  emailTo: IWsEmailContact[]
  emailType: string
  sharedBy: IWsEmailContact[]
  ccTo: IWsEmailContact[]
  body: { text: string; isHTML: boolean }
  timestamp: number
  appURL: string
  artifact: IWsArtifactDetails[]
}

export interface IWsArtifactDetails {
  identifier: string
  title: string
  description: string
  content: string[]
}

export interface IWsEmailResponse {
  response: string
  invalidIds?: string[]
}

export interface IWsEmailContact {
  name?: string
  email: string
}

export interface IWsEmailUserId {
  email: string
  userId: string
}

export interface IWsUserFollowEntity {
  email: string
  id: string
  firstname: string
}

export interface IWsUserFollow {
  followers: IWsUserFollowEntity[]
  following: IWsUserFollowEntity[]
}

export interface IWsEmailUserId {
  email: string
  userId: string
}
