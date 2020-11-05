import { animate, transition, trigger } from '@angular/animations'
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { LoaderService } from '../../../../../../../../services/loader.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { IAssessmentDetails, IQuestionDetail, IQuestionDetailsContent, ISectionDetailsContent, IResponseQuestion } from '../../interface/iap-assessment.interface'
import { IapAssessmentService } from '../../services/iap-assessment.service'
import { SectionDialogComponent } from '../section-dialog/section-dialog.component'
import { ViewQuestionDialogComponent } from '../view-question-dialog/view-question-dialog.component'
import { CONTENT_BASE_WEBHOST_ASSETS } from '../../../../../../../../constants/apiEndpoints'

@Component({
  selector: 'ws-auth-general-details',
  templateUrl: './general-details.component.html',
  styleUrls: ['./general-details.component.scss', '../iap-assessment/iap-assessment.component.scss'],
  animations: [
    trigger('detailExpand', [
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class GeneralDetailsComponent implements OnInit {
  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
    >
  @Output() data = new EventEmitter<string>()
  @Output() id = new EventEmitter<string>()
  _id!: string
  showInfo = false
  sectionDataList: ISectionDetailsContent[] = []
  currentContent = ''
  contentForm = new FormGroup({
    assessmentInstruction: new FormControl(''),
  })
  dummyResponse!: any
  generalDetailsForm!: FormGroup
  loaderFlag = false
  contestData!: IAssessmentDetails
  selected = new FormControl(0)
  showSettingButtons = true
  showQuestions = false
  showOptions = false
  sortBy = ['Topic', 'Tags', 'Name']
  showObjective = true
  showGroups = false
  isChanged = false
  sortbyValue = 'Name'
  tempSectionId!: string
  searchInu = ''
  searchClicked = false
  isSubmitPressed = false
  addSectionForm = new FormGroup({
    sectionName: new FormControl(''),
    sectionDescription: new FormControl(''),
  })
  searchForm = new FormGroup({
    searchField: new FormControl(''),
  })
  location = CONTENT_BASE_WEBHOST_ASSETS
  groupForm = new FormGroup({
    randomization: new FormControl(''),
  })
  objQuestionData!: IResponseQuestion
  groupQuestionData!: any[]
  questionDetails: IQuestionDetail = {
    myQuestion: 'yes',
    searchStatus: true,
    sortBy: '',
    tagsList: [],
    topicList: [],
    searchQuery: '',
  }
  queType = ['Relevance', 'Most Recent']
  questionType = 'Most Recent'
  expandedElement: any
  groupqueCount = 0
  tempSection!: ISectionDetailsContent
  displayedColumns: string[] = [
    'Title',
    'Topic',
    'Tags',
    'Question Type',
    'Add/Remove',
    'View Question',
  ]
  options = [
    { name: 'Add Questions', icon: 'add' },
    { name: 'Edit/View Section', icon: 'edit' },
    { name: 'Delete Section', icon: 'delete' },
  ]
  objDataSource = new MatTableDataSource<any>()
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | null = null

  @ViewChild(MatPaginator, { static: false }) set matPaginator(paginator: MatPaginator) {
    this.paginator = paginator
    this.setDataSourceAttributes()
  }
  setDataSourceAttributes() {
    this.objDataSource.paginator = this.paginator
  }
  constructor(
    private contentService: EditorContentService,
    private loaderService: LoaderService,
    public _service: IapAssessmentService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.contentService.changeActiveCont.subscribe(data1 => (this.currentContent = data1))
    this.createForm()
    const value = this.contentService.getOriginalMeta(this.currentContent)

    if (value && value.contentIdAtSource) {
      const idData = {
        id: value.contentIdAtSource,
      }
      this._service.contestToDraft(idData).subscribe(response => {
        this.dummyResponse = response

        const data = {
          id: value.contentIdAtSource,
        }
        const datatogetSection = {
          testId: value.contentIdAtSource,
        }
        this._service.getContestDetails(data).subscribe(res => {
          this.contestData = res
          this.contentService.setIapContent(
            { ['_id']: value.contentIdAtSource } as any,
            this.currentContent,
          )
          this._id = value.contentIdAtSource
          this.id.emit(this._id)
          this.contentForm = new FormGroup({
            assessmentInstruction: new FormControl(this.contestData.instructions || ''),
          })
          this.generalDetailsForm.controls.objNegMarks.setValue(this.contestData.objNegMarks)
          this.objNegMarks(this.contestData.objNegMarks)

          if (this.contestData.videoProctoring) {
            this.generalDetailsForm.controls.videoProctoring.setValue('true')
            this.videoProctoringChange('true')
          } else {
            this.generalDetailsForm.controls.videoProctoring.setValue('false')
            this.videoProctoringChange('false')
          }
          if (this.contestData.viewMarks) {
            this.generalDetailsForm.controls.viewMarks.setValue('true')
            this.viewMarks('true')
          } else {
            this.generalDetailsForm.controls.viewMarks.setValue('false')
            this.viewMarks('false')
          }
          if (this.contestData.reviewAttempt) {
            this.generalDetailsForm.controls.reviewAttempt.setValue('true')
            this.reviewAttempt('true')
          } else {
            this.generalDetailsForm.controls.reviewAttempt.setValue('false')
            this.reviewAttempt('false')
          }
          if (this.contestData.objNegMarksEnable === 'yes') {
            this.generalDetailsForm.controls.objNegMarksEnable.setValue('true')
            this.objNegMarksEnable('true')
          } else {
            this.generalDetailsForm.controls.objNegMarksEnable.setValue('false')
            this.objNegMarksEnable('false')
            this.generalDetailsForm.controls.objNegMarks.setValue('')
            this.objNegMarks('')
          }
          if (this.contestData.proctor === 'yes') {
            this.generalDetailsForm.controls.proctor.setValue('true')
            this.proctor('true')
          } else {
            this.generalDetailsForm.controls.proctor.setValue('false')
            this.proctor('false')
          }

          this.generalDetailsForm.controls.passPercentage.setValue(this.contestData.passPercentage)
          this.passPercentage(this.contestData.passPercentage)

          this._service.getCreatedSection(datatogetSection).subscribe(responseList => {
            this.sectionDataList = responseList.list || []
            this.countTotalNoOfQuestionsInSections()
          })
        })
      })
    } else {
      const data = {
        sectionEnabled: 'yes',
        testName: 'Dummy TestName',
        openEndedContest: 'true',
        lexResourceId: this.currentContent,
      }

      this._service.getIapId(data).subscribe(res => {
        this.contentService.setIapContent({ ['_id']: res._id } as any, this.currentContent)
        this._id = res._id
        this.id.emit(this._id)
        const value1 = {
          _id: this._id,
        }
        this._service.saveContestDetails(value1).subscribe(res1 => {
          if (res1.status === 'done') {
            this.contentService.setUpdatedMeta({ ['contentIdAtSource']: this._id } as any, this.currentContent)
          }

        })

      })
      this.contentForm = new FormGroup({
        assessmentInstruction: new FormControl(''),
      })
    }

  }
  createForm() {
    this.generalDetailsForm = this.formBuilder.group({
      videoProctoring: ['false'],
      viewMarks: ['true'],
      objNegMarksEnable: ['false'],
      proctor: ['false'],
      reviewAttempt: ['true'],
      objNegMarks: [''],
      passPercentage: [80],
    })
    this.videoProctoringChange('false')
    this.viewMarks('true')
    this.objNegMarksEnable('false')
    this.passPercentage(80)
    this.proctor('false')
    this.reviewAttempt('true')
  }

  updateContentService(meta: string, value: any) {
    this.contentForm.patchValue({
      assessmentInstruction: value,
    })
    this.contentService.setIapContent({ [meta]: value } as any, this.currentContent)
  }

  videoProctoringChange(e: any) {
    if (e === 'true') {
      this.contentService.setIapContent({ ['videoProctoring']: true } as any, this.currentContent)
    } else {
      this.contentService.setIapContent({ ['videoProctoring']: false } as any, this.currentContent)
    }
  }
  viewMarks(e: any) {
    if (e === 'true') {
      this.contentService.setIapContent({ ['viewMarks']: true } as any, this.currentContent)
    } else {
      this.contentService.setIapContent({ ['viewMarks']: false } as any, this.currentContent)
    }
  }
  reviewAttempt(e: any) {
    if (e === 'true') {
      this.contentService.setIapContent({ ['reviewAttempt']: true } as any, this.currentContent)
    } else {
      this.contentService.setIapContent({ ['reviewAttempt']: false } as any, this.currentContent)
    }
  }
  objNegMarksEnable(e: any) {
    this.contentService.setIapContent(
      { ['objNegMarksEnable']: this.generalDetailsForm.value.objNegMarksEnable } as any,
      this.currentContent,
    )
    if (e === 'true') {
      this.contentService.setIapContent(
        { ['objNegMarksEnable']: 'yes' } as any,
        this.currentContent,
      )
    } else {
      this.contentService.setIapContent({ ['objNegMarksEnable']: 'no' } as any, this.currentContent)
    }
  }
  proctor(e: any) {
    if (e === 'true') {
      this.contentService.setIapContent({ ['proctor']: 'yes' } as any, this.currentContent)
    } else {
      this.contentService.setIapContent({ ['proctor']: 'no' } as any, this.currentContent)
    }
  }
  objNegMarks(e: any) {
    this.contentService.setIapContent({ ['objNegMarks']: e } as any, this.currentContent)
  }
  passPercentage(e: any) {
    this.contentService.setIapContent({ ['passPercentage']: e } as any, this.currentContent)
  }

  showinfo(value: any) {
    if (value === 'proctor') {
      this.showInfo = !this.showInfo
    }
  }
  save() {
    this.data.emit('save')
  }
  next() {
    this.data.emit('next')
  }
  formNext(value: number) {
    this.selected.setValue(value)
  }

  // this function is to get objective questions from backend
  renderObjectiveQuestions() {

    this._service.getObjQuestions(this.questionDetails).subscribe(res => {

      this.objQuestionData = <IResponseQuestion>res
      if (this.tempSection && this.tempSection.objectiveQuestionsList && this.tempSection.objectiveQuestionsList.length !== 0) {
        this.objQuestionData.data.forEach(quedata => {
          this.tempSection.objectiveQuestionsList.forEach(qId => {
            if (qId === quedata._id) {
              quedata.contestAdded = true
            }
          })
        })
      }
      this.objDataSource = new MatTableDataSource<any>(res.data)
      this.objDataSource.paginator = this.paginator
      this.loaderFlag = false
      this.questionDetails.searchQuery = ''
    })
  }
  // this function is to get group questions(randomization) from backend
  renderGroupQuestions() {
    const groupDetails = {
      testId: this._id,
    }
    this._service.getGroupQuestions(groupDetails).subscribe(res => {
      this.groupQuestionData = res
    })
  }

  // Functions related to questions adding , hiding , searching and removing

  hideQuestions(value: number) {
    if (value !== 2) {
      this.showQuestions = false
    }
    if (value === 1) {
      const datatogetSection = {
        testId: this._id,
      }
      this._service.getCreatedSection(datatogetSection).subscribe(responseList => {
        this.sectionDataList = responseList.list || []
        this.countTotalNoOfQuestionsInSections()
      })
    }
  }
  searchQuestions() {
    if (this.searchInputElem.nativeElement) {
      this.searchInu = this.searchInputElem.nativeElement.value.trim()
    }
    this.questionDetails.searchQuery = ''
    this.questionDetails.tagsList = []
    this.questionDetails.topicList = []
    if (this.sortbyValue === 'Topic') {
      this.questionDetails.topicList.push(this.searchInu)
    } else if (this.sortbyValue === 'Tags') {
      this.questionDetails.tagsList.push(this.searchInu)
    } else {
      this.questionDetails.searchQuery = this.searchInu
    }
    this.loaderFlag = true
    this.renderObjectiveQuestions()
    this.searchClicked = true
  }
  clearAllFilters() {
    this.searchInputElem.nativeElement.value = ''
    this.loaderFlag = true
    this.searchClicked = false
    const questionDetails: IQuestionDetail = {
      myQuestion: 'yes',
      searchStatus: true,
      sortBy: '',
      tagsList: [],
      topicList: [],
      searchQuery: '',
    }
    this.questionDetails = questionDetails
    this.renderObjectiveQuestions()
  }
  // function to add objective question to section
  add(data: IQuestionDetailsContent) {
    data.loader = true
    const details = {
      testId: this._id,
      sectionId: this.tempSectionId,
      objectiveQuestionsList: [data._id],
    }
    this._service.addObjQuestionstoSections(details).subscribe(res => {
      data.loader = false
      if (res.status === 'notDone') {
        data.contestAdded = false
        this.snackBar.open(res.message)
      } else {
        data.contestAdded = true
        this.snackBar.open('Question added to section')
      }
    })
  }
  // function to remove objective question from section
  remove(data: any) {
    data.loader = true

    const details = {
      testId: this._id,
      sectionId: this.tempSectionId,
      objectiveQuestionsList: [data._id],
    }
    this._service.removeObjQuestionstoSections(details).subscribe(res => {
      data.loader = false
      if (res.status === 'notDone') {
        data.contestAdded = true
        this.snackBar.open(res.message)
      } else {
        data.contestAdded = false
        this.snackBar.open('Question removed from section')
      }
    })
  }
  setSortBy(value: any) {
    this.sortbyValue = value
  }
  // Section Related Functions

  addSection() {
    this.loaderService.changeLoad.next(true)
    this.addSectionForm.value.showOptions = false
    if (this.addSectionForm.value.sectionDescription === '') {
      this.addSectionForm.patchValue({
        sectionDescription: 'No description provided',
      })
    }
    const sectionData = {
      testId: this._id,
      sectionName: this.addSectionForm.value.sectionName,
      sectionDescription: this.addSectionForm.value.sectionDescription,
    }

    this._service.getSectionId(sectionData).subscribe(res => {
      this.addSectionForm.value._id = res.ids[0]
      this.sectionDataList.push(this.addSectionForm.value)

      // this.contentService.setIapContent({ ['sectionDetails']: this.sectionDataList } as any, this.currentContent)
      this.loaderService.changeLoad.next(false)
      const element = <any>document.getElementById('sectionContainer')
      this.countTotalNoOfQuestionsInSections()
      element.scrollIntoView({ block: 'end', behavior: 'smooth' })
      this.addSectionForm.patchValue({
        sectionName: '',
        sectionDescription: '',
        showOptions: false,
      })
    })
  }

  openOptions(section: ISectionDetailsContent) {
    section.showOptions = !section.showOptions
  }

  cardActions(name: String, section: ISectionDetailsContent) {
    if (name === 'Delete Section') {
      this.deleteSection(section)
    } else if (name === 'Add Questions') {
      this.tempSectionId = section._id
      this.showQuestions = true
      this.showGroups = false
      this.showObjective = true
      this.formNext(2)
      window.scrollTo(0, 200)
      this.loaderFlag = true
      this.tempSection = section
      this.searchClicked = false
      this.renderObjectiveQuestions()
      this.renderGroupQuestions()
    } else if (name === 'Edit/View Section') {
      this.openDialog(section)
    }
  }
  deleteSection(section: ISectionDetailsContent) {
    this.loaderService.changeLoad.next(true)
    let i = this.sectionDataList.length
    const sectionidTobedeleted = section._id
    const sectionDetails = {
      sectionId: sectionidTobedeleted,
      testId: this._id,
    }
    this._service.removeSection(sectionDetails).subscribe(res => {
      if (res.status === 'done') {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        while (i) {
          i = i - 1
          if (this.sectionDataList[i]._id === sectionidTobedeleted) {
            this.sectionDataList.splice(i, 1)
            break
          }
        }
      } else {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    })
  }
  setQueType(value: string) {
    if (value === 'Relevance') {
      this.questionDetails.sortBy = 'relevance'
      this.questionType = 'Relevance'
    } else {
      this.questionDetails.sortBy = 'most Recent'
      this.questionType = 'Most Recent'
    }

  }
  countTotalNoOfQuestionsInSections() {
    this.sectionDataList.forEach(section => {
      this.groupqueCount = 0
      section.numberOfQuestionsAdded = 0
      if (section.groupList && section.groupList.length) {
        section.groupList.forEach(group => {
          this.groupqueCount += group.questionsNeeded
        })
      }
      if (section.objectiveQuestionsList) {
        section.numberOfQuestionsAdded = section.objectiveQuestionsList.length + this.groupqueCount
      }

    })
  }
  openDialog(section: ISectionDetailsContent): void {
    const dialogRef = this.dialog.open(SectionDialogComponent, {
      width: '50%',
      data: { ...section, testId: this._id },
    })

    dialogRef.afterClosed().subscribe(result => {
      const datatogetSection = {
        testId: this._id,
      }

      this.sectionDataList.forEach(element => {
        if (element._id === section._id && result) {
          section.sectionName = result.value.sectionName
          section.sectionDescription = result.value.sectionDescription
          const editSectiondata = {
            testId: this._id,
            sectionData: [{
              _id: section._id,
              sectionName: section.sectionName,
              sectionDescription: section.sectionDescription,
            }],
          }
          this._service.editSectionName(editSectiondata).subscribe(response => {
            this.dummyResponse = response
            this._service.getCreatedSection(datatogetSection).subscribe(responseList => {
              this.sectionDataList = responseList.list || []
              this.countTotalNoOfQuestionsInSections()
            })
          })
        }
      })
      // this.contentService.setIapContent({ ['sectionDetails']: this.sectionDataList } as any, this.currentContent)
    })
  }

  openViewQuestionDialog(questionData: any) {
    this.dialog.open(ViewQuestionDialogComponent, {
      maxWidth: '80%',
      minWidth: '40%',
      panelClass: 'dialog-height',
      data: { ...questionData },
    })
  }
  radioChange(event: any) {
    const value = event.value
    if (value === 'objective') {
      this.showObjective = true
      this.showGroups = false
      // this.renderObjectiveQuestions()
    } else if (value === 'groups') {
      this.showGroups = true
      this.showObjective = false
      // this.renderGroupQuestions()
    }
  }

  addGroupToSection(group: any) {
    const groupData = group
    groupData.randomization = this.groupForm.value.randomization

    const data = {
      testId: this._id,
      sectionId: this.tempSectionId,
      groupId: group._id,
      questionsNeeded: Number(this.groupForm.value.randomization),
    }
    this._service.adGroupQuestionsToSections(data).subscribe(res => {
      if (res.status === 'done') {
        groupData.addedToContest = true
        this.snackBar.open(res.message)
      } else {
        groupData.addedToContest = false
        this.snackBar.open(res.message)
      }
    })
  }
  editRandomization(group: any) {
    const data = {
      sectionId: this.tempSectionId,
      groupId: group._id,
      questionsNeeded: Number(this.groupForm.value.randomization),
    }
    this._service.editRandomization(data).subscribe(res => {
      if (res.status === 'done') {
        this.snackBar.open('Randomization is edited')
      } else {
        this.snackBar.open(res.message)
      }
    })
  }
  removeGroupQuestion(group: any) {
    const data = {
      testId: this._id,
      sectionId: this.tempSectionId,
      groupId: group._id,
    }
    this._service.removeGroupFromSection(data).subscribe(res => {
      if (res.status === 'done') {
        group.addedToContest = false
        this.snackBar.open('Group removed from section')
      } else {
        group.addedToContest = true
        this.snackBar.open(res.message)
      }
    })
  }

}
