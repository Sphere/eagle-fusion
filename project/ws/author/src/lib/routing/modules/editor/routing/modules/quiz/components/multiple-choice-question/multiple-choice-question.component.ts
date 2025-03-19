import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar'
import { debounceTime, map } from 'rxjs/operators'
import { Observable, Subscription } from 'rxjs'
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout'

import { NOTIFICATION_TIME } from '../../constants/quiz-constants'
import { QuizStoreService } from '../../services/store.service'

import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component.ts'
import { McqQuiz, Option } from '../quiz-class'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { OpenPlainCkEditorComponent } from '../../shared/components/open-plain-ck-editor/open-plain-ck-editor.component'

@Component({
  selector: 'ws-auth-multiple-choice-question',
  templateUrl: './multiple-choice-question.component.html',
  styleUrls: ['./multiple-choice-question.component.scss'],
})
export class MultipleChoiceQuestionComponent implements OnInit, OnChanges, OnDestroy {
  @Output() value = new EventEmitter<any>()
  @Input() submitPressed!: boolean
  @Input() currentId = ''
  @Input() showHint!: boolean
  selectedCount = 0
  selectedQuiz?: McqQuiz
  quizForm!: FormGroup
  mcqOptions: any = {}
  snackbarRef?: MatSnackBarRef<NotificationComponent>
  contentLoaded = false
  showDeleteForCard?: number
  identifier = ''
  index!: number
  selectedOption?: number
  activeIndexSubscription?: Subscription
  smallScreen: Observable<boolean> = this.breakpointObserver
    .observe('(max-width:600px)')
    .pipe(map((res: BreakpointState) => res.matches))
  isSmallScreen = false

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private quizStoreSvc: QuizStoreService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnDestroy() {
    if (this.activeIndexSubscription) {
      this.activeIndexSubscription.unsubscribe()
    }
  }

  openCkEditor(index: number) {
    const hint =
      (((this.quizForm.controls.options as FormArray).at(index).get('hint') as FormControl) || {})
        .value || ''
    const dialogRef = this.dialog.open(OpenPlainCkEditorComponent, {
      width: '800px',

      data: {
        content: hint,
        identifier: this.currentId,
        type: 'HINT_EDITOR',
        index: index + 1,
      },
    })
    dialogRef.afterClosed().subscribe(res => {
      if (res !== undefined) {
        const optionsArr = this.quizForm.controls['options'] as FormArray
        if (optionsArr && optionsArr.at(index) && optionsArr.at(index).get('hint')) {
          (optionsArr.at(index).get('hint') as AbstractControl).setValue(res)
        }
      }
    })
  }

  ngOnInit() {
    this.smallScreen.subscribe(v => this.isSmallScreen = v)
    this.activeIndexSubscription = this.quizStoreSvc.selectedQuizIndex.subscribe(index => {
      this.contentLoaded = false
      this.index = index
      const val = this.quizStoreSvc.getQuiz(index)
      this.selectedQuiz =
        val && (val.questionType === 'mcq-sca' || val.questionType === 'mcq-mca')
          ? new McqQuiz(val)
          : undefined
      if (val && (val.questionType === 'mcq-sca' || val.questionType === 'mcq-mca')) {
        this.setUp()
        this.contentLoaded = true
      }
    })
  }

  ngOnChanges() {
    if (this.submitPressed && this.quizForm) {
      this.assignForm()
    }
  }

  setUp() {
    if (this.selectedQuiz && this.selectedQuiz.options) {
      if (this.mcqOptions) {
        this.mcqOptions = this.quizStoreSvc.getQuizConfig('mcq-sca')
      }
      this.createForm()
      for (let i = 0; i < this.mcqOptions.minOptions; i = i + 1) {
        if (this.selectedQuiz.options.length < this.mcqOptions.minOptions) {
          this.addOption()
        }
      }
      this.assignForm()
      this.selectedCount = 0
      this.selectedQuiz.options.forEach(op => {
        if (op.isCorrect) {
          this.selectedCount = this.selectedCount + 1
        }
      })
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    const optionsArr = this.quizForm.controls['options'].value
    moveItemInArray(optionsArr, event.previousIndex, event.currentIndex)
    for (let i = 0; i < optionsArr.length; i = i + 1) {
      (this.quizForm.controls['options'] as FormArray).at(i).setValue(optionsArr[i])
    }
  }

  addOption() {
    if (this.selectedQuiz) {
      const optionsLen = this.selectedQuiz.options.length
      if (optionsLen < this.mcqOptions.maxOptions) {
        const newOption = new Option({ isCorrect: false })
        this.createOptionControl(newOption)
        this.selectedQuiz.options.push(newOption)
      } else {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.MAX_OPTIONS_REACHED,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    }
  }

  removeOption(optionIndex: number) {
    const confirmDelete = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: 'delete',
    })
    confirmDelete.afterClosed().subscribe(confirm => {
      if (confirm && this.selectedQuiz && this.selectedQuiz.options.length) {
        const optionsArr = this.quizForm.controls['options'] as FormArray
        optionsArr.removeAt(optionIndex)
        this.selectedQuiz.options.splice(optionIndex, 1)
        if (this.selectedQuiz.options.length < this.mcqOptions.minOptions) {
          this.addOption()
        }
      }
    })
  }

  onSelected($event: any) {
    this.selectedCount = $event.checked ? this.selectedCount + 1 : this.selectedCount - 1
    if (
      this.selectedQuiz &&
      this.selectedQuiz.options &&
      this.selectedCount === this.selectedQuiz.options.length
    ) {
      this.snackbarRef = this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.MCQ_ALL_OPTIONS_CORRECT,
        },
        duration: NOTIFICATION_TIME * 500,
      })
    } else {
      if (this.snackbarRef) {
        this.snackbarRef.dismiss()
      }
    }
  }

  createOptionControl(optionObj: Option) {
    const noWhiteSpace = new RegExp('\\S')
    const newControl = this.formBuilder.group({
      text: [optionObj.text || '', [Validators.required, Validators.pattern(noWhiteSpace)]],
      isCorrect: [optionObj.isCorrect || false],
      hint: [optionObj.hint || ''],
    })
    const optionsArr = this.quizForm.controls['options'] as FormArray
    optionsArr.push(newControl)
  }

  assignForm() {
    const newData = this.quizStoreSvc.getQuiz(this.index)
    if (newData && newData.isInValid) {
      // this.quizForm.markAllAsTouched()
      Object.keys(this.quizForm.controls).map(v => {
        const optionsArr = this.quizForm.controls[v] as FormArray
        optionsArr.controls.map((d: any) => {
          Object.keys(d.controls).map(e => {
            if (e === 'text') {
              d.controls[e].markAsDirty()
              d.controls[e].markAsTouched()
            }
          })
        })
      })
    }
  }

  createForm() {
    this.quizForm = this.formBuilder.group({
      options: this.formBuilder.array([]),
    })
    if (this.selectedQuiz && this.selectedQuiz.options.length) {
      this.selectedQuiz.options.forEach(v => {
        this.createOptionControl(v)
      })
    }
    this.quizForm.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      this.value.emit(JSON.parse(JSON.stringify(this.quizForm.value)))
    })
  }
}
