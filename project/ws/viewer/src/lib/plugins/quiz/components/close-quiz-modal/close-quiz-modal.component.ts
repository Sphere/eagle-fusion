import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'viewer-close-quiz-modal',
  templateUrl: './close-quiz-modal.component.html',
  styleUrls: ['./close-quiz-modal.component.scss'],
})
export class CloseQuizModalComponent implements OnInit {

  modelType = ''
  constructor(
    public dialogRef: MatDialogRef<CloseQuizModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
  ) { }

  ngOnInit() {
    this.modelType = this.assesmentdata.type
  }
  closeNo() {
    this.dialogRef.close({ event: 'NO' })
  }

  closeYes() {
    this.dialogRef.close({ event: 'CLOSE' })
  }

  restart() {
    this.dialogRef.close({ event: 'RETAKE_QUIZ' })
  }
}
