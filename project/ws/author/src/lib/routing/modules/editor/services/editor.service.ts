import { Injectable } from '@angular/core'
import { NsAutoComplete, UserAutocompleteService } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import {
  AUTHORING_CONTENT_BASE,
  CONTENT_BASE_COPY,
  CONTENT_CREATE,
  CONTENT_DELETE,
  CONTENT_READ,
  CONTENT_SAVE,
  CONTENT_SAVE_V2,
  SEARCH,
  STATUS_CHANGE,
  SEARCH_V6_ADMIN,
  SEARCH_V6_AUTH,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NSApiResponse } from '@ws/author/src/lib/interface//apiResponse'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { Observable, of } from 'rxjs'
import { map, mergeMap, catchError } from 'rxjs/operators'
import { CONTENT_READ_MULTIPLE_HIERARCHY } from './../../../../constants/apiEndpoints'
import { ISearchContent, ISearchResult } from '../../../../interface/search'

@Injectable()
export class EditorService {
  accessPath: string[] = []
  constructor(
    private apiService: ApiService,
    private accessService: AccessControlService,
    private userAutoComplete: UserAutocompleteService,
    private configSvc: ConfigurationsService,
  ) { }

  create(meta: NSApiRequest.ICreateMetaRequestGeneral): Observable<string> {
    const requestBody: NSApiRequest.ICreateMetaRequest = {
      content: {
        locale: 'en',
        isExternal: false,
        authoringDisabled: false,
        isMetaEditingDisabled: false,
        isContentEditingDisabled: false,
        category: meta.contentType,
        ...meta,
        createdBy: this.accessService.userId,
      },
    }
    if (this.accessService.rootOrg === 'client2') {
      if (meta.contentType === 'Knowledge Artifact') {
        try {
          const userPath = `client2/Australia/dealer_code-${this.configSvc.unMappedUser.json_unmapped_fields.dealer_group_code}`
          requestBody.content.accessPaths = userPath
        } catch {
          requestBody.content.accessPaths = 'client2'
        }
      } else {
        requestBody.content.accessPaths = 'client2'
      }
    }
    return this.apiService
      .post<NSApiRequest.ICreateMetaRequest>(
        // tslint:disable-next-line:max-line-length
        `${CONTENT_CREATE}${this.accessService.orgRootOrgAsQuery}`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponse) => {
          return data.identifier
        }),
      )
  }

  readContent(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ}${id}${this.accessService.orgRootOrgAsQuery}`,
    )
  }

  readMultipleContent(ids: string[]): Observable<NSContent.IContentMeta[]> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ_MULTIPLE_HIERARCHY}${ids.join()}`,
    )
  }

  createAndReadContent(
    meta: NSApiRequest.ICreateMetaRequestGeneral,
  ): Observable<NSContent.IContentMeta> {
    return this.create(meta).pipe(mergeMap(data => this.readContent(data)))
  }

  updateContent(meta: NSApiRequest.IContentUpdate): Observable<null> {
    return this.apiService.post<null>(
      `${CONTENT_SAVE}${this.accessService.orgRootOrgAsQuery}`,
      meta,
    )
  }

  updateContentV2(meta: NSApiRequest.IContentUpdate): Observable<null> {
    return this.apiService.post<null>(
      `${CONTENT_SAVE_V2}${this.accessService.orgRootOrgAsQuery}`,
      meta,
    )
  }

  fetchEmployeeList(data: string): Observable<any[]> {
    return this.userAutoComplete.fetchAutoComplete(data).pipe(
      map((v: NsAutoComplete.IUserAutoComplete[]) => {
        return v.map(user => {
          return {
            displayName: `${user.first_name || ''} ${user.last_name || ''}`,
            id: user.wid,
            mail: user.email,
            department: user.department_name,
          }
        })
      }),
      catchError(_ => of([])),
    )
  }

  searchSkills(query: string): Observable<any> {
    return this.apiService.get(`/LA/api/search?search_text=${query}&type=skill`).pipe(
      map((v: any) =>
        v.map((val: any) => {
          return {
            identifier: val.identifier,
            name: val.name,
            skill: val.skill,
            category: val.category,
          }
        }),
      ),
    )
  }

  searchV6Content(query = '*', locale: string): Observable<ISearchContent[]> {
    return this.apiService
      .post<ISearchResult>(
        this.accessService.hasRole(['editor', 'admin']) ? SEARCH_V6_ADMIN : SEARCH_V6_AUTH,
        {
          query: query || '*',
          locale: [locale],
          pageSize: 20,
          pageNo: 0,
          filters: [
            {
              andFilters: [
                {
                  status: ['Live'],
                  contentType: ['Course', 'Collection', 'Learning Path', 'Resource'],
                },
              ],
            },
          ],
          uuid: this.accessService.userId,
          rootOrg: this.accessService.rootOrg,
        },
      )
      .pipe(
        map(v => (v && v.result ? v.result : [])),
        catchError(_ => of([])),
      )
  }

  checkUrl(url: string): Observable<any> {
    return this.apiService.get<any>(url)
  }

  forwardBackward(
    meta: NSApiRequest.IForwardBackwardActionGeneral,
    id: string,
    status: string,
  ): Observable<null> {
    const requestBody: NSApiRequest.IForwardBackwardAction = {
      actor: this.accessService.userId,
      ...meta,
      org: this.accessService.org,
      rootOrg: this.accessService.rootOrg || '',
      appName: this.accessService.appName,
      appUrl: window.location.origin,
      actorName: this.accessService.userName,
      action: this.accessService.getAction(status, meta.operation),
    }
    return this.apiService.post<null>(STATUS_CHANGE + id, requestBody)
  }

  readJSON(artifactUrl: string): Observable<any> {
    return this.apiService.get(`${AUTHORING_CONTENT_BASE}${encodeURIComponent(artifactUrl)}`)
  }

  searchContent(searchData: any): Observable<any> {
    return this.apiService
      .post<NSApiResponse.ISearchApiResponse>(SEARCH, searchData)
      .pipe(map((data: NSApiResponse.IApiResponse<NSApiResponse.ISearchApiResponse>) => data))
  }

  checkRole(id: string): Observable<string[]> {
    return this.apiService.get<string[]>(`/apis/protected/V8/user/roles/${id}`).pipe(
      map((v: { default_roles: string[]; user_roles: string[] }) => {
        if (v) {
          let roles: string[] = []
          if (v.default_roles) {
            roles = roles.concat(v.default_roles)
          }
          if (v.user_roles) {
            roles = roles.concat(v.user_roles)
          }
          return roles
        }
        return []
      }),
    )
  }

  getAccessPath(): Observable<string[]> {
    return this.accessPath.length
      ? of()
      : this.apiService.get<string[]>(`/apis/protected/V8/user/accessControl`).pipe(
        map((v: { special: { accessPaths: string[] }[] }) => {
          if (v) {
            v.special.forEach(acc => {
              this.accessPath = this.accessPath.concat(acc.accessPaths)
            })
          }
          return this.accessPath
        }),
      )
  }

  copy(lexId: string, url: string) {
    // tslint:disable-next-line: max-line-length
    const destination = `${this.accessService.rootOrg.replace(
      / /g,
      '_',
    )}%2F${this.accessService.org.replace(/ /g, '_')}%2FPublic%2F${lexId.replace('.img', '')}`
    const location = url.split('/').slice(4, 8).join('%2F')
    return this.apiService.post(
      CONTENT_BASE_COPY,
      {
        destination,
        location,
      },
      false,
    )
  }

  deleteContent(id: string, isKnowledgeBoard = false): Observable<null> {
    return isKnowledgeBoard
      ? this.apiService.delete(`${CONTENT_DELETE}/${id}/kb${this.accessService.orgRootOrgAsQuery}`)
      : this.apiService.post(`${CONTENT_DELETE}${this.accessService.orgRootOrgAsQuery}`, {
        identifier: id,
        author: this.accessService.userId,
        isAdmin: this.accessService.hasRole(['editor', 'admin']),
      })
  }
}
