import { Component, Inject, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { IapAssessmentService } from '../../services/iap-assessment.service'
import { IQuestionDetailsContent } from '../iap-assessment/iap-assessment.component'
// IQuestionDetailsContent

@Component({
  selector: 'ws-auth-section-dialog',
  templateUrl: './section-dialog.component.html',
  styleUrls: ['./section-dialog.component.scss'],
})
export class SectionDialogComponent implements OnInit {
  constructor(
    public iapService: IapAssessmentService,
    public dialogRef: MatDialogRef<SectionDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  loaderFlag = false
  questionDetails = {
    myQuestion: 'public',
    searchStatus: true,
    sortBy: '',
    tagsList: [],
    topicList: [],
    searchQuery: '',
  }
  objectiveQuestionsData: IQuestionDetailsContent[] = []
  groupQuestionsData = []
  addSectionForm = new FormGroup({
    sectionName: new FormControl(this.data.sectionName),
    sectionDescription: new FormControl(this.data.sectionDescription),
  })

  ngOnInit() {
    this.dialogRef.updateSize('80%', '80%')
    this.loaderFlag = true
    this.iapService.getSectionData(this.data._id).subscribe(response => {
      this.objectiveQuestionsData = response.objectiveQuestionsData
      this.groupQuestionsData = response.groupData
      this.loaderFlag = false
    })
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  removeQuestions(questionDetails: any) {
    const details = {
      testId: this.data.testId,
      sectionId: this.data._id,
      objectiveQuestionsList: [questionDetails._id],
    }
    this.iapService.removeObjQuestionstoSections(details).subscribe(res => {
      if (res.status === 'notDone') {
        this.snackbar.open(res.message)
      } else {
        this.snackbar.open('Question removed from section')
      }
      this.iapService.getSectionData(this.data._id).subscribe(response => {
        this.objectiveQuestionsData = response.objectiveQuestionsData
      })
    })

  }
  removeGroup(group: any) {
    const details = {
      testId: this.data.testId,
      sectionId: this.data._id,
      groupId: group._id,
    }
    this.iapService.removeGroupFromSection(details).subscribe(res => {
      if (res.status === 'notDone') {
        this.snackbar.open(res.message)
      } else {
        this.snackbar.open('Group removed from section')
      }
    })
    this.iapService.getSectionData(this.data._id).subscribe(response => {
      this.groupQuestionsData = response.groupData
    })
  }
}
