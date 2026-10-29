import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { LoggerService, ValueService } from '@ws-widget/utils'

@Component({
    standalone: false,
    selector: 'player-video-popup-component',
    templateUrl: './player-video-popup-component.html',
    styleUrls: ['./player-video-popup-component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    
})
export class PlayerVideoPopupComponent implements OnInit {

  isMobile = false
  currentIndex = 0 // Track the current question index
  selectedAnswers: any = [] // Store answers for the current question
  answers: any[] = [] // Track all answers
  questions: Array<{ text: string; options: any[] }>
  resultMessage: string | null = null
  selectedOption: any = null // To store the selected option
  showAnswerInfo = false
  layoutDirection = 'column' // or 'row'
  showReset = false
  constructor(
    private readonly valueSvc: ValueService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PlayerVideoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { questions: Array<{ text: string; options: any[] }> },
    private readonly logger: LoggerService
  ) {
    this.questions = data.questions
    this.answers = new Array(this.questions.length).fill(null) // Initialize answers array
    // dialogRef.disableClose = true
  }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.setColumnView()
      } else {
        this.setRowView()
      }
    })
  }

  private setColumnView(): void {
    this.layoutDirection = 'columnView'
  }

  private setRowView(): void {
    this.layoutDirection = 'rowView'
  }
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.closePopup()
      event.preventDefault()
    }
  }
  get currentQuestion() {
    return this.questions[this.currentIndex]
  }
  /** The question's correct option, whose hint is shown after a wrong answer. */
  get correctOption(): any {
    const options = this.currentQuestion?.options || []
    return options.find((option: any) => option.isCorrect) ?? null
  }
  onOptionSelected(option: any): void {
    this.selectedOption = option
    this.answers[this.currentIndex] = option
    this.resultMessage = option.isCorrect ? 'Correct' : 'Wrong'
  }
  moveToPrevious(): void {
    this.showAnswerInfo = false

    if (this.currentIndex > 0) {
      this.currentIndex--
    }
  }

  moveToNext(): void {
    this.showAnswerInfo = false
    this.showReset = false
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++
      // Each question keeps its own choice; a fresh question starts unselected.
      const answer = this.answers[this.currentIndex]
      this.selectedOption = answer ?? null
      this.resultMessage = answer ? (answer.isCorrect ? 'Correct' : 'Wrong') : null
    }
  }

  submitQuiz(): void {
    if (this.resultMessage) {
      this.showAnswerInfo = true
      if (this.resultMessage === 'Correct') {
        this.showReset = false
      } else {
        this.showReset = true
      }
    }
    this.logger.log('Submitted answers:', this.resultMessage, this.answers)
  }
  reset() {
    this.showReset = false
    this.showAnswerInfo = false
  }
  continue(): void {
    this.dialogRef.close({ event: 'submit', answers: this.answers })
  }
  sendAction(value: string): void {
    this.showAnswerInfo = false
    this.dialogRef.close({ event: value })
    this.logger.log('value', value)
  }
  closePopup() {
    this.dialogRef.close('skip')
  }

}