import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { CertificationApiService } from '../../../../app-toc/routes/app-toc-certification/apis/certification-api.service'
import {
  TCertificationRequestType,
  ICertificationRequestItem,
  ICertificationApproverData,
  ICertificationDialogData,
  ICertificationSendResponse,
} from '../../../../app-toc/routes/app-toc-certification/models/certification.model'

@Injectable()
export class CertificationDashboardService {
  constructor(private certificationApi: CertificationApiService) {}

  getApprovalItems(
    requestType?: TCertificationRequestType,
  ): Observable<ICertificationRequestItem[]> {
    return of(requestType).pipe(
      map(type => {
        if (type !== 'all') {
          return type
        }

        return undefined
      }),
      switchMap(type => this.certificationApi.getApprovalItems(type)),
    )
  }

  getCertificationRequests(
    startDate: Date,
    endDate: Date,
    type: TCertificationRequestType | null,
  ): Observable<ICertificationRequestItem[]> {
    const requestType = type === 'all' ? null : type
    const startDateMs = startDate.getTime()
    const endDateMs = endDate.getTime()

    return this.certificationApi.getCertificationRequests(startDateMs, endDateMs, requestType).pipe(
      map(requestItems => {
        requestItems.forEach(requestItem => {
          if (typeof requestItem.document === 'string') {
            requestItem.document_url = requestItem.document
          }
        })

        return requestItems
      }),
    )
  }

  performApproverAction(
    requestType: TCertificationRequestType,
    data: ICertificationApproverData,
  ): Observable<ICertificationSendResponse | null> {
    switch (requestType) {
      case 'proctor_approval':
        return this.certificationApi.sendAtDeskProctorAction(data.icfdId || 0, {
          status: data.status,
        })

      case 'budget_approval':
        return this.certificationApi.sendBudgetApproverAction(
          data.certificationId || '',
          data.sino || 0,
          data.ecdpId || 0,
          {
            status: data.status,
            reason: data.reason || '',
          },
        )

      case 'result_verification':
        return this.certificationApi.sendResultVerificationAction(data.certificationId || '', {
          status: data.status,
          reason: data.reason || '',
          upload_id: data.uploadId,
          user: data.user ? data.user.email : '',
        })

      default:
        return of({ res_code: 0, res_message: 'error' })
    }
  }

  performUserRequestAction(requestType: TCertificationRequestType, data: any) {
    switch (requestType) {
      case 'proctor_approval':
        return this.certificationApi.cancelSlot(data.certificationId, data.slotNo, data.icfdId)

      case 'budget_approval':
        return this.certificationApi.cancelBudgetApprovalRequest(data.certificationId)

      default:
        return of({ res_code: 0, res_message: 'error' })
    }
  }

  getDialogActionData(data: ICertificationDialogData, reason: string) {
    try {
      const resultData: ICertificationApproverData = {}

      switch (data.actionType) {
        case 'accept':
          resultData.status = 'Approved'
          break
        case 'decline':
          resultData.status = 'Rejected'
          break
      }

      switch (data.approvalItem.record_type) {
        case 'proctor_approval':
          resultData.icfdId = data.approvalItem.icfdid
          break

        case 'result_verification':
          resultData.certificationId = data.approvalItem.certification
          resultData.uploadId = data.approvalItem.upload_id
          resultData.reason = reason
          resultData.user = data.approvalItem.user
          break

        case 'budget_approval':
          resultData.certificationId = data.approvalItem.certification
          resultData.ecdpId = data.approvalItem.ecdp_id
          resultData.sino = data.approvalItem.sino
          resultData.reason = reason
          break
      }

      return resultData
    } catch (e) {
      return null
    }
  }
}
