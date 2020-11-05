import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import * as iapInterface from '../../interface/iap-assessment.interface'
import { IapAssessmentService } from '../../services/iap-assessment.service'

@Component({
  selector: 'ws-auth-view-question-dialog',
  templateUrl: './view-question-dialog.component.html',
  styleUrls: ['./view-question-dialog.component.scss'],
})
export class ViewQuestionDialogComponent implements OnInit {
  constructor(
    public iapService: IapAssessmentService,
    public dialogRef: MatDialogRef<ViewQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: iapInterface.IQuestionDetailsContent,
  ) {}

  ngOnInit() {}
}
