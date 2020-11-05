import { ISearchResult } from './../../../../interface/search'
import { HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import {
  CONTENT_CREATE,
  CONTENT_DELETE,
  CONTENT_READ,
  SEARCH,
  STATUS_CHANGE,
  UNPUBLISH,
  EXPIRY_DATE_ACTION,
  CONTENT_RESTORE,
  SEARCH_V6_ADMIN,
  SEARCH_V6_AUTH,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSApiResponse } from '@ws/author/src/lib/interface/apiResponse'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { IFormMeta } from '../../../../interface/form'
import { AuthInitService } from './../../../../services/init.service'

@Injectable()
export class MyContentService {
  constructor(
    private authInitService: AuthInitService,
    private apiService: ApiService,
    private accessService: AccessControlService,
    private configSvc: ConfigurationsService,
  ) { }

  fetchContent(searchData: any): Observable<any> {
    return this.apiService
      .post<NSApiResponse.ISearchApiResponse>(SEARCH, searchData)
      .pipe(map((data: NSApiResponse.IApiResponse<NSApiResponse.ISearchApiResponse>) => data))
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

  restoreContent(id: string): Observable<null> {
    return this.apiService.post(`${CONTENT_RESTORE}${this.accessService.orgRootOrgAsQuery}`, {
      identifier: id,
      author: this.accessService.userId,
      isAdmin: this.accessService.hasRole(['editor', 'admin']),
    })
  }

  fetchFromSearchV6(searchData: any, forAdmin = false): Observable<ISearchResult> {
    return this.apiService.post<ISearchResult>(
      forAdmin ? SEARCH_V6_ADMIN : SEARCH_V6_AUTH,
      searchData,
    )
  }

  readContent(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ}${id}${this.accessService.orgRootOrgAsQuery}`,
    )
  }

  createInAnotherLanguage(id: string, lang: string): Observable<string> {
    return this.readContent(id).pipe(
      mergeMap(content => {
        let requestObj: any = {}
        Object.keys(this.authInitService.authConfig).map(
          v =>
            (requestObj[v as any] = content[v as keyof NSContent.IContentMeta]
              ? content[v as keyof NSContent.IContentMeta]
              : JSON.parse(
                JSON.stringify(
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                    content.contentType
                    // tslint:disable-next-line: ter-computed-property-spacing
                  ][0].value,
                ),
              )),
        )
        requestObj = {
          ...requestObj,
          name: '',
          description: '',
          body: '',
          locale: lang,
          subTitle: '',
          appIcon: '',
          posterImage: '',
          thumbnail: '',
          isTranslationOf: id,
        }
        delete requestObj.identifier
        delete requestObj.status
        delete requestObj.categoryType
        delete requestObj.accessPaths
        return this.create(requestObj)
      }),
    )
  }

  create(meta: any): Observable<string> {
    const requestBody: NSApiRequest.ICreateMetaRequest = {
      content: {
        isExternal: false,
        ...meta,
        createdBy: this.accessService.userId,
        locale: meta.locale ? meta.locale : this.accessService.locale,
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

  actionOnExpiry(meta: { expiryDate?: string; isExtend: boolean }, id: string): Observable<null> {
    const requestBody = {
      ...meta,
      identifier: id,
      org: this.accessService.org,
      rootOrg: this.accessService.rootOrg || '',
    }
    return this.apiService.post<null>(EXPIRY_DATE_ACTION, requestBody)
  }

  upPublishOrDraft(id: string, unpublish = true): Observable<null> {
    const requestBody = {
      unpublish,
      identifier: id,
    }
    return this.apiService.post<any>(
      `${UNPUBLISH}${this.accessService.orgRootOrgAsQuery}`,
      requestBody,
      true,
      {
        headers: new HttpHeaders({
          Accept: 'text/plain',
        }),
        responseType: 'text',
      },
    )
  }

  getSearchBody(
    mode: string,
    locale: string[] = [],
    pageNo = 0,
    query = '*',
    forAdmin = false,
    pageSize = 24,
  ): any {
    const searchV6Body = {
      locale,
      pageSize,
      pageNo,
      query,
      filters: [
        {
          andFilters: [
            {
              status: <string[]>[],
              creatorContacts: undefined as any,
              trackContacts: undefined as any,
              publisherDetails: undefined as any,
              expiryDate: undefined as any,
            } as any,
          ],
        },
      ],
      visibleFilters: {
        learningMode: { displayName: 'Mode' },
        duration: { displayName: 'Duration' },
        contentType: { displayName: 'Content Type' },
        exclusiveContent: { displayName: 'Costs' },
        complexityLevel: { displayName: 'Level' },
        catalogPaths: { displayName: 'Catalog', order: [{ _key: 'asc' }] },
        sourceShortName: { displayName: 'Source' },
        resourceType: { displayName: 'Format' },
        region: { displayName: 'Region' },
        concepts: { displayName: 'Concepts' },
        lastUpdatedOn: { displayName: 'Last Updated' },
        creatorContacts: { displayName: 'Curators', order: [{ _key: 'asc' }] },
      },
      sort: undefined as any,
      uuid: this.accessService.userId,
      rootOrg: this.accessService.rootOrg,
    }
    if (mode === 'all') {
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      if (!forAdmin) {
        searchV6Body.filters[0] = {
          andFilters: [
            {
              creatorContacts: [this.accessService.userId],
              status: [
                'Draft',
                'InReview',
                'Reviewed',
                'Processing',
                'Live',
                'Deleted',
                'Unpublished',
                'QualityReview',
                'Expired',
                'MarkedForDeletion',
              ],
            },
          ],
        }
        searchV6Body.filters[1] = {
          andFilters: [{ trackContacts: [this.accessService.userId], status: ['InReview'] }],
        }
        searchV6Body.filters[2] = {
          andFilters: [{ publisherDetails: [this.accessService.userId], status: ['Reviewed'] }],
        }
      } else {
        searchV6Body.filters[0].andFilters[0].status = [
          'Draft',
          'InReview',
          'Reviewed',
          'Processing',
          'Live',
          'Deleted',
          'Unpublished',
          'QualityReview',
          'Expired',
          'MarkedForDeletion',
        ]
      }
    } else if (mode === 'expiry') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Live')
      searchV6Body.filters[0].andFilters[0].expiryDate = [
        {
          lte: this.accessService.convertToESDate(
            new Date(new Date().setMonth(new Date().getMonth() + 1)),
          ),
          gte: this.accessService.convertToESDate(new Date()),
        },
      ]
      searchV6Body.sort = [{ expiryDate: 'asc' }]
    } else if (mode === 'draft') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Draft')
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
    } else if (mode === 'inreview') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status = ['InReview', 'Reviewed', 'QualityReview']
    } else if (mode === 'published') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Live')
    } else if (mode === 'unpublished') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Unpublished')
    } else if (mode === 'deleted') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Deleted')
    } else if (mode === 'processing') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Processing')
    } else if (mode === 'review') {
      searchV6Body.filters[0].andFilters[0].trackContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].status.push('InReview')
    } else if (mode === 'qualityReview') {
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].status.push('QualityReview')
    } else if (mode === 'publish') {
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].publisherDetails = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Reviewed')
    }
    if (forAdmin) {
      searchV6Body.filters[0].andFilters[0].publisherDetails = undefined
      searchV6Body.filters[0].andFilters[0].creatorContacts = undefined
      searchV6Body.filters[0].andFilters[0].trackContacts = undefined
    }
    if (query && query !== 'all' && query !== '*') {
      searchV6Body.sort = undefined
    }
    return searchV6Body
  }
}
