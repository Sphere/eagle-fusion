import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class UserRolesService {

  endPoints = {
    getAllUserRoles: '/apis/protected/v8/admin/userRoles/allRoles',
    getUserRoles: '/apis/protected/v8/admin/userRoles',
    updateUserRoles: '/apis/protected/v8/admin/userRoles',
  }

  constructor(
    private http: HttpClient,
  ) { }

  getAllUserRoles(): Promise<any> {
    return this.http.get<any>(this.endPoints.getAllUserRoles).toPromise()
  }

  getUserRoles(id: string): Promise<any> {
    return this.http.get<any>(`${this.endPoints.getUserRoles}/${id}`).toPromise()
  }

  updateUserRoles(data: any) {
    return this.http.put<any>(`${this.endPoints.updateUserRoles}`, data).toPromise()
  }
}
