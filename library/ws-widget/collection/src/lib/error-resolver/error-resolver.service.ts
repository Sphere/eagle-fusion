import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NsError } from './error-resolver.model'

@Injectable({
  providedIn: 'root',
})
export class ErrorResolverService {
  constructor(private http: HttpClient) {}

  async getErrorConfig(path: string): Promise<NsError.IErrorConfig> {
    const errorData: NsError.IErrorConfig = await this.http
      .get<NsError.IErrorConfig>(path)
      .toPromise()
    return errorData
  }
}
