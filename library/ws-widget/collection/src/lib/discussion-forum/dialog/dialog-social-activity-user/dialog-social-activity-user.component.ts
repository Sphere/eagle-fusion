import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA, MatTabChangeEvent } from '@angular/material'
import { HttpErrorResponse } from '@angular/common/http'

import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { WsDiscussionForumService } from '../../ws-discussion-forum.services'
import { WsDiscussionForumUserService } from '../../ws-discussion-forum-user.service'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'

const TAB_INDEX_ACTIVITY_TYPE_MAPPING: { [key: number]: string } = {
  0: 'like',
  1: 'upvote',
  2: 'downvote',
}

@Component({
  selector: 'ws-widget-dialog-social-activity-user',
  templateUrl: './dialog-social-activity-user.component.html',
  styleUrls: ['./dialog-social-activity-user.component.scss'],
})
export class DialogSocialActivityUserComponent implements OnInit {
  commonRequestForActivityUsers = {
    postId: this.data.postId,
    pgNo: 0,
    pgSize: 20,
  }

  activityUsersFetchRequest: {
    like: NsDiscussionForum.IActivityUsers;
    upvote: NsDiscussionForum.IActivityUsers;
    downvote: NsDiscussionForum.IActivityUsers;
  } = {
    like: { ...this.commonRequestForActivityUsers, activityType: NsDiscussionForum.EActivityType.LIKE },
    upvote: { ...this.commonRequestForActivityUsers, activityType: NsDiscussionForum.EActivityType.UPVOTE },
    downvote: {
      ...this.commonRequestForActivityUsers,
      activityType: NsDiscussionForum.EActivityType.DOWNVOTE,
    },
  }

  activityUsersResult: {
    like: { data: NsDiscussionForum.IActivityUsersResult | null; fetchStatus: TFetchStatus };
    upvote: { data: NsDiscussionForum.IActivityUsersResult | null; fetchStatus: TFetchStatus };
    downvote: { data: NsDiscussionForum.IActivityUsersResult | null; fetchStatus: TFetchStatus };
    [key: string]: { data: NsDiscussionForum.IActivityUsersResult | null; fetchStatus: TFetchStatus };
  } = {
    like: { data: null, fetchStatus: 'none' },
    upvote: { data: null, fetchStatus: 'none' },
    downvote: { data: null, fetchStatus: 'none' },
  }

  selectedTabIndex = 0
  userId = ''
  userFollowData: NsDiscussionForum.IUserFollow | null = null
  userFollowFetchStatus: TFetchStatus = 'none'

  constructor(
    public dialogRef: MatDialogRef<DialogSocialActivityUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NsDiscussionForum.IDialogActivityUsers,
    private socialSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
    private userSvc: WsDiscussionForumUserService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() {
    try {
      for (const index in TAB_INDEX_ACTIVITY_TYPE_MAPPING) {
        if (TAB_INDEX_ACTIVITY_TYPE_MAPPING[index] === this.data.activityType) {
          this.selectedTabIndex = Number(index)
          break
        }
      }
    } catch (e) {
      this.selectedTabIndex = 0
    }
    this.fetchUserFollowers()
    this.fetchActivityUsers(this.data.activityType)
  }

  fetchActivityUsers(activityType: NsDiscussionForum.EActivityType) {
    if (
      this.activityUsersResult[activityType].fetchStatus === 'fetching' ||
      this.activityUsersResult[activityType].fetchStatus === 'done'
    ) {
      return
    }
    this.activityUsersResult[activityType].fetchStatus = 'fetching'
    this.socialSvc.fetchActivityUsers(this.activityUsersFetchRequest[activityType]).subscribe(
      data => {
        if (data && data.total) {
          if (!this.activityUsersResult[activityType].data) {
            this.activityUsersResult[activityType].data = data || {
              total: 0,
              users: [],
            }
          } else {
            const activityResultsData = this.activityUsersResult[activityType].data
            if (activityResultsData) {
              (this.activityUsersResult[activityType].data as NsDiscussionForum.IActivityUsersResult).users = [
                ...activityResultsData.users,
                ...data.users,
              ]
            }
          }
          if (
            data.total >
            (this.activityUsersResult[activityType].data as NsDiscussionForum.IActivityUsersResult).users.length
          ) {
            this.activityUsersResult[activityType].fetchStatus = 'hasMore'
          } else {
            this.activityUsersResult[activityType].fetchStatus = 'done'
          }
        } else {
          this.activityUsersResult[activityType].fetchStatus = 'none'
        }
        (this.activityUsersFetchRequest[activityType].pgNo as number) += 1
      },
      (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.activityUsersResult[activityType].fetchStatus = 'none'
        } else {
          this.activityUsersResult[activityType].fetchStatus = 'error'
        }
      },
    )
  }

  private fetchUserFollowers() {
    this.userFollowFetchStatus = 'fetching'
    this.userSvc.fetchUserFollow(this.userId).subscribe(
      data => {
        this.userFollowData = data || { followers: [], following: [] }
        this.userFollowFetchStatus = 'done'
      },
      (_err: any) => {
        this.userFollowData = { followers: [], following: [] }
        this.userFollowFetchStatus = 'error'
      },
    )
  }

  ifFollowing(id: string): boolean {
    if (this.userFollowData && this.userFollowData.following.map(user => user.id).includes(id)) {
      return true
    }
    return false
  }

  follow(user: NsDiscussionForum.IUserFollowEntity) {
    if (this.userFollowData) {
      this.userFollowData.following.push(user)
    }
    this.userSvc
      .followUser({ followsourceid: this.userId, followtargetid: user.id })
      .subscribe()
  }

  unFollow(user: NsDiscussionForum.IUserFollowEntity) {
    if (this.userFollowData) {
      this.userFollowData.following = this.userFollowData.following.filter(
        (userData: any) => userData.id !== user.id,
      )
    }
    this.userSvc
      .unFollowUser({ followsourceid: this.userId, followtargetid: user.id })
      .subscribe()
  }

  toggleFollow(user: NsDiscussionForum.IUserFollowEntity) {
    this.ifFollowing(user.id) ? this.unFollow(user) : this.follow(user)
  }

  tabChange(event: MatTabChangeEvent) {
    if (!this.activityUsersResult[TAB_INDEX_ACTIVITY_TYPE_MAPPING[event.index]].data) {
      this.fetchActivityUsers(TAB_INDEX_ACTIVITY_TYPE_MAPPING[event.index] as NsDiscussionForum.EActivityType)
    }
  }
}
