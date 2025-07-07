import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'

@Injectable({
  providedIn: 'root'
})
export class FormConfigService {
  private formData: BehaviorSubject<any> = new BehaviorSubject(null);
  formData$ = this.formData.asObservable();
  private data: any = {};
  constructor(
    private http: HttpClient,
  ) { }

  setValue(key: string, value: any): void {
    console.log("set value *********", key, value)
    this.data[key] = value
  }

  // Method to get a value
  getValue(key: string): any {
    console.log("get value *********", key, this.data[key])
    return this.data[key] || null
  }

  // Method to remove a value
  removeValue(key: string): void {
    delete this.data[key]
  }

  // Method to clear all stored values
  clearAll(): void {
    this.data = {}
  }

  readFormUIConfig(userDet: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get('/apis/public/v8/mobileApp/getById/homepageconfig/' + userDet?.rootOrgId).toPromise().then((res: any) => {
        console.log("res after login ", res, userDet)
        if (res.length > 0) {
          let roles: any = []
          let frameworkType = window.location.hostname
          let designation = ''
          if (userDet?.profileDetails?.profileReq?.professionalDetails?.length > 0) {
            designation = userDet.profileDetails?.profileReq?.professionalDetails[0]?.designation.toLowerCase()
          }
          res.forEach(item => {
            roles = item.role.toLowerCase().split(', ')
            const layoutName = item.layoutName?.toLowerCase()
            const framework = frameworkType?.toLowerCase()

            if ((roles.includes(designation?.toLowerCase()) && layoutName?.includes(framework)) || (framework === 'sphere' && layoutName?.includes(framework))) {
              console.log("layout name", item.layoutName)
              this.setValue('orgDet', item)
            }
          })
          return resolve(true)
        } else {
          return reject(false)
        }
      })
    })
  }

  getFormConfig(config: any, type: any): Promise<any> {
    let data
    return new Promise((resolve, reject) => {
      this.http.post(`/apis/v1/form/read/?v=${new Date().getTime()}`, config).toPromise().then((res: any) => {
        if (res.responseCode !== 'OK') {
          this.formData.next({ type, data: null })
          return reject(res.params.err)
        } else {
          data = res.result.form.data
          this.setValue(type, data)
          this.formData.next({ type, data })
          return resolve(data)
        }
      })
    })
  }
}
