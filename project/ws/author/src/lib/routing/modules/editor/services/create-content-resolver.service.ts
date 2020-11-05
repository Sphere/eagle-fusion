import { EditorService } from './editor.service'
import { Injectable } from '@angular/core'
import { Router, ActivatedRouteSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class CreateContentResolverService {

  constructor(
    private editorService: EditorService,
    private router: Router,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const meta = {
      mimeType: 'application/vnd.ekstep.content-collection',
      contentType: 'Knowledge Artifact',
    } as any
    const id = route.params['id'] || route.parent && route.parent.params.id
    return id ? of(null) : this.editorService.create(meta).pipe(
      catchError((v: any) => {
        this.router.navigateByUrl('/error-somethings-wrong')
        return of(v)
      }),
    )
  }
}
