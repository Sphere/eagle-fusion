import { NsContent } from '../_services/widget-content.model'

export namespace NsPlaylist {
  export enum EPlaylistUserAction {
    CREATE = 'create',
    ADD = 'add',
    DELETE = 'delete',
  }

  export enum EPlaylistTypes {
    ME = 'user',
    SHARED = 'share',
    PENDING = 'pending',
  }

  export enum EPlaylistEditTypes {
    ONLY_VIEW = 'view',
    EDIT = 'edit',
  }

  export enum EPlaylistVisibilityTypes {
    PUBLIC = 'public',
    PRIVATE = 'private',
  }

  export interface IPlaylistResponse {
    user: IPlaylist[]
    share: IPlaylist[]
    pending: IPlaylist[]
  }

  export interface IPlaylist {
    id: string
    name: string
    contents: NsContent.IContentMinimal[]
    createdOn: string
    duration: number
    editType: EPlaylistEditTypes
    visibility: EPlaylistVisibilityTypes
    icon: string
    sharedBy?: string
    sharedByDisplayName?: string
    sharedOn?: string
  }

  export interface IPlaylistCreateRequest {
    playlist_title: string
    content_ids: string[]
    shareWith?: string[]
    shareMsg?: string
    visibility: EPlaylistVisibilityTypes
  }

  export interface IPlaylistUpsertRequest {
    contentIds: string[]
  }

  export interface IPlaylistShareRequest {
    users: string[]
    message?: string
  }

  export interface IBtnPlaylist {
    contentId: string
    contentName: string
    contentType: NsContent.EContentTypes
    mode: 'dialog' | 'menu'
    isDisabled?: false
  }
}
