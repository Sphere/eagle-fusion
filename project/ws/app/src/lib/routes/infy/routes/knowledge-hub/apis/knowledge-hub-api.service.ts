import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import {
  ISearchObj,
  IKhubResult,
  ISearchObjForView,
  ISearchObjForSearch,
  ITopicTaggerAction,
  ITopicTaggerResponse,
  IKhubViewResultProject,
  IKhubViewResultDocs,
} from '../models/knowledgeHub.model'
// TODO: move this in some common place
const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const apiEndPoints = {
  // KHUB_DATA: `${PROTECTED_SLAG_V8}post/graphData`,
  KHUB_HOME: `${PROTECTED_SLAG_V8}/khub/home`,
  KHUB_TIMELINE: `${PROTECTED_SLAG_V8}/khub/search/`,
  KHUB_ITEM_GET: `${PROTECTED_SLAG_V8}/khub/item/`,
  KHUB_MORE_RECS: `${PROTECTED_SLAG_V8}/khub/moreLike/`,
  KHUB_TOPIC_TAGGER: `${PROTECTED_SLAG_V8}/khub/topic`,
}

@Injectable({
  providedIn: 'root',
})
export class KnowledgeHubApiService {
  constructor(private http: HttpClient) {}

  fetchPersonalizedData(request: ISearchObj): Observable<IKhubResult> {
    return this.http.get<any>(`${apiEndPoints.KHUB_HOME}?size=${request.size}`)
  }
  fetchSearchDataDocs(request: ISearchObjForSearch): Observable<IKhubViewResultDocs> {
    return this.http.get<IKhubViewResultDocs>(
      `${apiEndPoints.KHUB_TIMELINE}${request.searchQuery}/${request.from}/${request.size}/${
        request.category
      }?filter=${request.filter}`,
    )
  }
  fetchSearchDataProject(request: ISearchObjForSearch): Observable<IKhubViewResultProject> {
    return this.http.get<IKhubViewResultProject>(
      `${apiEndPoints.KHUB_TIMELINE}${request.searchQuery}/${request.from}/${request.size}/${
        request.category
      }?filter=${request.filter}`,
    )
  }

  fetchViewData(request: ISearchObjForView): Observable<any> {
    return this.http.get<any>(`${apiEndPoints.KHUB_ITEM_GET}${request.itemId}`)
  }

  fetchMoreRecs(request: ISearchObjForView): Observable<any> {
    const source = request.category === 'promt' ? '' : request.category
    return this.http.get<any>(
      `${apiEndPoints.KHUB_MORE_RECS}${source}/${request.itemId}/${request.source}`,
    )
  }

  postTopicTagger(request: ITopicTaggerAction): Observable<ITopicTaggerResponse> {
    return this.http.post<any>(apiEndPoints.KHUB_TOPIC_TAGGER, request)
  }
}
