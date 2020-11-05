import {
  Component,
  OnInit,
  QueryList,
  ElementRef,
  ViewChildren,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
} from '@angular/core'
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
import { NOTIFICATION_TIME } from '../../constants/quiz-constants'
import { QuizStoreService } from '../../services/store.service'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component.ts'
import { MatchQuiz, MatchOption } from '../quiz-class'

import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { OpenPlainCkEditorComponent } from '../../shared/components/open-plain-ck-editor/open-plain-ck-editor.component'
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout'

@Component({
  selector: 'ws-auth-match-the-following',
  templateUrl: './match-the-following.component.html',
  styleUrls: ['./match-the-following.component.scss'],
})
export class MatchTheFollowingComponent implements OnInit, OnChanges, OnDestroy {
  @Output() value = new EventEmitter<MatchQuiz>()
  @Input() submitPressed = false
  @Input() currentId = ''
  @Input() showHint!: boolean
  selectedQuiz?: MatchQuiz
  quizForm!: FormGroup
  matchOptions: any = {}
  canUpdate = true
  editColName?: 'colAName' | 'colBName'
  contentLoaded = false
  showDeleteForCard?: number
  selectedIndez!: number
  activeIndexSubscription?: Subscription
  @ViewChildren('colAName') colAInput!: QueryList<ElementRef>
  @ViewChildren('colBName') colBInput!: QueryList<ElementRef>
  smallMobile: Observable<boolean> = this.breakpointObserver
    .observe('(max-width:449px)')
    .pipe(map((res: BreakpointState) => res.matches))
  smallScreen: Observable<boolean> = this.breakpointObserver
    .observe('(max-width:700px)')
    .pipe(map((res: BreakpointState) => res.matches))
  isSmallScreenMobile = false
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

  ngOnInit() {
    this.smallScreen.subscribe(v => this.isSmallScreen = v)
    this.smallMobile.subscribe(v => this.isSmallScreenMobile = v)
    this.activeIndexSubscription = this.quizStoreSvc.selectedQuizIndex.subscribe(index => {
      this.contentLoaded = false
      const val = this.quizStoreSvc.getQuiz(index)
      this.selectedIndez = index
      this.selectedQuiz = val && val.questionType === 'mtf' ? new MatchQuiz(val) : undefined
      if (val && val.questionType === 'mtf') {
        this.setUp()
        this.contentLoaded = true
      }
    })
    // if (this.breakpointObserver.isMatched('(max-width:450px)')) {
    //   this.smallMobile = true
    // } else {
    //   this.smallMobile = false
    // }
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

  ngOnChanges() {
    if (this.submitPressed && this.quizForm) {
      this.assignForm()
    }
  }

  setUp() {
    if (this.matchOptions) {
      this.matchOptions = this.quizStoreSvc.getQuizConfig('mtf')
    }
    this.createForm()
    for (let i = 0; i < this.matchOptions.minOptions; i = i + 1) {
      if (
        this.selectedQuiz &&
        this.selectedQuiz.options &&
        this.selectedQuiz.options.length < this.matchOptions.minOptions
      ) {
        this.addOption()
      }
    }
    this.assignForm()
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
      if (optionsLen < this.matchOptions.maxOptions) {
        const newOption = new MatchOption({ isCorrect: true })
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
      if (confirm && this.selectedQuiz) {
        const optionsArr = this.quizForm.controls['options'] as FormArray
        optionsArr.removeAt(optionIndex)
        this.selectedQuiz.options.splice(optionIndex, 1)
        if (this.selectedQuiz.options.length < this.matchOptions.minOptions) {
          this.addOption()
        }
      }
    })
  }

  // saveChanges() {
  //   if (this.editColName) {
  //     if (this.quizForm.controls[this.editColName].value) {
  //       this.canUpdate = true
  //       this.value.emit(this.quizForm.value)
  //     } else {
  //       const colname = this.selectedQuiz ? this.selectedQuiz[this.editColName] as string : ''
  //       this.quizForm.controls[this.editColName].setValue(colname)
  //     }
  //     this.editColName = undefined
  //   }
  // }

  editColNameFn(colName: 'colAName' | 'colBName') {
    this.editColName = colName
    setTimeout(() => {
      if (colName === 'colAName') {
        this.colAInput.first.nativeElement.focus()
      } else {
        this.colBInput.first.nativeElement.focus()
      }
    },         100)
    this.canUpdate = false
  }

  updateContentService($event: any, optionIndex: number) {
    const optionsArr = this.quizForm.controls['options'] as FormArray
    if (optionsArr && optionsArr.at(optionIndex) && optionsArr.at(optionIndex).get('hint')) {
      (optionsArr.at(optionIndex).get('hint') as AbstractControl).setValue($event)
    }
  }

  createOptionControl(optionObj: MatchOption) {
    const noWhiteSpace = new RegExp('\\S')
    const newControl = this.formBuilder.group({
      text: [optionObj.text || '', [Validators.required, Validators.pattern(noWhiteSpace)]],
      match: [optionObj.match || '', [Validators.required, Validators.pattern(noWhiteSpace)]],
      hint: new FormControl(optionObj.hint || ''),
    })
    const optionsArr = this.quizForm.controls['options'] as FormArray
    optionsArr.push(newControl)
  }

  assignForm() {
    const newData = this.quizStoreSvc.getQuiz(this.selectedIndez)
    if (newData && newData.isInValid) {
      Object.keys(this.quizForm.controls).map(v => {
        if (v === 'options') {
          const optionsArr = this.quizForm.controls[v] as FormArray
          optionsArr.controls.map((d: any) => {
            Object.keys(d.controls).map(e => {
              if (e === 'text' || e === 'match') {
                d.controls[e].markAsDirty()
                d.controls[e].markAsTouched()
              }
            })
          })
        }
      })
    }
  }

  createForm() {
    // const noWhiteSpace = new RegExp('\\S')
    this.quizForm = this.formBuilder.group({
      // colAName: [this.selectedQuiz ? this.selectedQuiz.colAName : '', [Validators.required, Validators.pattern(noWhiteSpace)]],
      // colBName: [this.selectedQuiz ? this.selectedQuiz.colBName : '', [Validators.required, Validators.pattern(noWhiteSpace)]],
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
