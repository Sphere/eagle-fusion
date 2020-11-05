import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { CONTENT_CREATE } from '@ws/author/src/lib/constants/apiEndpoints'
import { NSApiResponse } from '@ws/author/src/lib/interface//apiResponse'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class DashBoardService {
  constructor(
    private apiService: ApiService,
    private configSvc: ConfigurationsService,
    private accessService: AccessControlService,
  ) { }

  create(meta: { mimeType: string; contentType: string }): Observable<string> {
    const requestBody: NSApiRequest.ICreateMetaRequest = {
      content: {
        isExternal: false,
        ...meta,
        name: 'Untitled Content',
        description: '',
        locale: this.accessService.locale,
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
        `${CONTENT_CREATE}${this.accessService.orgRootOrgAsQuery}`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponse) => {
          return data.identifier
        }),
      )
  }
}
