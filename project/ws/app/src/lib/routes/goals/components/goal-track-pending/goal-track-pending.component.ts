import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { TFetchStatus } from '@ws-widget/utils'
import { BtnGoalsService, NsGoal } from '@ws-widget/collection'
import { MatTableDataSource, MatSnackBar } from '@angular/material'
import { SelectionModel } from '@angular/cdk/collections'
// import { BtnGoalsService } from "@ws-widget/collection";

@Component({
  selector: 'ws-app-goal-track-pending',
  templateUrl: './goal-track-pending.component.html',
  styleUrls: ['./goal-track-pending.component.scss'],
})
export class GoalTrackPendingComponent implements OnInit {
  @ViewChild('remindError', { static: true }) remindErrorMessage!: ElementRef<
    any
  >
  @ViewChild('remindSuccess', { static: true })
  remindSuccessMessage!: ElementRef<any>

  goalId: string | null = null
  trackGoal: any
  error: any
  remindAPIProgress = false

  displayedColumnsPending: string[] = ['select', 'user']
  dataSourcePending: MatTableDataSource<any> | undefined = undefined
  selectionPending: SelectionModel<any> = new SelectionModel<any>(true, [])

  remindStatus: { [shareWith: string]: TFetchStatus } = {}
  constructor(
    private route: ActivatedRoute,
    private goalsSvc: BtnGoalsService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    if (this.route.parent && this.route.parent.snapshot) {
      this.goalId = this.route.parent.snapshot.params.goalId
      this.trackGoal = this.route.parent.snapshot.data.trackGoal.data
      this.error = this.route.parent.snapshot.data.trackGoal.error
    }
    if (this.trackGoal.pending) {
      this.dataSourcePending = new MatTableDataSource<any>(
        this.trackGoal.pending,
      )
      this.selectionPending = new SelectionModel<any>(true, [])
    }
  }

  isAllSelectedPending() {
    const numSelected = this.selectionPending.selected.length
    const numRows = this.dataSourcePending
      ? this.dataSourcePending.data.length
      : 0
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterTogglePending() {
    if (this.isAllSelectedPending()) {
      this.selectionPending.clear()
    } else {
      if (this.dataSourcePending) {
        this.dataSourcePending.data.forEach(row =>
          this.selectionPending.select(row),
        )
      }
    }
  }
  remind() {
    this.remindAPIProgress = true
    const userIds = this.selectionPending.selected
      .map(selectedUser => selectedUser.sharedWith)
      .map(data => data.userId)
    const goalType = this.route.snapshot.queryParams.goalType
    if (this.goalId) {
      this.goalsSvc.shareGoalV2(goalType, this.goalId, userIds, '').subscribe(
        (response: NsGoal.IGoalsShareResponse) => {
          if (response.result === 'success') {
            this.snackBar.open(this.remindSuccessMessage.nativeElement.value)
          }
          this.remindAPIProgress = false
        },
        () => {
          this.snackBar.open(this.remindErrorMessage.nativeElement.value)
          this.remindAPIProgress = false
        },
      )
    }
  }
}
