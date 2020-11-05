import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { catchError } from 'rxjs/operators'

import {
  IAccLocation,
  ITestCenterSlotList,
  ICertificationMeta,
  ICertificationCountry,
  IAtDeskLocation,
  IAtDeskSlotItem,
  IAtDeskBooking,
  ICertificationRequestItem,
  ICertificationCurrency,
  IBudgetApprovalRequest,
  ICertificationApproverAction,
  ICertificationSubmission,
  ICertificationSendResponse,
  TCertificationResultAction,
  ISubmitOrWithdrawRequest,
  TCertificationCompletionStatus,
  ICertificationUserPrivileges,
} from '../models/certification.model'

@Injectable()
export class CertificationApiService {
  private readonly BASE = '/apis/protected/v8/certifications'

  constructor(private http: HttpClient) {}

  getCertificationInfo(certificationId: string): Observable<ICertificationMeta> {
    return this.http.get<ICertificationMeta>(`${this.BASE}/${certificationId}/bookingInfo`)
  }

  getTestCenters(certificationId: string): Observable<IAccLocation[]> {
    return this.http.get<IAccLocation[]>(`${this.BASE}/${certificationId}/testCenters`)
  }

  getTestCenterSlots(
    certificationId: string,
    location: string,
    testCenter: string,
  ): Observable<ITestCenterSlotList> {
    return this.http.get<ITestCenterSlotList>(
      `${this.BASE}/${certificationId}/locations/${location}/testCenters/${testCenter}/slots`,
    )
  }

  bookAccSlot(certificationId: string, slotNo: number): Observable<ICertificationSendResponse> {
    return this.http.post<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/booking/${slotNo}`,
      {},
    )
  }

  getCountries(): Observable<ICertificationCountry[]> {
    return this.http.get<ICertificationCountry[]>(`${this.BASE}/countries`)
  }

  getAtDeskLocations(countryCode: string): Observable<IAtDeskLocation[]> {
    return this.http.get<IAtDeskLocation[]>(`${this.BASE}/countries/${countryCode}/locations`)
  }

  getAtDeskSlots(): Observable<IAtDeskSlotItem[]> {
    return this.http.get<IAtDeskSlotItem[]>(`${this.BASE}/slots`)
  }

  bookAtDeskSlot(
    certificationId: string,
    atDeskBooking: IAtDeskBooking,
  ): Observable<ICertificationSendResponse> {
    return this.http.post<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/atDeskBooking`,
      atDeskBooking,
    )
  }

  cancelSlot(
    certificationId: string,
    slotNo: number,
    icfdId?: number,
  ): Observable<ICertificationSendResponse> {
    let params = new HttpParams()
    if (icfdId) {
      params = params.append('icfdId', `${icfdId}`)
    }

    return this.http.delete<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/slots/${slotNo}`,
      {
        params,
      },
    )
  }

  getCurrencies(): Observable<ICertificationCurrency[]> {
    return this.http.get<ICertificationCurrency[]>(`${this.BASE}/currencies`)
  }

  sendBudgetApprovalRequest(
    certificationId: string,
    budgetRequest: IBudgetApprovalRequest,
  ): Observable<ICertificationSendResponse> {
    return this.http.post<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/budgetRequest`,
      budgetRequest,
    )
  }

  cancelBudgetApprovalRequest(certificationId: string): Observable<ICertificationSendResponse> {
    return this.http.delete<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/budgetRequest`,
    )
  }

  sendExternalProof(
    certificationId: string,
    proof: FormData,
  ): Observable<ICertificationSendResponse> {
    return this.http.post<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/result`,
      proof,
    )
  }

  deleteExternalProof(
    certificationId: string,
    documentUrl: string,
  ): Observable<ICertificationSendResponse> {
    return this.http.delete<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/document`,
      { params: { documentUrl } },
    )
  }

  submitOrWithdrawVerificationRequest(
    certificationId: string,
    resultData: ISubmitOrWithdrawRequest,
    action: TCertificationResultAction,
  ): Observable<ICertificationSendResponse> {
    let params = new HttpParams()
    params = params.append('action', action)

    return this.http.patch<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/result`,
      resultData,
      { params },
    )
  }

  getUploadedDocument(documentUrl: string) {
    let params = new HttpParams()
    params = params.append('documentUrl', documentUrl)

    return this.http.get(`${this.BASE}/submittedDocument`, { params })
  }

  getApprovalItems(type?: string): Observable<ICertificationRequestItem[]> {
    let params = new HttpParams()
    if (type) {
      params = params.append('type', type)
    }

    return this.http
      .get<ICertificationRequestItem[]>(`${this.BASE}/certificationApprovals`, {
        params,
      })
      .pipe(catchError(() => of([])))
  }

  getCertificationRequests(
    startDate: number,
    endDate: number,
    type?: string | null,
  ): Observable<ICertificationRequestItem[]> {
    let params = new HttpParams()
    params = params.append('startDate', `${startDate}`)
    params = params.append('endDate', `${endDate}`)

    if (type) {
      params = params.append('type', type)
    }

    return this.http.get<ICertificationRequestItem[]>(`${this.BASE}/certificationRequests`, {
      params,
    })
  }

  sendAtDeskProctorAction(
    icfdId: number,
    approverAction: ICertificationApproverAction,
  ): Observable<ICertificationSendResponse> {
    return this.http.post<ICertificationSendResponse>(
      `${this.BASE}/atDeskRequests/${icfdId}`,
      approverAction,
    )
  }

  sendBudgetApproverAction(
    certificationId: string,
    sino: number,
    ecdpId: number,
    approverAction: ICertificationApproverAction,
  ): Observable<ICertificationSendResponse> {
    let params = new HttpParams()
    params = params.append('sino', `${sino}`)
    params = params.append('ecdpId', `${ecdpId}`)

    return this.http.post<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/budgetRequestApproval`,
      approverAction,
      {
        params,
      },
    )
  }

  sendResultVerificationAction(
    certificationId: string,
    approverAction: ICertificationApproverAction,
  ): Observable<ICertificationSendResponse> {
    return this.http.post<ICertificationSendResponse>(
      `${this.BASE}/${certificationId}/resultVerificationRequests`,
      approverAction,
    )
  }

  getPastCertifications(
    status?: TCertificationCompletionStatus,
  ): Observable<ICertificationSubmission[]> {
    let params = new HttpParams()

    if (status) {
      params = params.append('status', status)
    }

    return this.http.get<ICertificationSubmission[]>(`${this.BASE}`, {
      params,
    })
  }

  getCertificationSubmissions(certificationId: string): Observable<ICertificationSubmission> {
    return this.http.get<ICertificationSubmission>(`${this.BASE}/${certificationId}/submissions`)
  }

  getCertificationUserPrivileges(emailId: string): Observable<ICertificationUserPrivileges> {
    return this.http.get<ICertificationUserPrivileges>(`${this.BASE}/${emailId}/privileges`)
  }

  getDefaultAtDeskProctor(): Observable<ICertificationUserPrivileges> {
    return this.http.get<ICertificationUserPrivileges>(`${this.BASE}/defaultProctor`).pipe(
      catchError(() =>
        of({
          canProctorAtDesk: false,
          canApproveBudgetRequest: false,
          canVerifyResult: false,
          manager: '',
        } as ICertificationUserPrivileges),
      ),
    )
  }
}
