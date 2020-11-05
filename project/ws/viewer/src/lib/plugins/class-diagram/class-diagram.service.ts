import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { NSClassDiagram } from './class-diagram.model'

const apiEndpoints = {
  CLASS_DIAGRAM_SUBMIT: `/apis/protected/v8/user/class-diagram/classdiagram/submit/`,
}
@Injectable({
  providedIn: 'root',
})
export class ClassDiagramService {
  constructor(private http: HttpClient) { }

  submitClassDiagram(req: { userSolution: any; identifier: string; }): Observable<NSClassDiagram.IClassDiagramApiResponse> {
    const reqBody = {
      user_solution: JSON.stringify({ options: req.userSolution }),
      user_id_type: 'uuid',
      ignore_error: true,
    }
    // tslint:disable-next-line:max-line-length
    return this.http.post<NSClassDiagram.IClassDiagramApiResponse>(apiEndpoints.CLASS_DIAGRAM_SUBMIT + req.identifier, reqBody).pipe(map(response => response))
  }
}
