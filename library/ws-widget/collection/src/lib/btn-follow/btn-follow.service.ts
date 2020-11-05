import { Injectable } from '@angular/core'
import { ConfigurationsService, EventService, WsEvents, TFetchStatus } from '@ws-widget/utils'
import { HttpClient } from '@angular/common/http'
import { Observable, ReplaySubject } from 'rxjs'
import { IFollowing } from './btn-follow.model'
import { map, tap, take } from 'rxjs/operators'
import { NsContent } from '../_services/widget-content.model'

const API_END_POINTS = {
  follow: '/apis/protected/v8/user/follow',
  unfollow: '/apis/protected/v8/user/follow/unfollow',
  following: (type: string) => `/apis/protected/v8/user/follow/${type}`,
  getFollowing: '/apis/protected/v8/user/follow/getFollowing',
}

@Injectable({
  providedIn: 'root',
})
export class BtnFollowService {
  constructor(
    private http: HttpClient,
    private events: EventService,
    private configSvc: ConfigurationsService,
  ) { }

  fetchStatus: TFetchStatus = 'none'
  fetchingFollowing = true
  followingItemList: IFollowing[] = []
  typeFollwed: string[] = ['Knowledge Board', 'Channel']
  private followReplaySubject: ReplaySubject<Set<string>> = new ReplaySubject(1)
  private followedIds: Set<string> | null = null

  private fetchContentFollowed() {
    this.fetchStatus = 'fetching'
    this.getFollowing().subscribe(
      data => {
        this.followingItemList = data
        const followingBoard = this.followingItemList.find((contents: any) => {
          const keys = Object.keys(contents)
          return Boolean(keys && keys.length && keys[0] === NsContent.EContentTypes.KNOWLEDGE_BOARD)
        })
        const listIds: string[] = []
        if (followingBoard) {
          followingBoard[NsContent.EContentTypes.KNOWLEDGE_BOARD].forEach((board: any) => {
            if (listIds.indexOf(board.identifier) === -1) {
              listIds.push(board.identifier)
            }
          })
        }
        this.fetchingFollowing = false
        this.fetchStatus = 'done'
        this.followedIds = new Set(listIds)
        this.followReplaySubject.next(new Set(this.followedIds))
      },
      _ => {
        this.fetchStatus = 'error'
        this.fetchingFollowing = false
        this.followReplaySubject.next(new Set([]))
        this.fetchingFollowing = false
      },
    )
  }
  get followed() {
    if (!this.followedIds && this.fetchStatus === 'none') {
      this.fetchContentFollowed()
    }
    return this.followReplaySubject
  }

  isFollowedFor(contentId: string): Observable<boolean> {
    return this.followed.pipe(map(followedIds => followedIds.has(contentId)))
  }

  follow(targetId: string, type: string = 'Knowledge Board') {
    this.raiseTelemetry(targetId, type, 'follow')
    return this.http
      .post(API_END_POINTS.follow, {
        type,
        followsourceid: this.configSvc.userProfile && this.configSvc.userProfile.userId,
        followtargetid: targetId,
      })
      .pipe(
        tap(() => {
          this.followReplaySubject.pipe(take(1)).subscribe(set => {
            set.add(targetId)
            this.followReplaySubject.next(set)
          })
        }),
      )
  }

  unfollow(targetId: string, type: string = 'Knowledge Board') {
    this.raiseTelemetry(targetId, type, 'unfollow')
    return this.http
      .post(API_END_POINTS.unfollow, {
        type,
        followsourceid: this.configSvc.userProfile && this.configSvc.userProfile.userId,
        followtargetid: targetId,
      })
      .pipe(
        tap(() => {
          this.followReplaySubject.pipe(take(1)).subscribe(set => {
            set.delete(targetId)
            this.followReplaySubject.next(set)
          })
        }),
      )
  }

  getFollowing(type?: string): Observable<any> {
    const url = `${API_END_POINTS.getFollowing + (type ? `?type=${type}` : '')}`
    return this.http.get<any>(url)
    // .pipe(
    //   map(u => {
    //     const result = []
    //     u.forEach((follow: any, i: number) => {
    //       for (const followType in follow) {
    //         if (follow[followType]) {
    //           result.push({
    //             [followType]: [],
    //           })
    //           follow[followType].forEach((followItem: any) => {
    //             if (result[i].map())
    //           })
    //         }
    //       }
    //     })
    //     return {}
    //   }),
    // )
  }

  raiseTelemetry(targetId: string, type: string, action: string) {
    this.events.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Warn,
      data: {
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
        type: action,
        subType: type,
        object: {
          id: targetId,
        },
      },
      from: {
        type: 'widget',
        widgetType: 'actionButton',
        widgetSubType: 'follow',
      },
      to: 'Telemetry',
    })
  }

}
