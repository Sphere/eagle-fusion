import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { API_END_POINTS } from '../../../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class ResourceCollectionService {

  constructor(
    private http: HttpClient,
  ) { }

  getAllSubmission(type: string, contentId: string) {
    return this.http.get<any[]>(API_END_POINTS.get_Submissions(type, contentId))
  }

  createContentDirectory(contentId: string) {
    return this.http.post(API_END_POINTS.createContentDirectory(contentId), null)
  }

  uploadFile(formData: FormData, contentId: string) {
    return this.http.post(API_END_POINTS.uploadFile(contentId), formData)
  }
  postSubmission(requestData: any, contentId: string) {
    return this.http.post(API_END_POINTS.postSubmission(contentId), requestData)
  }
  readContentTextFile(url: string) {
    return this.http.get(url, { responseType: 'text' })
  }
}
