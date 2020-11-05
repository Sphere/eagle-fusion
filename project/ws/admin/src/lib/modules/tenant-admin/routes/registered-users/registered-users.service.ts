import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

const END_POINT_BASE = '/apis/protected/v8/admin/userRegistration'
const API_END_POINTS = {
  listAllUsers: (source: string) => `${END_POINT_BASE}/listUsers/${source}`,
  deregisterUsers: (source: string) => `${END_POINT_BASE}/deregisterUsers/${source}`,
}
@Injectable({
  providedIn: 'root',
})
export class RegisteredUsersService {

  constructor(
    private http: HttpClient,
  ) { }

  listAllUsers(source: string) {
    return this.http.get<any[]>(API_END_POINTS.listAllUsers(source)).toPromise()
  }

  deregisterUsers(req: { source: string, users: string[] }) {
    return this.http.post(API_END_POINTS.deregisterUsers(req.source), req.users).toPromise()
  }
}
