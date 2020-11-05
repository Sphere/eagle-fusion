import { DeleteDialogComponent } from '@ws/author/src/lib/modules/shared/components/delete-dialog/delete-dialog.component'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { of } from 'rxjs'
import { mergeMap, tap, catchError } from 'rxjs/operators'
import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
import { NotificationService } from '@ws/author/src/lib/services/notification.service'

@Component({
  selector: 'ws-auth-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit, OnDestroy {
  contents: NSContent.IContentMeta[] = []
  currentContent = ''
  currentStep = 2
  allLanguages!: any[]
  disableCursor = false
  previewMode = false
  canTransCode = true
  showSettingButtons = true
  isChanged = false
  isSubmitPressed = false
  mimeTypeRoute = ''
  isMobile = false
  constructor(
    private authInitService: AuthInitService,
    private contentService: EditorContentService,
    private snackBar: MatSnackBar,
    private editorService: EditorService,
    private dialog: MatDialog,
    private router: Router,
    private loaderService: LoaderService,
    private accessService: AccessControlService,
    private notificationSvc: NotificationService,
  ) { }

  ngOnInit() {
    this.showSettingButtons = this.accessService.rootOrg === 'client1'
    this.allLanguages = this.authInitService.ordinals.subTitles
    this.canTransCode =
      this.authInitService.ordinals.canTransCode &&
        this.authInitService.ordinals.canTransCode.length &&
        this.authInitService.ordinals.canTransCode[0]
        ? this.authInitService.ordinals.canTransCode[0]
        : false
    Object.keys(this.contentService.originalContent).map(v =>
      this.contents.push(this.contentService.originalContent[v]),
    )
    if (this.contents[0] && this.contents[0].artifactUrl) {
      this.currentStep = 3
    }
    this.contentService.changeActiveCont.subscribe(data => {
      this.currentContent = data
      if (this.contentService.getOriginalMeta(data).isContentEditingDisabled) {
        this.currentStep = 3
      }
    })
    this.loaderService.changeLoadState(true)
  }

  ngOnDestroy() {
    this.loaderService.changeLoad.next(false)
  }

  customStepper(step: number) {
    if (
      step === 2 &&
      this.contentService.getOriginalMeta(this.currentContent).isContentEditingDisabled
    ) {
      return
    }
    if (step === 1) {
      this.disableCursor = true
    } else if (
      this.currentStep === 2 &&
      step !== 2 &&
      !this.contentService.getUpdatedMeta(this.currentContent).artifactUrl
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.UPLOAD_FILE,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    } else {
      this.currentStep = step
    }
  }

  createInAnotherLanguage(language: string) {
    this.loaderService.changeLoad.next(true)
    const meta = { artifactUrl: '' }
    this.contentService.createInAnotherLanguage(language, meta).subscribe(
      data => {
        this.loaderService.changeLoad.next(false)
        if (data !== true) {
          this.contents.push(data as NSContent.IContentMeta)
          this.changeContent(data as NSContent.IContentMeta)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_CREATE_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        } else {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.DATA_PRESENT,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        }
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
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  changeContent(content: NSContent.IContentMeta) {
    this.contentService.changeActiveCont.next(content.identifier)
  }

  save(nextAction?: string) {
    const updatedContent = this.contentService.upDatedContent[this.currentContent] || {}
    if (Object.keys(updatedContent).length) {
      this.isChanged = true
      this.loaderService.changeLoad.next(true)
      this.triggerSave(updatedContent, this.currentContent).subscribe(
        () => {
          if (nextAction) {
            this.action(nextAction)
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SAVE_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
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
    }
    if (!this.contentService.getUpdatedMeta(this.currentContent).artifactUrl) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.UPLOAD_FILE,
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
    if (this.validationCheck) {
      const dialogRef = this.dialog.open(CommentsDialogComponent, {
        width: '750px',
        height: '450px',
        data: this.contentService.getOriginalMeta(this.currentContent),
      })

      dialogRef.afterClosed().subscribe((commentsForm: FormGroup) => {
        this.finalCall(commentsForm)
      })
    }
  }

  finalCall(commentsForm: FormGroup) {
    if (commentsForm) {
      const body: NSApiRequest.IForwardBackwardActionGeneral = {
        comment: commentsForm.controls.comments.value,
        operation:
          commentsForm.controls.action.value === 'accept' ||
            ['Draft', 'Live'].includes(
              this.contentService.originalContent[this.currentContent].status,
            )
            ? ((this.accessService.authoringConfig.isMultiStepFlow && this.isDirectPublish()) ||
              !this.accessService.authoringConfig.isMultiStepFlow) &&
              this.accessService.rootOrg.toLowerCase() === 'client1'
              ? 100000
              : 1
            : 0,
      }

      const updatedContent = this.contentService.upDatedContent[this.currentContent] || {}
      const needSave = Object.keys(this.contentService.upDatedContent[this.currentContent] || {})
        .length
      const updatedMeta = this.contentService.getUpdatedMeta(this.currentContent)
      const saveCall = (needSave
        ? this.triggerSave(updatedContent, this.currentContent)
        : of({} as any)
      ).pipe(
        mergeMap(() =>
          this.editorService
            .forwardBackward(
              body,
              this.currentContent,
              this.contentService.originalContent[this.currentContent].status,
            )
            .pipe(
              mergeMap(() =>
                this.notificationSvc
                  .triggerPushPullNotification(
                    updatedMeta,
                    body.comment,
                    body.operation ? true : false,
                  )
                  .pipe(
                    catchError(() => {
                      return of({} as any)
                    }),
                  ),
              ),
            ),
        ),
      )
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

  preview() {
    const updatedContent = this.contentService.upDatedContent[this.currentContent] || {}
    const saveCall = Object.keys(updatedContent).length
      ? this.triggerSave(updatedContent, this.currentContent)
      : of({} as any)
    this.loaderService.changeLoad.next(true)
    saveCall.subscribe(
      () => {
        this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(
          this.contentService.getUpdatedMeta(this.currentContent).mimeType as any,
        )
        this.loaderService.changeLoad.next(false)
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

  toggleSettingButtons() {
    this.showSettingButtons = !this.showSettingButtons
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

  action(type: string) {
    switch (type) {
      case 'next':
        this.currentStep += 1
        break

      case 'preview':
        this.preview()
        break

      case 'save':
        this.save()
        break

      case 'saveAndNext':
        this.save('next')
        break

      case 'push':
        if (this.getAction() === 'publish') {
          const dialogRefForPublish = this.dialog.open(ConfirmDialogComponent, {
            width: '70%',
            data: 'publishMessage',
          })
          dialogRefForPublish.afterClosed().subscribe(result => {
            if (result) {
              this.takeAction()
            }
          })
        } else {
          this.takeAction()
        }
        break

      case 'delete':
        const dialog = this.dialog.open(DeleteDialogComponent, {
          width: '600px',
          height: 'auto',
          data: this.contentService.getUpdatedMeta(this.currentContent),
        })
        dialog.afterClosed().subscribe(confirm => {
          if (confirm) {
            this.contents = this.contents.filter(v => v.identifier !== this.currentContent)
            if (this.contents.length) {
              this.contentService.changeActiveCont.next(this.contents[0].identifier)
            } else {
              this.router.navigateByUrl('/author/home')
            }
          }
        })
        break

      case 'close':
        this.router.navigateByUrl('/author/home')
        break
    }
  }

  isDirectPublish(): boolean {
    return (
      ['Draft', 'Live'].includes(this.contentService.originalContent[this.currentContent].status) &&
      this.isPublisherSame()
    )
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
      error => {
        if (error.status === 409) {
          this.loaderService.changeLoad.next(false)
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
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  fullScreenToggle = () => {
    const doc: any = document
    const elm: any = doc.getElementById('upload-container')
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

  isPublisherSame(): boolean {
    const publisherDetails =
      this.contentService.getUpdatedMeta(this.currentContent).publisherDetails || []
    return publisherDetails.find(v => v.id === this.accessService.userId) ? true : false
  }

  getAction(): string {
    if (
      ((this.accessService.authoringConfig.isMultiStepFlow && this.isDirectPublish()) ||
        !this.accessService.authoringConfig.isMultiStepFlow) &&
      this.accessService.rootOrg.toLowerCase() === 'client1'
    ) {
      return 'publish'
    }
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

  canDelete() {
    return this.accessService.hasRole(['editor', 'admin']) ||
      (['Draft', 'Live'].includes(this.contentService.originalContent[this.currentContent].status) &&
        this.contentService.originalContent[this.currentContent].creatorContacts.find(v => v.id === this.accessService.userId)
      )
  }
}
