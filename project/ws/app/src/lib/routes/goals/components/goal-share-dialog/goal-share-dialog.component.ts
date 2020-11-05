import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { NsGoal, BtnGoalsService, NsAutoComplete } from '@ws-widget/collection'
import { TFetchStatus } from '@ws-widget/utils'
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-app-goal-share-dialog',
  templateUrl: './goal-share-dialog.component.html',
  styleUrls: ['./goal-share-dialog.component.scss'],
})
export class GoalShareDialogComponent implements OnInit {
  @ViewChild('errorShare', { static: true }) errorShareMessage!: ElementRef<
    any
  >
  @ViewChild('successShare', { static: true })
  successShareMessage!: ElementRef<any>

  @ViewChild('sharedPartially', { static: true })
  sharedPartiallyMessage!: ElementRef<any>

  @ViewChild('allInvalidIds', { static: true })
  allInvalidIdsMessage!: ElementRef<any>

  shareWithEmailIds: string[] = []
  message = ''
  apiResponse: NsGoal.IGoalsShareResponse = {
    result: '',
    already_shared: [],
    invalid_users: [],
    self_shared: false,
    unauthorized_users: [],
  }
  showPartiallySharedMessage = false

  shareGoalStatus: TFetchStatus = 'none'

  constructor(
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<GoalShareDialogComponent>,
    private goalSvc: BtnGoalsService,
    @Inject(MAT_DIALOG_DATA) public goal: NsGoal.IGoal,
  ) { }

  ngOnInit() { }

  updateUsers(users: NsAutoComplete.IUserAutoComplete[]) {
    if (Array.isArray(users)) {
      this.shareWithEmailIds = users.map(user => user.wid)
    }
  }

  shareGoal() {
    if (this.goal) {
      this.shareGoalStatus = 'fetching'

      this.goalSvc
        .shareGoalV2(
          this.goal.type,
          this.goal.id,
          this.shareWithEmailIds,
          this.message,
        )
        .subscribe(
          (response: NsGoal.IGoalsShareResponse) => {
            this.shareGoalStatus = 'done'
            this.apiResponse = response
            this.showPartiallySharedMessage =
              response.result === 'success' &&
              (response.unauthorized_users.length > 0 || response.already_shared.length > 0 || response.invalid_users.length > 0)

            if (
              this.showPartiallySharedMessage &&
              (response.unauthorized_users.length ===
                this.shareWithEmailIds.length || response.already_shared.length ===
                this.shareWithEmailIds.length || response.invalid_users.length === this.shareWithEmailIds.length)
            ) {
              this.snackBar.open(this.allInvalidIdsMessage.nativeElement.value)
            } else if (
              this.showPartiallySharedMessage &&
              (response.unauthorized_users.length !==
                this.shareWithEmailIds.length || response.already_shared.length !==
                this.shareWithEmailIds.length || response.invalid_users.length !== this.shareWithEmailIds.length)
            ) {
              this.snackBar.open(
                this.sharedPartiallyMessage.nativeElement.value,
              )
            } else {
              this.snackBar.open(this.successShareMessage.nativeElement.value)
              this.dialogRef.close(true)
            }
            this.shareWithEmailIds = []
          },

          () => {
            this.snackBar.open(this.errorShareMessage.nativeElement.value)
            this.shareGoalStatus = 'error'
          },
        )
    }
  }
}
