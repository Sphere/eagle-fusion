import { AUTHORING_BASE } from './../../../constants/apiEndpoints'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) { }

  public base64(url: string, body: any): any {
    if (url.startsWith(AUTHORING_BASE)) {
      const sString = JSON.stringify(body)
      const aUTF16CodeUnits = new Uint16Array(sString.length)
      Array.prototype.forEach.call(aUTF16CodeUnits, (_el, idx, arr) => arr[idx] = sString.charCodeAt(idx))
      return { data: btoa(new Uint8Array(aUTF16CodeUnits.buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')) }
    }
    return body
  }

  get<T>(url: string, options?: any): Observable<any> {
    return this.http.get<T>(url, options || undefined)
  }

  post<T>(url: string, body: any, doEncoding = true, options?: any): Observable<any> {
    return this.http.post<T>(url, doEncoding ? this.base64(url, body) : body, options || undefined)
  }

  put<T>(url: string, body: any, options?: any): Observable<any> {
    return this.http.put<T>(url, this.base64(url, body), options || undefined)
  }

  patch<T>(url: string, body: any, options?: any): Observable<any> {
    return this.http.patch<T>(url, this.base64(url, body), options || undefined)
  }

  delete<T>(url: string, options?: any): Observable<any> {
    return this.http.delete<T>(url, options || undefined)
  }

}
