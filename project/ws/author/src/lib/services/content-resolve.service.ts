import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { Observable, of } from 'rxjs'
import { ApiService } from '../modules/shared/services/api.service'
import { NSContent } from '../interface/content'
import { CONTENT_READ } from '../constants/apiEndpoints'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { catchError } from 'rxjs/operators'

@Injectable()
export class ContentTOCResolver  {

  constructor(
    private apiService: ApiService,
    private accessService: AccessControlService,
    private router: Router,
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<NSContent.IContentMeta> {
    const id = route.params['id']
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ}${id}${this.accessService.orgRootOrgAsQuery}`,
    ).pipe(
      catchError((v: any) => {
        this.router.navigateByUrl('/error-somethings-wrong')
        return of(v)
      }),
    )
  }
}
