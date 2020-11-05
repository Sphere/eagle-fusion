import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const API_END_POINTS = {
  USER_SIGNUP: `/apis/public/v8/signup`,
}

@Injectable({
  providedIn: 'root',
})
export class SignupService {

  constructor(private http: HttpClient) { }

  signup(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_SIGNUP, data).pipe(
      map(response => {
        return response.result
      }),
    )
  }
}
