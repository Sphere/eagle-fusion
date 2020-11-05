import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'

import { IResolveResponse } from '@ws-widget/utils'

import { ICertificationMeta } from '../models/certification.model'
import { CertificationApiService } from '../apis/certification-api.service'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class CertificationMetaResolver implements Resolve<IResolveResponse<ICertificationMeta>> {
  constructor(private certificationApi: CertificationApiService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IResolveResponse<ICertificationMeta>> {
    let contentId

    if (route.parent) {
      contentId = route.parent.paramMap.get('id')
    }

    if (contentId) {
      return this.certificationApi.getCertificationInfo(contentId).pipe(
        map(data => ({ data, error: null })),
        catchError((error: any) => of({ error, data: null })),
      )
    }
    return of({ error: 'NO_ID', data: null })
  }
}
