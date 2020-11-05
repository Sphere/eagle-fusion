import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IUserForm } from '../users.model'

const END_POINT_BASE = '/apis/protected/v8/user'
const API_END_POINTS = {
  createUser: (keycloak: boolean) => `${END_POINT_BASE}/users/createuser?keycloak=${keycloak}`,
}
@Injectable({
  providedIn: 'root',
})
export class CreateUserService {

  constructor(
    private http: HttpClient,
  ) { }

  createUser(data: IUserForm, keycloak: boolean) {
   return this.http.post<any>(API_END_POINTS.createUser(keycloak), data)
  }
}
