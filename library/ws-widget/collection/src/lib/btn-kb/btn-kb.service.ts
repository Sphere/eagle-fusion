import { Injectable } from '@angular/core'
import { WidgetContentService } from '../_services/widget-content.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { HttpClient } from '@angular/common/http'
import { NsContent } from '../_services/widget-content.model'

const API_END_POINTS = {
  updateHierarchy: `/apis/protected/v8/content/hierarchy/update`,
  editKBDetails: `/apis/protected/v8/content/kb`,
  getFollowers: `/apis/protected/v8/user/follow/getFollowers`,
  editKBDetailsV2: `/apis/protected/v8/content/kb/v2`,
  reorderKbV3: `/apis/protected/v8/content/kb/v3/reorder`,
}

@Injectable({
  providedIn: 'root',
})
export class BtnKbService {
  constructor(
    private contentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,
    private http: HttpClient,
  ) { }

  getMyKnowledgeBoards() {
    return this.contentSvc.search({
      filters: {
        contentType: [NsContent.EContentTypes.KNOWLEDGE_BOARD],
        creatorContacts: [(this.configSvc.userProfile && this.configSvc.userProfile.userId) || ''],
      },
      pageSize: 50,
    })
  }

  addContentToKb(kbId: string, children: { identifier: string; reason: string | undefined }[]) {
    return this.http.post(API_END_POINTS.updateHierarchy, {
      nodesModified: {},
      excludeRetry: true,
      hierarchy: {
        [kbId]: {
          children,
          root: true,
        },
      },
    })
  }
  addContentsToKb(req: any) {
    return this.http.post(`${API_END_POINTS.updateHierarchy}`, {
      ...req,
      excludeRetry: true,
    })
  }

  editKBBoards(req: any, type: string) {
    return this.http.post(`${API_END_POINTS.editKBDetails}/${type}`, {
      ...req,
      excludeRetry: true,
    })
  }

  getFollowers(id: string) {
    return this.http.post(`${API_END_POINTS.getFollowers}`, { id })
  }

  modifyKBV2(req: any, type: string) {
    return this.http.post(`${API_END_POINTS.editKBDetailsV2}/${type}`, {
      ...req,
      excludeRetry: true,
    })
  }

  reorderKBV3(req: any) {
    return this.http.post(`${API_END_POINTS.reorderKbV3}`, {
      ...req,
      excludeRetry: true,
    })
  }
}
