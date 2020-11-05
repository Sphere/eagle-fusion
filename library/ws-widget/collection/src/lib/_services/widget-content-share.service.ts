import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'
import { NsContent } from './widget-content.model'
import { NsShare } from './widget-share.model'
import { ICommon } from '../_models/common.model'

const API_END_POINTS = {
  USER_SHARE: `/apis/protected/v8/user/share`,
  USER_CONTENT_SHARE: `/apis/protected/v8/user/share/content`,
}

@Injectable({
  providedIn: 'root',
})
export class WidgetContentShareService {
  baseUrl = this.configSvc.sitePath

  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }

  fetchConfigFile(): Observable<ICommon> {
    return this.http.get<ICommon>(`${this.baseUrl}/feature/common.json`).pipe()
  }

  private shareContentApi(req: NsShare.IEmailRequest): Observable<NsShare.IEmailResponse> {
    return this.http.post<NsShare.IEmailResponse>(API_END_POINTS.USER_SHARE, req)
  }
  shareContent(
    content: NsContent.IContent,
    userMailIds: { email: string }[],
    txtBody: string,
    type: 'attachment' | 'share' | 'query' = 'share',
  ): Observable<NsShare.IEmailResponse> {
    let userName = ''
    let userEmail = ''
    if (this.configSvc.userProfile) {
      userName = this.configSvc.userProfile.userName || ''
      userEmail = this.configSvc.userProfile.email || ''
    }
    const profile: { name: string; email: string } = {
      email: userEmail,
      name: userName,
    }
    return this.shareContentApi(
      this.shareRequestBuilder(content, userMailIds, txtBody, profile, type),
    )
  }
  private shareRequestBuilder(
    content: NsContent.IContent,
    userMailIds: { email: string }[],
    txtBody: string,
    user: { name: string; email: string },
    type: 'attachment' | 'share' | 'query',
  ): NsShare.IEmailRequest {
    return {
      appURL: location.origin,
      artifacts: [
        {
          artifactUrl: content.artifactUrl || '',
          authors: content.creatorContacts,
          description: content.description,
          downloadUrl: content.downloadUrl || '',
          duration: `${content.duration}`,
          identifier: content.identifier,
          size: content.size || 0,
          thumbnailUrl: content.appIcon,
          title: content.name,
          track: (content.track || []).map(t => t.name).join(';'),
          url: `${document.baseURI}app/toc/${content.identifier}/overview`,
        },
      ],
      body: {
        text: txtBody,
        isHTML: false,
      },
      ccTo:
        type === 'attachment'
          ? []
          : [
            {
              name: user.name,
              email: user.email,
            },
          ],
      emailTo:
        type === 'attachment'
          ? [
            {
              name: user.name,
              email: user.email,
            },
          ]
          : userMailIds,
      emailType: type,
      sharedBy: [
        {
          name: user.name,
          email: user.email,
        },
      ],
      timestamp: Date.now(),
    }
  }

  contentShareNew(req: NsShare.IShareRequest) {
    return this.http.post(API_END_POINTS.USER_CONTENT_SHARE, req)
  }
}
