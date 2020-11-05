import { APP_BASE_HREF } from '@angular/common'
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import {
  AUTHORING_CONTENT_BASE,
  CONTENT_BASE_WEBHOST,
} from '@ws/author/src/lib/constants/apiEndpoints'
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
import { UploadService } from './../../../../../shared/services/upload.service'
import { ChannelResolverService } from './../../services/resolver.service'
import { ChannelStoreService } from './../../services/store.service'

@Component({
  selector: 'ws-auth-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
  providers: [ChannelStoreService],
})
export class ChannelComponent implements OnInit, OnDestroy {
  contents: NSContent.IContentMeta[] = []
  currentContent = ''
  mode: 'Basic' | 'Advanced' = 'Basic'
  isNew: { [key: string]: boolean } = {}
  currentStep = 2
  allLanguages!: any[]
  disableCursor = false
  previewMode = false
  mimeTypeRoute: any
  showSettingButtons = true
  isSubmitPressed = false
  isChanged = false
  canShowMode = false
  downloadRegex = new RegExp(`(/content-store/.*?)(\\\)?\\\\?['"])`, 'gm')
  uploadRegex = new RegExp(`${AUTHORING_CONTENT_BASE}(.*?)(\\\)?\\\\?['"])`, 'gm')

  constructor(
    private activateRoute: ActivatedRoute,
    private contentService: EditorContentService,
    private snackBar: MatSnackBar,
    private editorService: EditorService,
    private dialog: MatDialog,
    private router: Router,
    private loaderService: LoaderService,
    private storeService: ChannelStoreService,
    private channelResolver: ChannelResolverService,
    private uploadService: UploadService,
    private changeDetector: ChangeDetectorRef,
    private accessService: AccessControlService,
    private authInitService: AuthInitService,
    @Inject(APP_BASE_HREF) private baseHref: string,
  ) { }

  ngOnDestroy() {
    this.changeDetector.detach()
    this.loaderService.changeLoad.next(false)
  }

  ngOnInit() {
    this.showSettingButtons = this.accessService.rootOrg === 'Siemens'
    this.canShowMode = this.accessService.hasRole(['admin', 'channel-creator-advanced'])
    this.storeService.editMode = this.mode
    this.contentService.changeActiveCont.subscribe(data => {
      this.currentContent = data
    })
    if (this.activateRoute.parent && this.activateRoute.parent.parent) {
      this.activateRoute.parent.parent.data.subscribe(data => {
        data.contents.map((v: { content: NSContent.IContentMeta; data: any }) => {
          if (v.data) {
            this.isNew[v.content.identifier] = false
            const jsonData = JSON.parse(
              JSON.stringify(v.data).replace(this.downloadRegex, this.regexDownloadReplace),
            )
            // tslint:disable-next-line: ter-computed-property-spacing
            this.storeService.originalContent[
              v.content.identifier
              // tslint:disable-next-line: ter-computed-property-spacing
            ] = this.channelResolver.renderFromJSON(jsonData.pageLayout)
          } else {
            this.isNew[v.content.identifier] = true
            const jsonData = {
              contentType: 'Page',
              pageLayout: {
                widgetData: {
                  widgets: [
                    [
                      {
                        widget: {
                          widgetData: {},
                          widgetType: '',
                          widgetSubType: '',
                        },
                      },
                    ],
                  ],
                  gutter: 2,
                },
                widgetSubType: 'gridLayout',
                widgetType: 'layout',
              },
            }
            const renderedData = this.channelResolver.renderFromJSON(jsonData.pageLayout)
            this.storeService.updatedContent[v.content.identifier] = renderedData
            this.storeService.originalContent[v.content.identifier] = renderedData
          }
        })
      })
    }
    this.allLanguages = this.authInitService.ordinals.subTitles
    Object.keys(this.contentService.originalContent).map(v =>
      this.contents.push(this.contentService.originalContent[v]),
    )
    this.loaderService.changeLoadState(true)
  }

  regexUploadReplace(_str = '', group1: string, group2: string): string {
    return `${decodeURIComponent(group1)}${group2}`
  }

  regexDownloadReplace(_str = '', group1: string, group2: string): string {
    return `${AUTHORING_CONTENT_BASE}${encodeURIComponent(group1)}${group2}`
  }

  customStepper(step: number) {
    if (step === 1) {
      this.disableCursor = true
    } else {
      this.currentStep = step
    }
  }

  createInAnotherLanguage(language: string) {
    this.loaderService.changeLoad.next(true)
    const meta = { artifactUrl: '' }
    this.contentService.createInAnotherLanguage(language, meta).subscribe(
      (data: NSContent.IContentMeta | boolean) => {
        this.loaderService.changeLoad.next(false)
        if (typeof data !== 'boolean') {
          this.contents.push(data)
          const identifier = data.identifier
          this.isNew[identifier] = true
          const jsonData = {
            contentType: 'Page',
            pageLayout: {
              widgetData: {
                widgets: [
                  [
                    {
                      widget: {
                        widgetData: {},
                        widgetType: '',
                        widgetSubType: '',
                      },
                    },
                  ],
                ],
                gutter: 2,
              },
              widgetSubType: 'gridLayout',
              widgetType: 'layout',
            },
          }
          const renderedData = this.channelResolver.renderFromJSON(jsonData.pageLayout)
          this.storeService.updatedContent[identifier] = renderedData
          this.storeService.originalContent[identifier] = renderedData
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.UPLOAD_SUCCESS,
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
    this.contentService.currentContent = content.identifier
    this.contentService.changeActiveCont.next(content.identifier)
  }

  save() {
    const updatedContent = this.contentService.upDatedContent[this.currentContent] || {}
    if (
      Object.keys(updatedContent).length ||
      Object.keys(this.storeService.updatedContent[this.currentContent] || {}).length
    ) {
      this.isChanged = true
      this.loaderService.changeLoad.next(true)
      this.wrapperForTriggerSave(updatedContent, this.currentContent).subscribe(
        () => {
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
          type: Notify.CREATE_CONTENT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      returnValue = false
    }
    return returnValue
  }

  takeAction() {
    const needSave =
      Object.keys(this.contentService.upDatedContent[this.currentContent] || {}).length ||
      Object.keys(this.storeService.updatedContent[this.currentContent] || {}).length
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
            ['Draft', 'Live'].includes(this.contentService.originalContent[this.currentContent].status)
            ? 1
            : -1,
      }

      const needSave =
        Object.keys(this.contentService.upDatedContent[this.currentContent] || {}).length ||
        Object.keys(this.storeService.updatedContent[this.currentContent] || {}).length
      const saveCall = (needSave
        ? this.wrapperForTriggerSave(
          this.contentService.upDatedContent[this.currentContent] || {},
          this.currentContent,
        )
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
          this.router.navigateByUrl('/author/home')
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
    const saveCall =
      Object.keys(updatedContent).length ||
        Object.keys(this.storeService.updatedContent[this.currentContent] || {}).length
        ? this.wrapperForTriggerSave(updatedContent, this.currentContent)
        : of({} as any)
    this.loaderService.changeLoad.next(true)
    saveCall.subscribe(
      () => {
        this.loaderService.changeLoad.next(false)
        this.previewMode = true
        this.mimeTypeRoute = 'channel'
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
    // this.router.navigate(['/'], { relativeTo: this.activateRoute })
  }

  toggleSettingButtons() {
    this.showSettingButtons = !this.showSettingButtons
  }

  wrapperForTriggerSave(meta: NSContent.IContentMeta, id: string) {
    return (Object.keys(this.storeService.updatedContent[this.currentContent] || {}).length
      ? this.triggerFileSave()
      : of({} as any)
    ).pipe(
      mergeMap(v => {
        if (v.artifactURL) {
          meta.artifactUrl = v.artifactURL
          meta.lastUpdatedOn = `${
            new Date()
              .toISOString()
              .replace(/-/g, '')
              .replace(/:/g, '')
              .split('.')[0]
            }+0000`
        }
        return this.triggerSave(meta, id)
      }),
    )
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

      case 'editorChange':
        this.mode = this.mode === 'Advanced' ? 'Basic' : 'Advanced'
        this.storeService.editMode = this.mode
        this.changeDetector.detectChanges()
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
        delete this.isNew[this.currentContent]
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

  getAction(): string {
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

  triggerFileSave() {
    const originRegex = new RegExp(`${window.location.origin}${this.baseHref}`, 'gm')
    let modified = JSON.parse(
      JSON.stringify(this.storeService.getUpdatedJSON())
        .replace(this.uploadRegex, this.regexUploadReplace)
        .replace(originRegex, './'),
    )
    modified = modified
    const originalJson = {
      contentType: 'Page',
      pageLayout: this.channelResolver.renderToJSON(modified),
    }
    const blob = new Blob([JSON.stringify(originalJson, null, 2)], { type: 'application/json' })
    const form = new FormData()
    form.append('content', blob, '')

    return this.uploadService
      .encodedUpload(
        originalJson,
        'channel.json',
        // tslint:disable-next-line:align
        { contentId: this.currentContent, contentType: CONTENT_BASE_WEBHOST },
      )
      .pipe(tap(() => this.storeService.resetContent()))
  }

  fromTemplate(json: any) {
    this.isNew[this.currentContent] = false
    const modifiedJSON = JSON.parse(
      JSON.stringify(json).replace(this.downloadRegex, this.regexDownloadReplace),
    )
    if (json) {
      const renderedData = this.channelResolver.renderFromJSON(modifiedJSON)
      this.storeService.updatedContent[this.currentContent] = renderedData
      this.storeService.originalContent[this.currentContent] = renderedData
    }
    this.loaderService.changeLoad.next(true)
    this.wrapperForTriggerSave({} as any, this.currentContent).subscribe(
      () => {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
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
}
