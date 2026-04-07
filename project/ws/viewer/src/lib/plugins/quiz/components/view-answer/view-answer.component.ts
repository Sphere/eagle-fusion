import { Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

@Component({
    standalone: false,
    selector: "app-view-answer",
    templateUrl: "./view-answer.component.html",
    styleUrls: ["./view-answer.component.scss"],
    
})
export class ViewAnswerComponent implements OnInit {
  questions!: any[]
  userInput!: { [key: string]: string[] }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewAnswerComponent>
  ) { }

  userSelectedWrong(qId: string, opt: any): boolean {
    const selectedOptions = this.userInput[qId]
    if (!selectedOptions) return false

    return this.userInput[qId]?.includes(opt.optionId) && !opt.isCorrect
  }

  ngOnInit(): void {
    if (this.data) {
      this.questions = this.data.questions || []
      this.userInput = this.data.userInput || {}
    }
  }

  isUserAnswerCorrect(question: any): boolean {
    const selectedOptions = this.userInput[question.questionId]
    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
      return false
    }
    const correctOptionIds = question.options
      .filter((opt: any) => opt.isCorrect)
      .map((opt: any) => opt.optionId)
    if (question.multiSelection) {
      if (selectedOptions.length !== correctOptionIds.length) {
        return false
      }
      return correctOptionIds.every((id: string) =>
        selectedOptions.includes(id)
      )
    }
    return (
      selectedOptions.length === 1 &&
      correctOptionIds.includes(selectedOptions[0])
    )
  }

  closePopup(): void {
    this.dialogRef.close()
  }
}
