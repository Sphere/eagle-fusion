import { Injectable } from '@angular/core'
import { BehaviorSubject, Subject, Observable } from 'rxjs'
import { finalize } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import * as fileSaver from 'file-saver'

const API_ENDPOINTS = {
  bulkUpload: `/apis/protected/v8/admin/userRegistration/bulkUpload`,
  downloadReport: `/apis/protected/v8/admin/userRegistration/bulkUploadReport`,
}

@Injectable()
export class FileService {
    // tslint:disable-next-line: prefer-array-literal
    private fileList: string[] = new Array<string>()
    private fileList$: Subject<string[]> = new Subject<string[]>()
    private displayLoader$: Subject<boolean> = new BehaviorSubject<boolean>(false)

    constructor(private http: HttpClient) { }

    public isLoading(): Observable<boolean> {
      return this.displayLoader$
    }

    public upload(fileName: string, fileContent: string): Observable<any> {
      this.displayLoader$.next(true)
      return this.http.post<any>(API_ENDPOINTS.bulkUpload, { name: fileName, content: fileContent })
      .pipe(finalize(() => this.displayLoader$.next(false)))
    }

    public download(): void {
      // const httpOptions = {
      //   headers: new HttpHeaders({ responseType:  'blob',
      //   'Content-Type':  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
      // }
      this.http.get('/assets/common/user-bulk-upload-sample.xlsx', { responseType:  'blob' }).subscribe((res: any) => {
        // window.open(window.URL.createObjectURL(res))
        fileSaver.saveAs(res, 'user-bulk-upload-sample.xlsx')
      })
    }

    public downloadReport(id: any, name: string) {
        return this.http.get(`${API_ENDPOINTS.downloadReport}/${id}`).subscribe(
          (response: any) => {
            const blobObj = new Blob([new Uint8Array(response.report.data)])
            fileSaver.saveAs(blobObj, `${name.split('.')[0]}-report.csv`)
            return response
          },
        )
    }

    public remove(fileName: any): void {
      this.http.delete('/files/${fileName}').subscribe(() => {
        this.fileList.splice(this.fileList.findIndex(name => name === fileName), 1)
        this.fileList$.next(this.fileList)
      })
    }

    public list(): Observable<string[]> {
      return this.fileList$
    }

    // private addFileToList(fileName: string): void {
    //   this.fileList.push(fileName)
    //   this.fileList$.next(this.fileList)
    // }

    validateFile(name: String) {
      const allowedFormats = ['xlsx']
        const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
        if (allowedFormats.indexOf(ext) > -1) {
            return true
        // tslint:disable-next-line: no-else-after-return
        } else {
            return false
        }
    }
}
