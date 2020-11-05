import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core'
import { NsAutoComplete, UserAutocompleteService } from '@ws-widget/collection'
import {
  MAT_DIALOG_DATA,
  MatSnackBar,
  MatDialogRef,
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
} from '@angular/material'
import { FormControl } from '@angular/forms'
import { FeedbackService } from '@ws-widget/collection/src/lib/btn-content-feedback-v2/services/feedback.service'
import {
  EFeedbackType,
  EFeedbackRole,
} from '@ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  map,
  catchError,
} from 'rxjs/operators'
import { of } from 'rxjs'

const NOTIFICATION_TIME = 5

@Component({
  selector: 'ws-auth-shared-feedback',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
})
export class FeedbackFormComponent implements OnInit {
  forSelf = true
  selectedUsersDetails: any[] = []
  employeeList: any[] = []
  publisherDetailsCtrl!: FormControl
  userMessage = ''
  fetchTagsStatus: 'done' | 'fetching' | null = null
  hasError = false
  @ViewChild('publisherDetailsView', { static: false }) publisherDetailsView!: ElementRef
  onAction = false

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private dialogRef: MatDialogRef<FeedbackFormComponent>,
    private feedbackApi: FeedbackService,
    private snackBar: MatSnackBar,
    private userAutoComplete: UserAutocompleteService,
  ) {}

  ngOnInit() {
    this.userMessage = `Grant me the ${this.data} role`
    this.publisherDetailsCtrl = new FormControl()
    this.publisherDetailsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.userAutoComplete.fetchAutoComplete(value).pipe(
              map((v: NsAutoComplete.IUserAutoComplete[]) => {
                return v.map(user => {
                  return {
                    displayName: `${user.first_name || ''} ${user.last_name || ''}`,
                    id: user.wid,
                    mail: user.email,
                    department: user.department_name,
                  }
                })
              }),
              catchError(_ => of([] as any[])),
            )
          }
          return of([])
        }),
      )
      .subscribe(
        (users: any[]) => {
          this.employeeList = users || <any>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )
  }

  changeMessage() {
    if (this.forSelf) {
      this.userMessage = `Grant me the ${this.data} role`
    } else {
      this.userMessage = `Grant ${this.data} role to following users`
    }
  }

  addEmployee(event: MatAutocompleteSelectedEvent) {
    if (event.option.value && event.option.value.id) {
      this.publisherDetailsView.nativeElement.value = ''
      this.publisherDetailsCtrl.setValue(null)
      this.selectedUsersDetails.push({
        id: event.option.value.id,
        email: event.option.value.mail,
        name: event.option.value.displayName,
      })
    }
  }

  submitData() {
    let requestMsg = this.userMessage
    if (!this.forSelf) {
      if (!this.selectedUsersDetails.length) {
        this.hasError = true
        return
      }
      const usersMails = this.selectedUsersDetails.map((e: any) => e.email)
      requestMsg += `: ${usersMails.toString()}`
    }
    this.hasError = false
    this.onAction = true
    this.feedbackApi
      .submitPlatformFeedback({
        text: requestMsg,
        type: EFeedbackType.Platform,
        role: EFeedbackRole.Author,
      })
      .subscribe(
        () => {
          this.onAction = false
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.ROLE_REQUEST_SUBMIT_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.dialogRef.close()
        },
        () => {
          this.onAction = false
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.ROLE_REQUEST_SUBMIT_FAILURE,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  removeField(event: MatChipInputEvent) {
    // Reset the input value
    if (event.input) {
      event.input.value = ''
    }
  }

  removeEmployee(data: any) {
    this.selectedUsersDetails = this.selectedUsersDetails.filter(v => v.id !== data.id)
  }
}
