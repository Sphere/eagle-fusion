import { Component, OnInit, OnDestroy } from '@angular/core'
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Observable, timer, throwError, of, noop, Subscription } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'

import { NsContent } from '@ws-widget/collection'
import { TFetchStatus, TSendStatus } from '@ws-widget/utils'

import {
  ICertificationCurrency,
  IBudgetApprovalRequest,
  ICertificationUserPrivileges,
} from '../../models/certification.model'
import { CertificationApiService } from '../../apis/certification-api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { CertificationService } from '../../services/certification.service'
import { SnackbarComponent } from '../snackbar/snackbar.component'

@Component({
  selector: 'ws-app-budget-approval',
  templateUrl: './budget-approval.component.html',
  styleUrls: ['./budget-approval.component.scss'],
})
export class BudgetApprovalComponent implements OnInit, OnDestroy {
  content?: NsContent.IContent

  currencies: ICertificationCurrency[]
  certPrivileges: ICertificationUserPrivileges

  currencyFetchStatus: TFetchStatus
  managerFetchStatus: TFetchStatus
  requestSendStatus: TSendStatus

  budgetForm: FormGroup

  contentMetaSub?: Subscription
  certificationMetaSub?: Subscription

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private certificationApi: CertificationApiService,
    private certificationSvc: CertificationService,
  ) {
    this.certPrivileges = {
      canApproveBudgetRequest: false,
      canProctorAtDesk: false,
      canVerifyResult: false,
      manager: '',
    }
    this.currencies = []

    this.currencyFetchStatus = 'fetching'
    this.managerFetchStatus = 'none'
    this.requestSendStatus = 'none'

    this.budgetForm = new FormGroup({
      currency: new FormControl('', Validators.required),
      amount: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(99999999),
      ]),
      approverEmail: new FormControl(
        '',
        [Validators.required],
        [this.validateApproverEmail.bind(this)],
      ),
    })
  }

  ngOnInit() {
    this.subscribeToContentResolve()

    this.getCurrencies()
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
    if (this.budgetForm.invalid) {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          action: 'cert_budget_send',
          code: 'form_invalid',
        },
      })
      return
    }

    if (this.content) {
      const budgetRequest: IBudgetApprovalRequest = {
        amount: this.budgetForm.value.amount,
        currency: this.budgetForm.value.currency,
        manager_id: this.budgetForm.value.approverEmail.split('@')[0],
      }

      this.requestSendStatus = 'sending'
      this.certificationApi
        .sendBudgetApprovalRequest(this.content.identifier, budgetRequest)
        .subscribe(
          res => {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                action: 'cert_budget_send',
                code: res.res_code,
              },
            })

            this.requestSendStatus = 'done'
            if (res.res_code === 1) {
              this.router.navigate([
                `/app/toc/${this.content ? this.content.identifier : ''}/certification`,
              ])
            }
          },
          () => {
            this.requestSendStatus = 'error'
            this.snackbar.openFromComponent(SnackbarComponent)
          },
        )
    }
  }

  private getCurrencies() {
    this.currencyFetchStatus = 'fetching'
    this.certificationApi.getCurrencies().subscribe(
      result => {
        this.currencies = result
        this.currencyFetchStatus = 'done'
      },
      () => {
        this.currencies = []
        this.currencyFetchStatus = 'error'
      },
    )
  }

  private validateApproverEmail(control: AbstractControl): Observable<ValidationErrors | null> {
    return timer(500).pipe(
      map(() => control.value),
      switchMap((value: string) => {
        if (!value) {
          return throwError({ invalidEmail: true })
        }

        const trimmedEmail = value.split('@')[0]

        if (
          this.certPrivileges &&
          trimmedEmail.toLowerCase() === this.certPrivileges.manager.toLowerCase()
        ) {
          return of(null)
        }

        return this.certificationApi.getCertificationUserPrivileges(trimmedEmail)
      }),
      map(result =>
        result === null ? null : result.canApproveBudgetRequest ? null : { invalidEmail: true },
      ),
      catchError(() => of({ invalidEmail: true })),
    )
  }

  private getUserManager() {
    this.managerFetchStatus = 'fetching'
    this.certificationApi.getDefaultAtDeskProctor().subscribe(result => {
      this.certPrivileges = result
      this.budgetForm.patchValue({
        approverEmail: this.certPrivileges.manager,
      })
      this.managerFetchStatus = 'done'
    })
  }

  private subscribeToContentResolve() {
    this.contentMetaSub = this.certificationSvc
      .getContentMeta(this.route.parent)
      .subscribe(content => {
        this.content = content

        if (!(this.content.verifiers && this.content.verifiers.length)) {
          this.budgetForm.controls.approverEmail.setAsyncValidators(
            this.validateApproverEmail.bind(this),
          )
        }
      },         noop)
  }
}
