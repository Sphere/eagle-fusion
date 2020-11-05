import { Injectable } from '@angular/core'
import { KnowledgeHubApiService } from '../apis/knowledge-hub-api.service'
import {
  IKhubResult,
  ISearchObjForSearch,
  ISearchObjForView,
  ITopicTaggerAction,
  ITopicTaggerResponse,
  IKhubAutoMation,
  IKhubKshop,
  IKhubItemTile,
  IKhubProject,
} from '../models/knowledgeHub.model'
import { Observable } from 'rxjs'
@Injectable({
  providedIn: 'root',
})
export class KnowledgeHubService {
  constructor(private khubApiSrv: KnowledgeHubApiService) {}
  fetchPersonalization(request: ISearchObjForSearch): Observable<IKhubResult> {
    return this.khubApiSrv.fetchPersonalizedData(request)
  }
  fetchViewData(request: ISearchObjForView): Observable<any> {
    return this.khubApiSrv.fetchViewData(request)
  }

  fetchMoreLikeThis(request: ISearchObjForView): Observable<any> {
    return this.khubApiSrv.fetchMoreRecs(request)
  }

  postTopicTaggerAction(request: ITopicTaggerAction): Observable<ITopicTaggerResponse> {
    return this.khubApiSrv.postTopicTagger(request)
  }

  // tslint:disable-next-line: prefer-array-literal
  setTilesDocs(response: Array<IKhubKshop | IKhubAutoMation>) {
    try {
      const tiles: IKhubItemTile[] = []
      response.map((cur: IKhubKshop | IKhubAutoMation) => {
        const tile: IKhubItemTile = {
          author: cur.authors || [],
          category: cur.category || '',
          description: cur.description || '',
          itemId: cur.itemId,
          itemType: cur.itemType || '',
          noOfViews: cur.noOfViews || 0,
          restricted: cur.isAccessRestricted || 'N',
          source: cur.source,
          title: cur.title || '',
          topics: cur.topics || [],
          url: cur.url || '',
          dateCreated: cur.dateCreated ? new Date(cur.dateCreated) : new Date(),
          color: cur.source.toLowerCase() === 'kshop' ? '3px solid #f26522' : '3px solid #28a9b2',
          sourceId: cur.sourceId || 0,
        }
        tiles.push(tile)
      })
      return tiles
    } catch (e) {
      throw e
    }
  }

  setTileProject(response: IKhubProject[]) {
    try {
      const tilesProject: IKhubItemTile[] = []
      response.map((cur: IKhubProject) => {
        const tile: IKhubItemTile = {
          pm: cur.pm || [],
          dm: cur.dm || [],
          objectives: cur.mstInfyObjectives || '',
          risks: cur.risks || [],
          contribution: cur.contributions || [],
          category: 'Project',
          // description: '',
          projectScope: cur.mstProjectScope,
          businessContext: cur.mstBusinessContext,
          itemId: cur.itemId,
          restricted: cur.isAccessRestricted || 'N',
          source: 'PROMT',
          title: cur.mstProjectName || '',
          topics: cur.topics || [],
          url: '',
          dateCreated: new Date(cur.dateStartDate),
          color: '3px solid #e94a48',
          sourceId: 0,
        }
        tilesProject.push(tile)
      })
      return tilesProject
    } catch (e) {
      throw e
    }
  }
}
