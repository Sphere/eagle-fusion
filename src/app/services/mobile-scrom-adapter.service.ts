import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class MobileScromAdapterService {
  initialize = false

  constructor() { }

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
  loadDataV2() {
    console.log("loadDataV2")
  }
  loadData() {
    console.log("loadData")
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
