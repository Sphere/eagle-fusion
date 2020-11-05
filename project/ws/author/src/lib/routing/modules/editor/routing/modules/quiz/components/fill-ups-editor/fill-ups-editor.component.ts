import { Component, OnInit, Output, EventEmitter, Input, OnChanges, OnDestroy } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
  AbstractControl,
} from '@angular/forms'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { debounceTime, map } from 'rxjs/operators'
import { Observable, Subscription } from 'rxjs'
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout'

import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component.ts'
import { FillUps, Option } from '../quiz-class'
import { NOTIFICATION_TIME } from '../../constants/quiz-constants'

import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { QuizStoreService } from '../../services/store.service'
import { OpenPlainCkEditorComponent } from '../../shared/components/open-plain-ck-editor/open-plain-ck-editor.component'

@Component({
  selector: 'ws-auth-fill-ups-editor',
  templateUrl: './fill-ups-editor.component.html',
  styleUrls: ['./fill-ups-editor.component.scss'],
})
export class FillUpsEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() submitPressed = false
  @Output() value = new EventEmitter<FillUps>()
  @Input() currentId = ''
  @Input() showHint!: boolean
  selectedQuiz?: FillUps
  identifier = ''
  quizForm!: FormGroup
  fillUpsOptions: any = {}
  contentLoaded = false
  showDeleteForCard?: number
  selectedOption?: number
  activeIndexSubscription?: Subscription
  selectedIndex!: number
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

  ngOnChanges() {
    if (this.submitPressed && this.quizForm) {
      this.assignForm()
    }
  }

  ngOnInit() {
    this.smallScreen.subscribe(v => this.isSmallScreen = v)
    this.activeIndexSubscription = this.quizStoreSvc.selectedQuizIndex.subscribe(index => {
      this.contentLoaded = false
      const val = this.quizStoreSvc.getQuiz(index)
      this.selectedIndex = index
      this.selectedQuiz = val && val.questionType === 'fitb' ? new FillUps(val) : undefined
      if (val && val.questionType === 'fitb') {
        this.setUp()
        this.contentLoaded = true
      }
    })
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

  drop(event: CdkDragDrop<string[]>) {
    const optionsArr = this.quizForm.controls['options'].value
    moveItemInArray(optionsArr, event.previousIndex, event.currentIndex)
    for (let i = 0; i < optionsArr.length; i = i + 1) {
      (this.quizForm.controls['options'] as FormArray).at(i).setValue(optionsArr[i])
    }
  }

  addOption() {
    if (this.selectedQuiz && this.selectedQuiz.options.length < this.fillUpsOptions.maxOptions) {
      const newOption = new Option({ isCorrect: true })
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

  removeOption(optionIndex: number) {
    const confirmDelete = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: 'delete',
    })
    confirmDelete.afterClosed().subscribe(confirm => {
      if (confirm && this.selectedQuiz && this.selectedQuiz.options) {
        const optionsArr = this.quizForm.controls['options'] as FormArray
        optionsArr.removeAt(optionIndex)
        this.selectedQuiz.options.splice(optionIndex, 1)
        if (this.selectedQuiz.options.length < this.fillUpsOptions.minOptions) {
          this.addOption()
        }
      }
    })
  }

  setUp() {
    if (this.fillUpsOptions) {
      this.fillUpsOptions = this.quizStoreSvc.getQuizConfig('fitb')
    }
    this.createForm()
    for (let i = 0; i < this.fillUpsOptions.minOptions; i = i + 1) {
      if (this.selectedQuiz && this.selectedQuiz.options.length < this.fillUpsOptions.minOptions) {
        this.addOption()
      }
    }
    this.assignForm()
  }

  updateContentService($event: any, optionIndex: number) {
    const optionsArr = this.quizForm.controls['options'] as FormArray
    if (optionsArr && optionsArr.at(optionIndex) && optionsArr.at(optionIndex).get('hint')) {
      (optionsArr.at(optionIndex).get('hint') as AbstractControl).setValue($event)
    }
  }

  createOptionControl(optionObj: Option) {
    const noWhiteSpace = new RegExp('\\S')
    const newControl = this.formBuilder.group({
      hint: new FormControl(optionObj.hint || ''),
      text: [optionObj.text || '', [Validators.required, Validators.pattern(noWhiteSpace)]],
    })
    const optionsArr = this.quizForm.controls['options'] as FormArray
    optionsArr.push(newControl)
  }

  assignForm() {
    const newData = this.quizStoreSvc.getQuiz(this.selectedIndex)
    if (newData && newData.isInValid) {
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
      const updatedValue = JSON.parse(JSON.stringify(this.quizForm.value))
      updatedValue.options.map((op: any) => op.isCorrect = true)
      this.value.emit(updatedValue)
    })
  }
}
