import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

const END_POINTS = {
  exerciseBase: '/apis/protected/v8/user/exercise',
  createContentDirectory: (contentId: string) => `${END_POINTS.exerciseBase}/createContentDirectory/${contentId}`,
  postSubmission: (contentId: string) => `${END_POINTS.exerciseBase}/postsubmission/${contentId}`,
  uploadFile: (contentId: string) => `${END_POINTS.exerciseBase}/uploadFileToContentDirectory/${contentId}`,
  get_Submissions: (type: string, contentId: string) => `${END_POINTS.exerciseBase}/getSubmissions?type=${type}&contentId=${contentId}`,
}

@Injectable({
  providedIn: 'root',
})
export class ResourceCollectionService {

  constructor(
    private http: HttpClient,
  ) { }

  getAllSubmission(type: string, contentId: string) {
    return this.http.get<any[]>(END_POINTS.get_Submissions(type, contentId))
  }

  createContentDirectory(contentId: string) {
    return this.http.post(END_POINTS.createContentDirectory(contentId), null)
  }

  uploadFile(formData: FormData, contentId: string) {
    return this.http.post(END_POINTS.uploadFile(contentId), formData)
  }
  postSubmission(requestData: any, contentId: string) {
    return this.http.post(END_POINTS.postSubmission(contentId), requestData)
  }
  readContentTextFile(url: string) {
    return this.http.get(url, { responseType: 'text' })
  }
}
