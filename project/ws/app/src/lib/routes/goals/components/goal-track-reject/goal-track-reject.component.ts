import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BtnGoalsService } from '@ws-widget/collection'
import { TFetchStatus } from '@ws-widget/utils'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-app-goal-track-reject',
  templateUrl: './goal-track-reject.component.html',
  styleUrls: ['./goal-track-reject.component.scss'],
})
export class GoalTrackRejectComponent implements OnInit {
  @ViewChild('shareError', { static: true }) shareErrorMessage!: ElementRef<
    any
  >
  @ViewChild('shareSuccess', { static: true })
  shareSuccessMessage!: ElementRef<any>
  goalId: string | null = null
  trackGoal: any
  error: any
  shareAgainApiProgress = false

  shareAgainStatus: { [shareWith: string]: TFetchStatus } = {}
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
  }

  shareAgain(sharedWith: string) {
    this.shareAgainApiProgress = true
    const goalType = this.route.snapshot.queryParams.goalType
    if (this.goalId) {
      this.shareAgainStatus[sharedWith] = 'fetching'
      this.goalsSvc.shareGoal(goalType, this.goalId, [sharedWith]).subscribe(
        () => {
          this.shareAgainStatus[sharedWith] = 'done'
          this.trackGoal.rejected = this.trackGoal.rejected.filter(
            (reject: any) => reject.sharedWith !== sharedWith,
          )
          this.snackBar.open(this.shareSuccessMessage.nativeElement.value)
          this.shareAgainApiProgress = false
        },
        () => {
          this.shareAgainStatus[sharedWith] = 'error'
          this.snackBar.open(this.shareErrorMessage.nativeElement.value)
          this.shareAgainApiProgress = false
        },
      )
    }
  }
}
