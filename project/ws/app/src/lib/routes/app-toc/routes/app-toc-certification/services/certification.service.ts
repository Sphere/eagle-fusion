import { Injectable } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormGroup } from '@angular/forms'
import { throwError, of, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { NsContent } from '@ws-widget/collection'
import { IResolveResponse } from '@ws-widget/utils'

import {
  ICertificationMeta,
  ICertificationSendResponse,
  IAtDeskBooking,
  ISubmitOrWithdrawRequest,
  ICertificationDate,
} from '../models/certification.model'
import { CertificationApiService } from '../apis/certification-api.service'
import { HttpErrorResponse } from '@angular/common/http'

@Injectable()
export class CertificationService {
  private readonly genericError = {
    err: null,
    response: {
      res_code: 0,
      res_message: '',
    },
  }

  constructor(private certificationApi: CertificationApiService) {}

  getCertificationMeta(route?: ActivatedRoute | null): Observable<ICertificationMeta> {
    if (route) {
      return route.data.pipe(
        switchMap(data => {
          const certificationMetaResolve = data.certificationMetaResolve as IResolveResponse<
            ICertificationMeta
          >

          if (!certificationMetaResolve.data) {
            return throwError('No certification data.')
          }

          return of(certificationMetaResolve.data)
        }),
      )
    }

    return throwError('No certification data.')
  }

  getContentMeta(route?: ActivatedRoute | null): Observable<NsContent.IContent> {
    if (route) {
      return route.data.pipe(
        switchMap(data => {
          const contentMetaResolve = data.contentMetaResolve as IResolveResponse<
            NsContent.IContent
          >

          if (!contentMetaResolve.data) {
            return throwError('No content.')
          }

          return of(contentMetaResolve.data)
        }),
      )
    }
    return throwError('No content.')
  }

  bookAtDeskSlot(
    certificationId: string,
    atDeskForm: FormGroup,
  ): Observable<ICertificationSendResponse> {
    const atDeskBooking: IAtDeskBooking = {
      country_code: atDeskForm.value.country,
      location_code: atDeskForm.value.location,
      date: atDeskForm.value.date.dateObj,
      slot: atDeskForm.value.slot,
      user_contact: atDeskForm.value.userContact,
      proctor_contact: atDeskForm.value.proctorContact,
      proctor:
        typeof atDeskForm.value.proctorEmail === 'string'
          ? atDeskForm.value.proctorEmail.split('@')[0]
          : '',
    }

    return this.certificationApi.bookAtDeskSlot(certificationId, atDeskBooking)
  }

  sendExternalProof(
    certificationId: string,
    resultForm: FormGroup,
  ): Observable<ICertificationSendResponse> {
    try {
      const formData = this.toFormData(resultForm.value)
      formData.set('examDate', new Date(resultForm.value.examDate).getTime().toString())
      formData.delete('fileName')

      return this.certificationApi.sendExternalProof(certificationId, formData)
    } catch (e) {
      return this.getSendResponse(this.genericError.err, of(this.genericError.response))
    }
  }

  submitVerificationRequest(
    certificationId: string,
    submitForm: FormGroup,
  ): Observable<ICertificationSendResponse> {
    const resultData: ISubmitOrWithdrawRequest = {
      result_type: submitForm.value.resultType,
      result: submitForm.value.result,
      fileName: submitForm.value.fileName,
      verifierEmail: submitForm.value.verifierEmail,
      exam_date: new Date(submitForm.value.examDate).getTime(),
    }

    return this.certificationApi.submitOrWithdrawVerificationRequest(
      certificationId,
      resultData,
      'submit',
    )
  }

  private toFormData(data: any): FormData {
    const formData = new FormData()

    for (const key of Object.keys(data)) {
      const value = data[key]
      formData.append(key, value)
    }

    return formData
  }

  withdrawVerificationRequest(
    certificationId: string,
    resultType: string,
    result: string,
    fileName: string,
    verifierEmail: string,
    examDate: ICertificationDate | number,
  ): Observable<ICertificationSendResponse> {
    const resultData: ISubmitOrWithdrawRequest = {
      fileName,
      result,
      verifierEmail,
      result_type: resultType,
      exam_date: typeof examDate !== 'number' ? this.toDateMillis(examDate) : examDate,
    }

    return this.certificationApi.submitOrWithdrawVerificationRequest(
      certificationId,
      resultData,
      'withdraw',
    )
  }

  private getSendResponse(
    err: any,
    caught: Observable<ICertificationSendResponse>,
  ): Observable<ICertificationSendResponse> {
    if (err instanceof HttpErrorResponse) {
      return caught
    }

    const response: ICertificationSendResponse = {
      res_code: 0,
      res_message: '',
    }

    return of(response)
  }

  private toDateMillis(date: ICertificationDate): number {
    return new Date(date.year, date.month - 1, date.day).getTime()
  }
}
