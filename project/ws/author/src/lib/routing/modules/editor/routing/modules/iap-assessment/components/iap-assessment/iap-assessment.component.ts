import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { of } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import { CONTENT_BASE_WEBHOST_ASSETS } from '../../../../../../../../constants/apiEndpoints'
import { IAssessmentDetails } from '../../interface/iap-assessment.interface'
import { IapAssessmentService } from '../../services/iap-assessment.service'

@Component({
  selector: 'ws-auth-root-iap-assessment',
  templateUrl: './iap-assessment.component.html',
  styleUrls: ['./iap-assessment.component.scss'],
})
export class IapAssessmentComponent implements OnInit {
  constructor(
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    private contentService: EditorContentService,
    public dialog: MatDialog,
    private editorService: EditorService,
    private loaderService: LoaderService,
    private router: Router,
    public _service: IapAssessmentService,
    private snackBar: MatSnackBar,
  ) { }

  _id!: string
  contentForm = new FormGroup({
    assessmentInstruction: new FormControl(''),
  })
  mimeTypeRoute = ''
  dummyResponse!: any
  generalDetailsForm!: FormGroup
  loaderFlag = false
  contestData!: IAssessmentDetails
  options = [
    { name: 'Add Questions', icon: 'add' },
    { name: 'Edit/View Section', icon: 'edit' },
    { name: 'Delete Section', icon: 'delete' },
  ]
  contents: NSContent.IContentMeta[] = []
  showSettingButtons = true
  showQuestions = false
  showOptions = false
  disableCursor = false
  showObjective = true
  showGroups = false
  isChanged = false
  showInfo = false
  currentContent = ''
  allLanguages!: any[]
  currentStep = 2
  previewMode = false
  isSubmitPressed = false

  location = CONTENT_BASE_WEBHOST_ASSETS
  sectionDataList: ISectionDetailsContent[] = []
  addSectionForm = new FormGroup({
    sectionName: new FormControl(''),
    sectionDescription: new FormControl(''),
  })
  groupForm = new FormGroup({
    randomization: new FormControl(''),
  })
  objQuestionData = []
  groupQuestionData!: any[]

  expandedElement: any
  displayedColumns: string[] = [
    'Title',
    'Topic',
    'Tags',
    'Question Type',
    'Add/Remove',
    'View question',
  ]
  objDataSource = new MatTableDataSource()
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | null = null

  @ViewChild(MatPaginator, { static: false }) set matPaginator(paginator: MatPaginator) {
    this.paginator = paginator
    this.setDataSourceAttributes()
  }
  setDataSourceAttributes() {
    this.objDataSource.paginator = this.paginator
  }
  ngOnInit() {
    this.showSettingButtons = this.accessService.rootOrg === 'Siemens'
    this.allLanguages = this.authInitService.ordinals.subTitles
    Object.keys(this.contentService.originalContent).map(v =>
      this.contents.push(this.contentService.originalContent[v]),
    )
    this.contentService.changeActiveCont.subscribe(data1 => (this.currentContent = data1))
    this.loaderService.changeLoadState(true)
  }

  customStepper(step: number) {
    if (step === 1) {
      this.disableCursor = true
    }

    this.currentStep = step
  }

  // Function related to generalDetails tab

  // Functions related to Options
  toggleSettingButtons() {
    this.showSettingButtons = !this.showSettingButtons
  }

  action(type: string) {
    switch (type) {
      case 'next':
        this.currentStep += 1
        break
      case 'save':
        this.loaderService.changeLoad.next(true)
        this.saveCallIap().subscribe(responseSave => {
          if (responseSave.status === 'done') {
            this.save()
          }
        })

        break
      case 'push':
        this.saveCallIap().subscribe(res => {
          if (res.status === 'done') {
            this.takeAction()
          }
        })

        break
      case 'preview':
        this.loaderService.changeLoad.next(true)
        this.saveCallIap().subscribe(resPreview => {
          if (resPreview.status === 'done') {
            const reviewData = {
              testId: this._id,
            }
            this._service.reviewContestFlow(reviewData).subscribe(response => {
              if (response.status === 'done') {
                this.preview()
              } else {
                this.loaderService.changeLoad.next(false)
                this.snackBar.open(response.list[0])
              }
            })
          }
        })

        break

      case 'delete':
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '500px',
          height: '175px',
          data: 'delete',
        })

        dialogRef.afterClosed().subscribe((confirm: any) => {
          if (confirm) {
            this.delete()
          }
        })
        break
      case 'close':
        this.router.navigateByUrl('/author/home')
        break
    }
  }
  // changeContent(content: IAssessmentDetails) {
  //   this.contentService.changeActiveCont.next(content.identifier)
  // }

  preview() {
    const updatedContent = this.contentService.upDatedContent[this.currentContent] || {}
    const saveCall = Object.keys(updatedContent).length
      ? this.triggerSave(updatedContent, this.currentContent)
      : of({} as any)
    this.loaderService.changeLoad.next(true)
    saveCall.subscribe(
      () => {
        this.loaderService.changeLoad.next(false)
        this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(
          this.contentService.getUpdatedMeta(this.currentContent).mimeType as any,
        )
        this.previewMode = true
      },
      error => {
        if (error.status === 409) {
          const errorMap = new Map<string, NSContent.IContentMeta>()
          errorMap.set(this.currentContent, this.contentService.getUpdatedMeta(this.currentContent))
          this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
              dataMapping: errorMap,
            },
          })
        }
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }
  closePreview() {
    this.previewMode = false
  }

  save() {
    const upDatedContent = this.contentService.upDatedContent[this.currentContent] || {}

    if (Object.keys(upDatedContent).length) {
      this.isChanged = true
      this.loaderService.changeLoad.next(true)
      this.triggerSave(upDatedContent, this.currentContent).subscribe(
        () => {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SAVE_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
        () => {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SAVE_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
    } else {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.UP_TO_DATE,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    }
  }
  saveId(value: string) {
    this._id = value
  }
  saveCallIap() {
    this.contentService.setUpdatedMeta(
      { ['contentIdAtSource']: this._id } as any,
      this.currentContent,
    )
    const meta = this.contentService.getUpdatedMeta(this.currentContent)

    this.contentService.setIapContent({ ['testName']: meta.name } as any, this.currentContent)

    if (meta.duration === 0) {
      meta.duration = 3600
    }
    const duration = meta.duration / 60
    this.contentService.setIapContent({ ['duration']: duration } as any, this.currentContent)
    this.contentService.setIapContent({ ['security']: 'public' } as any, this.currentContent)
    const artifactUrl = `https://lex-deviap.infosysapps.com/contest/contest_${this._id}`
    this.contentService.setUpdatedMeta({ ['artifactUrl']: artifactUrl } as any, this.currentContent)
    const value = this.contentService.getIapContent(this.currentContent)

    return this._service.saveContestDetails(value)
  }

  triggerSave(meta: NSContent.IContentMeta, id: string) {
    const requestBody: NSApiRequest.IContentUpdate = {
      hierarchy: {},
      nodesModified: {
        [id]: {
          isNew: false,
          root: true,
          metadata: meta,
        },
      },
    }
    return this.editorService
      .updateContent(requestBody)
      .pipe(tap(() => this.contentService.resetOriginalMeta(meta, id)))
  }

  delete() {
    this.loaderService.changeLoad.next(true)
    this.editorService.deleteContent(this.currentContent).subscribe(
      () => {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.contents = this.contents.filter(v => v.identifier !== this.currentContent)
        if (this.contents.length) {
          this.contentService.changeActiveCont.next(this.contents[0].identifier)
        } else {
          this.router.navigateByUrl('/author/home')
        }
      },
      () => {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }
  getMessage(type: 'success' | 'failure') {
    if (type === 'success') {
      switch (this.contentService.originalContent[this.currentContent].status) {
        case 'Draft':
        case 'Live':
          return Notify.SEND_FOR_REVIEW_SUCCESS
        case 'InReview':
          return Notify.REVIEW_SUCCESS
        case 'Reviewed':
          return Notify.PUBLISH_SUCCESS
        default:
          return ''
      }
    }
    switch (this.contentService.originalContent[this.currentContent].status) {
      case 'Draft':
      case 'Live':
        return Notify.SEND_FOR_REVIEW_FAIL
      case 'InReview':
        return Notify.REVIEW_FAIL
      case 'Reviewed':
        return Notify.PUBLISH_FAIL
      default:
        return ''
    }
  }
  get validationCheck(): boolean {
    let returnValue = true
    if (!this.contentService.isValid(this.currentContent)) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.MANDATORY_FIELD_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      returnValue = false
    } else if (
      !this.contentService.getUpdatedMeta(this.currentContent).artifactUrl &&
      !this.contentService.getUpdatedMeta(this.currentContent).body
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.BODY_OR_URL,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      returnValue = false
    }
    return returnValue
  }

  takeAction() {
    const needSave = Object.keys(this.contentService.upDatedContent[this.currentContent] || {})
      .length
    if (
      !needSave &&
      this.contentService.getUpdatedMeta(this.currentContent).status === 'Live' &&
      !this.isChanged
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.UP_TO_DATE,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }
    const reviewData = {
      testId: this._id,
    }
    this._service.reviewContestFlow(reviewData).subscribe(response => {
      if (this.validationCheck && response.status === 'done') {
        const dialogRef = this.dialog.open(CommentsDialogComponent, {
          width: '750px',
          height: '450px',
          data: this.contentService.getOriginalMeta(this.currentContent),
        })

        dialogRef.afterClosed().subscribe((commentsForm: FormGroup) => {
          this.publishCall(commentsForm)
        })
      } else {
        if (response && response.list) {
          this.snackBar.open(response.list[0])
        }
      }
    })
  }

  publishCall(commentsForm: FormGroup) {
    this.loaderService.changeLoad.next(true)
    const actionType = this.getAction()
    if (actionType === 'publish') {
      const data = {
        testId: this._id,
      }
      this._service.publishContest(data).subscribe(result => {
        if (result.status === 'done') {
          this.finalCall(commentsForm)
        }
      })
    } else {
      this.finalCall(commentsForm)
    }
  }
  finalCall(commentsForm: FormGroup) {
    if (commentsForm) {
      const body: NSApiRequest.IForwardBackwardActionGeneral = {
        comment: commentsForm.controls.comments.value,
        operation:
          commentsForm.controls.action.value === 'accept' ||
            ['Draft', 'Live'].includes(this.contentService.originalContent[this.currentContent].status)
            ? 1
            : -1,
      }

      const updatedContent = this.contentService.upDatedContent[this.currentContent] || {}
      const needSave = Object.keys(this.contentService.upDatedContent[this.currentContent] || {})
        .length
      const saveCall = (needSave
        ? this.triggerSave(updatedContent, this.currentContent)
        : of({} as any)
      ).pipe(mergeMap(() => this.editorService.forwardBackward(body, this.currentContent)))
      this.loaderService.changeLoad.next(true)

      saveCall.subscribe(
        () => {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: this.getMessage('success'),
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.contents = this.contents.filter(v => v.identifier !== this.currentContent)
          if (this.contents.length) {
            this.contentService.changeActiveCont.next(this.contents[0].identifier)
          } else {
            this.router.navigateByUrl('/author/home')
          }
        },
        error => {
          if (error.status === 409) {
            const errorMap = new Map<string, NSContent.IContentMeta>()
            errorMap.set(
              this.currentContent,
              this.contentService.getUpdatedMeta(this.currentContent),
            )
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
                dataMapping: errorMap,
              },
            })
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: this.getMessage('failure'),
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
    }
  }

  fullScreenToggle = () => {
    const doc: any = document
    const elm: any = doc.getElementById('whole-container')
    if (elm.requestFullscreen) {
      !doc.fullscreenElement ? elm.requestFullscreen() : doc.exitFullscreen()
    } else if (elm.mozRequestFullScreen) {
      !doc.mozFullScreen ? elm.mozRequestFullScreen() : doc.mozCancelFullScreen()
    } else if (elm.msRequestFullscreen) {
      !doc.msFullscreenElement ? elm.msRequestFullscreen() : doc.msExitFullscreen()
    } else if (elm.webkitRequestFullscreen) {
      !doc.webkitIsFullscreen ? elm.webkitRequestFullscreen() : doc.webkitCancelFullscreen()
    }
  }

  getAction(): string {
    if (
      this.contentService.originalContent[this.currentContent].contentType === 'Knowledge Artifact'
    ) {
      return 'publish'
    }
    switch (this.contentService.originalContent[this.currentContent].status) {
      case 'Draft':
      case 'Live':
        return 'sendForReview'
      case 'InReview':
        return 'review'
      case 'Reviewed':
        return 'publish'
      default:
        return 'sendForReview'
    }
  }
}
export interface ISectionDetailsContent {
  _id: string
  sectionName: string
  sectionDescription: string
  numberOfQuestionsAdded: number
  showOptions: boolean
  objectiveQuestionsList: string[]
  objectiveQuestionsData: IQuestionDetailsContent[]
  groupList: object[]
}
export interface IQuestionDetailsContent {
  option1: string
  option2: string
  option3?: string
  option4?: string
  option5?: string
  option6?: string
  tags?: string[]
  topic?: string
  title: string
  flag: string
  creatorId: string
  accuracy: number
  isPrivate: string
  type: string
  maxMarks: number
  totalSubmissions: number
  archived: string
  solution: string
  problemStatement: string
  difficultyValue: number
  shareList: any
  difficulty: string
  timeStamp: any
  correctSubmissions: number
  questionType: string
  _id: string
  ownership: string
  contestAdded: boolean
  loader: boolean
}
