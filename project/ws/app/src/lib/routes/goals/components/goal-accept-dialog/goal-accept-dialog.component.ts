import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core'
import { NsGoal, BtnGoalsService } from '@ws-widget/collection'
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material'
import { TFetchStatus } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-goal-accept-dialog',
  templateUrl: './goal-accept-dialog.component.html',
  styleUrls: ['./goal-accept-dialog.component.scss'],
})
export class GoalAcceptDialogComponent implements OnInit {
  @ViewChild('errorAccept', { static: true }) errorAcceptMessage!: ElementRef<any>
  @ViewChild('successAccept', { static: true })
  successAcceptMessage!: ElementRef<any>
  showAlreadyGoalExistMessage = false

  acceptGoalStatus: TFetchStatus = 'none'
  constructor(
    private snackbar: MatSnackBar,
    private goalSvc: BtnGoalsService,
    private dialogRef: MatDialogRef<GoalAcceptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public goal: NsGoal.IGoal,
  ) {}

  ngOnInit() {
    this.acceptGoalConditionCheck()
  }

  acceptGoalConditionCheck() {
    this.goalSvc
      .acceptRejectGoal(
        'accept',
        this.goal.type,
        this.goal.id,
        this.goal.sharedBy ? this.goal.sharedBy.userId : '',
        '',
        false,
      )
      .subscribe(
        (response: NsGoal.IGoalAcceptConfirmationResponse) => {
          this.showAlreadyGoalExistMessage = response.commonUserGoal ? true : false
        },
        () => {
          this.showAlreadyGoalExistMessage = false
        },
      )
  }

  acceptGoal() {
    this.acceptGoalStatus = 'fetching'
    this.goalSvc
      .acceptRejectGoal(
        'accept',
        this.goal.type,
        this.goal.id,
        this.goal.sharedBy ? this.goal.sharedBy.userId : '',
      )
      .subscribe(
        () => {
          this.acceptGoalStatus = 'done'
          this.snackbar.open(this.successAcceptMessage.nativeElement.value)
          this.dialogRef.close(true)
        },
        () => {
          this.acceptGoalStatus = 'error'
          this.snackbar.open(this.errorAcceptMessage.nativeElement.value)
        },
      )
  }
}
