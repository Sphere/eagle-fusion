import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'player-video-popup-component',
  templateUrl: './player-video-popup-component.html',
  styleUrls: ['./player-video-popup-component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PlayerVideoPopupComponent implements OnInit {

  isMobile = false
  currentIndex = 0; // Track the current question index
  selectedAnswers: any = []; // Store answers for the current question
  answers: any[] = []; // Track all answers
  questions: Array<{ text: string; options: string[] }>
  resultMessage: string | null = null;
  selectedOption: any | null = null; // To store the selected option
  showAnswerInfo: boolean = false

  constructor(
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PlayerVideoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { questions: Array<{ text: string; options: string[] }> },
  ) {
    this.questions = data.questions
    this.answers = new Array(this.questions.length).fill(null) // Initialize answers array
    // dialogRef.disableClose = true
  }

  ngOnInit() {
    console.log("questions", this.questions)
  }

  get currentQuestion() {
    return this.questions[this.currentIndex]
  }
  onOptionSelected(option: any): void {
    console.log("option", option)
    this.selectedOption = option
    this.showAnswerInfo = true
    if (option.isCorrect) {
      this.resultMessage = 'Correct'
    } else {
      this.resultMessage = 'Wrong'
    }
  }
  moveToPrevious(): void {
    this.showAnswerInfo = false

    if (this.currentIndex > 0) {
      this.currentIndex--
    }
  }

  moveToNext(): void {
    this.showAnswerInfo = false
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++
    }
  }

  submitQuiz(): void {
    this.showAnswerInfo = false
    console.log('Submitted answers:', this.answers)
    this.dialogRef.close({ event: 'submit', answers: this.answers })
  }
  sendAction(value: string): void {
    this.showAnswerInfo = false
    this.dialogRef.close({ event: value })
    console.log('value', value)
  }
  closePopup() {
    this.dialogRef.close('skip')
  }

}
