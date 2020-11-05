import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms'
import { MatSnackBar } from '@angular/material'

import { Observable, timer, throwError, of, Subscription } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'

import { NsContent } from '@ws-widget/collection'
import { TFetchStatus, TSendStatus } from '@ws-widget/utils'

import { ICertificationMeta, ICertificationUserPrivileges } from '../../models/certification.model'
import {
  CERT_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  CERT_GRADE_TYPES,
} from '../../constants/certification-constants'
import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'
import { SnackbarComponent } from '../snackbar/snackbar.component'

@Component({
  selector: 'ws-app-result-upload',
  templateUrl: './result-upload.component.html',
  styleUrls: ['./result-upload.component.scss'],
})
export class ResultUploadComponent implements OnInit, OnDestroy {
  @Input() content!: NsContent.IContent
  @Input() certification!: ICertificationMeta
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>

  resultForm!: FormGroup
  formData: FormData
  certPrivileges: ICertificationUserPrivileges
  currentDate: Date
  farthestDate: Date
  supportedFileTypes: string[]
  grades: string[]
  maxFileSize: number

  fetchStatus: TFetchStatus
  contentFetchStatus: TFetchStatus
  managerFetchStatus: TFetchStatus
  requestSendStatus: TSendStatus
  proofDeleteStatus: TSendStatus
  proofSubmitStatus: TSendStatus

  certificationMetaSub?: Subscription
  contentMetaSub?: Subscription

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private certificationApi: CertificationApiService,
    private certificationSvc: CertificationService,
  ) {
    this.formData = new FormData()
    this.currentDate = new Date()
    this.farthestDate = new Date()
    this.farthestDate.setFullYear(this.currentDate.getFullYear() - 3)
    this.supportedFileTypes = CERT_FILE_TYPES
    this.grades = CERT_GRADE_TYPES
    this.maxFileSize = MAX_FILE_SIZE_BYTES
    this.certPrivileges = {
      canApproveBudgetRequest: false,
      canProctorAtDesk: false,
      canVerifyResult: false,
      manager: '',
    }

    this.resultForm = new FormGroup({
      resultType: new FormControl(null, [Validators.required]),
      result: new FormControl(null, [Validators.required, this.validateResult.bind(this)]),
      examDate: new FormControl(null, [Validators.required]),
      verifierEmail: new FormControl(null, [Validators.required]),
      file: new FormControl('', [
        this.validateFileType.bind(this),
        this.validateFileSize.bind(this),
      ]),
      fileName: new FormControl(),
    })

    this.fetchStatus = 'none'
    this.contentFetchStatus = 'none'
    this.managerFetchStatus = 'none'
    this.requestSendStatus = 'none'
    this.proofDeleteStatus = 'none'
    this.proofSubmitStatus = 'none'
  }

  ngOnInit() {
    this.subscribeToContentResolve()
    this.subscribeToCertificationResolve()
    this.getUserManager()
  }

  ngOnDestroy() {
    if (this.contentMetaSub && !this.contentMetaSub.closed) {
      this.contentMetaSub.unsubscribe()
    }

    if (this.certificationMetaSub && !this.certificationMetaSub.closed) {
      this.certificationMetaSub.unsubscribe()
    }
  }

  onSubmit() {
    if (this.resultForm.invalid) {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          action: 'cert_result_upload',
          code: 'form_invalid',
        },
      })
      return
    }

    this.requestSendStatus = 'sending'
    this.certificationSvc.sendExternalProof(this.content.identifier, this.resultForm).subscribe(
      res => {
        this.requestSendStatus = 'done'

        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            action: 'cert_result_upload',
            code: res.res_code,
          },
        })

        if (res.res_code === 1) {
          this.router.navigate([
            `/app/toc/${this.content ? this.content.identifier : ''}/certification`,
          ])
          return
        }
      },
      () => {
        this.snackbar.openFromComponent(SnackbarComponent)
        this.requestSendStatus = 'error'
      },
    )
  }

  deleteProof() {
    this.proofDeleteStatus = 'sending'

    this.certificationApi
      .deleteExternalProof(
        this.content.identifier,
        this.certification.verification_request.document[0].document_url,
      )
      .subscribe(
        res => {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              action: 'cert_result_delete',
              code: res.res_code,
            },
          })

          this.proofDeleteStatus = 'done'

          if (res.res_code === 1) {
            this.router.navigate([
              `/app/toc/${this.content ? this.content.identifier : ''}/certification`,
            ])
          }
        },
        () => {
          this.snackbar.openFromComponent(SnackbarComponent)
          this.proofDeleteStatus = 'error'
        },
      )
  }

  submitProof() {
    this.proofSubmitStatus = 'sending'

    this.certificationSvc
      .submitVerificationRequest(this.content.identifier, this.resultForm)
      .subscribe(
        res => {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              action: 'cert_result_submit',
              code: res.res_code,
            },
          })

          this.proofSubmitStatus = 'done'

          if (res.res_code === 1) {
            this.router.navigate([
              `/app/toc/${this.content ? this.content.identifier : ''}/certification`,
            ])
          }
        },
        () => {
          this.snackbar.openFromComponent(SnackbarComponent)
          this.proofSubmitStatus = 'error'
        },
      )
  }

  private getUserManager() {
    this.managerFetchStatus = 'fetching'
    this.certificationApi.getDefaultAtDeskProctor().subscribe(result => {
      this.certPrivileges = result
      if (!this.resultForm.value.verifierEmail) {
        this.resultForm.patchValue({
          verifierEmail: this.certPrivileges.manager,
        })
      }
      this.managerFetchStatus = 'done'
    })
  }

  private getFileType(fileName: string) {
    return fileName.substring(fileName.lastIndexOf('.', fileName.length)).toLowerCase()
  }

  private validateVerifierEmail(control: AbstractControl): Observable<ValidationErrors | null> {
    return timer(500).pipe(
      map(() => control.value),
      switchMap((value: string) => {
        if (!value) {
          return throwError({ invalidEmail: true })
        }

        const trimmedEmail = value.split('@')[0]

        if (trimmedEmail.toLowerCase() === this.certPrivileges.manager.toLowerCase()) {
          return of(null)
        }

        return this.certificationApi.getCertificationUserPrivileges(trimmedEmail)
      }),
      map(result =>
        result === null ? null : result.canVerifyResult ? null : { invalidEmail: true },
      ),
      catchError(() => of({ invalidEmail: true })),
    )
  }

  private validateResult(control: AbstractControl): ValidationErrors | null {
    try {
      const resultType: 'score' | 'grade' | 'percentage' | 'other' = this.resultForm.value
        .resultType

      if (!resultType) {
        return { noResultType: true }
      }

      switch (resultType) {
        case 'score':
          const score = Number(control.value)

          if (isNaN(score)) {
            return { scoreNaN: true }
          }

          break

        case 'grade':
          const grade = control.value

          if (!this.grades.some(allowedGrade => allowedGrade === grade)) {
            return { invalidGrade: true }
          }

          break

        case 'percentage':
          const percentage = Number(control.value)

          if (isNaN(percentage)) {
            return { scoreNaN: true }
          }

          if (!(percentage >= 0 && percentage <= 100)) {
            return { invalidPercentage: true }
          }

          break

        case 'other':
        default:
          break
      }

      return null
    } catch (err) {
      return { error: true }
    }
  }

  private validateFileSize(control: AbstractControl): ValidationErrors | null {
    const file: File = control.value

    if (file) {
      const fileSize = file.size

      if (fileSize > this.maxFileSize) {
        return {
          fileSizeExceeded: true,
        }
      }
    }
    return null
  }

  private validateFileType(control: AbstractControl): ValidationErrors | null {
    const file: File = control.value

    if (file) {
      const fileType = this.getFileType(file.name)
      if (this.supportedFileTypes.some(supportedType => supportedType === fileType)) {
        return null
      }

      return {
        fileTypeInvalid: true,
      }
    }

    return null
  }

  private subscribeToCertificationResolve() {
    this.fetchStatus = 'fetching'
    this.certificationMetaSub = this.certificationSvc
      .getCertificationMeta(this.route.parent)
      .subscribe(
        certificationData => {
          this.certification = certificationData
          if (!this.certification.verification_request.status) {
            this.resultForm.controls.file.setValidators(Validators.required)
          }

          this.initForm()

          this.fetchStatus = 'done'
        },
        () => {
          this.fetchStatus = 'error'
        },
      )
  }

  private subscribeToContentResolve() {
    this.contentMetaSub = this.certificationSvc.getContentMeta(this.route.parent).subscribe(
      content => {
        this.content = content

        if (!(this.content.verifiers && this.content.verifiers.length)) {
          this.resultForm.controls.verifierEmail.setAsyncValidators(
            this.validateVerifierEmail.bind(this),
          )
        }

        this.contentFetchStatus = 'done'
      },
      () => {
        this.contentFetchStatus = 'error'
      },
    )
  }

  private initForm() {
    if (this.certification) {
      const request = this.certification.verification_request

      this.resultForm.patchValue({
        resultType: request.result_type || null,
        result: request.result || null,
        examDate: request.exam_date || null,
        verifierEmail: request.verifierEmail || null,
        fileName:
          request.document && request.document.length ? request.document[0].document_name : '',
      })
    }
  }
}
