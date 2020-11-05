import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { BtnGoalsService, NsGoal } from '@ws-widget/collection'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { GoalDeleteDialogComponent } from '../goal-delete-dialog/goal-delete-dialog.component'
import { GoalShareDialogComponent } from '../goal-share-dialog/goal-share-dialog.component'
import { GoalSharedDeleteDialogComponent } from '../goal-shared-delete-dialog/goal-shared-delete-dialog.component'
// import { NoAccessDialogComponent } from '../no-access-dialog/no-access-dialog.component'

@Component({
  selector: 'ws-app-goal-card[type]',
  templateUrl: './goal-card.component.html',
  styleUrls: ['./goal-card.component.scss'],
})
export class GoalCardComponent implements OnInit {
  @ViewChild('errorDurationUpdate', { static: true })
  errorDurationUpdateMessage!: ElementRef<any>
  @ViewChild('durationUpdate', { static: true })
  durationUpdateMessage!: ElementRef<any>
  @ViewChild('editError', { static: true })
  editErrorMessage!: ElementRef<any>
  @ViewChild('shareError', { static: true })
  shareErrorMessage!: ElementRef<any>
  @Input() goal: NsGoal.IGoal | null = null
  @Input() type: 'me' | 'others' = 'me'
  @Input() showProgress = true

  @Output() updateGoals = new EventEmitter()
  currentTime: number

  isGoalExpanded: { [goalId: string]: boolean } = {}
  editCommonGoal = false
  updateGoalDurationStatus: TFetchStatus = 'none'
  updatedGoalDuration = 1
  isGoalContentViewMore: { [goalId: string]: boolean } = {}
  isShareEnabled = false

  goalProgressBarStyle: { left: string } = { left: '0%' }

  constructor(
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private goalSvc: BtnGoalsService,
    private configSvc: ConfigurationsService,
  ) {
    const now = new Date()
    this.currentTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isShareEnabled = !this.configSvc.restrictedFeatures.has('share')
    }

    if (this.goal) {
      this.updatedGoalDuration = this.goal.duration || 1
      const progress = Math.round((this.goal.progress || 0) * 100)
      this.goalProgressBarStyle = {
        left: `${Math.min(85, progress + 1)}%`,
      }
    }
  }

  checkNoAccess(goal: NsGoal.IGoal) {
    let hasAccess: boolean[] = []
    if (goal.contents && goal.contents.length > 0 && goal.contentProgress && goal.contentProgress.length > 0) {
      hasAccess = goal.contents
        .map(content => (!content.hasAccess ? false : true))
        .concat(goal.contentProgress.map(content => (!content.hasAccess ? false : true)))
    } else if (goal.contents && goal.contents.length > 0) {
      hasAccess = goal.contents.map(content => (!content.hasAccess ? false : true))
    } else if (goal.contentProgress && goal.contentProgress.length > 0) {
      hasAccess = goal.contentProgress.map(content => (!content.hasAccess ? false : true))
    }
    return hasAccess.includes(false)
  }

  editGoal() {
    if (this.goal) {
      if (this.goal.type.includes('common')) {
        this.editCommonGoal = true
        this.isGoalExpanded[this.goal.id] = true
      } else {
        this.router.navigate([`/app/goals/edit/${this.type}/${this.goal.id}`])
      }
    } else {
      this.snackbar.open(this.editErrorMessage.nativeElement.value)
    }
  }

  updateCommonGoalDuration() {
    if (this.goal) {
      this.updateGoalDurationStatus = 'fetching'
      this.goalSvc
        .updateDurationCommonGoal(this.goal.type, this.goal.id, this.updatedGoalDuration)
        .subscribe(
          () => {
            this.updateGoalDurationStatus = 'done'
            this.updateGoals.emit()
            this.snackbar.open(this.durationUpdateMessage.nativeElement.value)
          },
          () => {
            this.updateGoalDurationStatus = 'error'
            this.snackbar.open(this.errorDurationUpdateMessage.nativeElement.value)
          },
        )
    }
  }

  openShareGoalDialog(goal: NsGoal.IGoal) {
    // //console.log(this.checkNoAccess())

    // if (this.checkNoAccess()) {
    //   this.dialog.open(NoAccessDialogComponent, {
    //     data: {
    //       type: 'share',
    //     },
    //     width: '600px',
    //   })
    // } else {
    if (!this.checkNoAccess(goal)) {
      const dialogRef = this.dialog.open(GoalShareDialogComponent, {
        data: goal,
        width: '600px',
      })

      dialogRef.afterClosed().subscribe(shared => {
        if (shared) {
          this.updateGoals.emit()
        }
      })
    } else {
      this.snackbar.open(this.shareErrorMessage.nativeElement.value)
    }
    // }
  }

  openDeleteDialog() {
    if (this.goal && this.goal.isShared) {
      const dialogRef = this.dialog.open(GoalSharedDeleteDialogComponent, {
        data: this.goal,
      })

      dialogRef.afterClosed().subscribe(deleted => {
        if (deleted) {
          this.updateGoals.emit()
        }
      })
    }

    if (this.goal && !this.goal.isShared) {
      const dialogRef = this.dialog.open(GoalDeleteDialogComponent, {
        data: this.goal,
      })

      dialogRef.afterClosed().subscribe(deleted => {
        if (deleted) {
          this.updateGoals.emit()
        }
      })
    }
  }
}
