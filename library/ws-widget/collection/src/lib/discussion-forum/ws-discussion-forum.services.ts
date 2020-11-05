
import { ApiService } from 'project/ws/author/src/lib/modules/shared/services/api.service'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Observable } from 'rxjs'
import { NsDiscussionForum } from './ws-discussion-forum.model'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSApiResponse } from '@ws/author/src/lib/interface/apiResponse'
import { FIXED_FILE_NAME } from '@ws/author/src/lib/constants/upload'
import { CONTENT_BASE_ZIP, CONTENT_BASE } from '@ws/author/src/lib/constants/apiEndpoints'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  // SOCIAL_TIMELINE: `${PROTECTED_SLAG_V8}/social/post/timelineV2`, // this has to be changed(Temporary)
  SOCIAL_TIMELINE: `${PROTECTED_SLAG_V8}/social/post/timeline`,
  SOCIAL_VIEW_CONVERSATION: `${PROTECTED_SLAG_V8}/social/post/viewConversation`,
  SOCIAL_VIEW_CONVERSATION_V2: `${PROTECTED_SLAG_V8}/social/post/viewConversationV2`,
  SOCIAL_POST_PUBLISH: `${PROTECTED_SLAG_V8}/social/post/publish`,
  SOCIAL_POST_DELETE: `${PROTECTED_SLAG_V8}/social/post/delete`,
  SOCIAL_POST_ACTIVITY_UPDATE: `${PROTECTED_SLAG_V8}/social/post/activity/create`,
  SOCIAL_POST_ACTIVITY_USERS: `${PROTECTED_SLAG_V8}/social/post/activity/users`,
  SOCIAL_POST_UPDATE: `${PROTECTED_SLAG_V8}/social/edit/meta`,
}

@Injectable({
  providedIn: 'root',
})
export class WsDiscussionForumService {
  constructor(private http: HttpClient, private apiService: ApiService, private accessService: AccessControlService) { }

  deletePost(postId: string, userId: string) {
    const req: NsDiscussionForum.IPostDeleteRequest = {
      userId,
      id: postId,
    }
    return this.http.post(API_END_POINTS.SOCIAL_POST_DELETE, req)
  }
  updateActivity(
    request: NsDiscussionForum.IPostActivityUpdateRequest | NsDiscussionForum.IPostFlagActivityUpdateRequest,
  ) {
    return this.http.post<any>(API_END_POINTS.SOCIAL_POST_ACTIVITY_UPDATE, request)
  }
  fetchActivityUsers(request: NsDiscussionForum.IActivityUsers): Observable<NsDiscussionForum.IActivityUsersResult> {
    return this.http.post<NsDiscussionForum.IActivityUsersResult>(API_END_POINTS.SOCIAL_POST_ACTIVITY_USERS, request)
  }
  fetchTimelineData(request: NsDiscussionForum.ITimelineRequest): Observable<NsDiscussionForum.ITimeline> {
    return this.http.post<NsDiscussionForum.ITimeline>(API_END_POINTS.SOCIAL_TIMELINE, request)
  }
  publishPost(request: NsDiscussionForum.IPostPublishRequest | NsDiscussionForum.IPostCommentRequest) {
    return this.http.post<any>(API_END_POINTS.SOCIAL_POST_PUBLISH, request)
  }
  updatePost(request: NsDiscussionForum.IPostUpdateRequest) {
    return this.http.put<any>(API_END_POINTS.SOCIAL_POST_UPDATE, request)
  }
  fetchPost(request: NsDiscussionForum.IPostRequest): Observable<NsDiscussionForum.IPostResult> {
    return this.http.post<NsDiscussionForum.IPostResult>(API_END_POINTS.SOCIAL_VIEW_CONVERSATION, request)
  }
  fetchAllPosts(request: NsDiscussionForum.IPostRequestV2): Observable<NsDiscussionForum.IPostResultV2> {
    return this.http.post<NsDiscussionForum.IPostResultV2>(API_END_POINTS.SOCIAL_VIEW_CONVERSATION_V2, request)
  }

  upload(
    data: FormData,
    contentData: NSApiRequest.IContentData,
    options?: any,
    isZip = false,
  ): Observable<NSApiResponse.IFileApiResponse> {
    if (isZip) {
      return this.zipUpload(data, contentData, options)
    }
    const file = data.get('content') as File
    let fileName = file.name
    if (FIXED_FILE_NAME.indexOf(fileName) < 0) {
      fileName = this.appendToFilename(fileName)
    }
    const newFormData = new FormData()
    newFormData.append('content', file, fileName)
    return this.apiService.post<NSApiResponse.IFileApiResponse>(
      // tslint:disable-next-line:max-line-length
      `${CONTENT_BASE}${this.accessService.rootOrg.replace(/ /g, '_')}/${this.accessService.org.replace(/ /g, '_')}/Public/${contentData.contentId.replace('.img', '')}${contentData.contentType}`,
      newFormData,
      false,
      options,
    )
  }

  zipUpload(
    data: FormData,
    contentData: NSApiRequest.IContentData,
    options?: any,
  ): Observable<NSApiResponse.IFileApiResponse> {
    return this.apiService.post<NSApiResponse.IFileApiResponse>(
      // tslint:disable-next-line:max-line-length
      `${CONTENT_BASE_ZIP}${this.accessService.rootOrg.replace(/ /g, '_')}/${this.accessService.org.replace(/ /g, '_')}/Public/${contentData.contentId.replace('.img', '')}${contentData.contentType}`,
      data,
      false,
      options,
    )
  }

  appendToFilename(filename: string) {
    const timeStamp = new Date().getTime()
    const dotIndex = filename.lastIndexOf('.')
    if (dotIndex === -1) {
      return filename + timeStamp
    }
    return filename.substring(0, dotIndex) + timeStamp + filename.substring(dotIndex)
  }
}
