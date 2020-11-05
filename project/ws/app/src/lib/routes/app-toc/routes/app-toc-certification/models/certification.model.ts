import { NsContent } from '@ws-widget/collection'

export interface ICertificationResponse {
  resultList: ICertification
}
export interface ICertification {
  passedList: NsContent.IContent[]
  canAttemptList: NsContent.IContent[]
  cannotAttemptList: NsContent.IContent[]
  ongoingList: NsContent.IContent[]
  sortedList: NsContent.IContent[]
}
export interface ICertificationRequest {
  userEmail: string
  tracks: string[]
  sortOrder?: 'asc' | 'desc'
}

export interface ICertificationMeta {
  isCompleted: boolean
  warningMessage: string
  eligibility: ICertificationEligibility
  qualified: boolean
  lastTakenDate: ICertificationDate
  slotFreezeDate: ICertificationDate
  booking: ICertificationBooking
  verification_request: ICertificationVerificationRequest
  budget_Request: ICertificationBudgetRequest
  qualified_score?: string
}

export interface ICertificationEligibility {
  eligible: boolean
  reason: ICertificationEligibilityReason
}

export interface ICertificationEligibilityReason {
  code: number
  message: string
  nextRegisterDate?: ICertificationDate
}

export interface ICertificationDate {
  day: number
  month: number
  year: number
  timeZone?: string
}

export interface ICertificationBooking {
  booking_type: string
  dc?: string
  testcenter?: string
  country?: string
  location?: string
  date: ICertificationDate
  slot: string
  slotno: number
  status: string
  key?: string
  icfdId?: number
}

export interface ICertificationVerificationRequest {
  exam_date: number
  result_type: string
  result: string
  verifierEmail: string
  document: {
    document_url: string;
    document_name: string;
  }[]
  status: string
  reject_reason: string
}

export interface ICertificationBudgetRequest {
  manager_id?: string
  amount: number
  currency: string
  status: string
  reject_reason: string
}

export interface ISubmitOrWithdrawRequest {
  exam_date: ICertificationDate | number
  result_type: string
  result: string
  fileName: string
  verifierEmail: string
}

export interface IAccLocation {
  dc: string
  testcenters: string[]
}

export interface ITestCenterSlotList {
  dc: string
  testcenter: string
  slotdata: {
    date: number; // timestamp
    slots: ITestCenterSlot[];
  }[]
}

export interface ITestCenterSlot {
  slot_no: number
  slot_time: string
  seats_available: boolean
}

export interface IAtDeskBooking {
  country_code: string
  location_code: string
  location_name?: string
  date: number
  slot: string
  proctor: string
  proctor_contact: string
  user_contact: string
}

export interface ICertificationCountry {
  country_code: string
  country_name: string
}

export interface IAtDeskLocation {
  location_code: string
  location_name: string
}

export interface IAtDeskSlotItem {
  date: ICertificationDate
  slots: {
    slot_time: string;
  }[]
}

export interface IAtDeskSlotBooking {
  country_code: string
  location_code: string
  location_name?: string
  date: string
  slot: string
  proctor: string
  proctor_contact: string
  user_contact: string
}

export interface ICertificationCurrency {
  currency: string
}

export interface IBudgetApprovalRequest {
  manager_id: string
  amount: number
  currency: string
}

export interface ICertificationRequestItem {
  record_type: TCertificationRequestType
  user?: {
    name: string;
    email: string;
  }
  currently_with: {
    name: string;
    email: string;
  }
  raised_on?: ICertificationDate
  status?: string
  certification: string
  certification_name: string
  booking_type?: string
  country?: string
  location?: string
  date?: ICertificationDate
  slot?: string
  slotno?: number
  user_contact?: string
  icfdid?: number
  sino?: number
  ecdp_id?: number
  amount?: number
  currency?: string
  exam_date?: ICertificationDate
  document?: {
    document_url: string;
  }[]
  document_url?: string
  resultType?: string
  result?: string
  upload_id?: number
  sampleCertificationUrls?: string[]
}

export interface ICertificationApproverAction {
  status?: 'Approved' | 'Rejected'
  reason?: string
  upload_id?: number
  user?: string
}

export interface ICertificationSubmission {
  certification?: string
  certification_name: string
  certification_type: string
  examDate: ICertificationDate
  result_type: string
  result: string
  status?: string
}

export interface ICertificationApproverData {
  certificationId?: string
  icfdId?: number
  ecdpId?: number
  sino?: number
  status?: 'Approved' | 'Rejected'
  reason?: string
  uploadId?: number
  user?: {
    name: string;
    email: string;
  }
}

export interface ICertificationSendResponse {
  res_code: number
  res_message: string
}

export interface IResultUploadForm {
  result_type: string
  result: string
  exam_date: number | Date
  fileName: string
  file: File
}

export interface ICertificationDialogData {
  approvalItem: ICertificationRequestItem
  action: TCertificationRequestType
  actionType: TCertificationActionType
}

export interface IUserActionDialogData {
  approvalItem: ICertificationRequestItem
  actionType: TCertificationUserActionType
}

export interface ICertificationDialogResult {
  action: TCertificationRequestType
  result: boolean
  data: ICertificationApproverData | null
}

export interface IUserActionDialogResult {
  action: TCertificationRequestType
  result: boolean
  data: ICertificationApproverData
}

export interface IRequestFilterDialogResult {
  type?: TCertificationRequestType
  startDate?: Date
  endDate?: Date
  status?: string
}

export interface ICertificationResultSubmit {
  exam_date: string
  result_type: string
  result: string
  verifierEmail: string
  fileName: string
}

export interface ICertificationUserPrivileges {
  canProctorAtDesk: boolean
  canVerifyResult: boolean
  canApproveBudgetRequest: boolean
  manager: string
}

export type TCertificationRequestType =
  | 'result_verification'
  | 'budget_approval'
  | 'proctor_approval'
  | 'acc'
  | 'all'
export type TCertificationActionType = 'accept' | 'decline' | 'submit'
export type TCertificationUserActionType = 'cancel' | 'withdrawProof' | 'submitProof'
export type TCertificationResultAction = 'submit' | 'withdraw'
export type TCertificationCompletionStatus = 'completed' | 'notcompleted'
