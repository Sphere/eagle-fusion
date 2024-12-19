import { Component, OnInit, Input, OnDestroy } from '@angular/core'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBarRef } from '@angular/material/snack-bar'
import { QuizStoreService } from '../../../services/store.service'

import { QUIZ_QUESTION_TYPE } from '../../../constants/quiz-constants'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component.ts'

import { IQuizQuestionType } from '../../../interface/quiz-interface'

@Component({
  selector: 'ws-auth-question-editor-sidebar',
  templateUrl: './question-editor-sidenav.component.html',
  styleUrls: ['./question-editor-sidenav.component.scss'],
})
export class QuestionEditorSidenavComponent implements OnInit, OnDestroy {

  @Input() type = ''
  @Input() data: any[] = []
  @Input() showContent?: boolean
  /**
   * reviwer and publisher cannot add or delete or edit quizs but can rearrange them
   */
  @Input() canEdit!: boolean
  mediumSizeBreakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))
  mediumScreen = false
  selectedQuizIndex!: number
  showDeleteForCard!: number
  entityMinMaxConfig: any
  activeIndexSubscription?: Subscription
  snackbarRef!: MatSnackBarRef<NotificationComponent>
  questionType: IQuizQuestionType['fillInTheBlanks'] |
    IQuizQuestionType['matchTheFollowing'] |
    IQuizQuestionType['multipleChoiceQuestionSingleCorrectAnswer'] |
    IQuizQuestionType['multipleChoiceQuestionMultipleCorrectAnswer'] = QUIZ_QUESTION_TYPE['multipleChoiceQuestionSingleCorrectAnswer']

  constructor(
    private quizStoreSvc: QuizStoreService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnDestroy() {
    if (this.activeIndexSubscription) {
      this.activeIndexSubscription.unsubscribe()
    }
  }

  ngOnInit() {
    this.entityMinMaxConfig = this.type === 'assessment' ? this.quizStoreSvc.getQuizConfig('ques') : null
    this.activeIndexSubscription = this.quizStoreSvc.selectedQuizIndex.subscribe((index: number) => {
      this.selectedQuizIndex = index
    })
    this.mediumSizeBreakpoint$.subscribe(isLtMedium => {
      this.mediumScreen = isLtMedium
    })
    // this.quizStoreSvc.activeLexId.subscribe(id => {
    //   this.data =  this.quizStoreSvc.getUpdatedArr()
    // })
  }

  /**
 * Adds an entity to the selected entity array
 */
  addEntity() {
    this.quizStoreSvc.addQuestion(this.questionType)
  }

  /**
 * Removes an entity in the selected entity array by index
 * @param index of data element in the array
 */
  removeEntity(index: number, event: Event) {
    event.stopPropagation()
    const confirmDelete = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        type: 'deleteQues',
        index: index + 1,
      },
    })
    confirmDelete.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.quizStoreSvc.removeQuestion(index)
      }
    })
  }

  /**
   * Selects the quiz, closes navbar in mobile view and the notification
   * @param index of element in the array
   */
  selectEntity(index: number) {
    this.quizStoreSvc.changeQuiz(index)
    if (this.snackbarRef) {
      this.snackbarRef.dismiss()
    }
  }

  /**
  * Rearranges the elements into new position based on drag and drop event
  * @param event CdkDragDrop which has the entity's previous index and current index placed at
  */
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex)
    this.quizStoreSvc.hasChanged = true
    if (this.selectedQuizIndex === event.previousIndex) {
      this.selectEntity(event.currentIndex)
    }
  }

}
