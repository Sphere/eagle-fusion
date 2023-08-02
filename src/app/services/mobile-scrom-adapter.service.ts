import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

const API_END_POINTS = {
  CONTENT_HISTORYV2: `/apis/course/v1/content/state/read`
}

@Injectable({
  providedIn: 'root'
})
export class MobileScromAdapterService {
  initialize = false


  constructor(
    private http: HttpClient,
  ) { }

  LMSInitialize(): boolean {
    this.initialize = true
    return this.initialize
  }
  LMSFinish() {
    console.log("LMSFinish")
  }
  LMSGetValue() {
    console.log("LMSGetValue")
  }
  LMSSetValue() {
    console.log("LMSSetValue")
  }
  LMSCommit() {
    console.log("LMSCommit")
  }
  LMSGetLastError() {
    console.log("LMSGetLastError")
  }
  LMSGetErrorString() {
    console.log("LMSGetErrorString")
  }
  LMSGetDiagnostic() {
    console.log("LMSGetDiagnostic")
  }
  _isInitialized() {
    console.log("_isInitialized")
  }
  _setError() {
    console.log("_setError")
  }
  downladFile() {
    console.log("downladFile")
  }
  loadDataV2(req: any, header: any) {
    console.log("loadDataV2", req)
    req.request.fields = ['progressdetails']
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${header.Authorization}`,
      'X-authenticated-user-token': header.userToken,
      'Content-Type': 'application/json',
    })

    const options = {
      url: `${API_END_POINTS.CONTENT_HISTORYV2}`,
      payload: req,
    }
    this.http.post(options.url, options.payload, { headers }).subscribe(
      (res: any) => {
        console.log(res)
      }
    )
  }

  addData() {
    console.log("addData")
  }
  getStatus() {
    console.log("getStatus")
  }
  getPercentage() {
    console.log("getPercentage")
  }
  addDataV2() {
    console.log("addDataV2")
  }
}
